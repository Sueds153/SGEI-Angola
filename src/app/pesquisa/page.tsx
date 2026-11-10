import { Container } from "@/components/ui";
import { ProductCard } from "@/components/product/ProductCard";
import { getActiveProvider } from "@/lib/providers";
import Link from "next/link";
import type { Metadata } from "next";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}): Promise<Metadata> {
  const sp = await searchParams;
  return { title: sp?.q ? `Pesquisa: ${sp.q}` : "Pesquisa" };
}

export const dynamic = "force-dynamic";

export default async function PesquisaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;
  const q = sp?.q || "";
  const provider = await getActiveProvider();
  const products = q ? await provider.searchProducts(q, { limit: 48 }) : [];

  return (
    <Container className="py-8 md:py-12">
      <nav className="text-xs text-ink-500 mb-3">
        <Link href="/" className="hover:text-primary-600">Início</Link>
        <span className="mx-1.5">/</span>
        <span>Pesquisa</span>
      </nav>
      <h1 className="text-3xl md:text-4xl font-bold text-ink-900">
        {q ? `Resultados para "${q}"` : "Pesquisa"}
      </h1>
      <p className="mt-1.5 text-ink-600">
        {products.length} {products.length === 1 ? "produto encontrado" : "produtos encontrados"}
      </p>

      <div className="mt-8">
        {products.length === 0 ? (
          <div className="card p-10 text-center">
            <p className="text-lg font-semibold text-ink-900">
              {q ? "Não encontrámos produtos para esta pesquisa." : "Escreve o que procuras."}
            </p>
            <p className="mt-2 text-sm text-ink-500">
              Experimenta pesquisar por outra palavra ou{" "}
              <Link href="/" className="link">colar um link SHEIN</Link>.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-5">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
