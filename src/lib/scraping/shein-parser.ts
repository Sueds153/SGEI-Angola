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

    // Só aceitamos dados estruturados que identifiquem o artigo do URL.
    // OpenGraph, <title> e imagens soltas podem pertencer a recomendações ou
    // à página de bloqueio da SHEIN, por isso não servem como identidade.
    if (productData) {
      // Navega pela estrutura típica da SHEIN
      const detail = productData.productDetail || productData.detail || productData;
      const goods = detail.goods || detail.product || detail;
      
      if (goods) {
        const actualId = String(goods.goods_id || goods.goodsSn || goods.product_id || goods.id || "");
        if (actualId !== productId) return null;

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

    // Não transformar metadados da página nem recomendações em produto.
    // Se a loja não devolveu os dados do ID solicitado, o resolver deve pedir
    // confirmação manual em vez de apresentar um artigo possivelmente errado.
    if (!title || price.min <= 0 || images.length === 0) return null;
    
    // Remove duplicatas de imagens
    images = [...new Set(images)].filter((img) => {
      const clean = img.trim();
      return clean && 
             !clean.includes("1x1") && 
             !clean.includes("pixel") && 
             !clean.includes("logo") &&
             !clean.endsWith(".svg");
    }).slice(0, 15);
    if (images.length === 0) return null;

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
