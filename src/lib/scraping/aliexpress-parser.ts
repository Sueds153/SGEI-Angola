/**
 * Parser Inteligente para HTML do AliExpress
 * 
 * Extrai dados de produtos do HTML usando múltiplas estratégias:
 * 1. JSON-LD (schema.org) - padrão semântico da web
 * 2. __NEXT_DATA__ - dados React/Next.js embutidos
 * 3. Data-attributes - atributos de dados customizados
 * 4. Regex fallback - extração heurística
 */

interface AliExpressProduct {
  id: string;
  title: string;
  images: string[];
  price: {
    min: number;
    max: number;
    original: number;
  };
  rating: {
    average: number;
    count: number;
  };
  orders: number;
  skuList: {
    skuId: string;
    skuVal: Array<{ path: string; name: string }>;
    skuPrice: number;
    skuStock: number;
    skuImage: string;
  }[];
  category?: string;
  brand?: string;
  weightGrams?: number;
}

function extractJsonLd(html: string): any[] {
  try {
    const scriptTags = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
    return scriptTags.map(tag => {
      const match = tag.match(/<script[^>]*>([\s\S]*)<\/script>/i);
      return match?.[1] ? JSON.parse(match[1]) : null;
    }).filter(Boolean);
  } catch {
    return [];
  }
}

function extractNextData(html: string): any {
  try {
    const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/i);
    if (match?.[1]) {
      return JSON.parse(match[1]);
    }
  } catch {
    // Ignora parse errors
  }
  return null;
}

function extractSkuData(html: string): any {
  try {
    const match = html.match(/skuData\s*=\s*({[\s\S]*?});?\s*[,;]/);
    if (match?.[1]) {
      return JSON.parse(match[1]);
    }
  } catch {
    // Ignora parse errors
  }
  return null;
}

function extractPrice(html: string): { min: number; max: number; original: number } {
  // Tenta extrair de múltiplas fontes
  const patterns = [
    /"amount"\s*:\s*"([\d.]+)"/g,
    /"salePrice"\s*:\s*"([\d.]+)"/g,
    /"originalPrice"\s*:\s*"([\d.]+)"/g,
  ];

  let min = 0, max = 0, original = 0;

  for (const pattern of patterns) {
    const matches = Array.from(html.matchAll(pattern));
    if (matches.length > 0) {
      const values = matches.map(m => parseFloat(m[1])).filter(v => v > 0);
      min = Math.min(...values);
      max = Math.max(...values);
    }
  }

  if (original === 0 && max > 0) {
    original = max;
    min = min || max;
  }

  return { min, max, original: max };
}

function extractImages(html: string): string[] {
  const images: string[] = [];
  
  // Tenta JSON-LD primeiro
  const jsonLd = extractJsonLd(html);
  for (const ld of jsonLd) {
    const imageList = ld.image || [];
    const normalizedImages = Array.isArray(imageList) ? imageList : [imageList];
    images.push(...normalizedImages.filter((img: string) => typeof img === 'string'));
  }

  // Fallback: extrai tags img
  if (images.length === 0) {
    const imgPatterns = html.match(/<img[^>]*src=["']([^"']*?)"['"][^>]*>/gi) || [];
    for (const match of imgPatterns) {
      const src = match.match(/src=["']([^"']*?)["']/);
      if (src?.[1]) {
        const url = src[1].replace(/&amp;/g, '&');
        if (url.includes('ae01.alicdn.com') || url.includes('aliexpress.com')) {
          images.push(url);
        }
      }
    }
  }

  // Limpa duplicatas e limita a 20 imagens
  return [...new Set(images)].slice(0, 20);
}

function extractTitle(html: string): string {
  // Tenta JSON-LD
  const jsonLd = extractJsonLd(html);
  for (const ld of jsonLd) {
    if (ld.name) return ld.name;
  }

  // Tenta __NEXT_DATA__
  const nextData = extractNextData(html);
  if (nextData?.props?.pageProps?.product?.title) {
    return nextData.props.pageProps.product.title;
  }

  // Tenta extrair do title tag
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch?.[1]) {
    const clean = titleMatch[1].replace(/[-\|].*$/, '').trim();
    return clean;
  }

  return 'Produto AliExpress';
}

export function parseAliExpressHtml(html: string, productId: string): AliExpressProduct | null {
  if (!html || html.length < 100) {
    console.warn('[AliExpress Parser] HTML muito curto, ignorando');
    return null;
  }

  try {
    // Extrai dados básicos
    const title = extractTitle(html);
    const price = extractPrice(html);
    const images = extractImages(html);
    
    // Extrai rating e orders
    let ratingAvg = 0;
    let ratingCount = 0;
    let orders = 0;

    const nextData = extractNextData(html);
    if (nextData?.props?.pageProps?.product) {
      const product = nextData.props.pageProps.product;
      ratingAvg = product.avgRating || 0;
      ratingCount = product.ratingCount || 0;
      orders = product.orders || 0;
    } else {
      // Fallback regex
      const ratingMatch = html.match(/"avgStar"\s*:\s*"(\d+\.?\d*)"/);
      const countMatch = html.match(/"totalCount"\s*:\s*(\d+)/);
      const ordersMatch = html.match(/"evaluations"\s*:\s*\d+/);
      
      ratingAvg = ratingMatch ? parseFloat(ratingMatch[1]) / 10 : 0;
      ratingCount = countMatch ? parseInt(countMatch[1]) : 0;
      orders = ordersMatch ? parseInt(ordersMatch[1].split(':')[1]) : 0;
    }

    // Extrai SKU data
    const skuList: AliExpressProduct['skuList'] = [];
    const skuData = extractSkuData(html) || nextData?.props?.pageProps?.skuList;
    
    if (skuData?.skuListData?.skuList) {
      for (const sku of skuData.skuListData.skuList) {
        skuList.push({
          skuId: sku.skuId.toString(),
          skuVal: sku.skuVal || [],
          skuPrice: parseFloat(sku.skuPrice || price.min),
          skuStock: sku.stock || 999,
          skuImage: sku.skuImage || images[0],
        });
      }
    } else if (images.length > 0 && price.min > 0) {
      // Fallback: cria SKU único
      skuList.push({
        skuId: productId,
        skuVal: [],
        skuPrice: price.min,
        skuStock: 999,
        skuImage: images[0],
      });
    }

    const product: AliExpressProduct = {
      id: productId,
      title,
      images,
      price,
      rating: {
        average: ratingAvg,
        count: ratingCount,
      },
      orders,
      skuList,
      weightGrams: 250, // Estimativa padrão
    };

    if (product.title && product.images.length > 0) {
      console.log(`[AliExpress Parser] Produto extraído com sucesso: ${product.title}`);
      return product;
    }

    console.warn('[AliExpress Parser] Dados incompletos, retornando null');
    return null;
  } catch (error: any) {
    console.error('[AliExpress Parser] Erro ao parsear HTML:', error.message);
    return null;
  }
}

export { extractJsonLd, extractNextData, extractSkuData };
