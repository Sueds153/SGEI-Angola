import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { updateExchangeRatesInDb, getExchangeRates, clearExchangeRateCache } from "@/lib/exchange-rates";
import { clearScrapingCache, getCacheStats } from "@/lib/scraping";

export const dynamic = "force-dynamic";

// GET: Retorna status do sistema
export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const rates = await getExchangeRates();
  const cacheStats = getCacheStats();

  return NextResponse.json({
    exchangeRates: {
      USD_TO_AOA: rates.USD_TO_AOA,
      EUR_TO_AOA: rates.EUR_TO_AOA,
      CNY_TO_AOA: rates.CNY_TO_AOA,
      updatedAt: rates.updatedAt,
    },
    cache: cacheStats,
    providers: {
      scrapingbee: !!process.env.SCRAPINGBEE_API_KEY,
      zenrows: !!process.env.ZENROWS_API_KEY,
      rapidapi: !!process.env.RAPIDAPI_KEY,
    },
  });
}

// POST: Ações de admin
export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { action } = body;

  switch (action) {
    case "update-rates":
      const updated = await updateExchangeRatesInDb();
      return NextResponse.json({
        success: updated,
        message: updated ? "Taxas atualizadas com sucesso" : "Falha ao atualizar taxas",
        rates: await getExchangeRates(),
      });

    case "clear-cache":
      const productId = body.productId;
      clearScrapingCache(productId || undefined);
      return NextResponse.json({
        success: true,
        message: productId ? `Cache limpo para ${productId}` : "Cache limpo completamente",
      });

    case "set-rates":
      const { USD_TO_AOA, EUR_TO_AOA, CNY_TO_AOA } = body;
      if (!USD_TO_AOA || !EUR_TO_AOA || !CNY_TO_AOA) {
        return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
      }
      
      const { setPricingConfig } = await import("@/lib/pricing");
      await setPricingConfig("exchangeRateUsdToAoa", String(USD_TO_AOA));
      await setPricingConfig("exchangeRateEurToAoa", String(EUR_TO_AOA));
      await setPricingConfig("exchangeRateCnyToAoa", String(CNY_TO_AOA));
      await setPricingConfig("exchangeRatesUpdatedAt", new Date().toISOString());
      
      clearExchangeRateCache();
      
      return NextResponse.json({
        success: true,
        message: "Taxas atualizadas manualmente",
        rates: { USD_TO_AOA, EUR_TO_AOA, CNY_TO_AOA },
      });

    default:
      return NextResponse.json({ error: "Ação desconhecida" }, { status: 400 });
  }
}
