import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, payments, trackingEvents, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

// Rate Limiter para Upload de Comprovativos (Anti-DoS e Anti-Abuso)
const uploadAttempts = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

// Validação Estrita de Magic Bytes para Segurança Bancária
function validateMagicBytes(buffer: Buffer): { valid: boolean; ext: string } {
  if (buffer.length < 4) return { valid: false, ext: "" };

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return { valid: true, ext: ".jpg" };
  }

  // PNG: 89 50 4E 47
  if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return { valid: true, ext: ".png" };
  }

  // PDF: 25 50 44 46 (%PDF)
  if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) {
    return { valid: true, ext: ".pdf" };
  }

  // WEBP: RIFF....WEBP
  if (
    buffer.length >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return { valid: true, ext: ".webp" };
  }

  return { valid: false, ext: "" };
}

export async function POST(req: Request) {
  const clientIp = getClientIp(req);
  const now = Date.now();

  // Rate Limiting: Máximo 10 uploads por IP a cada 15 minutos
  const record = uploadAttempts.get(clientIp);
  if (record && record.resetAt > now) {
    if (record.count >= 10) {
      return NextResponse.json(
        { error: "Limite de tentativas de envio atingido. Aguarda 15 minutos por segurança." },
        { status: 429 }
      );
    }
    record.count++;
  } else {
    uploadAttempts.set(clientIp, { count: 1, resetAt: now + 15 * 60 * 1000 });
  }

  try {
    const formData = await req.formData();
    const reference = formData.get("reference")?.toString()?.trim();
    const transactionCode = formData.get("transactionCode")?.toString()?.trim() || "";
    const notes = formData.get("notes")?.toString()?.trim() || "";
    const file = formData.get("file") as File | null;

    if (!reference) {
      return NextResponse.json({ error: "Referência do pedido é obrigatória." }, { status: 400 });
    }

    // Normaliza referência
    const cleanRef = reference.toUpperCase().replace(/^#/, "");
    const normalizedRef = cleanRef.startsWith("SG-") ? cleanRef : `SG-${cleanRef.replace(/^SG/, "")}`;

    // Procura o pedido no banco
    const [order] = await db.select().from(orders).where(eq(orders.reference, normalizedRef)).limit(1);
    if (!order) {
      return NextResponse.json({ error: "Pedido não encontrado no sistema." }, { status: 404 });
    }

    let proofUrl = order.paymentProofUrl || "";

    if (file && file.size > 0) {
      // Bloqueio de tamanho máximo: 10MB
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "O ficheiro é demasiado grande (máximo 10MB)." }, { status: 400 });
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Verificação Estrita de Cibersegurança: Magic Bytes (Impede scripts executáveis camuflados)
      const magicCheck = validateMagicBytes(buffer);
      if (!magicCheck.valid) {
        return NextResponse.json(
          { error: "Ficheiro inválido ou não seguro. Envia apenas uma foto real (JPG, PNG) ou documento PDF legítimo do talão." },
          { status: 400 }
        );
      }

      // Diretório público de upload
      const uploadDir = path.join(process.cwd(), "public", "uploads", "proofs");
      await mkdir(uploadDir, { recursive: true });

      // Nome do ficheiro 100% gerado no servidor com hash criptográfico (Anti Path Traversal)
      const randomHash = crypto.randomBytes(8).toString("hex");
      const safeFilename = `proof-${order.reference.toLowerCase()}-${Date.now()}-${randomHash}${magicCheck.ext}`;
      const safeFilePath = path.join(uploadDir, safeFilename);

      await writeFile(safeFilePath, buffer);
      proofUrl = `/uploads/proofs/${safeFilename}`;
    } else if (!proofUrl && !transactionCode) {
      return NextResponse.json(
        { error: "Por favor anexa a foto do talão ou digita o código da transação do Express." },
        { status: 400 }
      );
    }

    // Atualiza o pedido
    await db
      .update(orders)
      .set({
        paymentProofUrl: proofUrl,
        paymentStatus: "REVIEW",
        status: order.status === "PENDING_PAYMENT" ? "PAYMENT_REVIEW" : order.status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, order.id));

    // Atualiza o registo de pagamento correspondente
    const paymentUpdates: Record<string, any> = {
      status: "REVIEW",
      updatedAt: new Date(),
    };
    if (proofUrl) paymentUpdates.proofUrl = proofUrl;
    if (transactionCode) paymentUpdates.reference = transactionCode;

    await db.update(payments).set(paymentUpdates).where(eq(payments.orderId, order.id));

    // Adiciona evento na timeline do cliente
    await db.insert(trackingEvents).values({
      orderId: order.id,
      status: "PAYMENT_REVIEW",
      title: "Comprovativo Recebido no Sistema",
      description: transactionCode
        ? `Talão submetido com sucesso (Cód: ${transactionCode}). A nossa equipa financeira está a bater o valor no banco para validar a tua carga.`
        : "Talão submetido com sucesso. A nossa equipa financeira está a conferir o valor no banco para validar a tua carga.",
      eventDate: new Date(),
      isPublic: true,
    });

    // Trilha de Auditoria Bancária com IP
    await db.insert(auditLogs).values({
      action: "PAYMENT_PROOF_SUBMITTED",
      entityType: "order",
      entityId: String(order.id),
      ip: clientIp,
      newValue: { proofUrl, transactionCode, notes },
    });

    return NextResponse.json({
      ok: true,
      proofUrl,
      reference: order.reference,
      message: "Comprovativo recebido com sucesso! A nossa equipa está a conferir no banco para despachar a tua encomenda.",
    });
  } catch (err: any) {
    console.error("Erro ao processar comprovativo:", err);
    return NextResponse.json({ error: "Erro interno no servidor ao guardar comprovativo." }, { status: 500 });
  }
}
