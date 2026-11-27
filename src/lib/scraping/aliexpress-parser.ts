/**
 * Parser Inteligente para HTML do AliExpress
 * 
 * Extrai dados de produtos do HTML usando múltiplas estratégias:
 * 1. JSON-LD (schema.org) - padrão semântico da web
 * 2. __NEXT_DATA__ - dados React/Next.js embutidos
 * 3. Data-attributes - atributos de dados customizados
 * 4. Regex fallback - extração heurística
 */

export interface AliExpressProduct {
  id: string;
  title: string;
  images: string[];
  price: {
    min: number;
    max: number;
    original: number;
    currency: string;
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

function extractPrice(html: string): { min: number; max: number; original: number; currency: string } {
  let currency = "USD";

  // 1. Tenta JSON-LD schema.org Product/Offers (mais confiável)
  const jsonLd = extractJsonLd(html);
  for (const ld of jsonLd) {
    if (ld["@type"] === "Product" && ld.offers) {
      const offers = Array.isArray(ld.offers) ? ld.offers[0] : ld.offers;
      if (offers.price) {
        const price = parseFloat(String(offers.price));
        if (offers.priceCurrency) currency = offers.priceCurrency.toUpperCase();
        return { min: price, max: price, original: price, currency };
      }
      if (offers.lowPrice && offers.highPrice) {
        const min = parseFloat(String(offers.lowPrice));
        const max = parseFloat(String(offers.highPrice));
        if (offers.priceCurrency) currency = offers.priceCurrency.toUpperCase();
        return { min, max, original: max, currency };
      }
    }
  }

  // 2. Tenta __NEXT_DATA__ (dados do Next.js)
  const nextData = extractNextData(html);
  if (nextData?.props?.pageProps?.product) {
    const product = nextData.props.pageProps.product;
    // Estrutura típica: product.price.min, product.price.max, product.price.currency
    if (product.price) {
      const min = parseFloat(String(product.price.min || product.price.salePrice || 0));
      const max = parseFloat(String(product.price.max || product.price.originalPrice || product.price.salePrice || 0));
      if (product.price.currency) currency = product.price.currency.toUpperCase();
      if (min > 0 || max > 0) {
        return { min: min || max, max: max || min, original: max || min, currency };
      }
    }
    // Fallback: campos diretos
    if (product.salePrice || product.originalPrice) {
      const min = parseFloat(String(product.salePrice || product.originalPrice || 0));
      const max = parseFloat(String(product.originalPrice || product.salePrice || 0));
      if (product.currencyCode) currency = product.currencyCode.toUpperCase();
      return { min, max, original: max, currency };
    }
  }

  // 3. Tenta skuData embutido
  const skuData = extractSkuData(html);
  if (skuData?.skuListData?.skuList?.length) {
    const prices = skuData.skuListData.skuList
      .map((sku: any) => parseFloat(String(sku.skuPrice || sku.price || 0)))
      .filter((p: number) => p > 0);
    if (prices.length > 0) {
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      if (skuData.currencyCode) currency = skuData.currencyCode.toUpperCase();
      return { min, max, original: max, currency };
    }
  }

  // 4. Fallback: regex direcionado apenas para preço de venda (não min/max de todos "amount")
  // Procura por salePrice, originalPrice, ou preço em formato estruturado
  const salePriceMatch = html.match(/"salePrice"\s*:\s*"([\d.]+)"/);
  const originalPriceMatch = html.match(/"originalPrice"\s*:\s*"([\d.]+)"/);
  const priceMatch = html.match(/"price"\s*:\s*"([\d.]+)"/);
  const amountMatch = html.match(/"amount"\s*:\s*"([\d.]+)"/);

  let min = 0, max = 0, original = 0;

  if (salePriceMatch) {
    min = parseFloat(salePriceMatch[1]);
    if (originalPriceMatch) {
      max = parseFloat(originalPriceMatch[1]);
    } else if (priceMatch) {
      max = parseFloat(priceMatch[1]);
    } else {
      max = min;
    }
    original = max;
  } else if (originalPriceMatch) {
    min = max = original = parseFloat(originalPriceMatch[1]);
  } else if (priceMatch) {
    min = max = original = parseFloat(priceMatch[1]);
  } else if (amountMatch) {
    // Último recurso: primeiro "amount" encontrado (evita min/max ruidoso)
    min = max = original = parseFloat(amountMatch[1]);
  }

  return { min, max, original: max, currency };
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

function containsRequestedProduct(html: string, productId: string): boolean {
  const escapedId = productId.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const identityPatterns = [
    // IDs explícitos no JSON/JS
    new RegExp(`(?:productId|product_id|itemId|item_id|productID|itemID|goods_id|goodsId)\\s*[\\"']?\\s*:\\s*[\\"']?${escapedId}(?:[\\"'&,}]|$)`, "i"),
    // Canonical URL ou og:url contendo o ID
    new RegExp(`(?:canonical|og:url)[^>]*(?:/item/${escapedId}(?:\\.html)?|[?&](?:productId|itemId|goods_id)=${escapedId})`, "i"),
    // Link canonical explícito
    new RegExp(`<link[^>]+href=[\\"'][^\\"']*/item/${escapedId}(?:\\.html)?[^\\"']*[\\"'][^>]*rel=[\\"']canonical`, "i"),
    // Meta property product:retailer_item_id
    new RegExp(`<meta[^>]+property=["']product:retailer_item_id["'][^>]+content=["']${escapedId}["']`, "i"),
    // data-product-id ou data-item-id attributes
    new RegExp(`(?:data-product-id|data-item-id|data-goods-id)=["']${escapedId}["']`, "i"),
  ];
  return identityPatterns.some((pattern) => pattern.test(html));
}

export function parseAliExpressHtml(html: string, productId: string): AliExpressProduct | null {
  if (!html || html.length < 100) {
    console.warn('[AliExpress Parser] HTML muito curto, ignorando');
    return null;
  }

  try {
    // Uma página de bloqueio ou uma recomendação também pode conter título,
    // imagem e preço. Exigimos que o HTML identifique o artigo pedido.
    if (!containsRequestedProduct(html, productId)) return null;

    // Extrai dados básicos
    const title = extractTitle(html);
    const price = extractPrice(html);
    const images = extractImages(html);

    // Validação extra: se o preço parece irrealista (ex: $0.01 ou > $10000), rejeita
    if (price.min <= 0 || price.min > 10000 || price.max > 10000) {
      console.warn('[AliExpress Parser] Preço fora de intervalo plausível:', price);
      return null;
    }
    
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

    if (product.title && product.title !== "Produto AliExpress" && product.price.min > 0 && product.images.length > 0) {
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
