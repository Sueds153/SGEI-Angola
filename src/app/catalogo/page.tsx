import { Container } from "@/components/ui";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { getActiveProvider } from "@/lib/providers";
import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo",
  description: "Todos os produtos disponíveis para pedido através da SGEI.",
};

export const dynamic = "force-dynamic";

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams?: Promise<{ categoria?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const categoria = sp?.categoria || "todos";
  const q = sp?.q || "";
  const provider = await getActiveProvider();
  let products;
  if (q) {
    products = await provider.searchProducts(q, { limit: 48 });
  } else {
    const res = await provider.getProductsByCategory(categoria, { limit: 48 });
    products = res.products;
  }
  return (
    <Container className="py-8 md:py-12">
      <div className="mb-6 md:mb-8">
        <nav className="text-xs text-ink-500 mb-3">
          <Link href="/" className="hover:text-primary-600">Início</Link>
          <span className="mx-1.5">/</span>
          <span>Catálogo</span>
        </nav>
        <h1 className="text-3xl md:text-4xl font-bold text-ink-900">Catálogo</h1>
        <p className="mt-1.5 text-ink-600">
          {q
            ? `Resultados para "${q}"`
            : categoria === "todos"
            ? "Todos os produtos disponíveis"
            : `A ver: ${categoria.replace(/-/g, " ")}`}
        </p>
      </div>
      <Suspense
        fallback={
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        }
      >
        {products.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-lg font-semibold text-ink-900">Nenhum produto encontrado</p>
            <p className="mt-1 text-sm text-ink-500">Tenta outra pesquisa ou <Link href="/" className="link">volta ao início</Link>.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </Suspense>
    </Container>
  );
}
