import { useState } from "react";
import { Filter, Search } from "lucide-react";

interface CommunityFiltersProps {
  onFilter: (filters: { platform?: string; category?: string; status?: string }) => void;
  onSearch: (query: string) => void;
}

export function CommunityFilters({ onFilter, onSearch }: CommunityFiltersProps) {
  const [platform, setPlatform] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    onSearch(value);
  };

  const handleApply = () => {
    onFilter({ platform, category, status });
  };

  const handleClear = () => {
    setPlatform("");
    setCategory("");
    setStatus("");
    setSearchQuery("");
    onFilter({});
    onSearch("");
  };

  const categories = [
    "Moda",
    "Tech",
    "Calçados",
    "Bolsas",
    "Beleza",
    "Acessórios",
    "Casa",
    "Outros",
  ];

  const statuses = [
    { value: "ENTREGUE", label: "Entregue" },
    { value: "EM_TRANSITO", label: "Em trânsito" },
    { value: "PENDENTE", label: "Pendente" },
  ];

  const activeFiltersCount = [platform, category, status].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl border border-ink-200 p-4 mb-6">
      <div className="flex flex-col gap-3">
        {/* Barra de pesquisa */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            aria-label="Pesquisar partilhas da comunidade"
            placeholder="Pesquisar por artigo, cliente ou província..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-ink-200 rounded-lg text-sm text-ink-900 placeholder:text-ink-400 focus:border-brand-600 focus:outline-none"
          />
        </div>

        {/* Botão de alternância de filtros e atalhos rápidos */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-expanded={showAdvanced}
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-ink-200 rounded-lg text-xs font-medium text-ink-700 hover:bg-ink-50 transition"
            >
              <Filter className="w-3.5 h-3.5 text-ink-500" />
              <span>Filtros detalhados</span>
              {activeFiltersCount > 0 && (
                <span className="ml-1 px-1.5 py-0.2 bg-brand-100 text-brand-800 rounded-full text-[10px] font-semibold">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* Filtros rápidos de plataforma */}
            <div className="hidden sm:flex items-center gap-1.5">
              {["SHEIN", "VINTED", "ALIEXPRESS"].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    const next = platform === p ? "" : p;
                    setPlatform(next);
                    onFilter({ platform: next, category, status });
                  }}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium border transition ${
                    platform === p
                      ? "bg-brand-50 border-brand-300 text-brand-800"
                      : "bg-white border-ink-200 text-ink-600 hover:bg-ink-50"
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {(searchQuery || activeFiltersCount > 0) && (
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-brand-700 hover:text-brand-800 font-medium underline underline-offset-2"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {/* Painel de filtros avançados */}
        {showAdvanced && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-ink-100">
            <div>
              <label
                htmlFor="community-platform"
                className="text-xs font-medium text-ink-700 block mb-1"
              >
                Loja de origem
              </label>
              <select
                id="community-platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 border border-ink-200 rounded-lg text-xs text-ink-900 bg-white"
              >
                <option value="">Todas as lojas</option>
                <option value="SHEIN">SHEIN</option>
                <option value="VINTED">Vinted</option>
                <option value="ALIEXPRESS">AliExpress</option>
                <option value="ZARA">Zara</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="community-category"
                className="text-xs font-medium text-ink-700 block mb-1"
              >
                Categoria
              </label>
              <select
                id="community-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-ink-200 rounded-lg text-xs text-ink-900 bg-white"
              >
                <option value="">Todas as categorias</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="community-status"
                className="text-xs font-medium text-ink-700 block mb-1"
              >
                Estado da encomenda
              </label>
              <select
                id="community-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-ink-200 rounded-lg text-xs text-ink-900 bg-white"
              >
                <option value="">Todos os estados</option>
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3 flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleClear}
                className="px-3 py-1.5 border border-ink-200 rounded-lg text-xs text-ink-700 hover:bg-ink-50 transition"
              >
                Repor
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-medium transition"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
