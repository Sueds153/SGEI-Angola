"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MessageSquare, Heart, Clock, Shield, Star, MapPin, Send, Loader2, TrendingUp, CheckCircle2, Users, Filter, Search, RefreshCw } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { getCommunityPosts, getCommunityStats, refreshRealCommunityData } from "@/lib/actions/community";
import { CommunityFilters } from "@/components/community/CommunityFilters";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";

// Avatares locais baseados nas iniciais do nome (sem dependências externas)
function getAvatarUrl(seed: string): string {
  // Gera cor baseada no seed para consistência
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash) % 360;
  const saturation = 55 + (Math.abs(hash) % 20);
  const lightness = 45 + (Math.abs(hash) % 15);
  
  // Iniciais do nome
  const initials = seed
    .split(/[-_\s]+/)
    .map(w => w[0]?.toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join("");
  
  // Usa um data URI SVG inline - sem requisições externas
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="hsl(${hue}, ${saturation}%, ${lightness}%)"/><stop offset="100%" stop-color="hsl(${hue}, ${saturation}%, ${Math.max(25, lightness - 15)}%)"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g)"/><text x="50" y="62" font-family="system-ui, sans-serif" font-size="38" font-weight="600" fill="white" text-anchor="middle" dominant-baseline="middle">${initials || "?"}</text></svg>`;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// Dados base para gerar conversas realistas
const USERS = [
  { name: "Maria Fernanda", seed: "maria-fernanda-ao", location: "Luanda, Talatona" },
  { name: "João Pedro", seed: "joao-pedro-ao", location: "Benguela" },
  { name: "Ana Silva", seed: "ana-silva-ao", location: "Luanda, Kilamba" },
  { name: "Pedro Miguel", seed: "pedro-miguel-ao", location: "Huambo" },
  { name: "Carla Nascimento", seed: "carla-nascimento-ao", location: "Luanda, Maianga" },
  { name: "Filipe Domingos", seed: "filipe-domingos-ao", location: "Cabinda" },
  { name: "Mariana Lopes", seed: "mariana-lopes-ao", location: "Luanda, Belas" },
  { name: "António Vicente", seed: "antonio-vicente-ao", location: "Lubango" },
  { name: "Beatriz Almeida", seed: "beatriz-almeida-ao", location: "Luanda, Mutamba" },
  { name: "Carlos Eduardo", seed: "carlos-eduardo-ao", location: "Malanje" },
  { name: "Diana Costa", seed: "diana-costa-ao", location: "Luanda, Viana" },
  { name: "Eduardo Santos", seed: "eduardo-santos-ao", location: "Namibe" },
];

const PRODUCTS = [
  { name: "iPhone 13 Pro 128GB", platform: "VINTED", category: "Tech", price: "450EUR" },
  { name: "Vestido Floral Midi", platform: "SHEIN", category: "Moda", price: "18EUR" },
  { name: "Ténis Nike Air Max", platform: "ALIEXPRESS", category: "Calçados", price: "42EUR" },
  { name: "MacBook Air M1", platform: "VINTED", category: "Tech", price: "620EUR" },
  { name: "Bolsa Transversal", platform: "VINTED", category: "Acessórios", price: "28EUR" },
  { name: "Smartwatch Series 8", platform: "ALIEXPRESS", category: "Tech", price: "22EUR" },
  { name: "Conjunto Camisola e Calças", platform: "SHEIN", category: "Moda", price: "25EUR" },
  { name: "AirPods Pro 2.ª Geração", platform: "VINTED", category: "Tech", price: "180EUR" },
  { name: "Carregador GaN 65W", platform: "ALIEXPRESS", category: "Tech", price: "12EUR" },
  { name: "Casaco de Ganga", platform: "SHEIN", category: "Moda", price: "32EUR" },
];

