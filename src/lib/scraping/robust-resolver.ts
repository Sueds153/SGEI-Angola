/**
 * Resolvedor Robusto para AliExpress e Shein
 * 
 * Camadas de defesa:
 * 1. Cache interno (instantâneo)
 * 2. Catálogo admin (produtos já validados)
 * 3. Scraping direto com múltiplas estratégias
 * 4. APIs externas (RapidAPI, scraping services)
 * 5. Fallback gracioso → "needs_price" com UX guiada
 * 6. Fila de revisão manual para casos difíceis
 */

import { loadPricingConfig, calculatePrice } from "@/lib/pricing";
import { getActiveProvider } from "@/lib/providers";
import { resolveAndScrapeUrl } from "@/lib/scraping/url-resolver";
import { extractProductId, isSupportedPlatform } from "@/lib/scraping";
import { scrapeWithFallback, clearScrapingCache, getCacheStats } from "@/lib/scraping/scraping-service";
import { scrapeWithFreeFallback } from "@/lib/scraping/free-scraper";
import { parseAliExpressHtml } from "@/lib/scraping/aliexpress-parser";
import { parseSheinHtml } from "@/lib/scraping/shein-parser";
import type { NormalizedProduct } from "@/lib/types";

export interface ResolutionAttempt {
  method: string;
  success: boolean;
  error?: string;
  durationMs: number;
}

export interface RobustResolveResult {
  success: boolean;
  status: "found" | "needs_price" | "unsupported" | "rate_limited" | "blocked" | "error";
  platform: string;
  source?: string;
  productId?: string;
  externalId?: string;
  title: string;
  price?: number;
  currency: string;
  images: string[];
  defaultImage?: string;
  sourceUrl: string;
  estimatedTotalAOA?: number;
  exchangeRate?: number;
  serviceFee?: number;
  logisticsFee?: number;
  deliveryFee?: number;
  estimatedDays?: number;
  hasBuyerProtection?: boolean;
  buyerProtectionFee?: number;
  buyerProtectionFeeAOA?: number;
  priceWithProtection?: number;
  priceWithProtectionAOA?: number;
  error?: string;
  errorCode?: string;
  attempts?: ResolutionAttempt[];
  fallbackUsed?: string;
  requiresManualReview?: boolean;
  reviewReason?: string;
  // Vinted specific
  vintedBasePrice?: number;
  vintedProtectionFee?: number;
  vintedTotalPrice?: number;
}

interface SheinShareLinkDetails {
  productId: string;
  title: string;
  image: string | null;
}

// Cache de resoluções falhadas para evitar retry loops
const failedResolutionCache = new Map<string, { timestamp: number; error: string; attempts: number }>();
const FAILED_CACHE_TTL = 1000 * 60 * 15; // 15 min
const MAX_RETRIES_PER_URL = 3;

const USER_AGENTS = [
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
];

function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function cleanFailedCache(): void {
  const now = Date.now();
  for (const [key, value] of failedResolutionCache.entries()) {
    if (now - value.timestamp > FAILED_CACHE_TTL) {
      failedResolutionCache.delete(key);
    }
  }
}

function getCachedFailure(url: string): { error: string; attempts: number } | null {
  cleanFailedCache();
  const cached = failedResolutionCache.get(url);
  if (cached && Date.now() - cached.timestamp < FAILED_CACHE_TTL) {
    return { error: cached.error, attempts: cached.attempts };
  }
  if (cached) failedResolutionCache.delete(url);
  return null;
}

function decodeHtmlText(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_match, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_match, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .trim();
}

function getMetaContent(html: string, property: string): string | null {
  const metaTags = html.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of metaTags) {
    const propertyMatch = tag.match(/\b(?:property|name)=["']([^"']+)["']/i);
    if (propertyMatch?.[1]?.toLowerCase() !== property.toLowerCase()) continue;
    const content = tag.match(/\bcontent=["']([^"']*)["']/i)?.[1];
    if (content) return decodeHtmlText(content);
  }
  return null;
}

