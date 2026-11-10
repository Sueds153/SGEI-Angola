"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Heart, Clock, Shield, TrendingUp, User, MapPin, Star } from "lucide-react";
import Link from "next/link";

// Conversas simuladas para gerar confiança
const SIMULATED_CONVERSATIONS = [
  {
    id: 1,
    user: "Maria F.",
    avatar: "👩🏾",
    location: "Luanda, Talatona",
    product: "iPhone 13 Pro - Vinted",
    image: "📱",
    message: "Recebi o meu iPhone hoje! Veio tudo certinho, bateria 92% como descrito. Demorou 18 dias. Recomendo!",
    likes: 47,
    timeAgo: "2 min",
    verified: true,
    status: "ENTREGUE",
  },
  {
    id: 2,
    user: "João P.",
    avatar: "👨🏿",
    location: "Benguela",
    product: "Vestido Shein",
    image: "👗",
    message: "Primeira vez que uso o ImportEasy. O vestido chegou em 15 dias! Paguei por transferência e foi super rápido o comprovativo.",
    likes: 32,
    timeAgo: "5 min",
    verified: true,
    status: "ENTREGUE",
  },
  {
    id: 3,
    user: "Ana S.",
    avatar: "👩🏽",
    location: "Luanda, Kilamba",
    product: "Ténis Nike - AliExpress",
    image: "👟",
    message: "Estou na espera do meu pedido SG-14210. Já está em Luanda segundo o rastreio! Ansiosa 😍",
    likes: 18,
    timeAgo: "12 min",
    verified: true,
    status: "EM_TRÂNSITO",
  },
  {
    id: 4,
    user: "Pedro M.",
    avatar: "👨🏾",
    location: "Huambo",
    product: "MacBook Air M1 - Vinted",
    image: "💻",
    message: "Alguém já importou MacBook? Estou a pensar pegar um da Vinted. Vale a pena o preço de 450.000 Kz?",
    likes: 12,
    timeAgo: "23 min",
    verified: false,
    status: "PERGUNTA",
  },
  {
    id: 5,
    user: "Carla N.",
    avatar: "👩🏿",
    location: "Luanda, Maianga",
    product: "Bolsa Zara - Vinted",
    image: "👜",
    message: "Melhor investimento! A bolsa custou 25€ na Vinted + taxas = 45.000 Kz. Aqui em Luanda custa 80.000 Kz. Poupei muito!",
    likes: 56,
    timeAgo: "1 hora",
    verified: true,
    status: "ENTREGUE",
  },
  {
    id: 6,
    user: "Filipe D.",
    avatar: "👨🏽",
    location: "Cabinda",
    product: "Smartwatch - AliExpress",
    image: "⌚",
    message: "Pedido SG-14199 chegou! O smartwatch funciona perfeitamente. O suporte no WhatsApp ajudou muito quando tive dúvida na alfândega.",
    likes: 29,
    timeAgo: "2 horas",
    verified: true,
    status: "ENTREGUE",
  },
  {
    id: 7,
    user: "Mariana L.",
    avatar: "👩🏾",
    location: "Luanda, Belas",
    product: "Conjunto Shein",
    image: "👚",
    message: "Acabei de fazer o pedido! Pela primeira vez. O simulador foi muito fácil de usar. Já paguei e estou a aguardar confirmação 🤞",
    likes: 8,
    timeAgo: "3 horas",
    verified: false,
    status: "PENDENTE",
  },
  {
    id: 8,
    user: "António V.",
    avatar: "👨🏿",
    location: "Lubango",
    product: "iPhone 12 - Vinted",
    image: "📱",
    message: "Segunda compra feita! Da primeira vez demorou 20 dias. Espero que desta seja mais rápido. Já recomendei a 3 amigos!",
    likes: 41,
    timeAgo: "5 horas",
    verified: true,
    status: "EM_ANÁLISE",
  },
];

