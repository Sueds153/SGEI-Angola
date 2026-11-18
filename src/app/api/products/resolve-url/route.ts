import { NextResponse } from "next/server";
import { z } from "zod";
import { getActiveProvider } from "@/lib/providers";
import { resolveAndScrapeUrl } from "@/lib/scraping/url-resolver";
import { loadPricingConfig, calculatePrice } from "@/lib/pricing";

const schema = z.object({
  url: z.string().min(3, "Link inválido"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ status: "unsupported", error: "Por favor insira um link válido." }, { status: 400 });
    }

    const { url } = parsed.data;

    // 1. Tentar catálogo interno primeiro (se já existir na base de dados)
    try {
      const provider = await getActiveProvider();
      const internalResult = await provider.resolveProductFromUrl(url);

      if (internalResult.status === "found" && internalResult.product) {
        const prod = internalResult.product as any;
        const config = await loadPricingConfig();
        const price = prod.originalPriceUsd || 15;
        const breakdown = calculatePrice({ productPriceUsd: price, quantity: 1, weightGrams: prod.weightGrams }, config);

        return NextResponse.json({
          status: "found",
          success: true,
          platform: prod.source,
          source: prod.source,
          productId: prod.id,
          externalId: prod.externalId,
          title: prod.name,
          price: price,
          currency: prod.currency || "EUR",
          images: prod.images || (prod.defaultImage ? [prod.defaultImage] : []),
          defaultImage: prod.defaultImage || prod.images?.[0] || null,
          sourceUrl: url,
          estimatedTotalAOA: Math.round(breakdown.totalCents / 100),
          exchangeRate: config.exchangeRateUsdToAoa,
          serviceFee: Math.round(breakdown.serviceFeeCents / 100),
          logisticsFee: Math.round(breakdown.logisticsFeeCents / 100),
          deliveryFee: Math.round(breakdown.deliveryFeeCents / 100),
          estimatedDays: 18,
          // Campos específicos do Vinted para discriminação transparente
          ...(prod.source === "VINTED" && {
            vintedBasePrice: prod.vintedBasePrice,
            vintedProtectionFee: prod.vintedProtectionFee,
            vintedTotalPrice: prod.vintedTotalPrice,
          }),
          product: prod,
        });
      }
    } catch {
      // Prossegue para scraper dinâmico caso o provider interno não tenha
    }

    // 2. Scraper dinâmico universal (OpenGraph, JSON-LD, redirecionamento e cálculo cambial)
    const result = await resolveAndScrapeUrl(url);

    if (!result.success) {
      return NextResponse.json(
        { status: "unsupported", error: result.error || "Não foi possível identificar o link inserido." },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[resolve-url] Erro:", error);
    return NextResponse.json(
      { status: "error", error: "Erro temporário ao processar o link. Tente novamente." },
      { status: 500 }
    );
  }
}
