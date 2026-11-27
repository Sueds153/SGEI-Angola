import { db } from "@/db";
import { pricingConfigs } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { MarginStatus, PriceBreakdown } from "./types";

export interface PricingConfig {
  exchangeRateUsdToAoa: number;
  exchangeRateEurToAoa: number;
  exchangeRateCnyToAoa: number;
  exchangeMode: "INFORMAL_MANUAL" | "OFFICIAL_AUTO"; // controla se o site usa taxa do admin ou APIs externas
  currencyBufferPct: number; // margem de segurança contra flutuação informal (0..50)
  serviceFeePct: number; // percentagem sobre o subtotal convertido
  serviceFeeMinCents: number; // taxa mínima em cêntimos
  logisticsBaseCents: number; // custo logístico base por pedido (consolidado)
  logisticsPerGramCents: number; // custo por grama
  localDeliveryCents: number; // entrega local (base)
  customsFeePct: number; // taxa alfandegária estimada (% sobre CIF)
  customsFeeMinCents: number; // taxa alfandegária mínima
  minimumMarginPct: number; // margem mínima (0..1)
  warningMarginPct: number; // margem de atenção
  roundToNearestCents: number; // arredondamento (ex: 10000 = 100 Kz)
  estimatedCostPct: number; // % do preço final que é custo estimado (para cálculo de margem)
  deliveryByProvince?: Record<string, number>; // entrega por província (em cêntimos)
}

