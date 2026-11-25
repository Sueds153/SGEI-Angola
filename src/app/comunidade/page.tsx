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
    <div className="min-h-screen bg-white">
      <main className="py-10 sm:py-12 pb-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-ink-950">
              Partilhas da comunidade
            </h1>
            <p className="mt-3 text-base leading-relaxed text-ink-600">
              Consulta experiências de importação partilhadas por clientes em Angola.
            </p>
          </div>

          {stats.totalPosts > 0 && (
            <p className="mb-6 border-y border-ink-200 py-3 text-sm text-ink-600">
              {formatNumber(stats.totalPosts)} partilhas
              {stats.approvedPosts > 0 && ` · ${formatNumber(stats.approvedPosts)} aprovadas`}
              {stats.verifiedPosts > 0 && ` · ${formatNumber(stats.verifiedPosts)} verificadas`}
            </p>
          )}

          {conversations.length > 0 && (
            <>
              <p className="mb-4 text-sm text-ink-600">
                As partilhas estão disponíveis para consulta. Ainda não é possível publicar ou reagir.
              </p>
              <CommunityFilters onFilter={handleFilterChange} onSearch={handleSearch} />
            </>
          )}

          {/* Feed */}
          {loading && conversations.length === 0 ? (
            <p className="py-8 text-sm text-ink-600" role="status">A carregar partilhas…</p>
          ) : feedUnavailable ? (
            <p className="border-y border-ink-200 py-8 text-sm text-ink-700" role="alert">
              Não foi possível carregar as partilhas. Tenta novamente mais tarde.
            </p>
          ) : conversations.length === 0 ? (
            <div className="border-y border-ink-200 py-8 sm:py-10">
              <h2 className="text-xl font-semibold text-ink-950">Ainda não há partilhas de clientes</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-600">
                Esta área ainda não recebe publicações. Podes consultar os artigos disponíveis no catálogo.
              </p>
              <Link
                href="/produtos"
                className="mt-5 inline-flex min-h-11 items-center text-sm font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-800"
              >
                Ver catálogo de produtos
              </Link>
            </div>
          ) : (
            <div className="space-y-4" role="feed" aria-label="Partilhas da comunidade">
              {conversations.map((conv) => (
                <ConversationCard key={conv.id} conversation={conv} />
              ))}
            </div>
          )}

          {/* Load More */}
          {conversations.length > 0 && hasMore && (
            <div className="text-center mt-8">
              <button
                onClick={loadMore}
                disabled={loading}
                className="min-h-11 px-4 py-2 text-sm text-brand-700 font-medium hover:text-brand-800 transition-colors disabled:opacity-50"
              >
                {loading ? "A carregar…" : "Carregar mais partilhas"}
              </button>
            </div>
          )}
        </div>
      </main>
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
