"use client";

import { useState, useEffect } from "react";
import { Search, Filter, ChevronDown, Zap, Shirt, Smartphone, Loader2 } from "lucide-react";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";

const PLATFORMS = [
  { value: "", label: "Todas", icon: null },
  { value: "SHEIN", label: "Shein", icon: Shirt, color: "bg-pink-100 text-pink-600" },
  { value: "ALIEXPRESS", label: "AliExpress", icon: Zap, color: "bg-orange-100 text-orange-600" },
  { value: "VINTED", label: "Vinted", icon: Smartphone, color: "bg-brand-100 text-brand-600" },
];

const CATEGORIES = [
  { value: "", label: "Todas as categorias" },
  { value: "vestuario-feminino", label: "Vestuário feminino" },
  { value: "vestuario-masculino", label: "Vestuário masculino" },
  { value: "calcados", label: "Calçados" },
  { value: "bolsas", label: "Bolsas" },
  { value: "acessorios", label: "Acessórios" },
  { value: "tech", label: "Tech & Eletrónicos" },
  { value: "beleza", label: "Beleza" },
  { value: "casa", label: "Casa" },
];

export default function ProdutosPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState("relevance");
  const [showFilters, setShowFilters] = useState(false);

  // fetchProducts recebe os parâmetros explicitamente para evitar stale closures
  const fetchProducts = async (
    pPlatform: string,
    pCategory: string,
    pSort: string
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (pPlatform) params.set("platform", pPlatform);
      if (pCategory) params.set("category", pCategory);
      if (pSort && pSort !== "relevance") params.set("sort", pSort);

      const response = await fetch(`/api/products?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Initial load on mount
  useEffect(() => {
    fetchProducts("", "", "relevance");
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      window.location.href = `/pesquisa?q=${encodeURIComponent(search.trim())}`;
    }
  };

  const handleFilterChange = () => {
    fetchProducts();
  };

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Search Bar */}
      <section className="bg-white border-b border-ink-200 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Procurar produtos... (vestido, iPhone, ténis...)"
              className="w-full pl-12 pr-4 py-3 border border-ink-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent text-ink-900 placeholder-ink-400"
            />
          </form>
        </div>
      </section>

      <main className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filters Bar */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-8">
            <div className="flex flex-wrap items-center gap-3">
              {/* Platform Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                {PLATFORMS.map((p) => (
                  <button
                    key={p.value}
                    onClick={() => { setPlatform(p.value); handleFilterChange(); }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition ${
                      platform === p.value
                        ? "bg-brand-600 text-white"
                        : "bg-white text-ink-600 hover:bg-ink-50 border border-ink-200"
                    }`}
                  >
                    {p.icon && <p.icon className={`w-3.5 h-3.5 ${p.color}`} />}
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <label htmlFor="sort" className="text-sm text-ink-500">Ordenar:</label>
              <select
                id="sort"
                value={sort}
                onChange={(e) => { setSort(e.target.value); handleFilterChange(); }}
                className="px-3 py-2 border border-ink-300 rounded-xl text-sm text-ink-900 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="relevance">Relevância</option>
                <option value="price-asc">Preço: Menor</option>
                <option value="price-desc">Preço: Maior</option>
                <option value="newest">Mais recentes</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mb-8 p-4 bg-white rounded-2xl border border-ink-200 animate-slide-down">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-ink-700 mb-1">Categoria</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => { setCategory(e.target.value); handleFilterChange(); }}
                    className="w-full px-3 py-2 border border-ink-300 rounded-xl text-sm text-ink-900 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={() => { setCategory(""); setPlatform(""); handleFilterChange(); }}
                    className="px-4 py-2 text-sm text-brand-600 font-medium hover:text-brand-700"
                  >
                    Limpar filtros
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Results Count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-ink-600">
              {loading 
                ? "A carregar..." 
                : `${products.length} produto${products.length !== 1 ? "s" : ""} encontrado${products.length !== 1 ? "s" : ""}`}
            </p>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-2 border border-ink-300 rounded-xl text-sm font-medium text-ink-700 hover:bg-ink-50 transition"
            >
              <Filter className="w-4 h-4" />
              Filtros
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </button>
          </div>

          {/* Products Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i}><ProductCardSkeleton /></div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id}><ProductCard product={product} /></div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-ink-100 flex items-center justify-center">
                <Search className="w-8 h-8 text-ink-400" />
              </div>
              <h3 className="text-xl font-semibold text-ink-900 mb-2">Nenhum produto encontrado</h3>
              <p className="text-ink-500 mb-6">Tente ajustar os filtros ou procurar por outro termo.</p>
              <button
                onClick={() => { setPlatform(""); setCategory(""); fetchProducts(); }}
                className="px-6 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700"
              >
                Ver todos os produtos
              </button>
            </div>
          )}

          {/* Load More */}
          {products.length >= 20 && !loading && (
            <div className="text-center mt-12">
              <button className="px-8 py-3 border-2 border-brand-600 text-brand-600 font-semibold rounded-xl hover:bg-brand-50 transition">
                Carregar mais produtos
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}