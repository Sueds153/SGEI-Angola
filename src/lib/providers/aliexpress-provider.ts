import type { NormalizedProduct, NormalizedVariant, ProductSource } from "@/lib/types";
import { scrapeWithFallback, scrapeWithFreeFallback, parseAliExpressHtml, extractProductId } from "@/lib/scraping";
import { normalizePrice } from "@/lib/currency";

const ALIEXPRESS_DOMAINS = [
  "aliexpress.com",
  "pt.aliexpress.com",
  "aliexpress.ru",
  "aliexpress.br",
  "es.aliexpress.com",
  "fr.aliexpress.com",
];

export function isAliExpressUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    return ALIEXPRESS_DOMAINS.some((d) => hostname.includes(d));
  } catch {
    return false;
  }
}

export function extractAliExpressProductId(url: string): string | null {
  const result = extractProductId(url);
  return result?.platform === 'aliexpress' ? result.id : null;
}

async function fetchAliExpressProduct(productId: string, sourceUrl?: string): Promise<NormalizedProduct | null> {
  try {
    const url = sourceUrl || `https://www.aliexpress.com/item/${productId}.html`;
    
    console.log(`[AliExpress] Scraping produto ${productId}...`);
    
    // Tenta primeiro o scraper gratuito
    const freeResult = await scrapeWithFreeFallback(url, productId, 'aliexpress', {
      timeout: 15000,
      maxRetries: 2,
    });
    
    let aliProduct = null;
    
    if (freeResult.success && freeResult.html) {
      // Parseia HTML do método gratuito
      aliProduct = parseAliExpressHtml(freeResult.html, productId);
    } else if (freeResult.success && freeResult.json) {
      // Dados estruturados do RapidAPI
      aliProduct = mapRapidApiProduct(freeResult.json, productId);
    }
    
    // Se o método gratuito falhou, tenta o scraper premium
    if (!aliProduct) {
      console.log('[AliExpress] Método gratuito falhou, tentando premium...');
      const scrapeResult = await scrapeWithFallback(url, productId, {
        renderJs: true,
        premiumProxy: true,
        timeout: 30000,
      });

      if (!scrapeResult.success || !scrapeResult.html) {
        console.warn(`[AliExpress] Scraping falhou: ${scrapeResult.error}`);
        return null;
      }
      aliProduct = parseAliExpressHtml(scrapeResult.html, productId);
    }
    
    if (!aliProduct) {
      console.warn('[AliExpress] Parser retornou null');
      return null;
    }

    // Converte para NormalizedProduct
    const sourceCurrency = "USD";
    const normalizedPrice = normalizePrice(
      aliProduct.price.min,
      sourceCurrency,
      { USD_TO_AOA: 920, EUR_TO_AOA: 980, CNY_TO_AOA: 127, updatedAt: new Date() }
    );

    // Extrai variantes dos SKUs
    const variants: NormalizedVariant[] = aliProduct.skuList.map((sku) => {
      const skuProps = sku.skuVal.reduce((acc, prop) => {
        acc[prop.path] = prop.name;
        return acc;
      }, {} as Record<string, string>);

      return {
        id: `ae-${sku.skuId}`,
        externalId: sku.skuId,
        color: skuProps['Color'] || skuProps['Cor'] || null,
        size: skuProps['Size'] || skuProps['Tamanho'] || null,
        otherOptions: skuProps,
        sku: `AE-${sku.skuId}`,
        priceModifierUsd: sku.skuPrice - aliProduct.price.min,
        stockQuantity: sku.skuStock,
        available: sku.skuStock > 0,
        imageUrl: sku.skuImage || aliProduct.images[0],
      };
    });

    // Estimativa de peso baseada na categoria
    let estimatedWeight = 250;
    const titleLower = aliProduct.title.toLowerCase();
    if (titleLower.includes('phone') || titleLower.includes('smartphone')) estimatedWeight = 300;
    if (titleLower.includes('watch') || titleLower.includes('smartwatch')) estimatedWeight = 80;
    if (titleLower.includes('headphone') || titleLower.includes('earphone') || titleLower.includes('tws')) estimatedWeight = 60;
    if (titleLower.includes('laptop') || titleLower.includes('notebook')) estimatedWeight = 2000;
    if (titleLower.includes('dress') || titleLower.includes('vestido')) estimatedWeight = 350;
    if (titleLower.includes('shoe') || titleLower.includes('tênis')) estimatedWeight = 800;

    return {
      id: `aliexpress-${productId}`,
      externalId: productId,
      source: "ALIEXPRESS" as ProductSource,
      sourceUrl: url,
      name: aliProduct.title,
      slug: `aliexpress-${productId}`,
      description: `Produto AliExpress com ${aliProduct.orders} pedidos vendidos. Avaliação: ${aliProduct.rating.average.toFixed(1)}/5 (${aliProduct.rating.count} avaliações).`,
      category: null,
      images: aliProduct.images,
      defaultImage: aliProduct.images[0] || null,
      originalPriceUsd: normalizedPrice?.amount || aliProduct.price.min,
      currency: normalizedPrice?.currency || "USD",
      availability: aliProduct.skuList.some(s => s.skuStock > 0) ? "IN_STOCK" : "OUT_OF_STOCK",
      status: "ACTIVE",
      sku: `AE-${productId}`,
      rating: aliProduct.rating.average > 0 ? aliProduct.rating.average / 2 : null, // Normaliza para escala 5
      reviewCount: aliProduct.rating.count || aliProduct.orders,
      weightGrams: estimatedWeight,
      variants: variants.length > 0 ? variants : [{
        id: `ae-${productId}-default`,
        externalId: productId,
        color: null,
        size: null,
        otherOptions: null,
        sku: `AE-${productId}`,
        priceModifierUsd: 0,
        stockQuantity: 999,
        available: true,
        imageUrl: aliProduct.images[0],
      }],
    };
  } catch (error: any) {
    console.error('[AliExpress] Erro ao buscar produto:', error.message);
    return null;
  }
}

