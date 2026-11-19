"use client";

import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Heart, Clock, Shield, MapPin, TrendingUp, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { CommunityFilters } from "@/components/community/CommunityFilters";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { formatNumber } from "@/lib/money";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  ENTREGUE: { label: "Entregue", color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 className="w-3 h-3" /> },
  EM_TRANSITO: { label: "Em trânsito", color: "bg-blue-100 text-blue-700", icon: <TrendingUp className="w-3 h-3" /> },
  PENDENTE: { label: "Pendente", color: "bg-amber-100 text-amber-700", icon: <Clock className="w-3 h-3" /> },
  EM_ANALISE: { label: "Em análise", color: "bg-purple-100 text-purple-700", icon: <Shield className="w-3 h-3" /> },
  PERGUNTA: { label: "Pergunta", color: "bg-ink-100 text-ink-700", icon: <MessageSquare className="w-3 h-3" /> },
};

const PLATFORM_COLORS: Record<string, string> = {
  VINTED: "bg-brand-100 text-brand-700",
  SHEIN: "bg-pink-100 text-pink-700",
  ALIEXPRESS: "bg-orange-100 text-orange-700",
  IMPORTEASY: "bg-green-100 text-green-700",
};

// Imagens de fundo locais
const bgImages = [
  "/images/comm-bg-01.jpg",
  "/images/comm-bg-02.jpg",
  "/images/comm-bg-03.jpg",
  "/images/comm-bg-04.jpg",
];



