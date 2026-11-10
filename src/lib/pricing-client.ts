// Cálculo de preço no cliente (sem acesso à DB)
// Este espelha o cálculo do servidor mas lê configs de um endpoint público.

export type SupportedCurrency = "USD" | "EUR" | "CNY" | "AOA";

export interface ClientPricingConfig {
  exchangeRateUsdToAoa: number;
  exchangeRateEurToAoa: number;
  exchangeRateCnyToAoa: number;
  serviceFeePct: number;
  serviceFeeMinCents: number;
  logisticsBaseCents: number;
  logisticsPerGramCents: number;
  localDeliveryCents: number;
  roundToNearestCents: number;
  deliveryByProvince: Record<string, number>;
}

let cachedConfig: ClientPricingConfig | null = null;
let cachePromise: Promise<ClientPricingConfig> | null = null;

export async function getPricingConfig(): Promise<ClientPricingConfig> {
  if (cachedConfig) return cachedConfig;
  if (cachePromise) return cachePromise;
  cachePromise = fetch("/api/pricing/config", { next: { revalidate: 300 } })
    .then((r) => r.json())
    .then((data) => {
      cachedConfig = data;
      return data;
    });
  return cachePromise;
}

function roundToNearest(cents: number, nearest: number): number {
  if (nearest <= 0) return Math.round(cents);
  return Math.round(cents / nearest) * nearest;
}

/**
 * Converte valor na moeda original para cêntimos AOA
 */
export function convertToAoaCents(
  amount: number,
  currency: SupportedCurrency,
  cfg: ClientPricingConfig
): number {
  let rate: number;
  switch (currency) {
    case "USD":
      rate = cfg.exchangeRateUsdToAoa;
      break;
    case "EUR":
      rate = cfg.exchangeRateEurToAoa;
      break;
    case "CNY":
      rate = cfg.exchangeRateCnyToAoa;
      break;
    case "AOA":
      rate = 1;
      break;
    default:
      rate = cfg.exchangeRateUsdToAoa;
  }
  return Math.round(amount * rate * 100);
}

export interface ClientCalcInput {
  productPrice: number;        // Preço na moeda original do produto
  productCurrency: SupportedCurrency; // Moeda do produto (USD, EUR, CNY)
  quantity?: number;
  weightGrams?: number | null;
  variantPriceModifier?: number; // Modificador na mesma moeda do produto
  province?: string | null;
}

export function clientCalculatePrice(
  input: ClientCalcInput,
  cfg: ClientPricingConfig
): {
  subtotalCents: number;
  serviceFeeCents: number;
  logisticsFeeCents: number;
  deliveryFeeCents: number;
  totalCents: number;
} {
  const quantity = input.quantity ?? 1;
  const unitPrice = input.productPrice + (input.variantPriceModifier ?? 0);
  const totalPrice = unitPrice * quantity;
  
  // Converte para AOA cêntimos usando a taxa correta
  const grossProductCents = convertToAoaCents(totalPrice, input.productCurrency, cfg);

  let serviceFeeCents = Math.round(grossProductCents * cfg.serviceFeePct);
  if (serviceFeeCents < cfg.serviceFeeMinCents) serviceFeeCents = cfg.serviceFeeMinCents;

  const weightLogisticsCents = input.weightGrams
    ? Math.round(input.weightGrams * cfg.logisticsPerGramCents * quantity)
    : 0;
  const logisticsFeeCents = cfg.logisticsBaseCents * quantity + weightLogisticsCents;

  let deliveryFeeCents = cfg.localDeliveryCents;
  if (input.province && cfg.deliveryByProvince && cfg.deliveryByProvince[input.province] != null) {
    deliveryFeeCents = cfg.deliveryByProvince[input.province];
  }

  const rawTotal = grossProductCents + serviceFeeCents + logisticsFeeCents + deliveryFeeCents;
  const totalCents = roundToNearest(rawTotal, cfg.roundToNearestCents);

  return {
    subtotalCents: grossProductCents,
    serviceFeeCents,
    logisticsFeeCents,
    deliveryFeeCents,
    totalCents,
  };
}

export function formatCents(cents: number): string {
  const kz = Math.round(cents) / 100;
  return new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 0 }).format(kz) + " Kz";
}