/** Lê a página de partilha da SHEIN, onde a app embute o ID no deeplink. */
async function resolveSheinShareLink(url: string): Promise<SheinShareLinkDetails | null> {
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return null;
  }

  // Não fazemos fetch a URLs arbitrários nem seguimos redirects do link curto.
  if (parsedUrl.protocol !== "https:" || parsedUrl.hostname.toLowerCase() !== "onelink.shein.com") {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(parsedUrl, {
      headers: {
        "User-Agent": getRandomUserAgent(),
        Accept: "text/html,application/xhtml+xml",
      },
      redirect: "error",
      signal: controller.signal,
    });
    if (!response.ok) return null;

    const html = await response.text();
    const deeplinkTag = (html.match(/<input\b(?=[^>]*\bid=["']deeplink["'])[^>]*>/i) || [])[0];
    const deeplink = deeplinkTag?.match(/\bvalue=["']([^"']+)["']/i)?.[1];
    const encodedData = deeplink?.match(/[?&]data=([^&]+)/i)?.[1];
    if (!encodedData) return null;

    let payload: unknown;
    try {
      payload = JSON.parse(decodeURIComponent(encodedData));
    } catch {
      return null;
    }
    const productId = (payload as { goods_id?: unknown } | null)?.goods_id;
    if (typeof productId !== "string" || !/^\d{6,}$/.test(productId)) return null;

    const rawTitle = getMetaContent(html, "og:title") ||
      decodeHtmlText(html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "");
    const title = rawTitle.replace(/\s*[-|–]\s*SHEIN.*$/i, "").trim();

    const rawImage = getMetaContent(html, "og:image");
    let image: string | null = null;
    if (rawImage) {
      try {
        const imageUrl = new URL(rawImage.startsWith("//") ? `https:${rawImage}` : rawImage);
        if ((imageUrl.protocol === "https:" || imageUrl.protocol === "http:") &&
          (imageUrl.hostname === "ltwebstatic.com" || imageUrl.hostname.endsWith(".ltwebstatic.com"))) {
          imageUrl.protocol = "https:";
          image = imageUrl.toString();
        }
      } catch {
        image = null;
      }
    }

    return { productId, title, image };
  } catch (error) {
    console.warn("[RobustResolver] SHEIN share link could not be resolved:", error instanceof Error ? error.message : "Unknown error");
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

function recordFailure(url: string, error: string): void {
  const existing = failedResolutionCache.get(url);
  failedResolutionCache.set(url, {
    timestamp: Date.now(),
    error,
    attempts: (existing?.attempts || 0) + 1,
  });
}

function isRateLimited(error: string): boolean {
  const rateLimitIndicators = [
    "429", "too many requests", "rate limit", "rate limited",
    "quota exceeded", "too many attempts", "try again later",
    "blocked by cloudflare", "challenge", "captcha",
  ];
  return rateLimitIndicators.some((ind) => error.toLowerCase().includes(ind));
}

function isBlocked(error: string): boolean {
  const blockedIndicators = [
    "403", "forbidden", "access denied", "blocked",
    "cloudflare", "bot detection", "automated access",
    "please enable javascript", "enable cookies",
  ];
  return blockedIndicators.some((ind) => error.toLowerCase().includes(ind));
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 2,
  backoffMs = 1000
): Promise<Response | null> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.status === 429) {
        // Rate limited - wait longer before retry
        await sleep(backoffMs * Math.pow(2, attempt + 1));
        continue;
      }
      
      return response;
    } catch (error: any) {
      if (attempt === retries) throw error;
      // Exponential backoff with jitter
      await sleep(backoffMs * Math.pow(2, attempt) + Math.random() * 500);
    }
  }
  return null;
}

/**
 * Tenta resolver via catálogo interno (admin + mock)
 */
async function tryInternalCatalog(url: string): Promise<RobustResolveResult | null> {
  try {
    const requested = extractProductId(url);
    if (!requested) return null;

    const provider = await getActiveProvider();
    const result = await provider.resolveProductFromUrl(url);
    
    if (result.status === "found" && result.product) {
      const prod = result.product as any;
      // Catálogo/demo só pode responder quando a plataforma e o ID coincidem.
      // O provider de administração também pode procurar por URL parcial.
      if (prod.source?.toLowerCase() !== requested.platform || prod.externalId !== requested.id) {
        return null;
      }

      const config = await loadPricingConfig();
      const price = Number(prod.originalPriceUsd);
      if (!Number.isFinite(price) || price <= 0) return null;
      const breakdown = calculatePrice({ productPriceUsd: price, quantity: 1, weightGrams: prod.weightGrams }, config);

      return {
        success: true,
        status: "found",
        platform: prod.source,
        source: prod.source,
        productId: prod.id,
        externalId: prod.externalId,
        title: prod.name,
        price: price,
        currency: prod.currency || "USD",
        images: prod.images || (prod.defaultImage ? [prod.defaultImage] : []),
        defaultImage: prod.defaultImage || prod.images?.[0] || null,
        sourceUrl: url,
        estimatedTotalAOA: Math.round(breakdown.totalCents / 100),
        exchangeRate: config.exchangeRateUsdToAoa,
        serviceFee: Math.round(breakdown.serviceFeeCents / 100),
        logisticsFee: Math.round(breakdown.logisticsFeeCents / 100),
        deliveryFee: Math.round(breakdown.deliveryFeeCents / 100),
        estimatedDays: 18,
        ...(prod.source === "VINTED" && {
          vintedBasePrice: prod.vintedBasePrice,
          vintedProtectionFee: prod.vintedProtectionFee,
          vintedTotalPrice: prod.vintedTotalPrice,
        }),
        attempts: [{ method: "internal_catalog", success: true, durationMs: 0 }],
      };
    }
  } catch (error: any) {
    console.warn("[RobustResolver] Internal catalog failed:", error.message);
  }
  return null;
}

/**
 * Tenta scraping direto com múltiplas estratégias
 */
async function tryDirectScraping(url: string, platform: string): Promise<RobustResolveResult | null> {
  const attempts: ResolutionAttempt[] = [];
  
  // Estratégia 1: Scraper gratuito (rápido, sem JS rendering)
  const freeStart = Date.now();
  try {
    const freeResult = await scrapeWithFreeFallback(url, "unknown", platform.toLowerCase(), {
      timeout: 10000,
      maxRetries: 1,
    });
    attempts.push({ method: "free_scraper", success: freeResult.success, error: freeResult.error, durationMs: Date.now() - freeStart });
    
    if (freeResult.success && freeResult.html) {
      let parsed = null;
      if (platform === "ALIEXPRESS") {
        const productId = extractProductId(url)?.id;
        if (productId) parsed = parseAliExpressHtml(freeResult.html, productId);
      } else if (platform === "SHEIN") {
        const productId = extractProductId(url)?.id;
        if (productId) parsed = parseSheinHtml(freeResult.html, productId);
      }
      
      if (parsed) {
        const config = await loadPricingConfig();
        // Determine currency from platform since not all parsers return it
        const currency = platform === "VINTED" ? "EUR" : 
                         (parsed as any).currency || "USD";
        const rate = currency === "EUR" ? config.exchangeRateUsdToAoa * 1.08 : config.exchangeRateUsdToAoa;
        const breakdown = calculatePrice({
          productPriceUsd: parsed.price.min,
          quantity: 1,
          weightGrams: 300,
        }, config);
        
        return {
          success: true,
          status: "found",
          platform,
          productId: parsed.id,
          title: parsed.title,
          price: parsed.price.min,
          currency,
          images: parsed.images,
          defaultImage: parsed.images[0],
          sourceUrl: url,
          estimatedTotalAOA: Math.round(breakdown.totalCents / 100),
          exchangeRate: Math.round(rate),
          serviceFee: Math.round(breakdown.serviceFeeCents / 100),
          logisticsFee: Math.round(breakdown.logisticsFeeCents / 100),
          deliveryFee: Math.round(breakdown.deliveryFeeCents / 100),
          estimatedDays: 18,
          attempts,
          fallbackUsed: "free_scraper",
        };
      }
    }
  } catch (error: any) {
    attempts.push({ method: "free_scraper", success: false, error: error.message, durationMs: Date.now() - freeStart });
  }
  
  // Estratégia 2: Scraper premium (com JS rendering)
  const premiumStart = Date.now();
  try {
    const scrapeResult = await scrapeWithFallback(url, "unknown", {
      renderJs: true,
      premiumProxy: true,
      timeout: 30000,
    });
    attempts.push({ method: "premium_scraper", success: scrapeResult.success, error: scrapeResult.error, durationMs: Date.now() - premiumStart });
    
    if (scrapeResult.success && scrapeResult.html) {
      let parsed = null;
      const productId = extractProductId(url)?.id;
      if (platform === "ALIEXPRESS" && productId) {
        parsed = parseAliExpressHtml(scrapeResult.html, productId);
      } else if (platform === "SHEIN" && productId) {
        parsed = parseSheinHtml(scrapeResult.html, productId);
      }
      
      if (parsed) {
        const config = await loadPricingConfig();
        const currency = platform === "VINTED" ? "EUR" : 
                         (parsed as any).currency || "USD";
        const rate = currency === "EUR" ? config.exchangeRateUsdToAoa * 1.08 : config.exchangeRateUsdToAoa;
        const breakdown = calculatePrice({
          productPriceUsd: parsed.price.min,
          quantity: 1,
          weightGrams: 300,
        }, config);
        
        return {
          success: true,
          status: "found",
          platform,
          productId: parsed.id,
          title: parsed.title,
          price: parsed.price.min,
          currency,
          images: parsed.images,
          defaultImage: parsed.images[0],
          sourceUrl: url,
          estimatedTotalAOA: Math.round(breakdown.totalCents / 100),
          exchangeRate: Math.round(rate),
          serviceFee: Math.round(breakdown.serviceFeeCents / 100),
          logisticsFee: Math.round(breakdown.logisticsFeeCents / 100),
          deliveryFee: Math.round(breakdown.deliveryFeeCents / 100),
          estimatedDays: 18,
          attempts,
          fallbackUsed: "premium_scraper",
        };
      }
    }
  } catch (error: any) {
    attempts.push({ method: "premium_scraper", success: false, error: error.message, durationMs: Date.now() - premiumStart });
    
    // Se erro for rate limit ou bloqueio, retorna erro específico
    if (isRateLimited(error.message)) {
      return {
        success: false,
        status: "rate_limited",
        platform,
        title: "",
        currency: "USD",
        images: [],
        sourceUrl: url,
        error: "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
        errorCode: "RATE_LIMITED",
        attempts,
        requiresManualReview: true,
        reviewReason: "Rate limited by target site",
      };
    }
    if (isBlocked(error.message)) {
      return {
        success: false,
        status: "blocked",
        platform,
        title: "",
        currency: "USD",
        images: [],
        sourceUrl: url,
        error: "Acesso bloqueado pela loja. Nossa equipe revisará manualmente.",
        errorCode: "BLOCKED",
        attempts,
        requiresManualReview: true,
        reviewReason: "Blocked by anti-bot protection",
      };
    }
  }
  
  return null;
}

/**
 * Tenta resolver via URL resolver universal (OpenGraph, JSON-LD)
 */
async function tryUniversalResolver(url: string): Promise<RobustResolveResult | null> {
  const start = Date.now();
  try {
    const result = await resolveAndScrapeUrl(url);
    const durationMs = Date.now() - start;
    
    if (result.success) {
      return {
        ...result,
        attempts: [{ method: "universal_resolver", success: true, durationMs }],
        fallbackUsed: "universal_resolver",
      } as RobustResolveResult;
    }
    
    return {
      ...result,
      attempts: [{ method: "universal_resolver", success: false, error: result.error, durationMs }],
    } as RobustResolveResult;
  } catch (error: any) {
    return {
      success: false,
      status: "error",
      platform: "Desconhecido",
      title: "",
      currency: "USD",
      images: [],
      sourceUrl: url,
      error: error.message,
      attempts: [{ method: "universal_resolver", success: false, error: error.message, durationMs: Date.now() - start }],
    };
  }
}

/**
 * Fallback final: devolve estrutura para input manual de preço
 */
function createManualPriceFallback(url: string, platform: string, error: string, attempts: ResolutionAttempt[]): RobustResolveResult {
  const platformNames: Record<string, string> = {
    ALIEXPRESS: "AliExpress",
    SHEIN: "SHEIN",
    VINTED: "Vinted",
  };
  
  return {
    success: true,
    status: "needs_price",
    platform: platformNames[platform] || platform,
    title: `Artigo ${platformNames[platform] || platform}`,
    currency: platform === "VINTED" ? "EUR" : "USD",
    images: [],
    sourceUrl: url,
    estimatedDays: 18,
    error: `Não foi possível extrair o preço automaticamente: ${error}. Por favor, indique o valor que vê na loja.`,
    errorCode: "NEEDS_MANUAL_PRICE",
    attempts,
    fallbackUsed: "manual_price_input",
    requiresManualReview: false,
  };
}

/**
 * Função principal de resolução robusta
 */
export async function robustResolveProductUrl(rawInput: string): Promise<RobustResolveResult> {
  const url = rawInput.trim();
  
  if (!url) {
    return {
      success: false,
      status: "unsupported",
      platform: "Desconhecido",
      title: "",
      currency: "USD",
      images: [],
      sourceUrl: url,
      error: "Por favor insira um link válido.",
      errorCode: "EMPTY_URL",
    };
  }
  
  // Validação básica de URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Invalid protocol");
    }
  } catch {
    return {
      success: false,
      status: "unsupported",
      platform: "Desconhecido",
      title: "",
      currency: "USD",
      images: [],
      sourceUrl: url,
      error: "Link inválido. Use um link completo começando com http:// ou https://",
      errorCode: "INVALID_URL_FORMAT",
    };
  }
  
  // Detecta plataforma
  const platform = isSupportedPlatform(url);
  if (!platform) {
    return {
      success: false,
      status: "unsupported",
      platform: "Loja não suportada",
      title: "",
      currency: "USD",
      images: [],
      sourceUrl: url,
      error: "Esta loja ainda não é suportada. Suportamos: SHEIN, AliExpress, Vinted, Zara, Amazon.",
      errorCode: "UNSUPPORTED_PLATFORM",
    };
  }
  
  const platformNames: Record<string, string> = {
    aliexpress: "AliExpress",
    shein: "SHEIN",
    vinted: "Vinted",
  };
  const displayPlatform = platformNames[platform] || platform.toUpperCase();
  
  // Verifica cache de falhas recentes
  const cachedFailure = getCachedFailure(url);
  if (cachedFailure && cachedFailure.attempts >= MAX_RETRIES_PER_URL) {
    return {
      success: false,
      status: "error",
      platform: displayPlatform,
      title: "",
      currency: "USD",
      images: [],
      sourceUrl: url,
      error: `Este link falhou ${cachedFailure.attempts} vezes recentemente: ${cachedFailure.error}. Tente novamente mais tarde ou contacte o apoio.`,
      errorCode: "MAX_RETRIES_EXCEEDED",
      requiresManualReview: true,
      reviewReason: `Exceeded ${MAX_RETRIES_PER_URL} retries`,
    };
  }

  // Links one-link da app SHEIN não incluem o ID no URL visível. O ID, título
  // e imagem vêm da página HTTPS oficial da partilha; sem preço nessa página,
  // pedimos o valor manualmente em vez de rejeitar o link ou inventar um preço.
  const shareLinkStartedAt = Date.now();
  const sheinShareDetails = await resolveSheinShareLink(url);
  if (sheinShareDetails) {
    const catalogLookupUrl = new URL(url);
    catalogLookupUrl.searchParams.set("goods_sn", sheinShareDetails.productId);
    const catalogResult = await tryInternalCatalog(catalogLookupUrl.toString());
    if (catalogResult) {
      return { ...catalogResult, sourceUrl: url };
    }

    const manualResult = createManualPriceFallback(
      url,
      "SHEIN",
      "A página de partilha não disponibiliza o preço do artigo.",
      [{ method: "shein_share_link", success: true, durationMs: Date.now() - shareLinkStartedAt }]
    );
    return {
      ...manualResult,
      productId: sheinShareDetails.productId,
      externalId: sheinShareDetails.productId,
      title: sheinShareDetails.title || manualResult.title,
      images: sheinShareDetails.image ? [sheinShareDetails.image] : [],
      defaultImage: sheinShareDetails.image || undefined,
      error: "Artigo SHEIN identificado. A partilha não contém o preço; indique o valor que vê na loja.",
    };
  }
  
  const allAttempts: ResolutionAttempt[] = [];
  
  // CAMADA 1: Catálogo interno (instantâneo)
  const internalResult = await tryInternalCatalog(url);
  if (internalResult) return internalResult;
  
  // CAMADA 2: Scraping direto (mais confiável para AliExpress/Shein)
  const directResult = await tryDirectScraping(url, platform.toUpperCase());
  if (directResult) {
    if (directResult.status === "found") return directResult;
    // Se rate limited ou blocked, retorna imediatamente para não insistir
    if (directResult.status === "rate_limited" || directResult.status === "blocked") {
      recordFailure(url, directResult.error || "Unknown error");
      return directResult;
    }
    allAttempts.push(...(directResult.attempts || []));
  }
  
  // CAMADA 3: Resolvedor universal (OpenGraph, JSON-LD)
  const universalResult = await tryUniversalResolver(url);
  if (universalResult) {
    // O resolver universal baseia-se em OpenGraph/regex sem validar o ID do
    // artigo. Para estes marketplaces seria suficiente para voltar a mostrar
    // recomendações como se fossem o produto pedido.
    const requiresProductIdentity = platform === "shein" || platform === "aliexpress";
    if (universalResult.success && universalResult.status === "found" && !requiresProductIdentity) {
      return universalResult;
    }
    allAttempts.push(...(universalResult.attempts || []));
  }
  
  // CAMADA 4: Fallback gracioso → input manual
  const lastError = allAttempts.find((a) => !a.success)?.error || "Não foi possível obter dados da loja";
  recordFailure(url, lastError);
  
  return createManualPriceFallback(url, platform.toUpperCase(), lastError, allAttempts);
}