export default function ComunidadePage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedUnavailable, setFeedUnavailable] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    platform: '',
    category: '',
    status: '',
    search: ''
  });
  const [stats, setStats] = useState({
    totalPosts: 0,
    approvedPosts: 0,
    verifiedPosts: 0,
    pendingPosts: 0,
  });

  // Carregar stats e posts reais da comunidade
  const loadConversations = useCallback(async (pageNum = 1, filterParams = filters) => {
    try {
      setLoading(pageNum === 1);
      setFeedUnavailable(false);
      
      // Carregar stats
      const statsResponse = await fetch('/api/community/stats');
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }
      
      // Carregar posts
      const response = await fetch(`/api/community/posts?` + new URLSearchParams({
        platform: filterParams.platform || '',
        category: filterParams.category || '',
        status: filterParams.status || '',
        search: filterParams.search || '',
        limit: '20',
        offset: ((pageNum - 1) * 20).toString()
      }));
      
      if (response.ok) {
        const data = await response.json();
        
        if (pageNum === 1) {
          setConversations(data.posts);
        } else {
          setConversations(prev => [...prev, ...data.posts]);
        }
        
        setHasMore(data.hasMore);
        setPage(pageNum);
      } else {
        setConversations([]);
        setHasMore(false);
        setFeedUnavailable(true);
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      setConversations([]);
      setHasMore(false);
      setFeedUnavailable(true);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Carrega inicialmente e volta a consultar quando os filtros mudam.
  useEffect(() => {
    const refresh = window.setTimeout(() => void loadConversations(1, filters), 0);
    return () => window.clearTimeout(refresh);
  }, [filters, loadConversations]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, search: query }));
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadConversations(page + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-50 via-white to-amber-50 relative overflow-hidden">
      {/* Background decorativo com acessórios */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <div className="absolute top-20 left-5 w-32 h-32 opacity-5" style={{ backgroundImage: `url("${bgImages[0]}")` }} />
        <div className="absolute top-40 right-10 w-24 h-24 opacity-5 rotate-12" style={{ backgroundImage: `url("${bgImages[1]}")` }} /> 
        <div className="absolute bottom-40 left-10 w-28 h-28 opacity-5 -rotate-6" style={{ backgroundImage: `url("${bgImages[2]}")` }} />
        <div className="absolute bottom-20 right-5 w-32 h-32 opacity-5" style={{ backgroundImage: `url("${bgImages[3]}")` }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-[0.02] rounded-full bg-brand-600" />
      </div>

      <main className="relative py-8 lg:py-12 pb-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-10 relative">
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-medium">
                <TrendingUp className="w-4 h-4" />
                <span>Comunidade ImportEasy</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-ink-900 mb-3">
              Comunidade <span className="text-brand-600">ImportEasy</span>
            </h1>
            <p className="text-lg text-ink-600 max-w-2xl mx-auto">
              Consulte as partilhas de outros clientes e acompanhe experiências de importação em Angola.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={MessageSquare} value={stats.totalPosts > 0 ? formatNumber(stats.totalPosts) : "—"} label="Publicações" />
            <StatCard icon={CheckCircle2} value={stats.approvedPosts > 0 ? formatNumber(stats.approvedPosts) : "—"} label="Aprovadas" />
            <StatCard icon={Shield} value={stats.verifiedPosts > 0 ? formatNumber(stats.verifiedPosts) : "—"} label="Verificadas" />
            <StatCard icon={Clock} value={stats.pendingPosts > 0 ? formatNumber(stats.pendingPosts) : "—"} label="Em análise" />
          </div>

          <div className="mb-6 rounded-2xl border border-ink-200 bg-white p-4 text-sm text-ink-600">
            A publicação de mensagens e as reacções ainda não estão disponíveis nesta página.
          </div>

          {/* Community Filters */}
          <CommunityFilters 
            onFilter={handleFilterChange}
            onSearch={handleSearch}
          />

          {/* Feed */}
          <div 
            className="space-y-4"
            role="feed"
            aria-label="Conversas da comunidade"
          >
            {conversations.map((conv) => (
              <ConversationCard
                key={conv.id}
                conversation={conv}
              />
            ))}
            {conversations.length === 0 && (
              <div className="text-center py-12 text-ink-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-ink-300" />
                <p>{feedUnavailable ? "Não foi possível carregar as publicações. Tenta novamente mais tarde." : "Ainda não existem publicações nesta comunidade."}</p>
              </div>
            )}
          </div>

          {/* Load More */}
          {hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                disabled={loading}
                className="px-6 py-3 text-brand-600 font-medium hover:text-brand-700 transition flex items-center gap-2 mx-auto disabled:opacity-50"
              >
                {loading ? "Carregando..." : "Carregar mais conversas"}
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Banner de Conversão de Alto Impacto */}
          <div className="bg-gradient-to-r from-brand-900 via-brand-800 to-ink-950 rounded-3xl p-6 sm:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 mt-12 shadow-xl border border-brand-700/50">
            <div className="space-y-1 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-300">
                Garantia 100% de Entrega · Sem Riscos
              </span>
              <h3 className="text-xl sm:text-2xl font-bold">Pronto para importar com segurança?</h3>
              <p className="text-white/70 text-xs sm:text-sm max-w-xl">
                Pague em Kwanzas por Multicaixa Express ou referência bancária, submeta o seu comprovativo direto no site e receba o produto na sua morada sem surpresas alfandegárias.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
              <Link
                href="/importar"
                className="px-6 py-3.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl text-center text-sm transition shadow-lg shadow-brand-500/30"
              >
                Simular Preço Agora
              </Link>
              <a
                href="https://wa.me/244922058136?text=Ol%C3%A1%20ImportEasy!%20Estou%20na%20comunidade%20e%20gostaria%20de%20ajuda%20para%20fazer%20uma%20encomenda."
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-center text-sm border border-white/20 transition flex items-center justify-center gap-2"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" /> Apoio (+244 922 058 136)
              </a>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, value, label }: { icon: React.ComponentType<{ className?: string }>; value: string; label: string }) {
  return (
    <div className="bg-white rounded-xl border border-ink-200 p-4 text-center shadow-sm hover:shadow-md transition">
      <Icon className="w-6 h-6 text-brand-600 mx-auto mb-2" />
      <div className="text-2xl font-bold text-ink-900">{value}</div>
      <div className="text-xs text-ink-500">{label}</div>
    </div>
  );
}

function ConversationCard({ conversation }: { conversation: any }) {
  const statusConfig = STATUS_CONFIG[conversation.status] || STATUS_CONFIG.PENDENTE;
  const platformColor = PLATFORM_COLORS[conversation.platform] || "bg-ink-100 text-ink-700";

  return (
    <article className="bg-white rounded-xl border border-ink-200 p-4 hover:border-brand-200 hover:shadow-md transition relative overflow-hidden group"
      style={conversation.isOwn ? { borderColor: "rgba(14, 116, 144, 0.3)", background: "linear-gradient(135deg, #f0fdfa 0%, #ffffff 100%)" } : undefined}
    >
      {conversation.isOwn && (
        <div className="absolute top-2 right-2 text-xs px-2 py-0.5 bg-brand-100 text-brand-700 rounded-full font-medium">
          A sua partilha
        </div>
      )}
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          <ResponsiveImage
            src={conversation.avatar}
            alt={conversation.user}
            width={48}
            height={48}
            className="rounded-full ring-2 ring-ink-100 object-cover"
            fallbackText={conversation.user.charAt(0)}
          />
          {conversation.verified && (
            <div className="absolute bottom-0 right-0 w-5 h-5 bg-brand-600 text-white rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-3 h-3" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-ink-900">{conversation.user}</span>
            {conversation.verified && (
              <span className="flex items-center gap-1 text-xs text-brand-600" title="Compra verificada">
                <CheckCircle2 className="w-3 h-3" /> Verificado
              </span>
            )}
            <span className="text-ink-400">·</span>
            <span className="text-sm text-ink-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {conversation.location}
            </span>
            <span className="text-ink-400">·</span>
            <span className="text-sm text-ink-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {conversation.timeAgo}
            </span>
          </div>

          {/* Product & Status */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-sm font-medium text-ink-700">{conversation.product}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${platformColor}`}>
              {conversation.platform}
            </span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color} flex items-center gap-1`}>
              {statusConfig.icon}
              {statusConfig.label}
            </span>
          </div>

          {/* Message */}
          <p className="text-ink-700 mb-3 leading-relaxed">{conversation.message}</p>

          {/* Actions */}
          <div className="flex items-center gap-4 pt-2 border-t border-ink-100">
            <span className="flex items-center gap-1.5 text-sm text-ink-500" aria-label={`${conversation.likes} gostos`}>
              <Heart className="w-4 h-4" />
              <span>{conversation.likes}</span>
            </span>
            {conversation.ref && (
              <span className="text-xs text-ink-400 font-mono ml-auto">Ref: {conversation.ref}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
