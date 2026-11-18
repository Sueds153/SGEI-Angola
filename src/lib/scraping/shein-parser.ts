/**
 * Parser para HTML da SHEIN
 * Extrai título, preço, imagens e variantes do HTML da página de produto
 */

export interface ParsedSheinProduct {
  id: string;
  title: string;
  images: string[];
  price: { min: number; max: number; original: number; currency: string };
  rating: { average: number; count: number };
  orders: number;
  skuList: Array<{
    skuId: string;
    skuVal: Array<{ path: string; name: string }>;
    skuPrice: number;
    skuStock: number;
    skuImage: string | null;
  }>;
  currency: string;
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/'/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/\\u002F/g, "/")
    .replace(/\\u003D/g, "=")
    .replace(/\\u0026/g, "&");
}

function extractJsonFromScript(html: string, pattern: RegExp): any | null {
  const match = html.match(pattern);
  if (match?.[1]) {
    try {
      return JSON.parse(decodeHtmlEntities(match[1]));
    } catch {
      return null;
    }
  }
  return null;
}

export function parseSheinHtml(html: string, productId: string): ParsedSheinProduct | null {
  try {
    let title = "";
    let images: string[] = [];
    let price = { min: 0, max: 0, original: 0, currency: "USD" };
    let rating = { average: 0, count: 0 };
    let orders = 0;
    let skuList: ParsedSheinProduct["skuList"] = [];
    let currency = "USD";

    // 1. Tenta extrair do __INITIAL_STATE__ ou data-state (mais confiável)
    const initialStatePatterns = [
      /__INITIAL_STATE__\s*=\s*({[\s\S]*?});\s*<\/script>/i,
      /data-state\s*=\s*["']({[\s\S]*?})["']/i,
      /window\.__INITIAL_DATA__\s*=\s*({[\s\S]*?});/i,
      /"productDetail"\s*:\s*({[\s\S]*?})\s*,\s*"(?:recommend|sku|spec)"/i,
    ];

    let productData: any = null;
    for (const pattern of initialStatePatterns) {
      productData = extractJsonFromScript(html, pattern);
      if (productData) break;
    }

    // Se encontrou dados estruturados, extrai deles
    if (productData) {
      // Navega pela estrutura típica da SHEIN
      const detail = productData.productDetail || productData.detail || productData;
      const goods = detail.goods || detail.product || detail;
      
      if (goods) {
        title = goods.goods_name || goods.title || goods.name || "";
        
        // Preço
        const salePrice = goods.sale_price?.amount || goods.price?.amount || goods.minPrice || 0;
        const originalPrice = goods.original_price?.amount || goods.retail_price?.amount || goods.maxPrice || salePrice;
        const currencyCode = goods.sale_price?.currency || goods.price?.currency || goods.currency || "USD";
        
        price = {
          min: parseFloat(salePrice) || 0,
          max: parseFloat(originalPrice) || parseFloat(salePrice) || 0,
          original: parseFloat(originalPrice) || parseFloat(salePrice) || 0,
          currency: currencyCode,
        };
        currency = currencyCode;

        // Imagens
        if (goods.image_urls) {
          images = goods.image_urls.map((u: string) => u.startsWith("//") ? "https:" + u : u);
        } else if (goods.goods_img) {
          images = [goods.goods_img].map((u: string) => u.startsWith("//") ? "https:" + u : u);
        } else if (goods.images) {
          images = goods.images.map((u: string) => u.startsWith("//") ? "https:" + u : u);
        }

        // Rating
        if (goods.comment_count || goods.rate) {
          rating = {
            average: parseFloat(goods.rate || goods.score || "0") || 0,
            count: parseInt(goods.comment_count || goods.review_count || "0") || 0,
          };
        }

        // Orders
        orders = parseInt(goods.sale_count || goods.trade_count || "0") || 0;

        // SKUs / Variantes
        if (goods.sku_list || goods.skus) {
          const skus = goods.sku_list || goods.skus;
          skuList = skus.map((sku: any) => ({
            skuId: sku.sku_id || sku.id || "",
            skuVal: (sku.sku_val || sku.attributes || []).map((attr: any) => ({
              path: attr.path || attr.name || "",
              name: attr.value || attr.val || "",
            })),
            skuPrice: parseFloat(sku.price?.amount || sku.sale_price || "0") || 0,
            skuStock: parseInt(sku.stock || sku.quantity || "999") || 999,
            skuImage: sku.image ? (sku.image.startsWith("//") ? "https:" + sku.image : sku.image) : null,
          }));
        }
      }
    }

    // 2. Fallback: OpenGraph / Meta tags
    if (!title) {
      const ogTitle = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
      if (ogTitle?.[1]) title = decodeHtmlEntities(ogTitle[1]).trim();
    }

    if (!title) {
      const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleTag?.[1]) title = decodeHtmlEntities(titleTag[1]).replace(/\s*[-|]\s*SHEIN.*$/i, "").trim();
    }

    if (images.length === 0) {
      const ogImage = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i);
      if (ogImage?.[1]) images.push(ogImage[1].startsWith("//") ? "https:" + ogImage[1] : ogImage[1]);
    }

    // 3. Fallback: Regex para preço no HTML
    if (price.min === 0) {
      const pricePatterns = [
        /"salePrice"\s*:\s*"?([0-9]+\.[0-9]{2})"?/i,
        /"price"\s*:\s*"?([0-9]+\.[0-9]{2})"?/i,
        /"minPrice"\s*:\s*"?([0-9]+\.[0-9]{2})"?/i,
        /\$([0-9]+\.[0-9]{2})/,
        /"amount"\s*:\s*"?([0-9]+\.[0-9]{2})"?/i,
        /data-price=["']([0-9]+\.[0-9]{2})["']/i,
      ];
      for (const pattern of pricePatterns) {
        const match = html.match(pattern);
        if (match?.[1]) {
          const val = parseFloat(match[1]);
          if (val > 0 && val < 5000) {
            price.min = val;
            price.max = val;
            price.original = val;
            break;
          }
        }
      }
    }

    // 4. Fallback: Extração de imagens via regex para SHEIN
    if (images.length === 0) {
      const imgPatterns = [
        /(?:https:)?\/\/img\.ltwebstatic\.com\/[^\s"'<>\\]+/gi,
        /(?:https:)?\/\/cdn\.shein\.com\/[^\s"'<>\\]+/gi,
        /(?:https:)?\/\/s\.shein\.com\/[^\s"'<>\\]+/gi,
      ];
      for (const pattern of imgPatterns) {
        const matches = html.match(pattern);
        if (matches) {
          images.push(...matches.slice(0, 10));
        }
      }
    }

    // Limpeza e validação
    if (!title) title = `Produto SHEIN ${productId}`;
    
    // Remove duplicatas de imagens
    images = [...new Set(images)].filter((img) => {
      const clean = img.trim();
      return clean && 
             !clean.includes("1x1") && 
             !clean.includes("pixel") && 
             !clean.includes("logo") &&
             !clean.endsWith(".svg");
    }).slice(0, 15);

    // Normaliza moeda
    const currencyMap: Record<string, string> = {
      "BRL": "BRL", "EUR": "EUR", "USD": "USD", "MXN": "MXN", "ARS": "ARS",
      "CLP": "CLP", "COP": "COP", "PEN": "PEN", "GBP": "GBP",
    };
    currency = currencyMap[currency] || "USD";

    return {
      id: `shein-${productId}`,
      title: title.trim(),
      images,
      price,
      rating,
      orders,
      skuList,
      currency,
    };
  } catch (error) {
    console.error("[SheinParser] Erro ao parsear HTML:", error);
    return null;
  }
}