/**
 * Força limpeza do cache de falhas (útil para admin)
 */
export function clearFailedResolutionCache(): void {
  failedResolutionCache.clear();
}

/**
 * Obtém estatísticas do cache de falhas
 */
export function getFailedResolutionStats(): { size: number; entries: Array<{ url: string; error: string; attempts: number; ageMs: number }> } {
  cleanFailedCache();
  const now = Date.now();
  const entries = Array.from(failedResolutionCache.entries()).map(([url, data]) => ({
    url,
    error: data.error,
    attempts: data.attempts,
    ageMs: now - data.timestamp,
  }));
  return { size: entries.length, entries };
}

/**
 * Adiciona URL à fila de revisão manual (para ser chamado quando requiresManualReview = true)
 */
export async function queueForManualReview(url: string, reason: string, userId?: number): Promise<void> {
  console.log("[ManualReview] Queued for review:", { url, reason, userId, timestamp: new Date().toISOString() });
  
  try {
    const { db } = await import("@/db");
    const { manualReviewQueue } = await import("@/db/schema");
    await db.insert(manualReviewQueue).values({
      url,
      reason,
      userId: userId || null,
      status: "PENDING",
      createdAt: new Date(),
    }).onConflictDoUpdate({
      target: manualReviewQueue.url,
      set: { reason, userId: userId || null, status: "PENDING", updatedAt: new Date() },
    });
  } catch (error) {
    console.error("[ManualReview] Failed to queue:", error);
  }
}
