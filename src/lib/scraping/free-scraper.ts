/**
 * Scraper Gratuito e Open-Source
 * 
 * Estratégias gratuitas que funcionam bem:
 * 1. Fetch direto com headers realistas + retry com backoff
 * 2. Proxies públicos gratuitos (fallback)
 * 3. APIs não-oficiais gratuitas (quando disponíveis)
 * 4. Google Translate como proxy (funciona para alguns sites)
 * 5. textise dot iitty (para sites simples)
 * 
 * Limitações:
 * - Sites com Cloudflare forte podem bloquear
 * - Sem garantia de uptime
 * - Pode ser mais lento que serviços pagos
 * 
 * Para produção crítica, recomendo upgrade para ScrapingBee ($49/mês)
 */

interface FreeScrapeResult {
  success: boolean;
  html?: string;
  json?: any;
  error?: string;
  method: string;
  latencyMs: number;
}

interface ScrapeOptions {
  timeout?: number;
  maxRetries?: number;
  userAgent?: string;
}

// User agents realistas
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
];

// Headers que imitam navegador real
function getRealisticHeaders(): HeadersInit {
  return {
    'User-Agent': USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.9,pt-PT;q=0.8,pt;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Connection': 'keep-alive',
    'Upgrade-Insecure-Requests': '1',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Cache-Control': 'max-age=0',
  };
}

// Delay com backoff exponencial
async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Método 1: Fetch direto com headers realistas
 * Funciona para: Sites sem proteção forte
 */
async function scrapeWithDirectFetch(url: string, options: ScrapeOptions): Promise<FreeScrapeResult> {
  const start = Date.now();
  const maxRetries = options.maxRetries || 3;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), options.timeout || 15000);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: getRealisticHeaders(),
        signal: controller.signal,
        redirect: 'follow',
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 429 && attempt < maxRetries) {
          // Rate limited, espera e tenta de novo
          await delay(2000 * attempt);
          continue;
        }
        return { 
          success: false, 
          error: `HTTP ${response.status}`, 
          method: 'direct-fetch', 
          latencyMs: Date.now() - start 
        };
      }
      
      const html = await response.text();
      
      // Verifica se é HTML válido
      if (html.length < 1000 || !html.includes('<html')) {
        return { 
          success: false, 
          error: 'HTML inválido ou muito curto', 
          method: 'direct-fetch', 
          latencyMs: Date.now() - start 
        };
      }
      
      return { 
        success: true, 
        html, 
        method: 'direct-fetch', 
        latencyMs: Date.now() - start 
      };
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return { 
          success: false, 
          error: 'Timeout', 
          method: 'direct-fetch', 
          latencyMs: Date.now() - start 
        };
      }
      
      if (attempt === maxRetries) {
        return { 
          success: false, 
          error: error.message, 
          method: 'direct-fetch', 
          latencyMs: Date.now() - start 
        };
      }
      
      // Backoff exponencial antes de retry
      await delay(1000 * Math.pow(2, attempt - 1));
    }
  }
  
  return { 
    success: false, 
    error: 'Máximo de tentativas atingido', 
    method: 'direct-fetch', 
    latencyMs: Date.now() - start 
  };
}

/**
 * Método 2: Google Translate como proxy
 * Funciona para: Burlar bloqueios básicos de CORS e alguns bloqueios de IP
 * URL: https://translate.google.com/translate?hl=en&sl=auto&tl=en&u={URL}
 */
