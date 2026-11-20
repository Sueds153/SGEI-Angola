import { db } from "@/db";
import { pricingConfigs, auditLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { Metadata } from "next";
import { InformalExchangeManager } from "@/components/admin/InformalExchangeManager";

export const metadata: Metadata = {
  title: "Câmbio Informal & Rua · ImportEasy Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminCambioPage() {
  const [rows, history] = await Promise.all([
    db.select().from(pricingConfigs),
    db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.action, "INFORMAL_EXCHANGE_UPDATED"))
      .orderBy(desc(auditLogs.createdAt))
      .limit(8),
  ]);

  const cfg: Record<string, string> = {};
  for (const r of rows) cfg[r.key] = r.value;

  return (
    <InformalExchangeManager
      initialUsd={Number(cfg.exchangeRateUsdToAoa) || 920}
      initialEur={Number(cfg.exchangeRateEurToAoa) || 1050}
      initialCny={Number(cfg.exchangeRateCnyToAoa) || 130}
      initialBuffer={Number.isFinite(Number(cfg.currencyBufferPct)) ? Number(cfg.currencyBufferPct) : 3}
      initialMode={cfg.exchangeMode || "INFORMAL_MANUAL"}
      updatedAt={cfg.exchangeRatesUpdatedAt || new Date().toISOString()}
      historyLogs={history}
    />
  );
}
