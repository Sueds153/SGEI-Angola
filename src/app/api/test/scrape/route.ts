import { NextResponse } from "next/server";
import { z } from "zod";
import { scrapeWithFreeFallback, scrapeWithFallback, extractProductId } from "@/lib/scraping";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  url: z.string().url("URL inválida"),
  forcePremium: z.boolean().default(false).optional(),
});

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  
  if (!parsed.success) {
    return NextResponse.json({ 
      success: false, 
      error: "URL inválida",
      issues: parsed.error.flatten()
    }, { status: 400 });
  }

  const { url, forcePremium } = parsed.data;
  const productIdInfo = extractProductId(url);
  
  if (!productIdInfo) {
    return NextResponse.json({ 
      success: false, 
      error: "Não foi possível identificar a plataforma ou extrair ID do produto. URLs suportadas: Shein, AliExpress, Vinted." 
    }, { status: 400 });
  }

  const { platform, id: productId } = productIdInfo;
  
  console.log(`[TestScrape] Testando ${platform}:${productId} - ${url}`);
  
  try {
    let result;
    
    if (forcePremium) {
      result = await scrapeWithFallback(url, productId, {
        renderJs: true,
        premiumProxy: true,
        timeout: 30000,
      });
    } else {
      result = await scrapeWithFreeFallback(url, productId, platform, {
        timeout: 15000,
        maxRetries: 2,
      });
    }
    
    // Se obteve HTML, tenta parsear
    let parsedProduct = null;
    if (result.success && result.html) {
      try {
        if (platform === 'aliexpress') {
          const { parseAliExpressHtml } = await import('@/lib/scraping/aliexpress-parser');
          parsedProduct = parseAliExpressHtml(result.html, productId);
        } else if (platform === 'vinted') {
          const { parseVintedHtml } = await import('@/lib/scraping/vinted-parser');
          parsedProduct = parseVintedHtml(result.html, productId);
        } else if (platform === 'shein') {
          // Shein parser não implementado ainda
          parsedProduct = null;
        }
      } catch (parseError: any) {
        console.error('[TestScrape] Erro no parser:', parseError);
      }
    }
    
    const method = "method" in result ? result.method : result.provider;
    const latencyMs = "latencyMs" in result ? result.latencyMs : 0;
    const parsedPrice = parsedProduct?.price;
    const parsedImages = parsedProduct?.images;

    return NextResponse.json({
      success: result.success,
      platform,
      productId,
      method,
      latencyMs,
      error: result.error,
      hasHtml: !!result.html,
      hasJson: !!result.json,
      htmlLength: result.html?.length || 0,
      htmlPreview: result.html?.substring(0, 500) || null,
      jsonPreview: result.json ? JSON.stringify(result.json).substring(0, 1000) : null,
      // Resultado do parser
      parsedProduct: parsedProduct ? {
        title: parsedProduct.title,
        price: parsedPrice && "amount" in parsedPrice ? parsedPrice.amount : parsedPrice?.min,
        currency: parsedPrice && "currency_code" in parsedPrice ? parsedPrice.currency_code : "EUR",
        brand: (parsedProduct as any).brand_title,
        size: (parsedProduct as any).size_title,
        condition: (parsedProduct as any).status,
        imagesCount: Array.isArray(parsedImages) ? parsedImages.length : parsedImages?.thumbnails?.length || 0,
        rating: "rating" in parsedProduct ? parsedProduct.rating : null,
        orders: "orders" in parsedProduct ? parsedProduct.orders : null,
        skuCount: "skuList" in parsedProduct ? parsedProduct.skuList?.length || 0 : 0,
      } : null,
    });
  } catch (error: any) {
    console.error('[TestScrape] Erro:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Acesso restrito a administradores." }, { status: 401 });
  }

  const freeMethods = [
    "Jina AI (texto limpo, ilimitado)",
    "Google Translate (proxy)",
    "Fetch direto (headers realistas)",
    "RapidAPI (AliExpress, 50 req/mês grátis)"
  ];
  
  const premiumMethods = [
    "ScrapingBee",
    "ZenRows",
    "Bright Data"
  ];

  return NextResponse.json({
    message: "Endpoint de teste de scraping",
    usage: {
      POST: {
        url: "https://www.aliexpress.com/item/1005001234567890.html",
        forcePremium: false
      }
    },
    supportedPlatforms: ["shein", "aliexpress", "vinted"],
    freeMethods,
    premiumMethods,
  });
}
