"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  MessageSquare,
  Heart,
  Clock,
  Shield,
  MapPin,
  TrendingUp,
  CheckCircle2,
  PlusCircle,
  Check,
  Pause,
  Play,
} from "lucide-react";
import Link from "next/link";
import { CommunityFilters } from "@/components/community/CommunityFilters";
import { formatNumber } from "@/lib/money";
import {
  INITIAL_COMMUNITY_POSTS,
  DYNAMIC_COMMENTS_STREAM,
  CommunityPost,
  generateInitialsAvatar,
} from "@/lib/community-data";

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  ENTREGUE: {
    label: "Entregue",
    color: "bg-emerald-50 text-emerald-800 border-emerald-200",
    icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
  },
  EM_TRANSITO: {
    label: "Em trânsito",
    color: "bg-blue-50 text-blue-800 border-blue-200",
    icon: <TrendingUp className="w-3 h-3 text-blue-600" />,
  },
  PENDENTE: {
    label: "Pendente",
    color: "bg-amber-50 text-amber-800 border-amber-200",
    icon: <Clock className="w-3 h-3 text-amber-600" />,
  },
  EM_ANALISE: {
    label: "Em análise",
    color: "bg-purple-50 text-purple-800 border-purple-200",
    icon: <Shield className="w-3 h-3 text-purple-600" />,
  },
  PERGUNTA: {
    label: "Dúvida",
    color: "bg-ink-100 text-ink-800 border-ink-200",
    icon: <MessageSquare className="w-3 h-3 text-ink-600" />,
  },
};

const PLATFORM_COLORS: Record<string, string> = {
  VINTED: "bg-brand-50 text-brand-800 border-brand-200",
  SHEIN: "bg-pink-50 text-pink-800 border-pink-200",
  ALIEXPRESS: "bg-orange-50 text-orange-800 border-orange-200",
  ZARA: "bg-neutral-100 text-neutral-800 border-neutral-200",
  IMPORTEASY: "bg-emerald-50 text-emerald-800 border-emerald-200",
};

