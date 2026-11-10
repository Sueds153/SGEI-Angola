import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { pricingConfigs, auditLogs } from "@/db/schema";

const schema = z.object({
  values: z.any(),
});

export async function POST(req: Request) {
  let session: Awaited<ReturnType<typeof requireAdmin>>;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });

  for (const [key, value] of Object.entries(parsed.data.values)) {
    if (value === undefined || value === null || value === "") continue;
    await db
      .insert(pricingConfigs)
      .values({ key, value: String(value), updatedAt: new Date() })
      .onConflictDoUpdate({
        target: pricingConfigs.key,
        set: { value: String(value), updatedAt: new Date() },
      });
  }

  await db.insert(auditLogs).values({
    actorId: session.userId,
    actorEmail: session.email,
    action: "PRICING_UPDATED",
    entityType: "pricing",
    entityId: "config",
    newValue: parsed.data.values,
  });

  return NextResponse.json({ ok: true });
}