// Mapeia dados do RapidAPI para estrutura normalizada
function mapRapidApiProduct(json: any, productId: string) {
  const product = json.product || json;
  
  return {
    id: productId,
    title: product.productTitle || product.title || 'Produto AliExpress',
    images: product.imageUrls || product.images || [],
    price: {
      min: product.salePrice || product.minPrice || 0,
      max: product.originalPrice || product.maxPrice || product.salePrice || 0,
      original: product.originalPrice || product.salePrice || 0,
    },
    rating: {
      average: product.ratingValue || product.averageRating || 0,
      count: product.reviewCount || product.ratingCount || 0,
    },
    orders: product.orders || product.sales || 0,
    skuList: product.skuList?.map((sku: any) => ({
      skuId: sku.skuId || sku.id,
      skuVal: sku.skuVal || [],
      skuPrice: sku.skuPrice || sku.price || 0,
      skuStock: sku.stock || sku.quantity || 999,
      skuImage: sku.skuImage || sku.image || null,
    })) || [],
  };
}

export const aliexpressProvider = {
  id: "ALIEXPRESS" as ProductSource,

  async searchProducts(query: string, params?: { category?: string; limit?: number }): Promise<NormalizedProduct[]> {
    console.warn("[AliExpressProvider] searchProducts não implementado - requer API de busca");
    return [];
  },

  async getProductBySlug(slug: string): Promise<NormalizedProduct | null> {
    const productId = slug.replace("aliexpress-", "");
    return this.getProductByExternalId(productId);
  },

  async getProductByExternalId(externalId: string): Promise<NormalizedProduct | null> {
    return fetchAliExpressProduct(externalId);
  },

  async resolveProductFromUrl(url: string): Promise<{
    status: "found" | "needs_confirmation" | "unsupported";
    externalId?: string;
    product?: NormalizedProduct | null;
    message?: string;
  }> {
    if (!isAliExpressUrl(url)) {
      return { status: "unsupported" };
    }

    const productId = extractAliExpressProductId(url);
    if (!productId) {
      return { 
        status: "needs_confirmation", 
        externalId: "unknown", 
        message: "Não foi possível extrair ID do produto AliExpress. URL pode estar incompleta." 
      };
    }

    // Tenta buscar o produto
    const product = await fetchAliExpressProduct(productId, url);
    
    if (product) {
      return {
        status: "found",
        externalId: productId,
        product,
      };
    }

    // Fallback: retorna para confirmação manual
    return {
      status: "needs_confirmation",
      externalId: productId,
      message: "Produto AliExpress detectado mas não foi possível extrair dados automáticos. Nossa equipe validará o preço e detalhes manualmente.",
    };
  },

  async getProductsByCategory(categorySlug: string, params?: { limit?: number; offset?: number; sort?: string }): Promise<{ products: NormalizedProduct[]; total: number }> {
    return { products: [], total: 0 };
  },

  async getFeaturedProducts(limit = 8): Promise<NormalizedProduct[]> {
    return [];
  },
};

export type AliExpressProvider = typeof aliexpressProvider;