async function scrapeWithGoogleTranslate(url: string, options: ScrapeOptions): Promise<FreeScrapeResult> {
  const start = Date.now();
  
  try {
    const encodedUrl = encodeURIComponent(url);
    const proxyUrl = `https://translate.google.com/translate?hl=en&sl=auto&tl=en&u=${encodedUrl}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 15000);
    
    const response = await fetch(proxyUrl, {
      method: 'GET',
      headers: getRealisticHeaders(),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return { 
        success: false, 
        error: `HTTP ${response.status}`, 
        method: 'google-translate', 
        latencyMs: Date.now() - start 
      };
    }
    
    const html = await response.text();
    
    // Google Translate envolve o HTML original, precisamos extrair
    // Procura pelo iframe ou conteúdo original
    const match = html.match(/<iframe[^>]*src=["']([^"']*?)["'][^>]*>/i);
    if (match?.[1]) {
      // Se tem iframe, faz fetch do conteúdo original
      return scrapeWithDirectFetch(url, options);
    }
    
    return { 
      success: html.length > 1000, 
      html, 
      method: 'google-translate', 
      latencyMs: Date.now() - start 
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message, 
      method: 'google-translate', 
      latencyMs: Date.now() - start 
    };
  }
}

/**
 * Método 3: textise dot iitty (texto dot iitty)
 * Funciona para: Sites de notícias, blogs, e-commerce simples
 * URL: https://r.jina.ai/{URL}
 */
async function scrapeWithJinaAI(url: string, options: ScrapeOptions): Promise<FreeScrapeResult> {
  const start = Date.now();
  
  try {
    // Jina AI Reader - gratuito, retorna texto limpo
    const jinaUrl = `https://r.jina.ai/${url}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), options.timeout || 10000);
    
    // IMPORTANTE: Jina AI retorna 403 quando usamos User-Agent de browser.
    // O UA default do Node (undici) funciona.
    const response = await fetch(jinaUrl, {
      method: 'GET',
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      return { 
        success: false, 
        error: `HTTP ${response.status}`, 
        method: 'jina-ai', 
        latencyMs: Date.now() - start 
      };
    }
    
    const text = await response.text();
    
    // Jina retorna texto formatado (markdown).
    // Para Vinted, devolvemos o texto bruto — o parser detecta o markdown.
    // Para as outras plataformas, envolvemos em HTML simples.
    const isVinted = url.includes('vinted.');
    const html = isVinted
      ? text
      : `
      <!DOCTYPE html>
      <html>
      <head><title>Scraped Content</title></head>
      <body>
        <pre>${text.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
      </body>
      </html>
    `;
    
    return { 
      success: text.length > 100, 
      html, 
      json: { rawText: text },
      method: 'jina-ai', 
      latencyMs: Date.now() - start 
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message, 
      method: 'jina-ai', 
      latencyMs: Date.now() - start 
    };
  }
}

/**
 * Método 4: API não-oficial do AliExpress (RapidAPI free tier)
 * 50 requests/mês grátis
 */
async function scrapeAliExpressViaRapidAPI(productId: string): Promise<FreeScrapeResult> {
  const start = Date.now();
  const rapidApiKey = process.env.RAPIDAPI_KEY;
  
  if (!rapidApiKey) {
    return { 
      success: false, 
      error: 'RAPIDAPI_KEY não configurada', 
      method: 'rapidapi-aliexpress', 
      latencyMs: 0 
    };
  }
  
  try {
    const apiUrl = `https://aliexpress-data-scraper.p.rapidapi.com/product?productId=${productId}&language=en`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'x-rapidapi-host': 'aliexpress-data-scraper.p.rapidapi.com',
        'x-rapidapi-key': rapidApiKey,
      },
    });
    
    if (!response.ok) {
      return { 
        success: false, 
        error: `HTTP ${response.status}`, 
        method: 'rapidapi-aliexpress', 
        latencyMs: Date.now() - start 
      };
    }
    
    const json = await response.json();
    
    return { 
      success: !!json.product, 
      json, 
      method: 'rapidapi-aliexpress', 
      latencyMs: Date.now() - start 
    };
  } catch (error: any) {
    return { 
      success: false, 
      error: error.message, 
      method: 'rapidapi-aliexpress', 
      latencyMs: Date.now() - start 
    };
  }
}