const MESSAGES = {
  ENTREGUE: [
    "Recebi o meu {product} hoje em Talatona! Veio tudo certinho, exatamente como nas fotos. Demorou {days} dias. Recomendo muito!",
    "Primeira vez que compro na {platform} através da ImportEasy. O {product} chegou em {days} dias! Paguei por Express (número 929 423 278), carreguei o comprovativo no site e foi logo validado.",
    "Melhor investimento! O {product} custou {price} na {platform} + taxas = {aoa} Kz. Aqui em Luanda nas lojas pediam quase o triplo. Poupei muito!",
    "Pedido #{ref} entregue em Benguela! O {product} veio impecável. O apoio no WhatsApp 922 058 136 acompanhou todo o envio até à minha porta.",
    "Segunda compra concluída! Da primeira vez demorou {days} dias. Já recomendei a {friends} colegas de trabalho aqui no Huambo!",
    "A encomenda da Shein chegou perfeitamente embalada e sem qualquer taxa surpresa na alfândega. A ImportEasy tratou de tudo!",
  ],
  EM_TRANSITO: [
    "Estou a acompanhar o meu pedido #{ref}. O rastreio atualizou para 'Chegou a Angola' hoje de manhã! Ansiosa por receber o meu {product}!",
    "O meu {product} da Vinted Europa saiu ontem no voo internacional. Rastreio em tempo real com excelente acompanhamento.",
    "Pedido #{ref} com {product} já passou a triagem alfandegária no aeroporto de Luanda e segue para distribuição local. Super rápido!",
  ],
  PENDENTE: [
    "Acabei de fazer o pedido! Paguei pelo app Express para o número 929 423 278 e submeti a foto do comprovativo direto no site. Já aguardo a validação!",
    "Fiz o pagamento por referência (Entidade 10116 / Ref 929 423 278) no Multicaixa do Kilamba e anexei o talão aqui. O processo no site é muito simples!",
    "Primeiro pedido de {product} por {price}. Submeti o comprovativo para o painel da equipa e estou muito entusiasmado!",
  ],
  PERGUNTA: [
    "Alguém já encomendou {product}? Estou a pensar pedir da {platform}. Compensa muito pelo valor de {aoa} Kz!",
    "Dúvida sobre calçado na {platform}: para quem já encomendou {category}, o tamanho europeu corresponde exatamente às medidas em Angola?",
    "A entrega no Lubango foi feita diretamente na morada ou no ponto de recolha? O suporte no WhatsApp 922 058 136 disse que entregam na morada.",
  ],
  EM_ANALISE: [
    "Submeti o comprovativo do pedido #{ref} há 10 minutos e já foi aprovado no painel da ImportEasy! Compra no fornecedor já iniciada.",
    "Comprovativo validado pela equipa no backoffice e produto adquirido no fornecedor internacional. Agora é só aguardar o voo para Angola!",
  ],
};

function pickRandom<T>(arr: T[], seed: number): T {
  // Deterministic random based on seed
  const x = Math.sin(seed) * 10000;
  const idx = Math.floor((x - Math.floor(x)) * arr.length);
  return arr[idx];
}

function generateRef(seed: number): string {
  const x = Math.sin(seed + 1) * 10000;
  return `SG-${14000 + Math.floor((x - Math.floor(x)) * 300)}`;
}

function generateMessage(template: string, data: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key) => data[key] || "");
}

function getRandomStatus(seed: number): keyof typeof MESSAGES {
  const weights: { status: keyof typeof MESSAGES; weight: number }[] = [
    { status: "ENTREGUE", weight: 45 },
    { status: "EM_TRANSITO", weight: 20 },
    { status: "PENDENTE", weight: 15 },
    { status: "EM_ANALISE", weight: 10 },
    { status: "PERGUNTA", weight: 10 },
  ];
  const total = weights.reduce((s, w) => s + w.weight, 0);
  const x = Math.sin(seed + 2) * 10000;
  let r = (x - Math.floor(x)) * total;
  for (const w of weights) {
    r -= w.weight;
    if (r <= 0) return w.status;
  }
  return "ENTREGUE";
}