export default function ComunidadePage() {
  // Inicializa já com 12 comentários estruturados para o utilizador encontrar conteúdo imediatamente
  const [conversations, setConversations] = useState<CommunityPost[]>(
    INITIAL_COMMUNITY_POSTS
  );
  const [isLiveActive, setIsLiveActive] = useState(true);
  const [newIncomingId, setNewIncomingId] = useState<number | null>(null);

  const [filters, setFilters] = useState<{
    platform?: string;
    category?: string;
    status?: string;
    search?: string;
  }>({});

  const [stats, setStats] = useState({
    totalPosts: INITIAL_COMMUNITY_POSTS.length,
    approvedPosts: INITIAL_COMMUNITY_POSTS.filter((p) => p.status === "ENTREGUE").length,
    verifiedPosts: INITIAL_COMMUNITY_POSTS.filter((p) => p.verified).length,
    pendingPosts: INITIAL_COMMUNITY_POSTS.filter((p) => p.status === "PENDENTE").length,
  });

  const [showForm, setShowForm] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [newShare, setNewShare] = useState({
    name: "",
    location: "Luanda, Talatona",
    product: "",
    platform: "SHEIN" as "SHEIN" | "VINTED" | "ALIEXPRESS" | "ZARA",
    message: "",
  });

  const streamIndexRef = useRef(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Ciclo dinâmico contínuo: injeta um novo depoimento a cada 5 a 7 segundos
  useEffect(() => {
    if (!isLiveActive) {
      if (timerRef.current) clearTimeout(timerRef.current);
      return;
    }

    const scheduleNextComment = () => {
      // Sorteia intervalo dinâmico entre 5000ms (5s) e 7000ms (7s)
      const nextDelay = Math.floor(Math.random() * 2000) + 5000;

      timerRef.current = setTimeout(() => {
        const template =
          DYNAMIC_COMMENTS_STREAM[
            streamIndexRef.current % DYNAMIC_COMMENTS_STREAM.length
          ];
        streamIndexRef.current += 1;

        const newId = Date.now();
        const incomingPost: CommunityPost = {
          ...template,
          id: newId,
          avatar: generateInitialsAvatar(template.user, streamIndexRef.current),
          ref: `IE-${Math.floor(85100 + Math.random() * 890)}`,
          timeAgo: "agora mesmo",
        };

        setNewIncomingId(newId);
        setConversations((prev) => [incomingPost, ...prev]);

        setStats((prev) => ({
          ...prev,
          totalPosts: prev.totalPosts + 1,
          approvedPosts:
            template.status === "ENTREGUE"
              ? prev.approvedPosts + 1
              : prev.approvedPosts,
          verifiedPosts: template.verified
            ? prev.verifiedPosts + 1
            : prev.verifiedPosts,
        }));

        scheduleNextComment();
      }, nextDelay);
    };

    scheduleNextComment();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isLiveActive]);

  // Atualiza periodicamente os rótulos de tempo relativo
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setConversations((prev) =>
        prev.map((c, i) => {
          if (c.timeAgo === "agora mesmo" && i > 0) {
            return { ...c, timeAgo: "há 1 minuto" };
          }
          return c;
        })
      );
    }, 60000);

    return () => clearInterval(timeInterval);
  }, []);

  const handleFilterChange = (newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleSearch = (query: string) => {
    setFilters((prev) => ({ ...prev, search: query }));
  };

  const handleAddShare = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newShare.name.trim() || !newShare.product.trim() || !newShare.message.trim()) {
      return;
    }

    const createdPost: CommunityPost = {
      id: Date.now(),
      user: newShare.name.trim(),
      avatar: generateInitialsAvatar(newShare.name, Math.floor(Math.random() * 10)),
      location: newShare.location,
      product: newShare.product.trim(),
      platform: newShare.platform,
      category: "Geral",
      message: newShare.message.trim(),
      likes: 1,
      timeAgo: "agora mesmo",
      verified: true,
      status: "ENTREGUE",
      ref: `IE-${Math.floor(10000 + Math.random() * 89999)}`,
      isOwn: true,
    };

    setConversations((prev) => [createdPost, ...prev]);
    setStats((prev) => ({
      ...prev,
      totalPosts: prev.totalPosts + 1,
      approvedPosts: prev.approvedPosts + 1,
      verifiedPosts: prev.verifiedPosts + 1,
    }));

    setFormSubmitted(true);
    setNewShare({
      name: "",
      location: "Luanda, Talatona",
      product: "",
      platform: "SHEIN",
      message: "",
    });

    setTimeout(() => {
      setShowForm(false);
      setFormSubmitted(false);
    }, 2500);
  };

  // Filtragem local instantânea
  const filteredConversations = conversations.filter((post) => {
    if (filters.platform && post.platform.toUpperCase() !== filters.platform.toUpperCase()) {
      return false;
    }
    if (filters.category && post.category.toLowerCase() !== filters.category.toLowerCase()) {
      return false;
    }
    if (filters.status && post.status.toUpperCase() !== filters.status.toUpperCase()) {
      return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const matches =
        post.user.toLowerCase().includes(q) ||
        post.product.toLowerCase().includes(q) ||
        post.location.toLowerCase().includes(q) ||
        post.message.toLowerCase().includes(q) ||
        post.ref.toLowerCase().includes(q);
      if (!matches) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-ink-50/40">
      <main className="py-8 sm:py-12 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Cabeçalho */}
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-800 text-xs font-semibold mb-2.5 border border-brand-200">
              <Shield className="w-3.5 h-3.5 text-brand-700" />
              <span>Experiências de Clientes em Angola</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-950">
              Comunidade ImportEasy
            </h1>
            <p className="mt-1.5 text-sm leading-relaxed text-ink-600 max-w-2xl">
              Acompanha em direto os relatos de encomendas recebidas em Luanda e outras províncias,
              com prazos reais de entrega e validação de compras na SHEIN, Vinted, AliExpress e Zara.
            </p>
          </div>

          {/* Barra de métricas sóbria */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
            <div className="bg-white p-3.5 rounded-xl border border-ink-200 shadow-xs">
              <span className="text-[11px] font-medium text-ink-500 block">Total de partilhas</span>
              <span className="text-lg font-bold text-ink-950 mt-0.5 block">
                {formatNumber(stats.totalPosts)}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-ink-200 shadow-xs">
              <span className="text-[11px] font-medium text-ink-500 block">Encomendas entregues</span>
              <span className="text-lg font-bold text-emerald-700 mt-0.5 block">
                {formatNumber(stats.approvedPosts)}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-ink-200 shadow-xs">
              <span className="text-[11px] font-medium text-ink-500 block">Compras verificadas</span>
              <span className="text-lg font-bold text-brand-700 mt-0.5 block">
                {formatNumber(stats.verifiedPosts)}
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-ink-200 shadow-xs flex flex-col justify-between">
              <span className="text-[11px] font-medium text-ink-500 block">Apoio oficial</span>
              <span className="text-xs font-semibold text-ink-800 block">
                Luanda · Carga Semanal
              </span>
            </div>
          </div>

          {/* Barra de controlo dinâmico em tempo real */}
          <div className="mb-4 bg-white rounded-xl border border-ink-200 px-4 py-2.5 flex items-center justify-between text-xs text-ink-700">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                {isLiveActive && (
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                )}
                <span className={`relative inline-flex rounded-full h-2 w-2 ${isLiveActive ? "bg-emerald-600" : "bg-ink-400"}`}></span>
              </span>
              <span className="font-medium text-ink-800">
                {isLiveActive
                  ? "Atualizações em direto (novos comentários a cada 5 a 7 segundos)"
                  : "Fluxo em direto pausado"}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsLiveActive((prev) => !prev)}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-brand-700 hover:text-brand-800 underline underline-offset-2 transition"
            >
              {isLiveActive ? (
                <>
                  <Pause className="w-3 h-3" />
                  <span>Pausar</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3" />
                  <span>Retomar</span>
                </>
              )}
            </button>
          </div>

          {/* Botão de partilha e formulário */}
          <div className="mb-6">
            {!showForm ? (
              <div className="bg-white rounded-xl border border-ink-200 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                <div>
                  <h2 className="text-sm font-bold text-ink-900">
                    Já recebeste uma encomenda através da ImportEasy?
                  </h2>
                  <p className="text-xs text-ink-500 mt-0.5">
                    Partilha a tua experiência sobre os artigos e o prazo de entrega.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowForm(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition active:scale-95 cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Escrever partilha</span>
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-brand-300 p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3 border-b border-ink-100 pb-2.5">
                  <h2 className="text-sm font-bold text-ink-900">
                    Nova partilha de encomenda
                  </h2>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="text-xs text-ink-400 hover:text-ink-600 font-medium cursor-pointer"
                  >
                    Fechar
                  </button>
                </div>

                {formSubmitted ? (
                  <div className="py-4 text-center">
                    <div className="w-8 h-8 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Check className="w-4 h-4" />
                    </div>
                    <p className="text-sm font-bold text-ink-900">
                      Obrigado pela tua partilha!
                    </p>
                    <p className="text-xs text-ink-500 mt-0.5">
                      A tua mensagem foi publicada na comunidade.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleAddShare} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="share-name"
                          className="text-xs font-medium text-ink-700 block mb-1"
                        >
                          O teu nome ou primeiro nome
                        </label>
                        <input
                          id="share-name"
                          type="text"
                          required
                          placeholder="Ex: Maria Fernandes"
                          value={newShare.name}
                          onChange={(e) =>
                            setNewShare((p) => ({ ...p, name: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-ink-200 rounded-lg text-xs text-ink-900 focus:border-brand-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="share-location"
                          className="text-xs font-medium text-ink-700 block mb-1"
                        >
                          Província / Bairro em Angola
                        </label>
                        <input
                          id="share-location"
                          type="text"
                          required
                          placeholder="Ex: Luanda, Talatona ou Benguela"
                          value={newShare.location}
                          onChange={(e) =>
                            setNewShare((p) => ({ ...p, location: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-ink-200 rounded-lg text-xs text-ink-900 focus:border-brand-600 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label
                          htmlFor="share-product"
                          className="text-xs font-medium text-ink-700 block mb-1"
                        >
                          Artigo encomendado
                        </label>
                        <input
                          id="share-product"
                          type="text"
                          required
                          placeholder="Ex: Vestido floral ou Ténis desportivos"
                          value={newShare.product}
                          onChange={(e) =>
                            setNewShare((p) => ({ ...p, product: e.target.value }))
                          }
                          className="w-full px-3 py-2 border border-ink-200 rounded-lg text-xs text-ink-900 focus:border-brand-600 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="share-platform"
                          className="text-xs font-medium text-ink-700 block mb-1"
                        >
                          Loja de origem
                        </label>
                        <select
                          id="share-platform"
                          value={newShare.platform}
                          onChange={(e) =>
                            setNewShare((p) => ({
                              ...p,
                              platform: e.target.value as any,
                            }))
                          }
                          className="w-full px-3 py-2 border border-ink-200 rounded-lg text-xs text-ink-900 bg-white"
                        >
                          <option value="SHEIN">SHEIN</option>
                          <option value="VINTED">Vinted</option>
                          <option value="ALIEXPRESS">AliExpress</option>
                          <option value="ZARA">Zara</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="share-message"
                        className="text-xs font-medium text-ink-700 block mb-1"
                      >
                        A tua experiência
                      </label>
                      <textarea
                        id="share-message"
                        required
                        rows={3}
                        placeholder="Conta como foi o prazo de entrega, o estado da encomenda e o pagamento em Kwanzas..."
                        value={newShare.message}
                        onChange={(e) =>
                          setNewShare((p) => ({ ...p, message: e.target.value }))
                        }
                        className="w-full px-3 py-2 border border-ink-200 rounded-lg text-xs text-ink-900 focus:border-brand-600 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="px-3 py-1.5 border border-ink-200 text-xs font-medium text-ink-700 rounded-lg hover:bg-ink-50 transition cursor-pointer"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-lg transition cursor-pointer"
                      >
                        Publicar relato
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Filtros de pesquisa */}
          <CommunityFilters
            onFilter={handleFilterChange}
            onSearch={handleSearch}
          />

          {/* Lista de publicações */}
          {filteredConversations.length === 0 ? (
            <div className="bg-white rounded-xl border border-ink-200 p-8 text-center">
              <h2 className="text-sm font-bold text-ink-900">
                Nenhuma partilha encontrada com os filtros selecionados
              </h2>
              <p className="text-xs text-ink-500 mt-1 max-w-md mx-auto">
                Tenta limpar a pesquisa ou selecionar outra loja para ver as experiências de importação.
              </p>
              <button
                type="button"
                onClick={() => setFilters({})}
                className="mt-3 inline-flex items-center text-xs font-semibold text-brand-700 hover:text-brand-800 underline underline-offset-4 cursor-pointer"
              >
                Limpar todos os filtros
              </button>
            </div>
          ) : (
            <div className="space-y-3" role="feed" aria-label="Partilhas da comunidade">
              {filteredConversations.map((conv) => (
                <ConversationCard
                  key={conv.id}
                  conversation={conv}
                  isNew={conv.id === newIncomingId}
                />
              ))}
            </div>
          )}

          {/* Rodapé institucional com CTA limpo */}
          <div className="mt-10 bg-white rounded-xl border border-ink-200 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-ink-950">
                Queres calcular o custo de um artigo?
              </h2>
              <p className="text-xs text-ink-500 mt-0.5">
                Usa o simulador oficial para calcular o valor final em Kwanzas com desalfandegamento e frete incluídos.
              </p>
            </div>
            <Link
              href="/importar"
              className="inline-flex items-center px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg transition shrink-0"
            >
              Simular importação
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

function ConversationCard({
  conversation,
  isNew = false,
}: {
  conversation: CommunityPost;
  isNew?: boolean;
}) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(conversation.likes || 0);

  const statusConfig =
    STATUS_CONFIG[conversation.status] || STATUS_CONFIG.ENTREGUE;
  const platformColor =
    PLATFORM_COLORS[conversation.platform] ||
    "bg-ink-100 text-ink-700 border-ink-200";

  const handleLike = () => {
    if (!liked) {
      setLiked(true);
      setLikeCount((p) => p + 1);
    } else {
      setLiked(false);
      setLikeCount((p) => Math.max(0, p - 1));
    }
  };

  return (
    <article
      className={`rounded-xl border p-4 sm:p-4.5 bg-white transition duration-200 ${
        isNew ? "animate-slide-down border-brand-300" : "border-ink-200 hover:border-ink-300"
      } ${conversation.isOwn ? "bg-brand-50/20" : ""}`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-ink-100 bg-ink-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              conversation.avatar ||
              generateInitialsAvatar(conversation.user, conversation.id)
            }
            alt={conversation.user}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Conteúdo */}
        <div className="flex-1 min-w-0">
          {/* Cabeçalho da partilha */}
          <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-xs text-ink-900">
                {conversation.user}
              </span>
              {conversation.verified && (
                <span
                  className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-brand-700 bg-brand-50 px-1.5 py-0.2 rounded border border-brand-200"
                  title="Compra verificada com comprovativo"
                >
                  <CheckCircle2 className="w-2.5 h-2.5 text-brand-600" />
                  <span>Verificado</span>
                </span>
              )}
              {isNew && (
                <span className="inline-flex items-center text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                  Novo
                </span>
              )}
              <span className="text-ink-300">·</span>
              <span className="text-[11px] text-ink-500 flex items-center gap-0.5">
                <MapPin className="w-3 h-3 text-ink-400" />
                <span>{conversation.location}</span>
              </span>
            </div>

            <span className="text-[11px] text-ink-400">
              {conversation.timeAgo}
            </span>
          </div>

          {/* Badges de artigo e status */}
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span className="text-xs font-semibold text-ink-800">
              {conversation.product}
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${platformColor}`}
            >
              {conversation.platform}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold border ${statusConfig.color}`}
            >
              {statusConfig.icon}
              <span>{statusConfig.label}</span>
            </span>
            {conversation.ref && (
              <span className="text-[10px] font-mono text-ink-400 ml-auto">
                Ref: {conversation.ref}
              </span>
            )}
          </div>

          {/* Mensagem da experiência */}
          <p className="text-xs text-ink-700 leading-relaxed">
            {conversation.message}
          </p>

          {/* Ações sóbrias */}
          <div className="flex items-center gap-3 pt-2.5 mt-2.5 border-t border-ink-100">
            <button
              type="button"
              onClick={handleLike}
              className={`inline-flex items-center gap-1 text-[11px] font-medium transition cursor-pointer ${
                liked
                  ? "text-red-600"
                  : "text-ink-500 hover:text-ink-800"
              }`}
            >
              <Heart
                className={`w-3.5 h-3.5 ${
                  liked ? "fill-red-600 text-red-600" : "text-ink-400"
                }`}
              />
              <span>{likeCount}</span>
              <span className="text-[10px] text-ink-400">gostos</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
