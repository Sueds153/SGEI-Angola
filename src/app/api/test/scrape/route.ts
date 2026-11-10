import { NextResponse } from "next/server";
import { z } from "zod";
import { scrapeWithFreeFallback, scrapeWithFallback, extractProductId } from "@/lib/scraping";

const schema = z.object({
  url: z.string().url("URL inválida"),
  forcePremium: z.boolean().default(false).optional(),
});

export async function POST(req: Request) {
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
    
    return NextResponse.json({
      success: result.success,
      platform,
      productId,
      method: result.method,
      latencyMs: result.latencyMs,
      error: result.error,
      hasHtml: !!result.html,
      hasJson: !!result.json,
      htmlLength: result.html?.length || 0,
      htmlPreview: result.html?.substring(0, 500) || null,
      jsonPreview: result.json ? JSON.stringify(result.json).substring(0, 1000) : null,
      // Resultado do parser
      parsedProduct: parsedProduct ? {
        title: parsedProduct.title,
        price: parsedProduct.price?.amount,
        currency: parsedProduct.price?.currency_code,
        brand: (parsedProduct as any).brand_title,
        size: (parsedProduct as any).size_title,
        condition: (parsedProduct as any).status,
        imagesCount: parsedProduct.images?.thumbnails?.length || 0,
        rating: parsedProduct.rating,
        orders: parsedProduct.orders,
        skuCount: parsedProduct.skuList?.length || 0,
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