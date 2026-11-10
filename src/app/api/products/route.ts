import { getActiveProvider } from "@/lib/providers";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const platform = searchParams.get("platform");
    const category = searchParams.get("category");
    const sort = searchParams.get("sort");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    const provider = await getActiveProvider();

    let products: any[] = [];

    // Se tem plataforma específica, busca via provider unificado
    if (platform && platform !== "TODAS") {
      // Para plataformas externas, usa featured + mock
      products = await provider.getFeaturedProducts(limit);
    } else {
      // Busca geral
      products = await provider.getFeaturedProducts(limit + offset);
    }

    // Filtrar por plataforma se necessário
    if (platform && platform !== "TODAS") {
      products = products.filter(p => p.source === platform);
    }

    // Filtrar por categoria se necessário
    if (category) {
      products = products.filter(p => p.category?.slug === category);
    }

    // Ordenar
    if (sort === "price-asc") {
      products.sort((a, b) => (a.priceAOA || 0) - (b.priceAOA || 0));
    } else if (sort === "price-desc") {
      products.sort((a, b) => (b.priceAOA || 0) - (a.priceAOA || 0));
    } else if (sort === "newest") {
      products.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    // Paginação
    const paginatedProducts = products.slice(offset, offset + limit);

    return NextResponse.json({
      products: paginatedProducts,
      total: products.length,
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