"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, Heart, Clock, Shield, Star, MapPin, Send, Loader2, TrendingUp, CheckCircle2, Users } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";

// Avatares locais baseados nas iniciais do nome (sem dependÃªncias externas)
function getAvatarUrl(seed: string): string {
  // Gera cor baseada no seed para consistÃªncia
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
  
  // Usa um data URI SVG inline - sem requisiÃ§Ãµes externas
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="hsl(${hue}, ${saturation}%, ${lightness}%)"/><stop offset="100%" stop-color="hsl(${hue}, ${saturation}%, ${Math.max(25, lightness - 15)}%)"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(#g)"/><text x="50" y="62" font-family="system-ui, sans-serif" font-size="38" font-weight="600" fill="white" text-anchor="middle" dominant-baseline="middle">${initials || "?"}</text></svg>`;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
}

// Dados base para gerar conversas realistas
const USERS = [
  { name: "Maria Fernanda", seed: "maria-fernanda-ao", location: "Luanda, Talatona" },
  { name: "JoÃ£o Pedro", seed: "joao-pedro-ao", location: "Benguela" },
  { name: "Ana Silva", seed: "ana-silva-ao", location: "Luanda, Kilamba" },
  { name: "Pedro Miguel", seed: "pedro-miguel-ao", location: "Huambo" },
  { name: "Carla Nascimento", seed: "carla-nascimento-ao", location: "Luanda, Maianga" },
  { name: "Filipe Domingos", seed: "filipe-domingos-ao", location: "Cabinda" },
  { name: "Mariana Lopes", seed: "mariana-lopes-ao", location: "Luanda, Belas" },
  { name: "AntÃ³nio Vicente", seed: "antonio-vicente-ao", location: "Lubango" },
  { name: "Beatriz Almeida", seed: "beatriz-almeida-ao", location: "Luanda, Mutamba" },
  { name: "Carlos Eduardo", seed: "carlos-eduardo-ao", location: "Malanje" },
  { name: "Diana Costa", seed: "diana-costa-ao", location: "Luanda, Viana" },
  { name: "Eduardo Santos", seed: "eduardo-santos-ao", location: "Namibe" },
];

const PRODUCTS = [
  { name: "iPhone 13 Pro 128GB", platform: "VINTED", category: "Tech", price: "450EUR" },
  { name: "Vestido Floral Midi", platform: "SHEIN", category: "Moda", price: "18EUR" },
  { name: "Tenis Nike Air Max", platform: "ALIEXPRESS", category: "Calcados", price: "42EUR" },
  { name: "MacBook Air M1", platform: "VINTED", category: "Tech", price: "620EUR" },
  { name: "Bolsa Transversal", platform: "VINTED", category: "Acessorios", price: "28EUR" },
  { name: "Smartwatch Series 8", platform: "ALIEXPRESS", category: "Tech", price: "22EUR" },
  { name: "Conjunto Moletom", platform: "SHEIN", category: "Moda", price: "25EUR" },
  { name: "AirPods Pro 2a Gen", platform: "VINTED", category: "Tech", price: "180EUR" },
  { name: "Carregador GaN 65W", platform: "ALIEXPRESS", category: "Tech", price: "12EUR" },
  { name: "Jaqueta Jeans", platform: "SHEIN", category: "Moda", price: "32EUR" },
];

const MESSAGES = {
  ENTREGUE: [
    "Recebi o meu {product} hoje! Veio tudo certinho, exatamente como nas fotos. Demorou {days} dias. Recomendo muito!",
    "Primeira vez que uso o ImportEasy. O {product} chegou em {days} dias! Paguei por transferencia e foi super rapido o comprovativo.",
    "Melhor investimento! O {product} custou {price} na {platform} + taxas = {aoa} Kz. Aqui em Angola custa o dobro. Poupei muito!",
    "Pedido {ref} chegou! O {product} funciona perfeitamente. O suporte no WhatsApp ajudou muito quando tive duvida na alfandega.",
    "Segunda compra feita! Da primeira vez demorou {days} dias. Espero que desta seja mais rapido. Ja recomendei a {friends} amigos!",
  ],
  EM_TRANSITO: [
    "Estou na espera do meu pedido {ref}. Ja esta em Luanda segundo o rastreio! Ansiosa!",
    "Meu {product} saiu da China ontem. Rastreio atualizou: 'Em transito para Angola'. Contando os dias!",
    "Pedido {ref} com {product} esta a caminho. O rastreio mostra que ja passou pela alfandega. Boa!",
  ],
  PENDENTE: [
    "Acabei de fazer o pedido! Pela primeira vez. O simulador foi muito facil de usar. Ja paguei e estou a aguardar confirmacao!",
    "Fiz o pagamento do meu {product} ha 2 horas. Aguardando o email de confirmacao. Alguem sabe quanto tempo demora?",
    "Primeiro pedido pelo ImportEasy. Comprei {product} por {price}. Espero que corra tudo bem!",
  ],
  PERGUNTA: [
    "Alguem ja importou {product}? Estou a pensar pegar um da {platform}. Vale a pena o preco de {aoa} Kz?",
    "Duvida: o {product} da {platform} vem com garantia? Alguem sabe me dizer?",
    "Para quem ja comprou {category} na {platform}: o tamanho vem certo? Tenho receio de pedir errado.",
  ],
  EM_ANALISE: [
    "Meu pedido {ref} esta em analise ha 2 dias. Normal? Comprei {product} por {price}.",
    "Pagamento confirmado ontem, mas pedido ainda em analise. Alguem sabe quanto tempo costuma demorar?",
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

function getRandomStatus(seed: number): string {
  const weights = [
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
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notifications, setNotifications] = useState<string[]>([]);
  const feedRef = useRef<HTMLDivElement>(null);
  const [isScrolledToBottom, setIsScrolledToBottom] = useState(true);

  // Inicializa com conversas existentes (determinÃ­stico para evitar hydration mismatch)
  useEffect(() => {
    const initial = Array.from({ length: 12 }, (_, i) => generateConversation(i + 1));
    setConversations(initial);
  }, []);

  // Simula tempo real: novas mensagens a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      const fresh = generateConversation(Date.now(), true);
      setConversations((prev) => [fresh, ...prev.slice(0, 20)]);

      // NotificaÃ§Ã£o visual
      setNotifications((prev) => [...prev, `Nova partilha de ${fresh.user}`]);
      setTimeout(() => setNotifications((p) => p.slice(1)), 5000);

      // Auto-scroll se estava no fundo
      if (isScrolledToBottom && feedRef.current) {
        feedRef.current.scrollTop = feedRef.current.scrollHeight;
      }
    }, 5000); // 5 segundos

    // Atualiza timestamps existentes
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

    return () => { clearInterval(interval); clearInterval(timeInterval); };
  }, [isScrolledToBottom]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));

    const userSeed = `user-${Date.now()}`;
    const message = {
      id: Date.now(),
      user: "VocÃª",
      avatar: getAvatarUrl(userSeed),
      location: "Angola",
      product: "ImportEasy",
      product,
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
    setShowEmojiPicker(false);
    
    // NotificaÃ§Ã£o de envio
    setNotifications((p) => [...p, "Mensagem publicada!"]);
    setTimeout(() => setNotifications((p) => p.slice(1)), 3000);
  };

  const handleLike = (id: number) => {
    setConversations((prev) =>
      prev.map((c) => c.id === id ? { ...c, likes: c.likes + 1 } : c)
    );
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    setIsScrolledToBottom(scrollHeight - scrollTop - clientHeight < 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-ink-50 via-white to-amber-50 relative overflow-hidden">
      {/* Background decorativo com acessÃ³rios */}
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
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-4">
              <TrendingUp className="w-4 h-4" />
              <span>Comunidade ativa Â· Tempo real</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-ink-900 mb-3">
              Comunidade <span className="text-brand-600">ImportEasy</span>
            </h1>
            <p className="text-lg text-ink-600 max-w-2xl mx-auto">
              Partilhe a sua experiÃªncia, tire dÃºvidas e veja o que outros clientes em Angola estÃ£o a importar.
              <span className="font-medium text-brand-600"> Mais de 2.500 angolanos jÃ¡ confiam.</span>
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatCard icon={Users} value="2.500+" label="Clientes ativos" />
            <StatCard icon={CheckCircle2} value="8.300+" label="Pedidos entregues" />
            <StatCard icon={Star} value="4,8/5" label="AvaliaÃ§Ã£o mÃ©dia" />
            <StatCard icon={TrendingUp} value="18 dias" label="MÃ©dia de entrega" />
          </div>

          {/* Composer */}
          <div className="bg-white rounded-2xl border border-ink-200 p-4 mb-8 shadow-sm relative">
            <div className="flex items-start gap-3">
              <img src={getAvatarUrl("current-user")} alt="VocÃª" className="w-10 h-10 rounded-full ring-2 ring-brand-200" />
              <div className="flex-1">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="O que estÃ¡ a pensar importar? Partilhe a sua experiÃªncia ou faÃ§a uma pergunta..."
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
          <div className="text-center mt-8">
            <button className="px-6 py-3 text-brand-600 font-medium hover:text-brand-700 transition flex items-center gap-2 mx-auto">
              Carregar mais conversas
              <TrendingUp className="w-4 h-4" />
            </button>
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
          <img 
            src={conversation.avatar} 
            alt={conversation.user} 
            className="w-12 h-12 rounded-full ring-2 ring-ink-100 object-cover"
            loading="lazy"
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
            <span className="text-ink-400">â€¢</span>
            <span className="text-sm text-ink-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {conversation.location}
            </span>
            <span className="text-ink-400">â€¢</span>
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
