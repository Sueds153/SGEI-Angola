import { loadPricingConfig, calculatePrice } from "@/lib/pricing";

export interface ResolvedProductInfo {
  success: boolean;
  status: "found" | "needs_price" | "unsupported";
  platform: string;
  productId?: string;
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
  error?: string;
}

const USER_AGENTS = [
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 14; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
];

export function extractUrlFromText(input: string): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  const match = trimmed.match(/https?:\/\/[^\s"'<>]+/i);
  if (match) {
    let clean = match[0];
    clean = clean.replace(/[),;.]+$/, "");
    return clean;
  }
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(trimmed)) {
    return `https://${trimmed}`;
  }
  return null;
}

export function detectPlatform(urlStr: string): { name: string; key: string } {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();

    if (host.includes("shein.") || host.includes("romwe.")) {
      return { name: "SHEIN", key: "SHEIN" };
    }
    if (host.includes("aliexpress.") || host.includes("alix.")) {
      return { name: "AliExpress", key: "ALIEXPRESS" };
    }
    if (host.includes("vinted.")) {
      return { name: "Vinted", key: "VINTED" };
    }
    if (host.includes("zara.")) {
      return { name: "Zara", key: "ZARA" };
    }
    if (host.includes("amazon.") || host.includes("amzn.")) {
      return { name: "Amazon", key: "AMAZON" };
    }
    
    // Tenta usar o domínio principal como nome da loja
    const parts = host.replace("www.", "").split(".");
    const domainName = parts[0] ? parts[0].toUpperCase() : "Loja Online";
    return { name: domainName, key: "OTHER" };
  } catch {
    return { name: "Loja Online", key: "OTHER" };
  }
}

export async function resolveFinalUrl(targetUrl: string): Promise<string> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "User-Agent": USER_AGENTS[0],
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timer);
    return res.url || targetUrl;
  } catch {
    return targetUrl;
  }
}

