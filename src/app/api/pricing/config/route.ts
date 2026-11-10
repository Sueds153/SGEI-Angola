import { NextResponse } from "next/server";
import { loadPricingConfig } from "@/lib/pricing";
import { getExchangeRates } from "@/lib/exchange-rates";

export const dynamic = "force-dynamic";

export async function GET() {
  const cfg = await loadPricingConfig();
  const liveRates = await getExchangeRates();

  // Retorna taxas reais (com fallback para config do admin)
  return NextResponse.json({
    exchangeRateUsdToAoa: liveRates.USD_TO_AOA || cfg.exchangeRateUsdToAoa,
    exchangeRateEurToAoa: liveRates.EUR_TO_AOA,
    exchangeRateCnyToAoa: liveRates.CNY_TO_AOA,
    ratesUpdatedAt: liveRates.updatedAt,
    serviceFeePct: cfg.serviceFeePct,
    serviceFeeMinCents: cfg.serviceFeeMinCents,
    logisticsBaseCents: cfg.logisticsBaseCents,
    logisticsPerGramCents: cfg.logisticsPerGramCents,
    localDeliveryCents: cfg.localDeliveryCents,
    roundToNearestCents: cfg.roundToNearestCents,
    deliveryByProvince: cfg.deliveryByProvince || {},
  });
}
