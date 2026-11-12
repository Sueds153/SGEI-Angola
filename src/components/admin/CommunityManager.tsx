"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert, Card, Input } from "@/components/ui";
import { 
  MessageSquare, 
  ArrowLeft, 
  Send, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Search,
  Filter,
  Flag,
  Eye,
  MoreVertical,
  Reply,
  Trash2,
  Check,
  X,
  Shield,
  User,
  MapPin,
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CommunityMessage {
  id: number;
  user: string;
  avatar: string;
  location: string;
  product: string;
  platform: string;
  message: string;
  likes: number;
  timeAgo: string;
  verified: boolean;
  status: string;
  ref: string;
  isOwn: boolean;
  adminReply?: string;
  adminReplyAt?: string;
  isHidden?: boolean;
  reported?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  ENTREGUE: { label: "Entregue", color: "bg-emerald-100 text-emerald-700" },
  EM_TRANSITO: { label: "Em trÃ¢nsito", color: "bg-blue-100 text-blue-700" },
  PENDENTE: { label: "Pendente", color: "bg-amber-100 text-amber-700" },
  EM_ANALISE: { label: "Em anÃ¡lise", color: "bg-purple-100 text-purple-700" },
  PERGUNTA: { label: "Pergunta", color: "bg-ink-100 text-ink-700" },
};

const PLATFORM_COLORS: Record<string, string> = {
  VINTED: "bg-brand-100 text-brand-700",
  SHEIN: "bg-pink-100 text-pink-700",
  ALIEXPRESS: "bg-orange-100 text-orange-700",
  IMPORTEASY: "bg-brand-100 text-brand-700",
};

export function CommunityManager() {
  // Initialize with deterministic mock data for consistent SSR/client hydration
  const [messages, setMessages] = useState<CommunityMessage[]>(() => generateMockMessages());
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("");
  const [showOnlyReported, setShowOnlyReported] = useState(false);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState<number | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null);
  const [messageToToggleHide, setMessageToToggleHide] = useState<number | null>(null);

  // Load from localStorage on client only
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem("community_messages");
        if (stored) {
          setMessages(JSON.parse(stored));
        } else {
          localStorage.setItem("community_messages", JSON.stringify(generateMockMessages()));
        }
      } catch (error) {
        console.error("Erro ao carregar mensagens:", error);
      }
    }
  }, []);

  function saveMessages(updated: CommunityMessage[]) {
    if (typeof window !== 'undefined') {
      localStorage.setItem("community_messages", JSON.stringify(updated));
    }
    setMessages(updated);
  }

  function generateMockMessages(): CommunityMessage[] {
    const users = [
      { name: "Maria Fernanda", seed: "maria-fernanda-ao", location: "Luanda, Talatona", skin: "8d5524" },
      { name: "JoÃ£o Pedro", seed: "joao-pedro-ao", location: "Benguela", skin: "5d4037" },
      { name: "Ana Silva", seed: "ana-silva-ao", location: "Luanda, Kilamba", skin: "a1887f" },
      { name: "Pedro Miguel", seed: "pedro-miguel-ao", location: "Huambo", skin: "6d4c41" },
      { name: "Carla Nascimento", seed: "carla-nascimento-ao", location: "Luanda, Maianga", skin: "795548" },
      { name: "Filipe Domingos", seed: "filipe-domingos-ao", location: "Cabinda", skin: "4e342e" },
    ];

    const products = [
      { name: "iPhone 13 Pro 128GB", platform: "VINTED" },
      { name: "Vestido Floral Midi", platform: "SHEIN" },
      { name: "Tenis Nike Air Max", platform: "ALIEXPRESS" },
      { name: "MacBook Air M1", platform: "VINTED" },
      { name: "Bolsa Transversal", platform: "VINTED" },
      { name: "Smartwatch Series 8", platform: "ALIEXPRESS" },
    ];

    const statuses = ["ENTREGUE", "EM_TRANSITO", "PENDENTE", "EM_ANALISE", "PERGUNTA"] as const;

    // Deterministic pseudo-random based on index for consistent SSR/client hydration
    function pseudoRandom(seed: number): number {
      const x = Math.sin(seed * 9999) * 10000;
      return x - Math.floor(x);
    }

    return Array.from({ length: 20 }, (_, i) => {
      const user = users[Math.floor(pseudoRandom(i * 2 + 1) * users.length)];
      const product = products[Math.floor(pseudoRandom(i * 2 + 2) * products.length)];
      const status = statuses[Math.floor(pseudoRandom(i * 2 + 3) * statuses.length)];
      const ref = `SG-${14000 + Math.floor(pseudoRandom(i * 2 + 4) * 300)}`;

      return {
        id: i + 1,
        user: user.name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.seed}&skinColor=${user.skin}&backgroundColor=e8f5e9,bbdefb,ffe0b2,fce4ec,fff3e0`,
        location: user.location,
        product: product.name,
        platform: product.platform,
        message: `Mensagem de exemplo ${i + 1} sobre ${product.name}...`,
        likes: Math.floor(pseudoRandom(i * 2 + 5) * 50),
        timeAgo: `${Math.floor(pseudoRandom(i * 2 + 6) * 48) + 1}h`,
        verified: status === "ENTREGUE" || status === "EM_TRANSITO" ? pseudoRandom(i * 2 + 7) > 0.3 : false,
        status,
        ref,
        isOwn: false,
        isHidden: false,
        reported: pseudoRandom(i * 2 + 8) < 0.1,
      };
    });
  }

  const filteredMessages = messages.filter((msg) => {
    if (showOnlyReported && !msg.reported) return false;
    if (filterStatus && msg.status !== filterStatus) return false;
    if (filterPlatform && msg.platform !== filterPlatform) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!msg.user.toLowerCase().includes(s) && 
          !msg.message.toLowerCase().includes(s) && 
          !msg.product.toLowerCase().includes(s) &&
          !msg.ref.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const handleReply = async (msgId: number) => {
    if (!replyText.trim()) return;
    setSendingReply(msgId);
    
    // Simula envio
    await new Promise(r => setTimeout(r, 500));
    
    const updated = messages.map(m => 
      m.id === msgId 
        ? { ...m, adminReply: replyText, adminReplyAt: new Date().toISOString() }
        : m
    );
    
    saveMessages(updated);
    setReplyingTo(null);
    setReplyText("");
    setSendingReply(null);
  };

  const handleDelete = (msgId: number) => {
    const updated = messages.filter(m => m.id !== msgId);
    saveMessages(updated);
    setMessageToDelete(null);
  };

  const handleToggleHide = (msgId: number) => {
    const updated = messages.map(m => 
      m.id === msgId ? { ...m, isHidden: !m.isHidden } : m
    );
    saveMessages(updated);
    setMessageToToggleHide(null);
  };

  const handleToggleReport = (msgId: number) => {
    const updated = messages.map(m => 
      m.id === msgId ? { ...m, reported: !m.reported } : m
    );
    saveMessages(updated);
  };

  const handleApprove = (msgId: number) => {
    const updated = messages.map(m => 
      m.id === msgId ? { ...m, verified: true, reported: false } : m
    );
    saveMessages(updated);
  };

  const handleRefresh = () => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem("community_messages");
        if (stored) {
          setMessages(JSON.parse(stored));
        } else {
          setMessages(generateMockMessages());
        }
      } catch (error) {
        console.error("Erro ao carregar mensagens:", error);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-ink-900">GestÃ£o da Comunidade</h2>
        <Button variant="secondary" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard value={messages.length} label="Total mensagens" icon={MessageSquare} color="text-brand-600" />
        <StatCard value={messages.filter(m => !m.adminReply).length} label="Por responder" icon={Reply} color="text-amber-600" />
        <StatCard value={messages.filter(m => m.reported).length} label="Reportadas" icon={Flag} color="text-red-600" />
        <StatCard value={messages.filter(m => m.isHidden).length} label="Ocultas" icon={Eye} color="text-ink-500" />
        <StatCard value={messages.filter(m => m.verified).length} label="Verificadas" icon={CheckCircle2} color="text-emerald-600" />
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-400" />
            <Input
              placeholder="Buscar por utilizador, produto, mensagem, ref..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-ink-300 rounded-lg text-sm"
            >
              <option value="">Todos os status</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="px-3 py-2 border border-ink-300 rounded-lg text-sm"
            >
              <option value="">Todas plataformas</option>
              <option value="VINTED">Vinted</option>
              <option value="SHEIN">Shein</option>
              <option value="ALIEXPRESS">AliExpress</option>
              <option value="IMPORTEASY">ImportEasy</option>
            </select>
            <label className="flex items-center gap-2 px-3 py-2 border border-ink-300 rounded-lg cursor-pointer hover:bg-ink-50">
              <input
                type="checkbox"
                checked={showOnlyReported}
                onChange={(e) => setShowOnlyReported(e.target.checked)}
                className="rounded border-ink-300 text-brand-600 focus:ring-brand-500"
              />
              <Flag className="w-4 h-4" />
              SÃ³ reportadas
            </label>
          </div>
        </div>
      </Card>

      {/* Messages List */}
      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-ink-50 border-b border-ink-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase">Utilizador</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase">Produto / Plataforma</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase">Mensagem</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-ink-500 uppercase">AÃ§Ãµes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filteredMessages.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-ink-500">
                    <MessageSquare className="w-12 h-12 mx-auto mb-3 text-ink-300" />
                    <p>Nenhuma mensagem encontrada</p>
                  </td>
                </tr>
              ) : (
                filteredMessages.map((msg) => (
                  <tr key={msg.id} className={cn("hover:bg-ink-50", msg.isHidden && "opacity-50 bg-amber-50", msg.reported && "bg-red-50")}>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={msg.avatar} 
                          alt={msg.user} 
                          className="w-10 h-10 rounded-full ring-2 ring-ink-100 object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-ink-900">{msg.user}</span>
                            {msg.verified && <Shield className="w-4 h-4 text-brand-600" title="Verificado" />}
                            {msg.isOwn && <span className="text-xs px-2 py-0.5 bg-brand-100 text-brand-700 rounded-full">Cliente</span>}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-ink-500">
                            <MapPin className="w-3 h-3" /> {msg.location}
                            <span>â€¢</span>
                            <Clock className="w-3 h-3" /> {msg.timeAgo}
                            {msg.ref && <span className="font-mono">Ref: {msg.ref}</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-ink-700 max-w-xs truncate">{msg.product}</span>
                      </div>
                      <span className={cn("inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium", PLATFORM_COLORS[msg.platform])}>
                        {msg.platform}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <p className="text-ink-700 max-w-md truncate" title={msg.message}>{msg.message}</p>
                      {msg.adminReply && (
                        <div className="mt-2 p-2 bg-brand-50 rounded-lg border border-brand-100">
                          <div className="flex items-center gap-1 text-xs text-brand-700 mb-1">
                            <Shield className="w-3 h-3" />
                            Resposta do admin ({new Date(msg.adminReplyAt!).toLocaleDateString("pt-AO")})
                          </div>
                          <p className="text-sm text-brand-900">{msg.adminReply}</p>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <span className={cn("px-2 py-1 rounded-full text-xs font-medium", STATUS_CONFIG[msg.status]?.color)}>
                        {STATUS_CONFIG[msg.status]?.label || msg.status}
                      </span>
                      {msg.reported && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                          <Flag className="w-3 h-3" /> Reportada
                        </span>
                      )}
                      {msg.isHidden && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs font-medium bg-ink-100 text-ink-700 flex items-center gap-1">
                          <Eye className="w-3 h-3" /> Oculta
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        {msg.adminReply ? (
                          <Button variant="ghost" size="sm" onClick={() => { setReplyingTo(msg.id); setReplyText(msg.adminReply || ""); }}>
                            <Reply className="w-4 h-4 mr-1" /> Editar resposta
                          </Button>
                        ) : (
                          <Button variant="primary" size="sm" onClick={() => { setReplyingTo(msg.id); setReplyText(""); }}>
                            <Reply className="w-4 h-4 mr-1" /> Responder
                          </Button>
                        )}
                        
                        <div className="relative">
                          <Button variant="ghost" size="sm" className="p-2" onClick={() => setMessageToToggleHide(msg.id)}>
                            {msg.isHidden ? <Eye className="w-4 h-4 text-ink-500" /> : <Eye className="w-4 h-4 text-ink-500" />}
                          </Button>
                          {messageToToggleHide === msg.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-ink-200 rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                              <button 
                                onClick={() => { handleToggleHide(msg.id); setMessageToToggleHide(null); }}
                                className="w-full px-3 py-2 text-left text-sm text-ink-700 hover:bg-ink-50 flex items-center gap-2"
                              >
                                {msg.isHidden ? <Eye className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                {msg.isHidden ? "Mostrar" : "Ocultar"}
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {msg.reported ? (
                          <Button variant="ghost" size="sm" onClick={() => handleApprove(msg.id)}>
                            <Check className="w-4 h-4 mr-1 text-emerald-600" /> Aprovar
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" onClick={() => handleToggleReport(msg.id)}>
                            <Flag className="w-4 h-4 mr-1" /> Reportar
                          </Button>
                        )}

                        <div className="relative">
                          <Button variant="ghost" size="sm" className="p-2" onClick={() => setMessageToDelete(msg.id)}>
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                          {messageToDelete === msg.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-ink-200 rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
                              <p className="px-3 py-2 text-sm text-ink-700">Eliminar definitivamente?</p>
                              <div className="flex gap-2 px-2 pb-2">
                                <Button variant="danger" size="sm" onClick={() => { handleDelete(msg.id); setMessageToDelete(null); }} className="flex-1">
                                  Eliminar
                                </Button>
                                <Button variant="secondary" size="sm" onClick={() => setMessageToDelete(null)} className="flex-1">
                                  Cancelar
                                </Button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Reply Modal */}
        {replyingTo && (
          <div className="border-t border-ink-200 bg-ink-50 p-4">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-ink-900">Responder a mensagem</h3>
                <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escreva a sua resposta como administrador..."
                rows={3}
                className="w-full border border-ink-300 rounded-lg p-3 text-ink-900 focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              />
              <div className="flex justify-end gap-2 mt-3">
                <Button variant="secondary" size="sm" onClick={() => { setReplyingTo(null); setReplyText(""); }}>
                  Cancelar
                </Button>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => handleReply(replyingTo!)}
                  disabled={sendingReply === replyingTo || !replyText.trim()}
                >
                  {sendingReply === replyingTo ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                  {sendingReply === replyingTo ? "A enviar..." : "Enviar resposta"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function StatCard({ value, label, icon: Icon, color }: { value: number; label: string; icon: React.ComponentType<{ className?: string }>; color: string }) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold text-ink-900">{value}</div>
          <div className="text-xs text-ink-500">{label}</div>
        </div>
        <div className={cn("w-10 h-10 rounded-xl bg-ink-100 flex items-center justify-center", color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </Card>
  );
}
