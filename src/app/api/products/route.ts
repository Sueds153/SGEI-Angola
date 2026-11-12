import { getActiveProvider } from "@/lib/providers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort") || "relevance";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const provider = await getActiveProvider();

    // Busca catálogo (admin + mock) — não limitado aos "featured"
    let all = await provider.searchProducts("", { limit: 200 });

    // Filtro por plataforma
    if (platform) {
      const p = platform.toUpperCase();
      all = all.filter((prod) => {
        const source = (prod.source || "").toUpperCase();
        // Produtos mock são tratados como SHEIN para fins de filtro
        if (p === "SHEIN") return source === "SHEIN" || source === "MOCK";
        return source === p;
      });
    }

    // Filtro por categoria
    if (category) {
      all = all.filter((prod) => prod.category?.slug === category);
    }

    // Ordenação
    if (sort === "price-asc") {
      all.sort((a, b) => (a.originalPriceUsd ?? 0) - (b.originalPriceUsd ?? 0));
    } else if (sort === "price-desc") {
      all.sort((a, b) => (b.originalPriceUsd ?? 0) - (a.originalPriceUsd ?? 0));
    }

    const total = all.length;
    const products = all.slice(offset, offset + limit);

    return NextResponse.json({
      products,
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
    });
  } catch (error) {
    console.error("Erro na API de produtos:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor", products: [] },
      { status: 500 }
    );
  }
}