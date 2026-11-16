import { Container, Alert } from "@/components/ui";
import { getActiveProvider } from "@/lib/providers";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ProductDetail } from "@/components/product/ProductDetail";
import { ProductCard } from "@/components/product/ProductCard";
import { getRecommendedProducts } from "@/lib/actions/products";
import type { NormalizedProduct } from "@/lib/types";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const provider = await getActiveProvider();
  const product = await provider.getProductBySlug(slug);
  if (!product) return { title: "Produto não encontrado" };
  return {
    title: product.name,
    description: product.description || "Produto disponível para importação rápida e segura via ImportEasy.",
    openGraph: { images: product.defaultImage ? [product.defaultImage] : undefined },
  };
}

export default async function ProdutoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const provider = await getActiveProvider();
  const product = await provider.getProductBySlug(slug);
  if (!product) notFound();

  return (
    <Container className="py-6 md:py-10">
      <nav className="text-xs text-ink-500 mb-4">
        <Link href="/" className="hover:text-primary-600">Início</Link>
        <span className="mx-1.5">/</span>
        <Link href="/catalogo" className="hover:text-primary-600">Catálogo</Link>
        {product.category && (
          <>
            <span className="mx-1.5">/</span>
            <Link href={`/categoria/${product.category.slug}`} className="hover:text-primary-600">
              {product.category.name}
            </Link>
          </>
        )}
        <span className="mx-1.5">/</span>
        <span className="text-ink-700 line-clamp-1 inline-block align-bottom max-w-[200px]">{product.name}</span>
      </nav>
      <ProductDetail product={product} />
      <Suspense fallback={<RecommendationsSkeleton />}>
        <ProductRecommendations product={product} />
      </Suspense>
    </Container>
  );
}

async function ProductRecommendations({ product }: { product: NormalizedProduct }) {
  const recommendations = await getRecommendedProducts(product);
  if (recommendations.length === 0) return null;

  return (
    <section className="mt-14 border-t border-ink-200 pt-10" aria-labelledby="recommendations-title">
      <div className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-brand-700">Sugestões para explorar</p>
          <h2 id="recommendations-title" className="mt-1 text-2xl font-semibold tracking-tight text-ink-900 sm:text-3xl">
            Talvez também goste
          </h2>
        </div>
        <Link href="/produtos" className="shrink-0 text-sm font-semibold text-brand-700 hover:text-brand-800">
          Ver catálogo
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {recommendations.map((recommended) => (
          <ProductCard key={recommended.id} product={recommended} compact />
        ))}
      </div>
    </section>
  );
}

function RecommendationsSkeleton() {
  return (
    <section className="mt-14 border-t border-ink-200 pt-10" aria-hidden="true">
      <div className="mb-6 h-8 w-56 animate-pulse rounded bg-ink-100" />
      <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="aspect-[3/4] animate-pulse rounded-[20px] bg-ink-100" />
        ))}
      </div>
    </section>
  );
}
