"use client";

import { useState } from "react";
import { Card, Badge } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import {
  Search,
  Truck,
  MapPin,
  Phone,
  MessageSquare,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Send,
  Loader2,
  FileText,
  ExternalLink,
  Edit3,
  Shield,
  Package,
} from "lucide-react";
import { formatKz, formatDateTime, ORDER_STATUS_LABELS } from "@/lib/types";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface OrderSearchResult {
  id: number;
  reference: string;
  customerName: string;
  customerPhone: string;
  customerWhatsapp: string | null;
  status: string;
  paymentStatus: string;
  totalCents: number;
  createdAt: string;
  internalNotes: string | null;
  items: Array<{
    id: number;
    productName: string;
    productImage: string | null;
    quantity: number;
    totalPriceCents: number;
  }>;
  shipment: {
    internationalTracking: string | null;
    localTracking: string | null;
    carrier: string | null;
    status: string | null;
  } | null;
  address: {
    province: string;
    municipality: string;
    neighborhood: string | null;
    street: string | null;
    reference: string | null;
    recipientName: string | null;
  } | null;
  tracking: Array<{
    id: number;
    title: string;
    description: string | null;
    status: string;
    eventDate: string;
  }>;
}

const PRESET_EVENTS = [
  {
    title: "Retido na Alfândega de Luanda (Aeroporto 4 de Fevereiro)",
    desc: "A encomenda está em processo de verificação aduaneira pela nossa equipa de despachantes.",
    status: "ARRIVED_IN_ANGOLA",
  },
  {
    title: "Desalfandegamento Concluído com Sucesso",
    desc: "A mercadoria foi liberada e está a caminho do nosso centro de triagem em Luanda.",
    status: "ARRIVED_IN_ANGOLA",
  },
  {
    title: "Disponível para Levantamento no Ponto de Apoio",
    desc: "A sua encomenda já pode ser recolhida no nosso ponto de distribuição em Luanda.",
    status: "OUT_FOR_DELIVERY",
  },
  {
    title: "Saiu para Entrega com o Estafeta",
    desc: "O nosso estafeta está a caminho do seu endereço. Por favor, mantenha o telefone ligado.",
    status: "OUT_FOR_DELIVERY",
  },
  {
    title: "Em Voo Internacional (Espanha → Luanda)",
    desc: "Carga consolidada e despachada para o Aeroporto Internacional de Luanda.",
    status: "IN_TRANSIT",
  },
];

