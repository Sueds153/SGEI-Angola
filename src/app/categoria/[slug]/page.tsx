import { Container } from "@/components/ui";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { getActiveProvider } from "@/lib/providers";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Suspense } from "react";

const CATEGORY_NAMES: Record<string, string> = {
  "vestuario-feminino": "Vestuário feminino",
  "vestuario-masculino": "Vestuário masculino",
  criancas: "Crianças",
  calcados: "Calçados",
  bolsas: "Bolsas",
  acessorios: "Acessórios",
  beleza: "Beleza",
  casa: "Casa",
  outros: "Outros",
};

export async function generateStaticParams() {
  return Object.keys(CATEGORY_NAMES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  return { title: CATEGORY_NAMES[slug] || "Categoria" };
}

export const dynamic = "force-dynamic";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const name = CATEGORY_NAMES[slug];
  if (!name) notFound();

  const provider = await getActiveProvider();
  const { products } = await provider.getProductsByCategory(slug, { limit: 48 });

  return (
    <Container className="py-8 md:py-12">
      <nav className="text-xs text-ink-500 mb-3">
        <Link href="/" className="hover:text-primary-600">Início</Link>
        <span className="mx-1.5">/</span>
        <Link href="/catalogo" className="hover:text-primary-600">Catálogo</Link>
        <span className="mx-1.5">/</span>
        <span>{name}</span>
      </nav>
      <h1 className="text-3xl md:text-4xl font-bold text-ink-900">{name}</h1>
      <p className="mt-1.5 text-ink-600">{products.length} produtos</p>

      <div className="mt-8">
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
              <p className="text-lg font-semibold text-ink-900">
                Ainda não existem produtos nesta categoria.
              </p>
              <p className="mt-2 text-sm text-ink-500">
                <Link href="/" className="link">Cola um link da SHEIN</Link> para pedires um produto específico.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </Suspense>
      </div>
    </Container>
  );
}
