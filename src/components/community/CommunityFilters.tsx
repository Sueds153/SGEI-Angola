import { useState, useEffect } from "react";
import { Filter, Search, TrendingUp, Users, CheckCircle2, Star, Clock, MapPin } from "lucide-react";

interface CommunityFiltersProps {
  onFilter: (filters: any) => void;
  onSearch: (query: string) => void;
}

export function CommunityFilters({ onFilter, onSearch }: CommunityFiltersProps) {
  const [platform, setPlatform] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    setTimeout(() => onSearch(value), 300);
  };

  const handleApply = () => {
    onFilter({ platform, category, status });
  };

  const handleClear = () => {
    setPlatform('');
    setCategory('');
    setStatus('');
    setSearchQuery('');
    onFilter({});
  };

  const categories = ['Tech', 'Moda', 'Calcados', 'Bolsas', 'Acessórios', 'Beleza', 'Casa', 'Outros'];
  const statuses = [
    { value: 'ENTREGUE', label: 'Entregue' },
    { value: 'EM_TRANSITO', label: 'Em trânsito' },
    { value: 'PENDENTE', label: 'Pendente' },
    { value: 'EM_ANALISE', label: 'Em análise' },
    { value: 'PERGUNTA', label: 'Pergunta' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-ink-200 p-4 mb-6 shadow-sm">
      <div className="flex flex-col gap-4">
        {/* Barra de busca principal */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
          <input
            type="text"
            placeholder="🔍 Buscar por usuário, produto, cidade..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-ink-300 rounded-lg text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        {/* Filtros rápidos */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 px-3 py-2 border border-ink-300 rounded-lg text-sm hover:bg-ink-50 transition"
          >
            <Filter className="w-4 h-4" />
            Filtros {showAdvanced && '(3)'}
          </button>

          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                onSearch('');
              }}
              className="text-sm text-brand-600 hover:text-brand-700"
            >
              Limpar busca
            </button>
          )}
        </div>

        {/* Filtros avançados */}
        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 border-t border-ink-200">
            <div>
              <label className="text-xs text-ink-600 block mb-1">Plataforma</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 border border-ink-300 rounded-lg text-sm"
              >
                <option value="">Todas plataformas</option>
                <option value="Shein">Shein</option>
                <option value="AliExpress">AliExpress</option>
                advantage
                <option value="Vinted">Vinted</option>
                <option value="IMPORTEASY">ImportEasy</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-ink-600 block mb-1">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-ink-300 rounded-lg text-sm"
              >
                <option value="">Todas categorias</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs text-ink-600 block mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-ink-300 rounded-lg text-sm"
              >
                <option value="">Qualquer status</option>
                {statuses.map(s => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>

            <div className="flex items-end gap-2">
              <button
                onClick={handleApply}
                className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition text-sm"
              >
                Filtrar
              </button>
              <button
                onClick={handleClear}
                className="px-3 py-2 bg-ink-100 text-ink-700 rounded-lg hover:bg-ink-200 transition text-sm"
              >
                Limpar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}