/**
 * Serviço de Atualização de Taxas de Câmbio
 * 
 * Atualiza taxas de câmbio de fontes externas ou via admin
 * Fontes:
 * 1. ExchangeRate-API (gratuito)
 * 2. Frankfurter API (gratuito, sem chave)
 * 3. Valor hardcoded do admin
 */

import { setPricingConfig, loadPricingConfig } from "@/lib/pricing";

interface ExchangeApiResponse {
  rates?: {
    AOA?: number;
    EUR?: number;
    CNY?: number;
  };
  base?: string;
  date?: string;
}

// Cache em memória
let cachedRates: { USD_TO_AOA: number; EUR_TO_AOA: number; CNY_TO_AOA: number; updatedAt: Date } | null = null;
let lastFetchTime = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 hora

export async function fetchExchangeRates(): Promise<{ USD_TO_AOA: number; EUR_TO_AOA: number; CNY_TO_AOA: number } | null> {
  try {
    // Tenta múltiplas APIs em sequência
    const sources = [
      fetchFrankfurterApi,
      fetchExchangeRateApi,
    ];

    for (const fetcher of sources) {
      try {
        const rates = await fetcher();
        if (rates && rates.USD_TO_AOA > 0) {
          console.log('[ExchangeRates] Taxas atualizadas com sucesso');
          return rates;
        }
      } catch (error) {
        console.warn('[ExchangeRates] Fonte falhou, tentando próxima...');
      }
    }

    console.warn('[ExchangeRates] Todas as fontes falharam, usando valores do admin');
    return null;
  } catch (error) {
    console.error('[ExchangeRates] Erro ao buscar taxas:', error);
    return null;
  }
}

async function fetchFrankfurterApi(): Promise<{ USD_TO_AOA: number; EUR_TO_AOA: number; CNY_TO_AOA: number } | null> {
  // Frankfurter API é gratuita e não precisa de chave
  // Base em EUR
  const response = await fetch('https://api.frankfurter.app/latest?from=EUR&to=AOA&to=USD&to=CNY', {
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) return null;

  const data: ExchangeApiResponse = await response.json();
  if (!data.rates || !data.rates.AOA) return null;

  const eurToAoa = data.rates.AOA;
  const eurToUsd = data.rates.USD;
  const eurToCny = data.rates.CNY;

  if (!eurToUsd || !eurToCny) return null;

  // Converte tudo para base AOA
  return {
    USD_TO_AOA: Math.round(eurToAoa / eurToUsd),
    EUR_TO_AOA: Math.round(eurToAoa),
    CNY_TO_AOA: Math.round(eurToAoa / eurToCny),
  };
}

async function fetchExchangeRateApi(): Promise<{ USD_TO_AOA: number; EUR_TO_AOA: number; CNY_TO_AOA: number } | null> {
  // ExchangeRate-API (versão gratuita)
  const response = await fetch('https://open.er-api.com/v6/latest/USD', {
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) return null;

  const data: ExchangeApiResponse = await response.json();
  if (!data.rates || !data.rates.AOA) return null;

  const usdToAoa = data.rates.AOA;
  
  // Precisa buscar EUR e CNY separadamente
  const [eurRes, cnyRes] = await Promise.all([
    fetch('https://open.er-api.com/v6/latest/EUR', { signal: AbortSignal.timeout(5000) }).catch(() => null),
    fetch('https://open.er-api.com/v6/latest/CNY', { signal: AbortSignal.timeout(5000) }).catch(() => null),
  ]);

  const eurData = eurRes?.ok ? (await eurRes.json()) as ExchangeApiResponse : null;
  const cnyData = cnyRes?.ok ? (await cnyRes.json()) as ExchangeApiResponse : null;

  const eurToAoa = eurData?.rates?.AOA || Math.round(usdToAoa * 1.06);
  const cnyToAoa = cnyData?.rates?.AOA || Math.round(usdToAoa * 0.138);

  return {
    USD_TO_AOA: Math.round(usdToAoa),
    EUR_TO_AOA: Math.round(eurToAoa),
    CNY_TO_AOA: Math.round(cnyToAoa),
  };
}

export async function updateExchangeRatesInDb(): Promise<boolean> {
  try {
    const rates = await fetchExchangeRates();
    
    if (!rates) {
      console.warn('[ExchangeRates] Não foi possível atualizar taxas automaticamente');
      return false;
    }

    // Salva no banco
    await setPricingConfig('exchangeRateUsdToAoa', String(rates.USD_TO_AOA));
    await setPricingConfig('exchangeRateEurToAoa', String(rates.EUR_TO_AOA));
    await setPricingConfig('exchangeRateCnyToAoa', String(rates.CNY_TO_AOA));
    await setPricingConfig('exchangeRatesUpdatedAt', new Date().toISOString());

    // Atualiza cache
    cachedRates = { ...rates, updatedAt: new Date() };
    
    console.log(`[ExchangeRates] Taxas atualizadas no DB: USD=${rates.USD_TO_AOA}, EUR=${rates.EUR_TO_AOA}, CNY=${rates.CNY_TO_AOA}`);
    return true;
  } catch (error) {
    console.error('[ExchangeRates] Erro ao atualizar taxas no DB:', error);
    return false;
  }
}

export async function getExchangeRates(): Promise<{ USD_TO_AOA: number; EUR_TO_AOA: number; CNY_TO_AOA: number; updatedAt: Date }> {
  // Verifica cache primeiro
  if (cachedRates && Date.now() - lastFetchTime < CACHE_TTL) {
    return cachedRates;
  }

  try {
    const config = await loadPricingConfig();
    
    // Tenta buscar taxas atuais
    const rates = await fetchExchangeRates();
    
    if (rates) {
      cachedRates = { ...rates, updatedAt: new Date() };
      lastFetchTime = Date.now();
    } else {
      // Usa taxas do admin
      cachedRates = {
        USD_TO_AOA: config.exchangeRateUsdToAoa,
        EUR_TO_AOA: Math.round(config.exchangeRateUsdToAoa * 1.06),
        CNY_TO_AOA: Math.round(config.exchangeRateUsdToAoa * 0.138),
        updatedAt: new Date(),
      };
    }
  } catch (error) {
    console.error('[ExchangeRates] Erro ao obter taxas:', error);
  }

  return cachedRates || {
    USD_TO_AOA: 920,
    EUR_TO_AOA: 980,
    CNY_TO_AOA: 127,
    updatedAt: new Date(),
  };
}

export function clearExchangeRateCache(): void {
  cachedRates = null;
  lastFetchTime = 0;
  console.log('[ExchangeRates] Cache limpo');
}
