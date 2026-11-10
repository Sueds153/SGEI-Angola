/**
 * Index do módulo de Scraping
 * 
 * Exporta funções principais para uso nos providers
 */

export { scrapeWithFallback, clearScrapingCache, getCacheStats } from './scraping-service';
export { parseAliExpressHtml } from './aliexpress-parser';
export { parseVintedHtml } from './vinted-parser';
export { scrapeWithFreeFallback, getFreeScraperMethods } from './free-scraper';

/**
 * Função utilitária para extrair ID de produto baseado na URL
 */
export function extractProductId(url: string): { platform: string; id: string } | null {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    
    // AliExpress
    if (hostname.includes('aliexpress')) {
      const patterns = [
        /[?&]productId[=:](\d{12,})/i,
        /\/item\/(\d{12,})/i,
        /\/p\/(\d{12,})/i,
        /\/(\d{12,})\.html/i,
      ];
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return { platform: 'aliexpress', id: match[1] };
        }
      }
    }
    
    // Vinted
    if (hostname.includes('vinted')) {
      const patterns = [
        /\/items\/(\d+)/i,
        /\/item\/(\d+)/i,
        /[?&]item[_-]?id[=:](\d+)/i,
      ];
      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return { platform: 'vinted', id: match[1] };
        }
      }
    }
    
    // Shein
    if (hostname.includes('shein')) {
      const patterns = [
        /p-(\d+)/i,
        /goods[/-]?sn=?(\d+)/i,
        /product[/-](\d+)/i,
        /(\d{6,})/i,
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
