import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { pricingConfigs, auditLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { clearExchangeRateCache } from "@/lib/exchange-rates";

const schema = z.object({
  exchangeRateUsdToAoa: z.number().positive("O câmbio USD deve ser um valor positivo"),
  exchangeRateEurToAoa: z.number().positive().optional(),
  exchangeRateCnyToAoa: z.number().positive().optional(),
  currencyBufferPct: z.number().min(0).max(50).optional(), // Margem de segurança contra flutuação informal (0 a 50%)
  exchangeMode: z.enum(["INFORMAL_MANUAL", "OFFICIAL_AUTO"]).default("INFORMAL_MANUAL"),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const rows = await db.select().from(pricingConfigs);
  const cfg: Record<string, string> = {};
  for (const r of rows) cfg[r.key] = r.value;

  // Busca histórico recente de alterações de câmbio na auditoria
  const history = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.action, "INFORMAL_EXCHANGE_UPDATED"))
    .orderBy(desc(auditLogs.createdAt))
    .limit(8);

  return NextResponse.json({
    usdRate: Number(cfg.exchangeRateUsdToAoa) || 920,
    eurRate: Number(cfg.exchangeRateEurToAoa) || 1050,
    cnyRate: Number(cfg.exchangeRateCnyToAoa) || 130,
    currencyBufferPct: Number(cfg.currencyBufferPct) || 3,
    exchangeMode: cfg.exchangeMode || "INFORMAL_MANUAL",
    updatedAt: cfg.exchangeRatesUpdatedAt || new Date().toISOString(),
    history,
  });
}

export async function POST(req: Request) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.format() }, { status: 400 });
  }

  const {
    exchangeRateUsdToAoa,
    exchangeRateEurToAoa,
    exchangeRateCnyToAoa,
    currencyBufferPct,
    exchangeMode,
    notes,
  } = parsed.data;

  // Calcula valores derivados se não foram informados
  const calculatedEur = exchangeRateEurToAoa || Math.round(exchangeRateUsdToAoa * 1.09);
  const calculatedCny = exchangeRateCnyToAoa || Math.round(exchangeRateUsdToAoa / 7.2);

  const configsToSave: Array<{ key: string; value: string }> = [
    { key: "exchangeRateUsdToAoa", value: String(exchangeRateUsdToAoa) },
    { key: "exchangeRateEurToAoa", value: String(calculatedEur) },
    { key: "exchangeRateCnyToAoa", value: String(calculatedCny) },
    { key: "currencyBufferPct", value: String(currencyBufferPct ?? 3) },
    { key: "exchangeMode", value: exchangeMode },
    { key: "exchangeRatesUpdatedAt", value: new Date().toISOString() },
  ];

  for (const item of configsToSave) {
    await db
      .insert(pricingConfigs)
      .values({ key: item.key, value: item.value, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: pricingConfigs.key,
        set: { value: item.value, updatedAt: new Date() },
      });
  }

  // Limpa o cache para que o simulador e checkout peguem a taxa informal imediatamente
  clearExchangeRateCache();

  // Registro de Auditoria Bancária
  await db.insert(auditLogs).values({
    actorId: session.userId,
    actorEmail: session.email,
    action: "INFORMAL_EXCHANGE_UPDATED",
    entityType: "pricing",
    entityId: "exchange_rate",
    newValue: {
      usdToAoa: exchangeRateUsdToAoa,
      eurToAoa: calculatedEur,
      cnyToAoa: calculatedCny,
      bufferPct: currencyBufferPct,
      mode: exchangeMode,
      notes: notes || "Atualização de câmbio informal no painel admin",
    },
  });

  return NextResponse.json({
    ok: true,
    message: "Câmbio informal atualizado com sucesso! Todos os preços no site já foram ajustados.",
    rates: {
      USD_TO_AOA: exchangeRateUsdToAoa,
      EUR_TO_AOA: calculatedEur,
      CNY_TO_AOA: calculatedCny,
    },
  });
}
