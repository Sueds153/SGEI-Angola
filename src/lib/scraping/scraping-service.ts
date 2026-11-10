/**
 * Serviço de Scraping Inteligente com Fallback Múltiplo
 * 
 * Estratégia: Tenta múltiplos providers em cascata até conseguir os dados
 * 1. ScrapingBee (pago, mais confiável)
 * 2. ZenRows (backup pago)
 * 3. RapidAPI (backup econômico)
 * 4. Fetch direto (último recurso, pode falhar)
 * 
 * Cache: Redis-like em memória com TTL para evitar re-scraping
 */

interface ScrapingResult {
  success: boolean;
  html?: string;
  json?: any;
  error?: string;
  provider: string;
  latencyMs: number;
}

interface ScrapingOptions {
  timeout?: number;
  renderJs?: boolean;
  premiumProxy?: boolean;
  countryCode?: string;
}

const CACHE = new Map<string, { data: any; expiresAt: number }>();
const CACHE_TTL = 1000 * 60 * 30; // 30 minutos

const PROVIDERS = {
  scrapingbee: {
    baseUrl: 'https://app.scrapingbee.com/api/v1',
    apiKey: process.env.SCRAPINGBEE_API_KEY,
    enabled: !!process.env.SCRAPINGBEE_API_KEY,
  },
  zenrows: {
    baseUrl: 'https://api.zenrows.com/v1',
    apiKey: process.env.ZENROWS_API_KEY,
    enabled: !!process.env.ZENROWS_API_KEY,
  },
  rapidapi: {
    baseUrl: 'https://aliexpress-data-scraper.p.rapidapi.com',
    apiKey: process.env.RAPIDAPI_KEY,
    enabled: !!process.env.RAPIDAPI_KEY,
    headers: {
      'x-rapidapi-host': 'aliexpress-data-scraper.p.rapidapi.com',
    },
  },
};

function getCacheKey(type: string, id: string): string {
  return `${type}:${id}`;
}

function getFromCache<T>(key: string): T | null {
  const cached = CACHE.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data as T;
  }
  CACHE.delete(key);
  return null;
}

function setCache<T>(key: string, data: T, ttlMs = CACHE_TTL): void {
  CACHE.set(key, { data, expiresAt: Date.now() + ttlMs });
}

async function timeout<T>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> {
  const timeoutPromise = new Promise<never>((_, reject) => {
    setTimeout(() => reject(new Error(errorMsg)), ms);
  });
  return Promise.race([promise, timeoutPromise]);
}

async function scrapeWithScrapingBee(url: string, options: ScrapingOptions): Promise<ScrapingResult> {
  const start = Date.now();
  const provider = PROVIDERS.scrapingbee;
  
  if (!provider.apiKey) {
    return { success: false, error: 'API key não configurada', provider: 'scrapingbee', latencyMs: 0 };
  }

  try {
    const params = new URLSearchParams({
      api_key: provider.apiKey,
      url: url,
      render_js: options.renderJs ? 'true' : 'false',
      premium_proxy: options.premiumProxy ? 'true' : 'false',
      country_code: options.countryCode || 'US',
      wait_for: '2000',
    });

    const response = await timeout(
      fetch(`${provider.baseUrl}/?${params.toString()}`),
      options.timeout || 30000,
      'ScrapingBee timeout'
    );

    if (!response.ok) {
      return { 
        success: false, 
        error: `HTTP ${response.status}`, 
        provider: 'scrapingbee', 
        latencyMs: Date.now() - start 
      };
    }

    const html = await response.text();
    return { 
      success: html.length > 1000, 
      html, 
      provider: 'scrapingbee', 
      latencyMs: Date.now() - start 
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message, 
      provider: 'scrapingbee', 
      latencyMs: Date.now() - start 
    };
  }
}

async function scrapeWithZenRows(url: string, options: ScrapingOptions): Promise<ScrapingResult> {
  const start = Date.now();
  const provider = PROVIDERS.zenrows;
  
  if (!provider.apiKey) {
    return { success: false, error: 'API key não configurada', provider: 'zenrows', latencyMs: 0 };
  }

  try {
    const response = await timeout(
      fetch(`${provider.baseUrl}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${provider.apiKey}`,
        },
        body: JSON.stringify({
          url: url,
          js_render: options.renderJs,
          premium_proxy: options.premiumProxy,
          country_code: options.countryCode || 'US',
        }),
      }),
      options.timeout || 30000,
      'ZenRows timeout'
    );

    if (!response.ok) {
      return { 
        success: false, 
        error: `HTTP ${response.status}`, 
        provider: 'zenrows', 
        latencyMs: Date.now() - start 
      };
    }

    const data = await response.json();
    return { 
      success: !!data.html, 
      html: data.html, 
      provider: 'zenrows', 
      latencyMs: Date.now() - start 
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message, 
      provider: 'zenrows', 
      latencyMs: Date.now() - start 
    };
  }
}

