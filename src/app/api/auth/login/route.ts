import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateAdmin, authenticateCustomer, createSession } from "@/lib/auth";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";

// Rate Limiter em Memória para Prevenção de Ataques de Força Bruta
interface RateLimitRecord {
  attempts: number;
  blockedUntil: number;
}
const loginAttemptsMap = new Map<string, RateLimitRecord>();

// Limpeza periódica do mapa a cada 30 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of loginAttemptsMap.entries()) {
    if (now > record.blockedUntil && record.attempts === 0) {
      loginAttemptsMap.delete(key);
    }
  }
}, 30 * 60 * 1000);

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutos de bloqueio

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

const schema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  emailOrPhone: z.string().optional(),
  password: z.string().min(4, "A palavra-passe deve conter pelo menos 4 caracteres"),
  role: z.enum(["admin", "customer"]).optional(),
});

export async function POST(req: Request) {
  const clientIp = getClientIp(req);
  const now = Date.now();

  // Verificação de Rate Limit
  const rateLimit = loginAttemptsMap.get(clientIp);
  if (rateLimit && rateLimit.blockedUntil > now) {
    const minutesRemaining = Math.ceil((rateLimit.blockedUntil - now) / 60000);
    return NextResponse.json(
      {
        error: `Acesso temporariamente bloqueado por motivos de segurança. Tente novamente dentro de ${minutesRemaining} minuto(s).`,
      },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos." }, { status: 400 });
  }

  const { password, role } = parsed.data;
  const identifier = (parsed.data.emailOrPhone || parsed.data.email || "").trim();

  try {
    if (role === "admin") {
      const admin = await authenticateAdmin(identifier, password);
      if (!admin) {
        // Incrementa tentativas falhadas
        const currentAttempts = (rateLimit?.attempts || 0) + 1;
        const isBlocked = currentAttempts >= MAX_ATTEMPTS;
        loginAttemptsMap.set(clientIp, {
          attempts: isBlocked ? 0 : currentAttempts,
          blockedUntil: isBlocked ? now + LOCKOUT_DURATION_MS : 0,
        });

        // Trilha de Auditoria Bancária: Registro de Tentativa Não Autorizada
        try {
          await db.insert(auditLogs).values({
            action: "ADMIN_LOGIN_FAILED",
            entityType: "auth",
            entityId: identifier || "unknown",
            ip: clientIp,
            newValue: {
              attemptCount: currentAttempts,
              blocked: isBlocked,
              timestamp: new Date().toISOString(),
            },
          });
        } catch (logErr) {
          console.error("Falha ao registrar auditoria de login falhado:", logErr);
        }

        if (isBlocked) {
          return NextResponse.json(
            {
              error: "Limite de tentativas excedido. O seu IP foi temporariamente bloqueado por 15 minutos.",
            },
            { status: 429 }
          );
        }

        return NextResponse.json(
          {
            error: `Credenciais de administrador inválidas. Restam ${MAX_ATTEMPTS - currentAttempts} tentativa(s).`,
          },
          { status: 401 }
        );
      }

      // Sucesso no login de admin: limpa o rate limit
      loginAttemptsMap.delete(clientIp);

      // Trilha de Auditoria: Registro de Login com Sucesso
      try {
        await db.insert(auditLogs).values({
          actorId: admin.userId,
          actorEmail: admin.email,
          action: "ADMIN_LOGIN_SUCCESS",
          entityType: "auth",
          entityId: String(admin.userId),
          ip: clientIp,
        });
      } catch (logErr) {
        console.error("Falha ao registrar auditoria de login com sucesso:", logErr);
      }

      await createSession({
        userId: admin.userId,
        role: "admin",
        email: admin.email,
        name: admin.name,
      });

      return NextResponse.json({ ok: true, role: "admin" });
    }

    // Login de Cliente Comum
    const customer = await authenticateCustomer(identifier, password);
    if (!customer) {
      const currentAttempts = (rateLimit?.attempts || 0) + 1;
      const isBlocked = currentAttempts >= MAX_ATTEMPTS;
      loginAttemptsMap.set(clientIp, {
        attempts: isBlocked ? 0 : currentAttempts,
        blockedUntil: isBlocked ? now + LOCKOUT_DURATION_MS : 0,
      });

      return NextResponse.json(
        { error: "Credenciais inválidas. Verifique o seu telefone/e-mail e palavra-passe." },
        { status: 401 }
      );
    }

    // Sucesso cliente
    loginAttemptsMap.delete(clientIp);
    await createSession({
      userId: customer.userId,
      role: customer.role as "customer" | "admin",
      email: customer.email,
      name: customer.name,
    });

    return NextResponse.json({ ok: true, role: customer.role });
  } catch (e) {
    console.error("Erro no processamento de login:", e);
    return NextResponse.json({ error: "Erro interno no servidor de autenticação." }, { status: 500 });
  }
}
