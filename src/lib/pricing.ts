import { db } from "@/db";
import { pricingConfigs } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { MarginStatus, PriceBreakdown } from "./types";

export interface PricingConfig {
  exchangeRateUsdToAoa: number;
  serviceFeePct: number; // percentagem sobre o subtotal convertido
  serviceFeeMinCents: number; // taxa mínima em cêntimos
  logisticsBaseCents: number; // custo logístico base
  logisticsPerGramCents: number; // custo por grama
  localDeliveryCents: number; // entrega local (base)
  minimumMarginPct: number; // margem mínima (0..1)
  warningMarginPct: number; // margem de atenção
  roundToNearestCents: number; // arredondamento (ex: 10000 = 100 Kz)
  estimatedCostPct: number; // % do preço final que é custo estimado (para cálculo de margem)
  deliveryByProvince?: Record<string, number>; // entrega por província (em cêntimos)
}

const DEFAULTS: PricingConfig = {
  exchangeRateUsdToAoa: 920,
  serviceFeePct: 0.12,
  serviceFeeMinCents: 1500 * 100, // 1.500 Kz
  logisticsBaseCents: 2500 * 100, // 2.500 Kz
  logisticsPerGramCents: 2, // 2 cêntimos por grama
  localDeliveryCents: 1000 * 100, // 1.000 Kz
  minimumMarginPct: 0.15,
  warningMarginPct: 0.25,
  roundToNearestCents: 500 * 100, // 500 Kz
  estimatedCostPct: 0.62,
  deliveryByProvince: {
    Luanda: 800 * 100,
    Benguela: 1500 * 100,
    Huambo: 1500 * 100,
    Lubango: 1500 * 100,
  },
};

export async function loadPricingConfig(): Promise<PricingConfig> {
  try {
    const rows = await db.select().from(pricingConfigs);
    const cfg = { ...DEFAULTS };
    for (const row of rows) {
      const val = row.value;
      switch (row.key) {
        case "exchangeRateUsdToAoa":
          cfg.exchangeRateUsdToAoa = Number(val) || DEFAULTS.exchangeRateUsdToAoa;
          break;
        case "serviceFeePct":
          cfg.serviceFeePct = Number(val) || DEFAULTS.serviceFeePct;
          break;
        case "serviceFeeMinCents":
          cfg.serviceFeeMinCents = Number(val) || DEFAULTS.serviceFeeMinCents;
          break;
        case "logisticsBaseCents":
          cfg.logisticsBaseCents = Number(val) || DEFAULTS.logisticsBaseCents;
          break;
        case "logisticsPerGramCents":
          cfg.logisticsPerGramCents = Number(val) || DEFAULTS.logisticsPerGramCents;
          break;
        case "localDeliveryCents":
          cfg.localDeliveryCents = Number(val) || DEFAULTS.localDeliveryCents;
          break;
        case "minimumMarginPct":
          cfg.minimumMarginPct = Number(val) || DEFAULTS.minimumMarginPct;
          break;
        case "warningMarginPct":
          cfg.warningMarginPct = Number(val) || DEFAULTS.warningMarginPct;
          break;
        case "roundToNearestCents":
          cfg.roundToNearestCents = Number(val) || DEFAULTS.roundToNearestCents;
          break;
        case "estimatedCostPct":
          cfg.estimatedCostPct = Number(val) || DEFAULTS.estimatedCostPct;
          break;
        case "deliveryByProvince":
          try {
            cfg.deliveryByProvince = JSON.parse(val);
          } catch {
            cfg.deliveryByProvince = DEFAULTS.deliveryByProvince;
          }
          break;
      }
    }
    return cfg;
  } catch {
    return DEFAULTS;
  }
}

export function getDefaultPricingConfig(): PricingConfig {
  return { ...DEFAULTS };
}

export function roundToNearest(cents: number, nearest: number): number {
  if (nearest <= 0) return Math.round(cents);
  return Math.round(cents / nearest) * nearest;
}

