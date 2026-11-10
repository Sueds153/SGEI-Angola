import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { orders, trackingEvents, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ORDER_STATUS_LABELS } from "@/lib/types";
import type { OrderStatus } from "@/lib/types";

const schema = z.object({
  status: z.string(),
  paymentStatus: z.string().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const { id } = await params;
  const orderId = Number(id);
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  const [existing] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!existing) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });

  const newStatus = parsed.data.status as OrderStatus;
  const newPaymentStatus = parsed.data.paymentStatus || existing.paymentStatus;

  await db
    .update(orders)
    .set({
      status: newStatus,
      paymentStatus: newPaymentStatus as any,
      paidAt: newPaymentStatus === "PAID" && existing.paymentStatus !== "PAID" ? new Date() : existing.paidAt,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId));

  // Adiciona tracking event se o estado mudou
  if (newStatus !== existing.status) {
    await db.insert(trackingEvents).values({
      orderId,
      status: newStatus,
      title: ORDER_STATUS_LABELS[newStatus].publicLabel,
      description: `Estado atualizado para: ${ORDER_STATUS_LABELS[newStatus].label}.`,
      eventDate: new Date(),
      isPublic: true,
    });
  }

  // Audit log
  await db.insert(auditLogs).values({
    action: "ORDER_STATUS_UPDATED",
    entityType: "order",
    entityId: String(orderId),
    oldValue: { status: existing.status, paymentStatus: existing.paymentStatus },
    newValue: { status: newStatus, paymentStatus: newPaymentStatus },
  });

  return NextResponse.json({ ok: true });
}