/**
 * Scraper principal com fallback em cascata
 * Tenta métodos gratuitos em ordem de eficácia
 */
export async function scrapeWithFreeFallback(
  url: string, 
  productId: string,
  platform: string,
  options: ScrapeOptions = {}
): Promise<{ success: boolean; html?: string; json?: any; method: string; error?: string }> {
  
  const opts: Required<ScrapeOptions> = {
    timeout: 15000,
    maxRetries: 3,
    userAgent: USER_AGENTS[0],
    ...options,
  };
  
  console.log(`[FreeScraper] Iniciando scraping para ${platform}:${productId}`);
  
  // Para AliExpress, tenta RapidAPI primeiro (se configurado)
  if (platform === 'aliexpress' && process.env.RAPIDAPI_KEY) {
    console.log('[FreeScraper] Tentando RapidAPI (AliExpress)...');
    const rapidResult = await scrapeAliExpressViaRapidAPI(productId);
    if (rapidResult.success) {
      console.log(`[FreeScraper] Sucesso com ${rapidResult.method} (${rapidResult.latencyMs}ms)`);
      return { 
        success: true, 
        json: rapidResult.json, 
        method: rapidResult.method 
      };
    }
    console.warn(`[FreeScraper] RapidAPI falhou: ${rapidResult.error}`);
  }
  
  // Para Vinted, tenta Jina AI PRIMEIRO (muito eficaz)
  if (platform === 'vinted') {
    console.log('[FreeScraper] Tentando Jina AI (Vinted)...');
    const jinaResult = await scrapeWithJinaAI(url, opts);
    if (jinaResult.success && jinaResult.json?.rawText) {
      console.log(`[FreeScraper] Sucesso com ${jinaResult.method} (${jinaResult.latencyMs}ms)`);
      return { 
        success: true, 
        html: jinaResult.html, 
        json: jinaResult.json, 
        method: jinaResult.method 
      };
    }
    console.warn(`[FreeScraper] Jina AI falhou: ${jinaResult.error}`);
  }
  
  // Tenta Jina AI para outras plataformas
  console.log('[FreeScraper] Tentando Jina AI...');
  const jinaResult = await scrapeWithJinaAI(url, opts);
  if (jinaResult.success && jinaResult.json?.rawText) {
    console.log(`[FreeScraper] Sucesso com ${jinaResult.method} (${jinaResult.latencyMs}ms)`);
    return { 
      success: true, 
      html: jinaResult.html, 
      json: jinaResult.json, 
      method: jinaResult.method 
    };
  }
  
  // Tenta Google Translate como proxy
  console.log('[FreeScraper] Tentando Google Translate proxy...');
  const translateResult = await scrapeWithGoogleTranslate(url, opts);
  if (translateResult.success) {
    console.log(`[FreeScraper] Sucesso com ${translateResult.method} (${translateResult.latencyMs}ms)`);
    return { 
      success: true, 
      html: translateResult.html, 
      method: translateResult.method 
    };
  }
  
  // Último recurso: fetch direto
  console.log('[FreeScraper] Tentando fetch direto...');
  const directResult = await scrapeWithDirectFetch(url, opts);
  if (directResult.success) {
    console.log(`[FreeScraper] Sucesso com ${directResult.method} (${directResult.latencyMs}ms)`);
    return { 
      success: true, 
      html: directResult.html, 
      method: directResult.method 
    };
  }
  
  console.error('[FreeScraper] Todos os métodos gratuitos falharam');
  return { 
    success: false, 
    error: 'Todos os métodos de scraping gratuito falharam. Considere usar ScrapingBee para produção.', 
    method: 'none' 
  };
}

export function getFreeScraperMethods(): string[] {
  return [
    'rapidapi-aliexpress (50 req/mês grátis)',
    'jina-ai (ilimitado, texto)',
    'google-translate (proxy)',
    'direct-fetch (com headers realistas)',
  ];
}
