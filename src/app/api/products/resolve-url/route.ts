import { NextResponse } from "next/server";
import { z } from "zod";
import { getActiveProvider } from "@/lib/providers";
import { extractProductIdFromSheinUrl, isValidHttpUrl } from "@/lib/utils";

const schema = z.object({
  url: z.string().min(5, "URL inválida"),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ status: "unsupported", error: "URL inválida" }, { status: 400 });
  }
  const { url } = parsed.data;
  if (!isValidHttpUrl(url)) {
    return NextResponse.json({ status: "unsupported" });
  }
  const provider = await getActiveProvider();
  const result = await provider.resolveProductFromUrl(url);
  if (result.status === "found" && result.product) {
    return NextResponse.json({
      status: "found",
      externalId: result.externalId,
      source: result.product.source,
      currency: result.product.currency,
      product: {
        id: result.product.id,
        slug: result.product.slug,
        name: result.product.name,
        originalPriceUsd: result.product.originalPriceUsd, // Valor na moeda original do provider
        originalCurrency: result.product.currency,
        weightGrams: result.product.weightGrams,
        images: result.product.images,
        defaultImage: result.product.defaultImage,
        variants: result.product.variants,
      },
    });
  }
  if (result.status === "needs_confirmation") {
    return NextResponse.json({
      status: "needs_confirmation",
      externalId: result.externalId || extractProductIdFromSheinUrl(url),
      message: result.message || "Este produto precisa de confirmação manual. Podes continuar e a nossa equipa irá validar o preço.",
    });
  }
  return NextResponse.json({ status: "unsupported" });
}
