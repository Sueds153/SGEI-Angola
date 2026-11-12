import { aliexpressProvider } from "./aliexpress-provider";
import { vintedProvider } from "./vinted-provider";
import { mockProductProvider } from "./mock-provider";
import { adminCatalogProvider } from "./admin-provider";
import type { NormalizedProduct, ProductSource } from "@/lib/types";
import { isAliExpressUrl, extractAliExpressProductId } from "./aliexpress-provider";
import { isVintedUrl, extractVintedItemId } from "./vinted-provider";
import { extractProductIdFromSheinUrl, isValidHttpUrl } from "@/lib/utils";

export type UnifiedProvider = typeof unifiedProvider;

/**
 * Provider Unificado Inteligente
 * 
 * Roteia automaticamente para o provider correto baseado na URL/domínio
 * Mantém cache em memória para evitar re-fetchs
 * Fallback gracioso para mock/admin
 */
const providerCache = new Map<string, NormalizedProduct>();

const PROVIDERS = [
  { 
    id: "ALIEXPRESS" as ProductSource, 
    instance: aliexpressProvider, 
    matcher: isAliExpressUrl,
    extractor: extractAliExpressProductId 
  },
  { 
    id: "VINTED" as ProductSource, 
    instance: vintedProvider, 
    matcher: isVintedUrl,
    extractor: extractVintedItemId 
  },
  { 
    id: "SHEIN" as ProductSource, 
    instance: mockProductProvider, // mockProductProvider já tem lógica Shein
    matcher: (url: string) => {
      try {
        const hostname = new URL(url).hostname.replace("www.", "");
        return hostname.includes("shein") || hostname.includes("shein.com");
      } catch { return false; }
    },
    extractor: extractProductIdFromSheinUrl
  },
];

function findProvider(url: string) {
  return PROVIDERS.find(p => p.matcher(url));
}

function getCacheKey(providerId: ProductSource, externalId: string) {
  return `${providerId}:${externalId}`;
}

export const unifiedProvider = {
  id: "UNIFIED" as ProductSource,

  async searchProducts(query: string, params?: { category?: string; limit?: number }): Promise<NormalizedProduct[]> {
    // Busca no admin + mock (catálogo próprio)
    // Para busca cross-platform, precisaríamos de APIs de busca de cada um
    const [adminResults, mockResults] = await Promise.all([
      adminCatalogProvider.searchProducts(query, params),
      mockProductProvider.searchProducts(query, params),
    ]);
    
    const existingSlugs = new Set(adminResults.map(p => p.slug));
    const combined = [...adminResults];
    for (const mp of mockResults) {
      if (!existingSlugs.has(mp.slug)) combined.push(mp);
    }
    return combined.slice(0, params?.limit || 24);
  },

  async getProductBySlug(slug: string): Promise<NormalizedProduct | null> {
    // 1) Admin + Mock primeiro (instantâneo, em memória) — inclui produtos demo
    //    com slugs vinted-*/aliexpress-* para não disparar scraping desnecessário
    const admin = await adminCatalogProvider.getProductBySlug(slug);
    if (admin) return admin;
    const mock = await mockProductProvider.getProductBySlug(slug);
    if (mock) return mock;

    // 2) Só então tenta provider externo (scraping real) para slugs desconhecidos
    if (slug.startsWith("aliexpress-")) {
      const cached = providerCache.get(getCacheKey("ALIEXPRESS", slug.replace("aliexpress-", "")));
      if (cached) return cached;
      const product = await aliexpressProvider.getProductBySlug(slug);
      if (product) providerCache.set(getCacheKey("ALIEXPRESS", product.externalId!), product);
      return product;
    }
    if (slug.startsWith("vinted-")) {
      const cached = providerCache.get(getCacheKey("VINTED", slug.replace("vinted-", "")));
      if (cached) return cached;
      const product = await vintedProvider.getProductBySlug(slug);
      if (product) providerCache.set(getCacheKey("VINTED", product.externalId!), product);
      return product;
    }
    return null;
  },

  async getProductByExternalId(externalId: string): Promise<NormalizedProduct | null> {
    // Tenta admin primeiro
    const admin = await adminCatalogProvider.getProductByExternalId(externalId);
    if (admin) return admin;
    
    // Tenta cada provider externo
    for (const { id, instance, extractor } of PROVIDERS) {
      const cacheKey = getCacheKey(id, externalId);
      const cached = providerCache.get(cacheKey);
      if (cached) return cached;
      
      const product = await instance.getProductByExternalId(externalId);
      if (product) {
        providerCache.set(cacheKey, product);
        return product;
      }
    }
    return mockProductProvider.getProductByExternalId(externalId);
  },

  async resolveProductFromUrl(url: string): Promise<{
    status: "found" | "needs_confirmation" | "unsupported";
    externalId?: string;
    product?: NormalizedProduct | null;
  }> {
    if (!isValidHttpUrl(url)) {
      return { status: "unsupported" };
    }

    // 1. Verifica se já temos no catálogo admin (por sourceUrl)
    const adminResult = await adminCatalogProvider.resolveProductFromUrl(url);
    if (adminResult.status === "found") {
      return adminResult;
    }

    // 2. Identifica provider pela URL
    const provider = findProvider(url);
    if (!provider) {
      // Não é URL conhecida - tenta mock (Shein) como fallback
      return mockProductProvider.resolveProductFromUrl(url);
    }

    // 3. Extrai ID e busca no cache
    const externalId = provider.extractor(url);
    if (externalId) {
      const cacheKey = getCacheKey(provider.id, externalId);
      const cached = providerCache.get(cacheKey);
      if (cached) {
        return { status: "found", externalId, product: cached };
      }
    }

    // 4. Delega para o provider específico
    const result = await provider.instance.resolveProductFromUrl(url);
    
    // 5. Cacheia se encontrado
    if (result.status === "found" && result.product && result.externalId) {
      providerCache.set(getCacheKey(provider.id, result.externalId), result.product);
    }

    return result;
  },

  async getProductsByCategory(categorySlug: string, params?: { limit?: number; offset?: number; sort?: string }): Promise<{ products: NormalizedProduct[]; total: number }> {
    // Para categorias, usa admin + mock
    return adminCatalogProvider.getProductsByCategory(categorySlug, params);
  },

  async getFeaturedProducts(limit = 8): Promise<NormalizedProduct[]> {
    // Combina admin + mock
    const [admin, mock] = await Promise.all([
      adminCatalogProvider.getFeaturedProducts(limit),
      mockProductProvider.getFeaturedProducts(limit),
    ]);
    const existingSlugs = new Set(admin.map(p => p.slug));
    const combined = [...admin];
    for (const mp of mock) {
      if (combined.length >= limit) break;
      if (!existingSlugs.has(mp.slug)) combined.push(mp);
    }
    return combined.slice(0, limit);
  },

  // Métodos utilitários para admin
  clearCache() {
    providerCache.clear();
  },

  getCacheStats() {
    return { size: providerCache.size, keys: Array.from(providerCache.keys()) };
  },
};

// Exporta também os providers individuais para uso direto se necessário
export { aliexpressProvider } from "./aliexpress-provider";
export { vintedProvider } from "./vinted-provider";
export { mockProductProvider } from "./mock-provider";
export { adminCatalogProvider } from "./admin-provider";