export async function resolveAndScrapeUrl(rawInput: string): Promise<ResolvedProductInfo> {
  const url = extractUrlFromText(rawInput);
  if (!url) {
    return {
      success: false,
      status: "unsupported",
      platform: "Desconhecido",
      title: "",
      currency: "USD",
      images: [],
      sourceUrl: rawInput,
      error: "Por favor insira um link válido da SHEIN, AliExpress ou outra loja online.",
    };
  }

  // Resolver redirecionamentos (especialmente shein.top, a.aliexpress.com, etc.)
  const finalUrl = await resolveFinalUrl(url);
  const platform = detectPlatform(finalUrl);

  let html = "";
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 9000);

    const response = await fetch(finalUrl, {
      method: "GET",
      headers: {
        "User-Agent": USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)],
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "pt-PT,pt;q=0.9,en-US;q=0.8,en;q=0.7",
        "Cache-Control": "no-cache",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      html = await response.text();
    }
  } catch {
    // Se falhar o fetch direto (bloqueio ou timeout), prossegue para fallback gracioso
  }

  let title = "";
  let price: number | undefined;
  let currency = platform.key === "VINTED" || platform.key === "ZARA" ? "EUR" : "USD";
  const images: string[] = [];

  if (html) {
    // 1. Tentar JSON-LD
    const jsonLdMatches = html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);
    for (const match of jsonLdMatches) {
      try {
        const parsed = JSON.parse(match[1]);
        const items = Array.isArray(parsed) ? parsed : [parsed];
        for (const item of items) {
          if (item["@type"] === "Product" || item["@type"] === "IndividualProduct") {
            if (item.name && !title) title = String(item.name).trim();
            if (item.image) {
              const imgArray = Array.isArray(item.image) ? item.image : [item.image];
              imgArray.forEach((im: any) => {
                const src = typeof im === "string" ? im : im.url || im.contentUrl;
                if (src && !images.includes(src)) images.push(src);
              });
            }
            if (item.offers) {
              const offers = Array.isArray(item.offers) ? item.offers[0] : item.offers;
              const p = parseFloat(String(offers.price || offers.lowPrice || "0"));
              if (p > 0 && !price) {
                price = p;
                if (offers.priceCurrency) currency = offers.priceCurrency.toUpperCase();
              }
            }
          }
        }
      } catch {
        // Ignorar JSON malformatado
      }
    }

    // 2. Tentar OpenGraph Tags
    if (!title) {
      const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
      if (ogTitle?.[1]) {
        title = decodeHtmlEntities(ogTitle[1]).trim();
      }
    }

    if (!title) {
      const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleTag?.[1]) {
        title = decodeHtmlEntities(titleTag[1]).trim();
      }
    }

    const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (ogImage?.[1] && !images.includes(ogImage[1])) {
      images.unshift(ogImage[1]);
    }

    // 3. Tentar extração de preço via OpenGraph ou Regex
    if (!price) {
      const ogPrice = html.match(/<meta[^>]+property=["'](?:og:price:amount|product:price:amount)["'][^>]+content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["'](?:og:price:amount|product:price:amount)["']/i);
      if (ogPrice?.[1]) {
        const parsedP = parseFloat(ogPrice[1].replace(/,/g, "."));
        if (parsedP > 0) price = parsedP;
      }
    }

    if (!price) {
      // Padrões de preço comuns no HTML
      const pricePatterns = [
        /"original_price":\{[^}]*"amount":"([^"]+)"/,
        /"sale_price":\{[^}]*"amount":"([^"]+)"/,
        /"price":\s*([0-9]+\.[0-9]{2})/,
        /"usdPrice":\s*"?([0-9]+\.[0-9]{2})"?/,
        /\$\s*([0-9]+(?:\.[0-9]{2})?)/,
        /([0-9]+(?:\.[0-9]{2})?)\s*(?:USD|\$|EUR|€)/i,
      ];
      for (const pattern of pricePatterns) {
        const m = html.match(pattern);
        if (m?.[1]) {
          const val = parseFloat(m[1].replace(/,/g, "."));
          if (val > 0 && val < 5000) {
            price = val;
            break;
          }
        }
      }
    }
  }

  // Limpeza de título
  if (title) {
    title = title.replace(/\s*[-–|]\s*(SHEIN|AliExpress|Vinted|Zara|Amazon).*$/i, "").trim();
  } else {
    title = `Artigo ${platform.name}`;
  }

  // Se conseguimos ler o preço, calcula a simulação completa em Kwanzas
  const config = await loadPricingConfig();
  const rate = currency === "EUR" ? (config.exchangeRateUsdToAoa * 1.08) : config.exchangeRateUsdToAoa;

  if (price && price > 0) {
    const breakdown = calculatePrice(
      {
        productPriceUsd: price,
        quantity: 1,
        weightGrams: 300,
      },
      config
    );

    const totalAOA = Math.round(breakdown.totalCents / 100);

    return {
      success: true,
      status: "found",
      platform: platform.name,
      title,
      price,
      currency,
      images,
      defaultImage: images[0] || undefined,
      sourceUrl: finalUrl,
      estimatedTotalAOA: totalAOA,
      exchangeRate: Math.round(rate),
      serviceFee: Math.round(breakdown.serviceFeeCents / 100),
      logisticsFee: Math.round(breakdown.logisticsFeeCents / 100),
      deliveryFee: Math.round(breakdown.deliveryFeeCents / 100),
      estimatedDays: 18,
    };
  }

  // Se o link foi detectado mas a loja escondeu o preço atrás de JS/Login,
  // devolve "needs_price" para o cliente digitar o valor da tela sem dar erro!
  return {
    success: true,
    status: "needs_price",
    platform: platform.name,
    title,
    currency,
    images,
    defaultImage: images[0] || undefined,
    sourceUrl: finalUrl,
    exchangeRate: Math.round(rate),
    estimatedDays: 18,
  };
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/");
}
