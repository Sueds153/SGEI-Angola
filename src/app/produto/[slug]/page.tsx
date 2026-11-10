import { Container, Alert } from "@/components/ui";
import { getActiveProvider } from "@/lib/providers";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { ProductDetail } from "@/components/product/ProductDetail";

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
    description: product.description || "Produto disponível via SGEI.",
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
      {product.source === "MOCK" && (
        <div className="mb-4">
          <Alert variant="warning" title="Produto de demonstração">
            Este é um artigo de demonstração para mostrar a plataforma. Os produtos reais serão adicionados pelo administrador.
          </Alert>
        </div>
      )}
      <ProductDetail product={product} />
    </Container>
  );
}