export function OrderInterventionCenter({ initialOrders }: { initialOrders: OrderSearchResult[] }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderSearchResult | null>(
    initialOrders.length > 0 ? initialOrders[0] : null
  );

  // Estados dos formulários de intervenção
  const [activeTab, setActiveTab] = useState<"event" | "tracking" | "address" | "notes">("event");

  // Novo Evento de Tracking
  const [eventTitle, setEventTitle] = useState("");
  const [eventDesc, setEventDesc] = useState("");
  const [eventStatus, setEventStatus] = useState("");

  // Códigos de envio
  const [intTracking, setIntTracking] = useState("");
  const [locTracking, setLocTracking] = useState("");
  const [carrier, setCarrier] = useState("");

  // Morada e contactos
  const [editPhone, setEditPhone] = useState("");
  const [editNeighborhood, setEditNeighborhood] = useState("");
  const [editStreet, setEditStreet] = useState("");
  const [editRefPoint, setEditRefPoint] = useState("");

  // Notas internas
  const [internalNotes, setInternalNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Filtro de pesquisa
  const filteredOrders = initialOrders.filter((o) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      o.reference.toLowerCase().includes(q) ||
      o.customerName.toLowerCase().includes(q) ||
      o.customerPhone.includes(q) ||
      (o.shipment?.internationalTracking && o.shipment.internationalTracking.toLowerCase().includes(q)) ||
      (o.shipment?.localTracking && o.shipment.localTracking.toLowerCase().includes(q))
    );
  });

  const handleSelectOrder = (order: OrderSearchResult) => {
    setSelectedOrder(order);
    setIntTracking(order.shipment?.internationalTracking || "");
    setLocTracking(order.shipment?.localTracking || "");
    setCarrier(order.shipment?.carrier || "SHEIN Express");
    setEditPhone(order.customerPhone || "");
    setEditNeighborhood(order.address?.neighborhood || "");
    setEditStreet(order.address?.street || "");
    setEditRefPoint(order.address?.reference || "");
    setInternalNotes(order.internalNotes || "");
    setEventStatus(order.status);
    setFeedback(null);
  };

  const handleInterventionSubmit = async (action: string, payload: any) => {
    if (!selectedOrder) return;
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/intervene`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Falha na intervenção.");

      setFeedback({ type: "success", msg: data.message || "Intervenção aplicada com sucesso!" });

      // Limpa campos de evento se foi adição
      if (action === "ADD_TRACKING_EVENT") {
        setEventTitle("");
        setEventDesc("");
      }

      router.refresh();
      setTimeout(() => setFeedback(null), 4000);
    } catch (err: any) {
      setFeedback({ type: "error", msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Gerador de Link WhatsApp Inteligente com Mensagem Pré-formatada
  const getWhatsAppLink = (order: OrderSearchResult) => {
    const phone = order.customerWhatsapp || order.customerPhone;
    const cleanPhone = phone.replace(/\D/g, "");
    const fullPhone = cleanPhone.startsWith("244") ? cleanPhone : `244${cleanPhone}`;
    const statusLabel = ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS]?.label || order.status;

    const text = encodeURIComponent(
      `Olá ${order.customerName}! 👋\n\nDaqui fala o suporte da ImportEasy Angola относительно à sua encomenda *#${order.reference}*.\n\n` +
      `📦 *Estado atual:* ${statusLabel}\n` +
      (order.shipment?.internationalTracking ? `✈️ *Tracking SHEIN:* ${order.shipment.internationalTracking}\n` : "") +
      `Estamos a acompanhar o processo para garantir que a sua encomenda chegue com total segurança. Como posso ajudar com o seu pedido?`
    );

    return `https://wa.me/${fullPhone}?text=${text}`;
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900">
            Central de Rastreio & Intervenção Imediata
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-100 text-brand-800 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> Super Admin
          </span>
        </div>
        <p className="mt-1 text-sm text-ink-500">
          Localize qualquer encomenda por Ref, Telefone, Nome ou Tracking. Intervenha em tempo real para resolver dúvidas, atualizar rotas ou contactar o cliente no WhatsApp.
        </p>
      </div>

      {/* Barra de Pesquisa Global */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
        <input
          type="text"
          placeholder="Pesquisar por Referência (#SG-...), Telefone (929...), Nome do Cliente ou Código de Tracking da SHEIN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-ink-200 bg-white text-base shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500 font-medium"
        />
        {searchTerm && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-500">
            {filteredOrders.length} resultado(s)
          </span>
        )}
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl border flex items-center gap-2.5 text-sm font-semibold ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {feedback.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span>{feedback.msg}</span>
        </div>
      )}

      {/* Grid Principal: Lista à Esquerda | Painel de Intervenção à Direita */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Lista de Pedidos */}
        <div className="lg:col-span-5 space-y-3 max-h-[750px] overflow-y-auto pr-1">
          {filteredOrders.length === 0 ? (
            <Card className="p-8 text-center text-ink-500 rounded-2xl">
              Nenhuma encomenda encontrada com os termos indicados.
            </Card>
          ) : (
            filteredOrders.map((o) => {
              const sm = ORDER_STATUS_LABELS[o.status as keyof typeof ORDER_STATUS_LABELS];
              const isSelected = selectedOrder?.id === o.id;

              return (
                <div
                  key={o.id}
                  onClick={() => handleSelectOrder(o)}
                  className={`p-4 rounded-2xl border cursor-pointer transition ${
                    isSelected
                      ? "bg-brand-50/50 border-brand-500 shadow-sm ring-1 ring-brand-500"
                      : "bg-white border-ink-200 hover:border-ink-300 hover:bg-ink-50/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-ink-900">#{o.reference}</span>
                    <Badge color={sm?.color as any}>{sm?.label || o.status}</Badge>
                  </div>

                  <div className="mt-2 text-xs text-ink-600 space-y-0.5">
                    <p className="font-semibold text-ink-800">{o.customerName}</p>
                    <p className="text-ink-500 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {o.customerPhone}
                    </p>
                    {o.shipment?.internationalTracking && (
                      <p className="font-mono text-brand-700 font-bold text-[11px]">
                        ✈️ {o.shipment.internationalTracking}
                      </p>
                    )}
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-ink-100 flex items-center justify-between text-xs">
                    <span className="font-bold text-ink-900">{formatKz(o.totalCents)}</span>
                    <span className="text-ink-400 text-[10px]">{formatDateTime(o.createdAt)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Painel de Intervenção Rápida */}
        <div className="lg:col-span-7">
          {selectedOrder ? (
            <div className="space-y-5">
              {/* Card Resumo do Pedido Selecionado */}
              <Card className="p-5 rounded-2xl border border-ink-200 shadow-sm bg-white">
                <div className="flex flex-wrap items-start justify-between gap-3 pb-4 border-b border-ink-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-ink-900">#{selectedOrder.reference}</h2>
                      <Badge
                        color={
                          ORDER_STATUS_LABELS[selectedOrder.status as keyof typeof ORDER_STATUS_LABELS]
                            ?.color as any
                        }
                      >
                        {ORDER_STATUS_LABELS[selectedOrder.status as keyof typeof ORDER_STATUS_LABELS]
                          ?.label || selectedOrder.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-ink-500 mt-0.5">
                      Cliente: <strong>{selectedOrder.customerName}</strong> ({selectedOrder.customerPhone})
                    </p>
                  </div>

                  {/* Botão de Emergência WhatsApp Direto */}
                  <a
                    href={getWhatsAppLink(selectedOrder)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Falar com Cliente no WhatsApp
                  </a>
                </div>

                {/* Tracking Atual e Destino */}
                <div className="grid grid-cols-2 gap-4 pt-3 text-xs">
                  <div>
                    <span className="text-ink-400 font-semibold uppercase text-[10px]">
                      Tracking Internacional SHEIN:
                    </span>
                    <p className="font-mono font-bold text-ink-900 mt-0.5">
                      {selectedOrder.shipment?.internationalTracking || "Não atribuído ainda"}
                    </p>
                  </div>
                  <div>
                    <span className="text-ink-400 font-semibold uppercase text-[10px]">
                      Local de Entrega em Angola:
                    </span>
                    <p className="font-medium text-ink-900 mt-0.5 truncate">
                      {selectedOrder.address?.neighborhood
                        ? `${selectedOrder.address.neighborhood}, ${selectedOrder.address.municipality}`
                        : selectedOrder.address?.province || "Luanda"}
                    </p>
                  </div>
                </div>
              </Card>

              {/* Abas de Intervenção */}
              <div className="flex border-b border-ink-200 gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("event")}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
                    activeTab === "event"
                      ? "border-brand-600 text-brand-700"
                      : "border-transparent text-ink-500 hover:text-ink-800"
                  }`}
                >
                  📍 Adicionar Evento de Rastreio
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("tracking")}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
                    activeTab === "tracking"
                      ? "border-brand-600 text-brand-700"
                      : "border-transparent text-ink-500 hover:text-ink-800"
                  }`}
                >
                  ✈️ Códigos de Envio
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("address")}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
                    activeTab === "address"
                      ? "border-brand-600 text-brand-700"
                      : "border-transparent text-ink-500 hover:text-ink-800"
                  }`}
                >
                  🏠 Corrigir Morada / Telefone
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("notes")}
                  className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition ${
                    activeTab === "notes"
                      ? "border-brand-600 text-brand-700"
                      : "border-transparent text-ink-500 hover:text-ink-800"
                  }`}
                >
                  📝 Notas Internas
                </button>
              </div>

              {/* Conteúdo da Aba 1: Adicionar Evento de Rastreio */}
              {activeTab === "event" && (
                <Card className="p-5 rounded-2xl border border-ink-200 shadow-sm space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-ink-900 mb-1">
                      Injetar Novo Evento de Rastreio na Linha do Tempo
                    </h3>
                    <p className="text-xs text-ink-500">
                      O cliente verá esta atualização imediatamente na página pública de rastreio e por SMS/WhatsApp.
                    </p>
                  </div>

                  {/* Atalhos com Eventos Pré-Configurados Típicos de Angola */}
                  <div>
                    <span className="text-[11px] font-semibold text-ink-500 block mb-1.5">
                      Modelos de eventos frequentes (1 clique para preencher):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {PRESET_EVENTS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setEventTitle(preset.title);
                            setEventDesc(preset.desc);
                            setEventStatus(preset.status);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-ink-100 hover:bg-ink-200 text-[11px] font-medium text-ink-800 transition"
                        >
                          {preset.title.split("(")[0]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-ink-700 mb-1">
                        Título do Evento *
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Mercadoria desalfandegada no Aeroporto 4 de Fevereiro"
                        value={eventTitle}
                        onChange={(e) => setEventTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-ink-200 text-xs font-medium focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink-700 mb-1">
                        Descrição / Detalhes para o Cliente (Opcional)
                      </label>
                      <textarea
                        rows={2}
                        placeholder="Ex: A carga chegou a Luanda e está a ser conferida..."
                        value={eventDesc}
                        onChange={(e) => setEventDesc(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-ink-200 text-xs focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <Button
                      size="sm"
                      onClick={() =>
                        handleInterventionSubmit("ADD_TRACKING_EVENT", {
                          eventTitle,
                          eventDescription: eventDesc,
                          eventStatus,
                        })
                      }
                      disabled={loading || !eventTitle.trim()}
                      className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs"
                    >
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Send className="w-3.5 h-3.5 mr-1.5" />}
                      Publicar Evento no Rastreio Agora
                    </Button>
                  </div>
                </Card>
              )}

              {/* Conteúdo da Aba 2: Códigos de Envio */}
              {activeTab === "tracking" && (
                <Card className="p-5 rounded-2xl border border-ink-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-ink-900">
                    Atribuir Códigos de Rastreio (SHEIN & Local)
                  </h3>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-ink-700 mb-1">
                        Código de Rastreio Internacional (SHEIN / Courier Aéreo)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: SHEIN-AOA-982143 ou YT2409812..."
                        value={intTracking}
                        onChange={(e) => setIntTracking(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-ink-200 font-mono text-xs focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink-700 mb-1">
                        Transportadora / Companhia
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: SHEIN Express, DHL, Correios de Angola..."
                        value={carrier}
                        onChange={(e) => setCarrier(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-ink-200 text-xs focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-ink-700 mb-1">
                        Código de Rastreio Local (Luanda / Províncias)
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: MOTO-BOY-04 / KILAMBA-01"
                        value={locTracking}
                        onChange={(e) => setLocTracking(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-ink-200 font-mono text-xs focus:ring-2 focus:ring-brand-500"
                      />
                    </div>

                    <Button
                      size="sm"
                      onClick={() =>
                        handleInterventionSubmit("UPDATE_SHIPMENT_TRACKING", {
                          internationalTracking: intTracking,
                          localTracking: locTracking,
                          carrier,
                        })
                      }
                      disabled={loading}
                      className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs"
                    >
                      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />}
                      Salvar Códigos de Rastreio
                    </Button>
                  </div>
                </Card>
              )}

              {/* Conteúdo da Aba 3: Corrigir Morada e Contactos */}
              {activeTab === "address" && (
                <Card className="p-5 rounded-2xl border border-ink-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-ink-900">
                    Intervenção de Morada e Contactos Telefónicos
                  </h3>
                  <p className="text-xs text-ink-500">
                    Se o cliente cometeu algum erro na morada ou no telefone, corrija aqui para que a equipa de estafetas consiga fazer a entrega.
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-ink-700 mb-1">
                        Telefone Principal
                      </label>
                      <input
                        type="text"
                        value={editPhone}
                        onChange={(e) => setEditPhone(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-ink-200 text-xs focus:ring-2 focus:ring-brand-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-ink-700 mb-1">
                        Bairro / Zona
                      </label>
                      <input
                        type="text"
                        value={editNeighborhood}
                        onChange={(e) => setEditNeighborhood(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-ink-200 text-xs focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-ink-700 mb-1">
                        Rua / Edifício / Casa
                      </label>
                      <input
                        type="text"
                        value={editStreet}
                        onChange={(e) => setEditStreet(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-ink-200 text-xs focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-ink-700 mb-1">
                        Ponto de Referência
                      </label>
                      <input
                        type="text"
                        value={editRefPoint}
                        onChange={(e) => setEditRefPoint(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-ink-200 text-xs focus:ring-2 focus:ring-brand-500"
                      />
                    </div>
                  </div>

                  <Button
                    size="sm"
                    onClick={() =>
                      handleInterventionSubmit("UPDATE_CUSTOMER_CONTACT_OR_ADDRESS", {
                        customerPhone: editPhone,
                        neighborhood: editNeighborhood,
                        street: editStreet,
                        referencePoint: editRefPoint,
                      })
                    }
                    disabled={loading}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <Edit3 className="w-3.5 h-3.5 mr-1.5" />}
                    Atualizar Morada & Contacto
                  </Button>
                </Card>
              )}

              {/* Conteúdo da Aba 4: Notas Internas */}
              {activeTab === "notes" && (
                <Card className="p-5 rounded-2xl border border-ink-200 shadow-sm space-y-4">
                  <h3 className="text-sm font-bold text-ink-900">
                    Notas Internas Confidenciais
                  </h3>
                  <p className="text-xs text-ink-500">
                    Visível apenas para si e para os administradores. O cliente nunca tem acesso a este campo.
                  </p>

                  <textarea
                    rows={4}
                    placeholder="Ex: Cliente tem pressa para o evento de sábado. Pedir prioridade ao motorista..."
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-ink-200 text-xs focus:ring-2 focus:ring-brand-500"
                  />

                  <Button
                    size="sm"
                    onClick={() =>
                      handleInterventionSubmit("SAVE_INTERNAL_NOTES", {
                        internalNotes,
                      })
                    }
                    disabled={loading}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs"
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" /> : <FileText className="w-3.5 h-3.5 mr-1.5" />}
                    Guardar Notas Internas
                  </Button>
                </Card>
              )}

              {/* Histórico da Linha do Tempo Atual */}
              <Card className="p-5 rounded-2xl border border-ink-200 shadow-sm bg-ink-50/50">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ink-600 mb-3">
                  Histórico de Rastreio Atual do Pedido
                </h4>
                <div className="space-y-3">
                  {selectedOrder.tracking.length === 0 ? (
                    <p className="text-xs text-ink-500">Ainda sem eventos de rastreio registados.</p>
                  ) : (
                    selectedOrder.tracking.map((t) => (
                      <div key={t.id} className="text-xs pb-2 border-b border-ink-200 last:border-0 last:pb-0">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-ink-900">{t.title}</span>
                          <span className="text-[10px] text-ink-400">{formatDateTime(t.eventDate)}</span>
                        </div>
                        {t.description && <p className="text-ink-600 mt-0.5">{t.description}</p>}
                      </div>
                    ))
                  )}
                </div>
              </Card>
            </div>
          ) : (
            <Card className="p-12 text-center text-ink-500 rounded-2xl border border-ink-200">
              Selecione uma encomenda à esquerda para abrir a consola de intervenção imediata.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
