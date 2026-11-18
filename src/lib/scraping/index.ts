/**
 * Index do módulo de Scraping
 * 
 * Exporta funções principais para uso nos providers
 */

export { scrapeWithFallback, clearScrapingCache, getCacheStats } from './scraping-service';
export { parseAliExpressHtml } from './aliexpress-parser';
export { parseVintedHtml } from './vinted-parser';
export { parseSheinHtml } from './shein-parser';
export { scrapeWithFreeFallback, getFreeScraperMethods } from './free-scraper';

/**
 * Função utilitária para extrair ID de produto baseado na URL
 * Suporta URLs completas, encurtadas, mobile, afiliadas e de apps
 */
export function extractProductId(url: string): { platform: string; id: string } | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    const pathname = new URL(url).pathname;
    const searchParams = new URL(url).searchParams;
    
    // AliExpress - Padrões expandidos para cobrir URLs mobile, encurtadas, afiliadas
    if (hostname.includes('aliexpress') || hostname.includes('alix.') || hostname === 'a.aliexpress.com' || hostname === 's.click.aliexpress.com') {
      // 1. Check query parameters first (common in shortened/affiliate links)
      const productIdFromQuery = searchParams.get('productId') || searchParams.get('itemId') || searchParams.get('id');
      if (productIdFromQuery && /^\d{10,}$/.test(productIdFromQuery)) {
        return { platform: 'aliexpress', id: productIdFromQuery };
      }
      
      // 2. Path patterns (various formats)
      const patterns = [
        /\/item\/(\d{10,})/i,           // /item/1234567890123.html
        /\/p\/(\d{10,})/i,              // /p/1234567890123
        /\/(\d{10,})\.html/i,           // /1234567890123.html
        /\/product\/(\d{10,})/i,        // /product/1234567890123
        /(\d{10,})/i,                   // fallback: any 10+ digit number
      ];
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return { platform: 'aliexpress', id: match[1] };
        }
      }
    }
    
    // Vinted - Expanded patterns
    if (hostname.includes('vinted')) {
      // Check query params first
      const itemIdFromQuery = searchParams.get('item_id') || searchParams.get('itemId') || searchParams.get('id');
      if (itemIdFromQuery && /^\d+$/.test(itemIdFromQuery)) {
        return { platform: 'vinted', id: itemIdFromQuery };
      }
      
      const patterns = [
        /\/items\/(\d+)/i,
        /\/item\/(\d+)/i,
        /\/catalog\/(\d+)/i,
        /\/product\/(\d+)/i,
        /(\d{6,})/i,  // fallback
      ];
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return { platform: 'vinted', id: match[1] };
        }
      }
    }
    
    // Shein - Expanded patterns for mobile, app links, etc.
    if (hostname.includes('shein') || hostname.includes('romwe') || hostname === 'shein.top' || hostname === 'm.shein.com' || hostname === 'us.shein.com' || hostname === 'br.shein.com') {
      // Check query params first
      const goodsSn = searchParams.get('goods_sn') || searchParams.get('productId') || searchParams.get('id');
      if (goodsSn && /^\d{6,}$/.test(goodsSn)) {
        return { platform: 'shein', id: goodsSn };
      }
      
      const patterns = [
        /p-(\d{6,})/i,                  // p-12345678
        /goods[/-]?sn=?(\d{6,})/i,      // goods-sn=123456 or goods/123456
        /product[/-](\d{6,})/i,         // product/12345678
        /\/product\/(\d{6,})/i,         // /product/12345678
        /\/goods\/(\d{6,})/i,           // /goods/12345678
        /\/p\/(\d{6,})/i,               // /p/12345678
        /(\d{7,})/i,                    // fallback: 7+ digits
      ];
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return { platform: 'shein', id: match[1] };
        }
      }
    }
  } catch {
    // URL inválida
  }
  
  return null;
}

/**
 * Verifica se a URL é de uma plataforma suportada
 */
export function isSupportedPlatform(url: string): string | null {
  const result = extractProductId(url);
  return result?.platform || null;
}