const STATUS_COLORS: Record<string, string> = {
  ENTREGUE: "bg-green-100 text-green-700",
  EM_TRÂNSITO: "bg-blue-100 text-blue-700",
  PENDENTE: "bg-yellow-100 text-yellow-700",
  EM_ANÁLISE: "bg-purple-100 text-purple-700",
  PERGUNTA: "bg-ink-100 text-ink-700",
};

const STATUS_LABELS: Record<string, string> = {
  ENTREGUE: "✓ Entregue",
  EM_TRÂNSITO: "🚚 Em trânsito",
  PENDENTE: "⏳ Pendente",
  EM_ANÁLISE: "📋 Em análise",
  PERGUNTA: "❓ Pergunta",
};

export default function ComunidadePage() {
  const [conversations, setConversations] = useState(SIMULATED_CONVERSATIONS);
  const [newMessage, setNewMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simula novas mensagens chegando em tempo real
  useEffect(() => {
    const newConversations = [
      {
        id: Date.now(),
        user: "Sandra K.",
        avatar: "👩🏽",
        location: "Luanda, Mutamba",
        product: "Saia Shein",
        image: "👗",
        message: "Chegou hoje o meu pedido! Qualidade impecável. Obrigada ImportEasy! 💕",
        likes: 0,
        timeAgo: "Agora",
        verified: true,
        status: "ENTREGUE",
      },
    ];

    // Adiciona nova mensagem simulada a cada 2-5 minutos
    const interval = setInterval(() => {
      const randomMsg = SIMULATED_CONVERSATIONS[Math.floor(Math.random() * SIMULATED_CONVERSATIONS.length)];
      const freshMsg = {
        ...randomMsg,
        id: Date.now(),
        timeAgo: "Agora",
        likes: 0,
        user: generateRandomUser(),
        location: generateRandomLocation(),
      };
      
      setConversations((prev) => [freshMsg, ...prev.slice(0, 15)]);
    }, 180000); // 3 minutos

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsSubmitting(true);
    
    // Simula envio
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const message = {
      id: Date.now(),
      user: "Você",
      avatar: "👤",
      location: "Angola",
      product: "Não especificado",
      image: "📦",
      message: newMessage,
      likes: 0,
      timeAgo: "Agora",
      verified: false,
      status: "PENDENTE" as const,
    };

    setConversations((prev) => [message, ...prev]);
    setNewMessage("");
    setIsSubmitting(false);
  };

  const handleLike = (id: number) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, likes: c.likes + 1 } : c))
    );
  };

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Header */}
      <header className="bg-white border-b border-ink-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">📦</span>
              <span className="font-bold text-xl text-brand-600">ImportEasy</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link href="/produtos" className="text-ink-600 hover:text-brand-600">Produtos</Link>
              <Link href="/comunidade" className="text-brand-600 font-medium">Comunidade</Link>
              <Link href="/importar" className="text-ink-600 hover:text-brand-600">Simular</Link>
              <a href="https://wa.me/244922058136" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium">
                Suporte
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="py-8 lg:py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-ink-900 mb-2">
              Comunidade <span className="text-brand-600">ImportEasy</span>
            </h1>
            <p className="text-ink-600">
              Partilhe experiências, tire dúvidas e veja o que outros clientes estão a importar.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <StatCard icon={User} value="2.500+" label="Clientes ativos" />
            <StatCard icon={MessageSquare} value="8.300+" label="Pedidos entregues" />
            <StatCard icon={Star} value="4.8/5" label="Avaliação média" />
          </div>

          {/* Nova mensagem */}
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-ink-200 p-4 mb-8 shadow-sm">
            <label htmlFor="message" className="sr-only">Sua mensagem</label>
            <textarea
              id="message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Partilhe a sua experiência ou faça uma pergunta..."
              rows={3}
              className="w-full resize-none border-0 focus:ring-0 text-ink-900 placeholder-ink-400"
              disabled={isSubmitting}
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-100">
              <div className="flex items-center gap-2 text-xs text-ink-500">
                <Shield className="w-4 h-4" />
                <span>Mensagens moderadas</span>
              </div>
              <button
                type="submit"
                disabled={!newMessage.trim() || isSubmitting}
                className="px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isSubmitting ? "Enviando..." : "Publicar"}
              </button>
            </div>
          </form>

          {/* Feed */}
          <div className="space-y-4">
            {conversations.map((conv) => (
              <ConversationCard
                key={conv.id}
                conversation={conv}
                onLike={() => handleLike(conv.id)}
              />
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-8">
            <button className="px-6 py-3 text-brand-600 font-medium hover:text-brand-700 transition">
              Carregar mais conversas
            </button>
          </div>
        </div>
      </main>

      {/* Footer CTA */}
      <footer className="bg-brand-600 text-white py-12 mt-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Pronto para fazer a sua importação?</h2>
          <p className="text-brand-100 mb-6">
            Junte-se a mais de 2.500 clientes satisfeitos em Angola.
          </p>
          <Link
            href="/importar"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-600 font-semibold rounded-xl hover:bg-brand-50 transition"
          >
            Simular Importação Agora
          </Link>
        </div>
      </footer>
    </div>
  );
}

function StatCard({ icon: Icon, value, label }: { icon: React.ComponentType<{ className?: string }>; value: string; label: string }) {
  return (
    <div className="bg-white rounded-xl border border-ink-200 p-4 text-center">
      <Icon className="w-6 h-6 text-brand-600 mx-auto mb-2" />
      <div className="text-2xl font-bold text-ink-900">{value}</div>
      <div className="text-xs text-ink-500">{label}</div>
    </div>
  );
}

function ConversationCard({ conversation, onLike }: { conversation: any; onLike: () => void }) {
  return (
    <article className="bg-white rounded-xl border border-ink-200 p-4 hover:border-brand-200 hover:shadow-md transition">
      <div className="flex items-start gap-3">
        <div className="text-3xl flex-shrink-0">{conversation.avatar}</div>
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="font-semibold text-ink-900">{conversation.user}</span>
            {conversation.verified && (
              <Shield className="w-4 h-4 text-brand-500" title="Compra verificada" />
            )}
            <span className="text-ink-400">•</span>
            <span className="text-sm text-ink-500 flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {conversation.location}
            </span>
            <span className="text-ink-400">•</span>
            <span className="text-sm text-ink-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {conversation.timeAgo}
            </span>
          </div>

          {/* Product & Status */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-lg">{conversation.image}</span>
            <span className="text-sm text-ink-700">{conversation.product}</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[conversation.status]}`}>
              {STATUS_LABELS[conversation.status]}
            </span>
          </div>

          {/* Message */}
          <p className="text-ink-700 mb-3">{conversation.message}</p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={onLike}
              className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600 transition"
            >
              <Heart className="w-4 h-4" />
              <span>{conversation.likes}</span>
            </button>
            <button className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600 transition">
              <MessageSquare className="w-4 h-4" />
              <span>Responder</span>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

function generateRandomUser() {
  const names = ["Beatriz", "Carlos", "Diana", "Eduardo", "Fernanda", "Gabriel", "Helena", "Isaac", "Juliana", "Kevin"];
  const lastNames = ["A.", "B.", "C.", "D.", "E.", "F.", "G.", "H.", "I.", "J."];
  return `${names[Math.floor(Math.random() * names.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`;
}

function generateRandomLocation() {
  const locations = [
    "Luanda, Talatona",
    "Luanda, Kilamba",
    "Luanda, Maianga",
    "Luanda, Belas",
    "Luanda, Mutamba",
    "Benguela",
    "Huambo",
    "Lubango",
    "Cabinda",
    "Malanje",
  ];
  return locations[Math.floor(Math.random() * locations.length)];
}