async function scrapeWithRapidApi(url: string, productId: string): Promise<ScrapingResult> {
  const start = Date.now();
  const provider = PROVIDERS.rapidapi;
  
  if (!provider.apiKey) {
    return { success: false, error: 'API key não configurada', provider: 'rapidapi', latencyMs: 0 };
  }

  try {
    // RapidAPI usa endpoint específico para AliExpress
    const apiUrl = `${provider.baseUrl}/product?productId=${productId}&language=en`;
    
    const response = await timeout(
      fetch(apiUrl, {
        headers: {
          ...provider.headers,
          'x-rapidapi-key': provider.apiKey,
        },
      }),
      options.timeout || 15000,
      'RapidAPI timeout'
    );

    if (!response.ok) {
      return { 
        success: false, 
        error: `HTTP ${response.status}`, 
        provider: 'rapidapi', 
        latencyMs: Date.now() - start 
      };
    }

    const json = await response.json();
    return { 
      success: !!json.product, 
      json, 
      provider: 'rapidapi', 
      latencyMs: Date.now() - start 
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message, 
      provider: 'rapidapi', 
      latencyMs: Date.now() - start 
    };
  }
}

async function scrapeDirect(url: string, options: ScrapingOptions): Promise<ScrapingResult> {
  const start = Date.now();
  
  try {
    const response = await timeout(
      fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      }),
      options.timeout || 10000,
      'Direct fetch timeout'
    );

    if (!response.ok) {
      return { 
        success: false, 
        error: `HTTP ${response.status}`, 
        provider: 'direct', 
        latencyMs: Date.now() - start 
      };
    }

    const html = await response.text();
    return { 
      success: html.length > 1000, 
      html, 
      provider: 'direct', 
      latencyMs: Date.now() - start 
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message, 
      provider: 'direct', 
      latencyMs: Date.now() - start 
    };
  }
}

export async function scrapeWithFallback(
  url: string, 
  productId: string,
  options: ScrapingOptions = {}
): Promise<{ success: boolean; html?: string; json?: any; provider: string; error?: string }> {
  
  // Verifica cache primeiro
  const cacheKey = getCacheKey('scrape', productId);
  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log(`[Scraping] Cache hit para ${productId}`);
    return { success: true, ...cached, provider: 'cache' };
  }

  const opts: Required<ScrapingOptions> = {
    timeout: 30000,
    renderJs: true,
    premiumProxy: true,
    countryCode: 'US',
    ...options,
  };

  const providers = [
    // Tenta ScrapingBee primeiro (mais confiável)
    () => scrapeWithScrapingBee(url, opts),
    // Fallback para ZenRows
    () => scrapeWithZenRows(url, opts),
    // Para AliExpress, tenta RapidAPI (dados estruturados)
    productId.length >= 12 ? () => scrapeWithRapidApi(url, productId) : null,
    // Último recurso: fetch direto (provavelmente vai falhar)
    () => scrapeDirect(url, opts),
  ].filter(Boolean) as Array<() => Promise<ScrapingResult>>;

  for (const [index, tryProvider] of providers.entries()) {
    try {
      console.log(`[Scraping] Tentando provider ${index + 1}/${providers.length}...`);
      const result = await tryProvider();
      
      if (result.success) {
        console.log(`[Scraping] Sucesso com ${result.provider} (${result.latencyMs}ms)`);
        
        // Cacheia o resultado
        const cacheData = result.html ? { html: result.html } : { json: result.json };
        setCache(cacheKey, cacheData);
        
        return { 
          success: true, 
          html: result.html, 
          json: result.json, 
          provider: result.provider 
        };
      }
      
      console.warn(`[Scraping] ${result.provider} falhou: ${result.error}`);
    } catch (error: any) {
      console.error(`[Scraping] Erro inesperado no provider ${index}:`, error.message);
    }
  }

  console.error('[Scraping] Todos os providers falharam');
  return { 
    success: false, 
    error: 'Todos os métodos de scraping falharam', 
    provider: 'none' 
  };
}

export function clearScrapingCache(productId?: string): void {
  if (productId) {
    const cacheKey = getCacheKey('scrape', productId);
    CACHE.delete(cacheKey);
    console.log(`[Scraping] Cache limpo para ${productId}`);
  } else {
    CACHE.clear();
    console.log('[Scraping] Cache limpo completamente');
  }
}

export function getCacheStats(): { size: number; keys: string[] } {
  const now = Date.now();
  const validKeys: string[] = [];
  
  CACHE.forEach((value, key) => {
    if (value.expiresAt > now) {
      validKeys.push(key);
    } else {
      CACHE.delete(key);
    }
  });
  
  return { size: validKeys.length, keys: validKeys };
}