const DEFAULTS: PricingConfig = {
  exchangeRateUsdToAoa: 920,
  exchangeRateEurToAoa: 1050,
  exchangeRateCnyToAoa: 130,
  exchangeMode: "INFORMAL_MANUAL",
  currencyBufferPct: 3,
  serviceFeePct: 0.12,
  serviceFeeMinCents: 1500 * 100, // 1.500 Kz
  logisticsBaseCents: 8000 * 100, // 8.000 Kz ≈ 8.7 USD
  logisticsPerGramCents: 2, // 2 cêntimos por grama
  localDeliveryCents: 1000 * 100, // 1.000 Kz
  customsFeePct: 0.05, // 5% sobre CIF
  customsFeeMinCents: 500 * 100, // 500 Kz
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
    const configuredNumber = (value: string, fallback: number) => {
      if (!value.trim()) return fallback;
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };
    for (const row of rows) {
      const val = row.value;
      switch (row.key) {
        case "exchangeRateUsdToAoa":
          cfg.exchangeRateUsdToAoa = configuredNumber(val, DEFAULTS.exchangeRateUsdToAoa);
          break;
        case "exchangeRateEurToAoa":
          cfg.exchangeRateEurToAoa = configuredNumber(val, DEFAULTS.exchangeRateEurToAoa);
          break;
        case "exchangeRateCnyToAoa":
          cfg.exchangeRateCnyToAoa = configuredNumber(val, DEFAULTS.exchangeRateCnyToAoa);
          break;
        case "exchangeMode":
          cfg.exchangeMode = (val as "INFORMAL_MANUAL" | "OFFICIAL_AUTO") || DEFAULTS.exchangeMode;
          break;
        case "currencyBufferPct":
          cfg.currencyBufferPct = configuredNumber(val, DEFAULTS.currencyBufferPct);
          break;
        case "serviceFeePct":
          cfg.serviceFeePct = configuredNumber(val, DEFAULTS.serviceFeePct);
          break;
        case "serviceFeeMinCents":
          cfg.serviceFeeMinCents = configuredNumber(val, DEFAULTS.serviceFeeMinCents);
          break;
        case "logisticsBaseCents":
          cfg.logisticsBaseCents = configuredNumber(val, DEFAULTS.logisticsBaseCents);
          break;
        case "logisticsPerGramCents":
          cfg.logisticsPerGramCents = configuredNumber(val, DEFAULTS.logisticsPerGramCents);
          break;
        case "localDeliveryCents":
          cfg.localDeliveryCents = configuredNumber(val, DEFAULTS.localDeliveryCents);
          break;
        case "customsFeePct":
          cfg.customsFeePct = configuredNumber(val, DEFAULTS.customsFeePct);
          break;
        case "customsFeeMinCents":
          cfg.customsFeeMinCents = configuredNumber(val, DEFAULTS.customsFeeMinCents);
          break;
        case "minimumMarginPct":
          cfg.minimumMarginPct = configuredNumber(val, DEFAULTS.minimumMarginPct);
          break;
        case "warningMarginPct":
          cfg.warningMarginPct = configuredNumber(val, DEFAULTS.warningMarginPct);
          break;
        case "roundToNearestCents":
          cfg.roundToNearestCents = configuredNumber(val, DEFAULTS.roundToNearestCents);
          break;
        case "estimatedCostPct":
          cfg.estimatedCostPct = configuredNumber(val, DEFAULTS.estimatedCostPct);
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
    // No modo manual, o painel apresenta o valor com o buffer como taxa efetiva.
    // Aplicá-lo aqui mantém simulador, catálogo, resolução de links e pedidos iguais.
    if (cfg.exchangeMode === "INFORMAL_MANUAL" && cfg.currencyBufferPct !== 0) {
      const multiplier = 1 + cfg.currencyBufferPct / 100;
      cfg.exchangeRateUsdToAoa = Math.round(cfg.exchangeRateUsdToAoa * multiplier);
      cfg.exchangeRateEurToAoa = Math.round(cfg.exchangeRateEurToAoa * multiplier);
      cfg.exchangeRateCnyToAoa = Math.round(cfg.exchangeRateCnyToAoa * multiplier);
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
  productCurrency?: "USD" | "EUR" | "CNY"; // Moeda do preço do produto (padrão: USD)
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

  // Selecionar taxa de câmbio baseada na moeda do produto
  let exchangeRate = config.exchangeRateUsdToAoa;
  switch (input.productCurrency) {
    case "EUR":
      exchangeRate = config.exchangeRateEurToAoa;
      break;
    case "CNY":
      exchangeRate = config.exchangeRateCnyToAoa;
      break;
    case "USD":
    default:
      exchangeRate = config.exchangeRateUsdToAoa;
      break;
  }

  // Converter para cêntimos de Kz
  const grossProductCents = Math.round(totalUsd * exchangeRate * 100);

  // Taxa de serviço
  let serviceFeeCents = Math.round(grossProductCents * config.serviceFeePct);
  if (serviceFeeCents < config.serviceFeeMinCents) {
    serviceFeeCents = config.serviceFeeMinCents;
  }

  // Logística (consolidada: base uma vez por pedido, peso por unidade)
  const weightLogisticsCents = input.weightGrams
    ? Math.round(input.weightGrams * config.logisticsPerGramCents * quantity)
    : 0;
  const logisticsFeeCents = config.logisticsBaseCents + weightLogisticsCents;

  // Alfândega (sobre CIF = produto + logística + frete internacional se aplicável)
  const cifBaseCents = grossProductCents + logisticsFeeCents;
  let customsFeeCents = Math.round(cifBaseCents * config.customsFeePct);
  if (customsFeeCents < config.customsFeeMinCents) {
    customsFeeCents = config.customsFeeMinCents;
  }

  // Entrega local
  let deliveryFeeCents = config.localDeliveryCents;
  if (input.province && config.deliveryByProvince && config.deliveryByProvince[input.province] != null) {
    deliveryFeeCents = config.deliveryByProvince[input.province];
  }

  const subtotalCents = grossProductCents;
  const rawTotalCents = subtotalCents + serviceFeeCents + logisticsFeeCents + customsFeeCents + deliveryFeeCents;
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
    exchangeRate,
    subtotalCents,
    serviceFeeCents,
    logisticsFeeCents,
    customsFeeCents,
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
  customsFeeCents: number;
  deliveryFeeCents: number;
  totalCents: number;
} {
  const itemsSubtotalCents = items.reduce((sum, i) => sum + i.unitPriceCents * i.quantity, 0);
  let serviceFeeCents = Math.round(itemsSubtotalCents * config.serviceFeePct);
  if (serviceFeeCents < config.serviceFeeMinCents) serviceFeeCents = config.serviceFeeMinCents;
  const logisticsFeeCents = config.logisticsBaseCents;
  // Alfândega sobre CIF (subtotal + logística)
  const cifBaseCents = itemsSubtotalCents + logisticsFeeCents;
  let customsFeeCents = Math.round(cifBaseCents * config.customsFeePct);
  if (customsFeeCents < config.customsFeeMinCents) customsFeeCents = config.customsFeeMinCents;
  let deliveryFeeCents = config.localDeliveryCents;
  if (province && config.deliveryByProvince && config.deliveryByProvince[province] != null) {
    deliveryFeeCents = config.deliveryByProvince[province];
  }
  const rawTotal = itemsSubtotalCents + serviceFeeCents + logisticsFeeCents + customsFeeCents + deliveryFeeCents;
  const totalCents = roundToNearest(rawTotal, config.roundToNearestCents);
  return { itemsSubtotalCents, serviceFeeCents, logisticsFeeCents, customsFeeCents, deliveryFeeCents, totalCents };
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
