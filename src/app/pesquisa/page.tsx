import { ProductCard } from "@/components/product/ProductCard";
import { Container } from "@/components/ui";
import { discoverProducts, type DiscoveryStore } from "@/lib/search/product-discovery";
import { getActiveProvider } from "@/lib/providers";
import { AlertCircle, ArrowUpRight, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

const STORES: Array<{ id: DiscoveryStore; label: string; focus: string; styles: string }> = [
  { id: "ALL", label: "Todas", focus: "Produtos elegíveis", styles: "border-ink-200 bg-white text-ink-700" },
  { id: "SHEIN", label: "SHEIN", focus: "Vestuário", styles: "border-pink-200 bg-pink-50 text-pink-800" },
  { id: "ALIEXPRESS", label: "AliExpress", focus: "Gadgets e electrónica", styles: "border-orange-200 bg-orange-50 text-orange-800" },
  { id: "VINTED", label: "Vinted", focus: "iPhones publicados nas últimas 72 horas", styles: "border-blue-200 bg-blue-50 text-blue-800" },
];

const STORE_IDS = new Set(STORES.map((store) => store.id));

function firstParam(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function searchHref(store: DiscoveryStore, query: string): string {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (store !== "ALL") params.set("store", store);
  const search = params.toString();
  return search ? `/pesquisa?${search}` : "/pesquisa";
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; store?: string | string[] }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const query = firstParam(params.q).trim();
  return { title: query ? `Pesquisa: ${query}` : "Descobrir produtos" };
}

export const dynamic = "force-dynamic";

export default async function PesquisaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[]; store?: string | string[] }>;
}) {
  const params = await searchParams;
  const query = firstParam(params.q).trim();
  const requestedStore = firstParam(params.store).toUpperCase() as DiscoveryStore;
  const store = STORE_IDS.has(requestedStore) ? requestedStore : "ALL";
  const provider = await getActiveProvider();
  const catalog = await provider.searchProducts(query, { limit: 200 });
  const discovery = discoverProducts(catalog, { store, query });
  const { products } = discovery;
  const selectedStore = STORES.find((item) => item.id === store) || STORES[0];

  return (
    <Container className="py-6 md:py-10">
      <nav className="mb-5 text-xs text-ink-500" aria-label="Navegação estrutural">
        <Link href="/" className="transition-colors hover:text-primary-600">Início</Link>
        <span className="mx-1.5">/</span>
        <span aria-current="page">Descobrir produtos</span>
      </nav>

      <header className="mx-auto max-w-3xl text-center">
        <p className="text-sm font-semibold text-primary-700">Compra internacional simplificada</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink-950 sm:text-4xl">
          Descobre o que queres importar
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-ink-600 sm:text-base">
          Pesquisa no catálogo ImportEasy e escolhe a loja onde queres procurar.
        </p>
      </header>

      <section className="mx-auto mt-6 max-w-3xl rounded-3xl border border-ink-200 bg-white p-3 shadow-sm sm:mt-8 sm:p-4" aria-label="Pesquisa de produtos">
        <form action="/pesquisa" method="get" className="flex flex-col gap-2 sm:flex-row">
          <input type="hidden" name="store" value={store} />
          <label className="relative min-w-0 flex-1">
            <span className="sr-only">O que procuras?</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-400" />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Ex.: vestido, auriculares, iPhone"
              className="h-13 w-full rounded-2xl border border-ink-200 bg-ink-50 pl-12 pr-4 text-base text-ink-950 outline-none transition focus:border-primary-500 focus:bg-white focus:ring-4 focus:ring-primary-100"
            />
          </label>
          <button type="submit" className="inline-flex h-13 items-center justify-center gap-2 rounded-2xl bg-primary-600 px-6 text-sm font-bold text-white transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-200">
            <Search aria-hidden="true" className="h-4 w-4" />
            Pesquisar
          </button>
        </form>
      </section>

      <section className="mx-auto mt-5 max-w-4xl" aria-label="Filtrar por loja">
        <div className="flex flex-wrap justify-center gap-2">
          {STORES.map((option) => {
            const active = option.id === store;
            return (
              <Link
                key={option.id}
                href={searchHref(option.id, query)}
                aria-current={active ? "page" : undefined}
                className={`rounded-full border px-4 py-2 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 ${option.styles} ${active ? "ring-2 ring-primary-500 ring-offset-2" : "opacity-80 hover:opacity-100"}`}
              >
                {option.label}
                <span className="sr-only"> — {option.focus}</span>
              </Link>
            );
          })}
        </div>
        <p className="mt-3 text-center text-sm text-ink-500">{selectedStore.focus}</p>
      </section>

      <section className="mx-auto mt-7 max-w-6xl md:mt-9" aria-labelledby="results-heading">
        <div className="mb-4 flex flex-col gap-1 border-b border-ink-100 pb-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="results-heading" className="text-xl font-bold text-ink-950 sm:text-2xl">
              {query ? `Resultados para “${query}”` : "Produtos para descobrir"}
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              {products.length} {products.length === 1 ? "produto elegível" : "produtos elegíveis"} no catálogo ImportEasy
            </p>
          </div>
          <p className="text-xs text-ink-500">A disponibilidade e os preços podem mudar na loja de origem.</p>
        </div>

        {discovery.vintedFreshnessUnavailable && (
          <div className="mb-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-950" role="status">
            <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />
            <div>
              <p className="font-semibold">Ainda não conseguimos confirmar anúncios Vinted publicados nas últimas 72 horas.</p>
              <p className="mt-1 text-sm leading-5 text-amber-900">
                Para não mostrar anúncios antigos como recentes, só apresentamos resultados com data de publicação confirmada. Podes continuar a pesquisa colando o link do iPhone.
              </p>
              <Link href="/importar" className="mt-2 inline-flex items-center gap-1 text-sm font-bold text-amber-950 underline underline-offset-4">
                Pesquisar por link <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-primary-100 bg-primary-50 p-4 text-primary-950">
          <AlertCircle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary-700" />
          <p className="text-sm leading-5">
            Antes de confirmar o pedido, verifica na loja de origem o artigo, a cor/tamanho, a disponibilidade e o preço actual.
          </p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink-300 bg-ink-50 px-5 py-12 text-center sm:px-10">
            <h3 className="text-lg font-bold text-ink-900">
              {discovery.vintedFreshnessUnavailable
                ? "Não há iPhones com publicação confirmada neste momento."
                : query
                  ? "Não encontrámos produtos elegíveis para esta pesquisa."
                  : "Ainda não há produtos elegíveis nesta selecção."}
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-ink-600">
              Experimenta outro termo ou escolhe uma loja diferente. Também podes colar directamente o link do produto para pedir uma simulação.
            </p>
            <Link href="/importar" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-primary-600 px-5 text-sm font-bold text-white transition hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary-200">
              Colar link do produto
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </Container>
  );
}
