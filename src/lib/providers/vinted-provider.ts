import type { NormalizedProduct, NormalizedVariant, ProductSource } from "@/lib/types";
import { scrapeWithFallback, scrapeWithFreeFallback, parseVintedHtml, extractProductId } from "@/lib/scraping";

const VINTED_DOMAINS = ["vinted.pt", "vinted.es", "vinted.fr", "vinted.de", "vinted.it", "vinted.co.uk", "vinted.com"];

export function isVintedUrl(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.replace("www.", "");
    return VINTED_DOMAINS.some((d) => hostname.includes(d));
  } catch {
    return false;
  }
}

export function extractVintedItemId(url: string): string | null {
  const result = extractProductId(url);
  return result?.platform === 'vinted' ? result.id : null;
}

async function fetchVintedItem(itemId: string, sourceUrl?: string): Promise<NormalizedProduct | null> {
  try {
    const url = sourceUrl || `https://www.vinted.pt/items/${itemId}`;
    
    console.log(`[Vinted] Scraping item ${itemId}...`);
    
    // Tenta primeiro o scraper gratuito
    const freeResult = await scrapeWithFreeFallback(url, itemId, 'vinted', {
      timeout: 15000,
      maxRetries: 2,
    });
    
    let vintedItem = null;
    
    if (freeResult.success && freeResult.html) {
      // Parseia HTML do método gratuito
      vintedItem = parseVintedHtml(freeResult.html, itemId);
    }
    
    // Se o método gratuito falhou, tenta o scraper premium
    if (!vintedItem) {
      console.log('[Vinted] Método gratuito falhou, tentando premium...');
      const scrapeResult = await scrapeWithFallback(url, itemId, {
        renderJs: true,
        premiumProxy: true,
        timeout: 30000,
      });

      if (!scrapeResult.success || !scrapeResult.html) {
        console.warn(`[Vinted] Scraping falhou: ${scrapeResult.error}`);
        return null;
      }
      vintedItem = parseVintedHtml(scrapeResult.html, itemId);
    }
    
    if (!vintedItem) {
      console.warn('[Vinted] Parser retornou null');
      return null;
    }

    // Vinted usa EUR
    const sourceCurrency = "EUR";
    const priceAmount = parseFloat(vintedItem.price.amount);

    // Estimativa de peso baseada no título
    const titleLower = vintedItem.title.toLowerCase();
    let estimatedWeight = 250;
    if (titleLower.includes('casaco') || titleLower.includes('jaqueta') || titleLower.includes('coat')) estimatedWeight = 800;
    if (titleLower.includes('calça') || titleLower.includes('jeans') || titleLower.includes('pants')) estimatedWeight = 500;
    if (titleLower.includes('vestido') || titleLower.includes('dress')) estimatedWeight = 350;
    if (titleLower.includes('camisa') || titleLower.includes('shirt') || titleLower.includes('blusa')) estimatedWeight = 200;
    if (titleLower.includes('tênis') || titleLower.includes('sapato') || titleLower.includes('shoe') || titleLower.includes('boot')) estimatedWeight = 900;
    if (titleLower.includes('bolsa') || titleLower.includes('mochila') || titleLower.includes('bag')) estimatedWeight = 400;

    // Mapeia condição para label em português
    const conditionMap: Record<string, string> = {
      'new_with_tags': 'Novo com etiqueta',
      'new_without_tags': 'Novo sem etiqueta',
      'very_good': 'Muito bom',
      'good': 'Bom',
      'satisfactory': 'Satisfatório',
    };

    const variants: NormalizedVariant[] = [{
      id: `vinted-${itemId}-default`,
      externalId: itemId,
      color: null,
      size: vintedItem.size_title || null,
      otherOptions: {
        condition: conditionMap[vintedItem.status] || vintedItem.status,
        brand: vintedItem.brand_title || 'Sem marca',
        seller: vintedItem.user.login || 'Desconhecido',
        sellerRating: String(vintedItem.user.feedback_reputation || 0),
      },
      sku: `VT-${itemId}`,
      priceModifierUsd: 0,
      stockQuantity: 1, // Vinted = peças únicas
      available: true,
      imageUrl: vintedItem.images?.full_size_url || vintedItem.images?.url || null,
    }];

    const images = vintedItem.images?.thumbnails?.length ? vintedItem.images.thumbnails : 
                   vintedItem.images?.url ? [vintedItem.images.url] : [];

    return {
      id: `vinted-${itemId}`,
      externalId: itemId,
      source: "VINTED" as ProductSource,
      sourceUrl: url,
      name: vintedItem.title,
      slug: `vinted-${itemId}`,
      description: `Marca: ${vintedItem.brand_title || 'Sem marca'}. Condição: ${conditionMap[vintedItem.status] || vintedItem.status}. Vendido por @${vintedItem.user.login || 'Desconhecido'} (${vintedItem.user.feedback_reputation || 0}+ avaliações).`,
      category: null,
      images,
      defaultImage: images[0] || null,
      originalPriceUsd: priceAmount, // Valor em EUR
      currency: sourceCurrency,
      availability: "IN_STOCK",
      status: "ACTIVE",
      sku: `VT-${itemId}`,
      rating: vintedItem.user.feedback_reputation > 0 ? 4.5 : null,
      reviewCount: vintedItem.user.feedback_reputation || 0,
      weightGrams: estimatedWeight,
      variants,
    };
  } catch (error: any) {
    console.error('[Vinted] Erro ao buscar item:', error.message);
    return null;
  }
}

export const vintedProvider = {
  id: "VINTED" as ProductSource,

  async searchProducts(query: string, params?: { category?: string; limit?: number }): Promise<NormalizedProduct[]> {
    console.warn("[VintedProvider] searchProducts não implementado - Vinted não tem API de busca pública");
    return [];
  },

  async getProductBySlug(slug: string): Promise<NormalizedProduct | null> {
    const itemId = slug.replace("vinted-", "");
    return this.getProductByExternalId(itemId);
  },

  async getProductByExternalId(externalId: string): Promise<NormalizedProduct | null> {
    return fetchVintedItem(externalId);
  },

  async resolveProductFromUrl(url: string): Promise<{
    status: "found" | "needs_confirmation" | "unsupported";
    externalId?: string;
    product?: NormalizedProduct | null;
    message?: string;
  }> {
    if (!isVintedUrl(url)) {
      return { status: "unsupported" };
    }

    const itemId = extractVintedItemId(url);
    if (!itemId) {
      return { 
        status: "needs_confirmation", 
        externalId: "unknown", 
        message: "Não foi possível extrair ID do item Vinted. URL pode estar incompleta." 
      };
    }

    // Tenta buscar o item
    const product = await fetchVintedItem(itemId, url);
    
    if (product) {
      return {
        status: "found",
        externalId: itemId,
        product,
      };
    }

    // Fallback: retorna para confirmação manual
    return {
      status: "needs_confirmation",
      externalId: itemId,
      message: "Item Vinted detectado mas não foi possível extrair dados automáticos. Nossa equipe validará o preço, condição e disponibilidade manualmente.",
    };
  },

  async getProductsByCategory(categorySlug: string, params?: { limit?: number; offset?: number; sort?: string }): Promise<{ products: NormalizedProduct[]; total: number }> {
    return { products: [], total: 0 };
  },

  async getFeaturedProducts(limit = 8): Promise<NormalizedProduct[]> {
    return [];
  },
};

export type VintedProvider = typeof vintedProvider;