export interface CalculatePriceInput {
  productPriceUsd: number;
  quantity?: number;
  weightGrams?: number | null;
  variantPriceModifierUsd?: number;
  province?: string | null;
  config?: PricingConfig;
}

export function calculatePrice(input: CalculatePriceInput, config: PricingConfig): PriceBreakdown {
  const quantity = input.quantity ?? 1;
  const unitUsd = input.productPriceUsd + (input.variantPriceModifierUsd ?? 0);
  const totalUsd = unitUsd * quantity;

  // Converter para cêntimos de Kz
  const grossProductCents = Math.round(totalUsd * config.exchangeRateUsdToAoa * 100);

  // Taxa de serviço
  let serviceFeeCents = Math.round(grossProductCents * config.serviceFeePct);
  if (serviceFeeCents < config.serviceFeeMinCents) {
    serviceFeeCents = config.serviceFeeMinCents;
  }

  // Logística
  const weightLogisticsCents = input.weightGrams
    ? Math.round(input.weightGrams * config.logisticsPerGramCents * quantity)
    : 0;
  let logisticsFeeCents = config.logisticsBaseCents * quantity + weightLogisticsCents;

  // Entrega
  let deliveryFeeCents = config.localDeliveryCents;
  if (input.province && config.deliveryByProvince && config.deliveryByProvince[input.province] != null) {
    deliveryFeeCents = config.deliveryByProvince[input.province];
  }

  const subtotalCents = grossProductCents;
  const rawTotalCents = subtotalCents + serviceFeeCents + logisticsFeeCents + deliveryFeeCents;
  const totalCents = roundToNearest(rawTotalCents, config.roundToNearestCents);

  // Margem estimada
  const estimatedCostCents = Math.round(totalCents * config.estimatedCostPct);
  const estimatedMarginCents = totalCents - estimatedCostCents;
  const estimatedMarginPct = totalCents > 0 ? estimatedMarginCents / totalCents : 0;

  let marginStatus: MarginStatus = "SAFE";
  if (estimatedMarginPct < config.minimumMarginPct) {
    marginStatus = "BLOCKED";
  } else if (estimatedMarginPct < config.warningMarginPct) {
    marginStatus = "WARNING";
  }

  return {
    originalPriceUsd: totalUsd,
    exchangeRate: config.exchangeRateUsdToAoa,
    subtotalCents,
    serviceFeeCents,
    logisticsFeeCents,
    deliveryFeeCents,
    totalCents,
    currency: "AOA",
    marginStatus,
    estimatedCostCents,
    estimatedMarginCents,
    estimatedMarginPct,
  };
}

/** Calcula o preço para um item de pedido (usado para multiplos itens) */
export function calculateOrderTotals(
  items: Array<{ unitPriceCents: number; quantity: number }>,
  config: PricingConfig,
  province?: string | null
): {
  itemsSubtotalCents: number;
  serviceFeeCents: number;
  logisticsFeeCents: number;
  deliveryFeeCents: number;
  totalCents: number;
} {
  const itemsSubtotalCents = items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);
  let serviceFeeCents = Math.round(itemsSubtotalCents * config.serviceFeePct);
  if (serviceFeeCents < config.serviceFeeMinCents) serviceFeeCents = config.serviceFeeMinCents;
  const logisticsFeeCents = config.logisticsBaseCents;
  let deliveryFeeCents = config.localDeliveryCents;
  if (province && config.deliveryByProvince && config.deliveryByProvince[province] != null) {
    deliveryFeeCents = config.deliveryByProvince[province];
  }
  const rawTotal = itemsSubtotalCents + serviceFeeCents + logisticsFeeCents + deliveryFeeCents;
  const totalCents = roundToNearest(rawTotal, config.roundToNearestCents);
  return { itemsSubtotalCents, serviceFeeCents, logisticsFeeCents, deliveryFeeCents, totalCents };
}

export async function setPricingConfig(key: string, value: string) {
  await db
    .insert(pricingConfigs)
    .values({ key, value, updatedAt: new Date() })
    .onConflictDoUpdate({
      target: pricingConfigs.key,
      set: { value, updatedAt: new Date() },
    });
}