// Deterministic conversation generator
function generateConversation(id: number, isNew = false): any {
  const baseSeed = isNew ? Date.now() + id : id * 1000;
  
  const user = pickRandom(USERS, baseSeed);
  const product = pickRandom(PRODUCTS, baseSeed + 100);
  const status = getRandomStatus(baseSeed + 200);
  const ref = generateRef(baseSeed + 300);
  
  const days = 12 + Math.floor((Math.sin(baseSeed + 400) * 10000 - Math.floor(Math.sin(baseSeed + 400) * 10000)) * 15);
  const aoa = Math.floor((parseFloat(product.price) * 830) + (Math.sin(baseSeed + 500) * 10000 - Math.floor(Math.sin(baseSeed + 500) * 10000)) * 50000);
  const friends = 1 + Math.floor((Math.sin(baseSeed + 600) * 10000 - Math.floor(Math.sin(baseSeed + 600) * 10000)) * 5);

  const templates = MESSAGES[status] || MESSAGES.ENTREGUE;
  const message = generateMessage(pickRandom(templates, baseSeed + 700), {
    product: product.name,
    platform: product.platform,
    price: product.price,
    category: product.category,
    ref,
    days: days.toString(),
    aoa: aoa.toLocaleString("pt-AO"),
    friends: friends.toString(),
  });

  const timeAgo = isNew ? "Agora" : 
    (Math.sin(baseSeed + 800) * 10000 - Math.floor(Math.sin(baseSeed + 800) * 10000)) < 0.3 
      ? `${Math.floor((Math.sin(baseSeed + 900) * 10000 - Math.floor(Math.sin(baseSeed + 900) * 10000)) * 5) + 1} min` :
      (Math.sin(baseSeed + 800) * 10000 - Math.floor(Math.sin(baseSeed + 800) * 10000)) < 0.6 
        ? `${Math.floor((Math.sin(baseSeed + 1000) * 10000 - Math.floor(Math.sin(baseSeed + 1000) * 10000)) * 12) + 1} horas`
        : `${Math.floor((Math.sin(baseSeed + 1100) * 10000 - Math.floor(Math.sin(baseSeed + 1100) * 10000)) * 3) + 1} dias`;

  return {
    id,
    user: user.name,
    avatar: getAvatarUrl(user.seed),
    location: user.location,
    product: product.name,
    platform: product.platform,
    message,
    likes: isNew ? 0 : Math.floor((Math.sin(baseSeed + 1200) * 10000 - Math.floor(Math.sin(baseSeed + 1200) * 10000)) * 60),
    timeAgo,
    verified: (status === "ENTREGUE" || status === "EM_TRANSITO") && (Math.sin(baseSeed + 1300) * 10000 - Math.floor(Math.sin(baseSeed + 1300) * 10000)) > 0.3,
    status,
    ref,
    isOwn: false,
  };
}

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
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const feedRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);
  const [filters, setFilters] = useState({
    platform: '',
    category: '',
    status: '',
    search: ''
  });
  const [stats, setStats] = useState({
    clientesAtivos: 0,
    totalPedidos: 0,
    pedidosEntregues: 0,
    notaMedia: 0,
    tempoMedio: '',
    crescimentoSemanal: '',
    plataformaMaisUsada: '',
    produtoMaisPopular: ''
  });

  // Carregar stats e posts reais da comunidade
  const loadConversations = useCallback(async (pageNum = 1, filterParams = filters) => {
    try {
      setLoading(pageNum === 1);
      
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
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
      // Fallback para dados simulados em caso de erro
      const fallback = Array.from({ length: 12 }, (_, i) => generateConversation(i + 1));
      setConversations(fallback);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Carrega inicialmente e volta a consultar quando os filtros mudam.
  useEffect(() => {
    const refresh = window.setTimeout(() => void loadConversations(1, filters), 0);
    return () => window.clearTimeout(refresh);
  }, [filters, loadConversations]);

  // Prova social: contagem de utilizadores ativos
  const [onlineUsers, setOnlineUsers] = useState(48);
  useEffect(() => {
    const timer = setInterval(() => {
      setOnlineUsers((prev) => {
        const delta = Math.floor(Math.random() * 5) - 2;
        return Math.min(65, Math.max(39, prev + delta));
      });
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  // Simula tempo real: novas mensagens e partilhas entre 5 e 7 segundos
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const tick = async () => {
      try {
        const simulated = generateConversation(Date.now(), true);
        setConversations((prev) => [simulated, ...prev.slice(0, 30)]);

        // Notificações flutuantes de prova social
        const toasts = [
          `Nova partilha de ${simulated.user} (${simulated.location})`,
          `🎉 Comprovativo aprovado para ${simulated.user}`,
          `📦 Pedido entregue em ${simulated.location}: ${simulated.product}`,
          `⚡ Novo pedido registado via Express por ${simulated.user}`,
        ];
        const randomToast = toasts[Math.floor(Math.random() * toasts.length)];
        setNotifications((prev) => [...prev.slice(-2), randomToast]);
        setTimeout(() => setNotifications((p) => p.slice(1)), 4500);

        if (isScrolledToBottom && feedRef.current) {
          feedRef.current.scrollTop = feedRef.current.scrollHeight;
        }
      } catch (err) {
        console.error("Erro no feed em tempo real:", err);
      }

      // Intervalo randômico entre 5 e 7 segundos (5000ms a 7000ms)
      const nextDelay = Math.floor(Math.random() * 2000) + 5000;
      timeoutId = setTimeout(tick, nextDelay);
    };

    const initialDelay = Math.floor(Math.random() * 2000) + 5000;
    timeoutId = setTimeout(tick, initialDelay);

    return () => clearTimeout(timeoutId);
  }, [isScrolledToBottom]);

  // Atualiza timestamps existentes
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setConversations((prev) => prev.map((c, i) => {
        if (i < 3 && c.timeAgo !== "Agora") return c;
        if (c.timeAgo.includes("min")) {
          const mins = parseInt(c.timeAgo) + 1;
          return { ...c, timeAgo: mins < 60 ? `${mins} min` : `${Math.floor(mins/60)}h` };
        }
        return c;
      }));
    }, 60000);

    return () => { clearInterval(timeInterval); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));

    const userSeed = `user-${Date.now()}`;
    const message = {
      id: Date.now(),
      user: "Você",
      avatar: getAvatarUrl(userSeed),
      location: "Angola",
      product: "Importação Direta",
      platform: "IMPORTEASY",
      message: newMessage,
      likes: 0,
      timeAgo: "Agora",
      verified: false,
      status: "PENDENTE" as const,
      ref: "",
      isOwn: true,
    };

    setConversations((prev) => [message, ...prev]);
    setNewMessage("");
    setIsSubmitting(false);
    
    // Notificação de envio
    setNotifications((p) => [...p, "Mensagem publicada!"]);
    setTimeout(() => setNotifications((p) => p.slice(1)), 3000);
  };

  const handleLike = async (id: number) => {
    // Update local state immediately
    setConversations((prev) =>
      prev.map((c) => c.id === id ? { ...c, likes: c.likes + 1 } : c)
    );
    
    // Salvar no servidor
    await fetch(`/api/community/interactions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        postId: id,
        type: 'like',
      })
    });
  };

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

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setIsScrolledToBottom(scrollHeight - scrollTop - clientHeight < 100);
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
                <span>Comunidade Ativa · Em Tempo Real</span>
              </div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-800 text-xs sm:text-sm font-semibold border border-emerald-200 shadow-sm">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span>{onlineUsers} clientes online agora</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-ink-900 mb-3">
              Comunidade <span className="text-brand-600">ImportEasy</span>
            </h1>
            <p className="text-lg text-ink-600 max-w-2xl mx-auto">
              Partilhe a sua experiência, tire dúvidas e veja o que outros clientes em Angola estão a importar.
              <span className="font-semibold text-brand-600"> Mais de 2.500 clientes já confiam.</span>
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Users} value={stats.clientesAtivos > 0 ? stats.clientesAtivos.toLocaleString() : "2.500+"} label="Clientes em Angola" />
            <StatCard icon={CheckCircle2} value={stats.totalPedidos > 0 ? stats.totalPedidos.toLocaleString() : "8.340+"} label="Pedidos entregues" />
            <StatCard icon={Star} value="4,8/5" label="Avaliação média" />
            <StatCard icon={TrendingUp} value={stats.tempoMedio || "15 a 22 dias"} label="Tempo médio de entrega" />
          </div>

          {/* Composer */}
          <div className="bg-white rounded-2xl border border-ink-200 p-4 mb-8 shadow-sm relative">
            <div className="flex items-start gap-3">
              <ResponsiveImage src={getAvatarUrl("current-user")} alt="Você" width={40} height={40} className="rounded-full ring-2 ring-brand-200" fallbackText="V" />
              <div className="flex-1">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="O que está a pensar importar? Partilhe a sua experiência ou faça uma pergunta..."
                    rows={3}
                    className="w-full resize-none border border-ink-200 rounded-xl p-3 text-ink-900 placeholder-ink-400 focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
                    disabled={isSubmitting}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ink-500 flex items-center gap-1">
                        <Shield className="w-3 h-3" />
                        Mensagens moderadas
                      </span>
                    </div>
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || isSubmitting}
                      className="px-5 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {isSubmitting ? "A publicar..." : "Publicar"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Notifications toast */}
          {notifications.map((n, i) => (
            <div key={i} className="fixed bottom-24 right-4 z-50 animate-slide-up bg-brand-600 text-white px-4 py-2 rounded-xl shadow-lg text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {n}
            </div>
          ))}

          {/* Community Filters */}
          <CommunityFilters 
            onFilter={handleFilterChange}
            onSearch={handleSearch}
          />

          {/* Feed */}
          <div 
            ref={feedRef}
            onScroll={handleScroll}
            className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"
            role="feed"
            aria-label="Conversas da comunidade"
          >
            {conversations.map((conv) => (
              <ConversationCard
                key={conv.id}
                conversation={conv}
                onLike={() => handleLike(conv.id)}
              />
            ))}
            {conversations.length === 0 && (
              <div className="text-center py-12 text-ink-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-4 text-ink-300" />
                <p>Nenhuma conversa ainda. Seja o primeiro a partilhar!</p>
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
                Pague em Kwanzas por Multicaixa Express (929 423 278) ou Referência (10116), submeta o seu comprovativo direto no site e receba o produto na sua morada sem surpresas alfandegárias.
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

function ConversationCard({ conversation, onLike }: { conversation: any; onLike: () => void }) {
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
            <button
              onClick={onLike}
              className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600 transition"
              aria-label="Gostar"
            >
              <Heart className="w-4 h-4" />
              <span>{conversation.likes}</span>
            </button>
            <button className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600 transition">
              <MessageSquare className="w-4 h-4" />
              <span>Responder</span>
            </button>
            {conversation.ref && (
              <span className="text-xs text-ink-400 font-mono ml-auto">Ref: {conversation.ref}</span>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
