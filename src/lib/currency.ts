import type { PricingConfig } from "./pricing";

/**
 * Sistema de Conversão Multi-Moeda
 * Suporta: USD (Shein), EUR (Vinted), CNY (AliExpress), USD (AliExpress), AOA (Final)
 */

export type SupportedCurrency = "USD" | "EUR" | "CNY" | "AOA";

export interface ExchangeRates {
  USD_TO_AOA: number;
  EUR_TO_AOA: number;
  CNY_TO_AOA: number;
  updatedAt: Date;
}

// Taxas padrão (atualizadas via admin ou job automático)
export const DEFAULT_EXCHANGE_RATES: ExchangeRates = {
  USD_TO_AOA: 920,
  EUR_TO_AOA: 980, // ~1.06 USD/EUR * 920
  CNY_TO_AOA: 127, // ~0.138 USD/CNY * 920
  updatedAt: new Date(),
};

/**
 * Converte qualquer moeda suportada para AOA (cêntimos)
 */
export function convertToAoaCents(
  amount: number,
  fromCurrency: SupportedCurrency,
  rates: ExchangeRates
): number {
  let rate: number;
  switch (fromCurrency) {
    case "USD":
      rate = rates.USD_TO_AOA;
      break;
    case "EUR":
      rate = rates.EUR_TO_AOA;
      break;
    case "CNY":
      rate = rates.CNY_TO_AOA;
      break;
    case "AOA":
      rate = 1;
      break;
    default:
      rate = rates.USD_TO_AOA; // fallback
  }
  // amount vem em unidades (ex: 18.90 USD) → converte para cêntimos AOA
  return Math.round(amount * rate * 100);
}

/**
 * Converte AOA cêntimos para moeda de origem (para exibição/admin)
 */
export function convertFromAoaCents(
  aoaCents: number,
  toCurrency: SupportedCurrency,
  rates: ExchangeRates
): number {
  let rate: number;
  switch (toCurrency) {
    case "USD":
      rate = rates.USD_TO_AOA;
      break;
    case "EUR":
      rate = rates.EUR_TO_AOA;
      break;
    case "CNY":
      rate = rates.CNY_TO_AOA;
      break;
    case "AOA":
      rate = 1;
      break;
    default:
      rate = rates.USD_TO_AOA;
  }
  return aoaCents / (rate * 100);
}

/**
 * Obtém taxa de câmbio baseada na configuração de pricing
 * Mantém compatibilidade com PricingConfig existente
 */
export function getExchangeRatesFromConfig(config: PricingConfig): ExchangeRates {
  return {
    USD_TO_AOA: config.exchangeRateUsdToAoa,
    EUR_TO_AOA: Math.round(config.exchangeRateUsdToAoa * 1.06), // EUR ≈ 1.06 USD
    CNY_TO_AOA: Math.round(config.exchangeRateUsdToAoa * 0.138), // CNY ≈ 0.138 USD
    updatedAt: new Date(),
  };
}

/**
 * Formata moeda para exibição
 */
export function formatCurrency(amount: number, currency: SupportedCurrency): string {
  const formatter = new Intl.NumberFormat("pt-PT", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

/**
 * Detecta moeda baseada na source/origem
 */
export function detectCurrencyFromSource(source: string): SupportedCurrency {
  switch (source.toUpperCase()) {
    case "SHEIN":
      return "USD";
    case "ALIEXPRESS":
      return "USD"; // AliExpress geralmente em USD para internacional
    case "VINTED":
      return "EUR";
    default:
      return "USD";
  }
}

/**
 * Normaliza produto para moeda base do provider
 */
export interface NormalizedPrice {
  amount: number; // em unidades da moeda original (ex: 18.90)
  currency: SupportedCurrency;
  aoaCents: number; // já convertido para AOA cêntimos
}

export function normalizePrice(
  rawPrice: number | string | null,
  sourceCurrency: SupportedCurrency,
  rates: ExchangeRates
): NormalizedPrice | null {
  if (rawPrice === null || rawPrice === undefined) return null;
  const amount = typeof rawPrice === "string" ? parseFloat(rawPrice) : rawPrice;
  if (isNaN(amount)) return null;
  
  return {
    amount,
    currency: sourceCurrency,
    aoaCents: convertToAoaCents(amount, sourceCurrency, rates),
  };
}