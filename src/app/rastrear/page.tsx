"use client";

import { useState } from "react";
import { Search, Truck, Package, CheckCircle, Clock, AlertCircle, MapPin, User, Clock as ClockIcon, Calendar } from "lucide-react";

const ORDER_STATUSES = [
  { key: "PENDING_PAYMENT", label: "Pagamento pendente", icon: Clock, color: "text-yellow-600 bg-yellow-100" },
  { key: "PAID", label: "Pago", icon: CheckCircle, color: "text-blue-600 bg-blue-100" },
  { key: "PURCHASED", label: "Comprado", icon: Package, color: "text-purple-600 bg-purple-100" },
  { key: "PREPARING_SHIPMENT", label: "A preparar envio", icon: Truck, color: "text-orange-600 bg-orange-100" },
  { key: "IN_TRANSIT", label: "Em trânsito", icon: Truck, color: "text-brand-600 bg-brand-100" },
  { key: "ARRIVED_IN_ANGOLA", label: "Chegou a Angola", icon: MapPin, color: "text-green-600 bg-green-100" },
  { key: "OUT_FOR_DELIVERY", label: "Saiu para entrega", icon: Truck, color: "text-brand-600 bg-brand-100" },
  { key: "DELIVERED", label: "Entregue", icon: CheckCircle, color: "text-green-600 bg-green-100" },
];

const MOCK_ORDERS: Record<string, any> = {
  "SG-14023": {
    reference: "SG-14023",
    status: "DELIVERED",
    items: [{ name: "Vestido Floral Midi - Shein", qty: 1, price: 18500 }],
    total: 2280000,
    createdAt: "2024-11-10",
    tracking: {
      international: "SF-INT-DEMO",
      carrier: "DHL / Entrega Local",
      events: [
        { status: "PENDING_PAYMENT", title: "Pedido recebido", desc: "O seu pedido foi registado na plataforma.", date: "2024-10-20" },
        { status: "PAID", title: "Pagamento confirmado", desc: "Confirmámos o recebimento do pagamento.", date: "2024-10-21" },
        { status: "PURCHASED", title: "Compra realizada", desc: "O produto foi comprado ao fornecedor.", date: "2024-10-23" },
        { status: "PREPARING_SHIPMENT", title: "Envio em preparação", desc: "O pedido está a ser preparado para envio.", date: "2024-10-25" },
        { status: "IN_TRANSIT", title: "Em trânsito", desc: "O pedido está a caminho de Angola.", date: "2024-10-30" },
        { status: "ARRIVED_IN_ANGOLA", title: "Chegou a Angola", desc: "O seu pedido já se encontra em Angola.", date: "2024-11-05" },
        { status: "OUT_FOR_DELIVERY", title: "Saiu para entrega", desc: "O pedido está com o estafeta.", date: "2024-11-07" },
        { status: "DELIVERED", title: "Entregue", desc: "O pedido foi entregue com sucesso.", date: "2024-11-08" },
      ],
    },
  },
  "SG-14102": {
    reference: "SG-14102",
    status: "IN_TRANSIT",
    items: [{ name: "Ténis Nike Air Max - AliExpress", qty: 1, price: 35000 }],
    total: 3630000,
    createdAt: "2024-11-15",
    tracking: {
      international: "AE-INT-14102",
      carrier: "AliExpress Standard / DHL",
      events: [
        { status: "PENDING_PAYMENT", title: "Pedido recebido", desc: "O seu pedido foi registado na plataforma.", date: "2024-11-05" },
        { status: "PAID", title: "Pagamento confirmado", desc: "Confirmámos o recebimento do pagamento.", date: "2024-11-06" },
        { status: "PURCHASED", title: "Compra realizada", desc: "O produto foi comprado ao fornecedor.", date: "2024-11-08" },
        { status: "PREPARING_SHIPMENT", title: "Envio em preparação", desc: "O pedido está a ser preparado para envio.", date: "2024-11-10" },
        { status: "IN_TRANSIT", title: "Em trânsito", desc: "O pedido está a caminho de Angola.", date: "2024-11-15" },
      ],
    },
  },
};

export default function RastrearPage() {
  const [reference, setReference] = useState("");
  const [order, setOrder] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOrder(null);
    setLoading(true);

    // Simular busca
    await new Promise((r) => setTimeout(r, 800));

    const found = MOCK_ORDERS[reference.toUpperCase()];
    if (found) {
      setOrder(found);
    } else {
      setError("Pedido não encontrado. Verifique o código (ex: SG-14023).");
    }
    setLoading(false);
  };

  const getStatusInfo = (statusKey: string) => {
    return ORDER_STATUSES.find(s => s.key === statusKey) || 
      { label: statusKey, icon: Package, color: "text-ink-600 bg-ink-100" };
  };

  const currentStatusIndex = order 
    ? ORDER_STATUSES.findIndex(s => s.key === order.status) 
    : -1;

  return (
    <div className="min-h-screen bg-ink-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-ink-900 mb-2">Rastrear o seu pedido</h1>
          <p className="text-ink-600">
            Insira o código do pedido (ex: SG-14023) para ver o status e a entrega.
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" />
            <input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value.toUpperCase())}
              placeholder="SG-14023"
              className="w-full pl-12 pr-4 py-4 border border-ink-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent text-ink-900 placeholder-ink-400 text-center text-lg font-mono tracking-wider uppercase"
              required
            />
          </div>
          <div className="mt-4 text-center">
            <button
              type="submit"
              disabled={loading || !reference}
              className="px-8 py-3 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 disabled:opacity-50 transition flex items-center justify-center gap-2 mx-auto"
            >
              {loading ? "A buscar..." : "Rastrear Pedido"}
            </button>
          </div>
        </form>

        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 max-w-md mx-auto" role="alert">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Order Details */}
        {order && (
          <div className="space-y-8 animate-fade-in">
            {/* Order Header */}
            <div className="bg-white rounded-2xl border border-ink-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-ink-900">Pedido {order.reference}</h2>
                  <p className="text-sm text-ink-500">Criado em {new Date(order.createdAt).toLocaleDateString("pt-AO")}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`px-4 py-2 rounded-xl ${getStatusInfo(order.status).color} font-semibold text-sm`}>
                    {getStatusInfo(order.status).label}
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="border-t border-ink-200 pt-4">
                <h3 className="font-medium text-ink-900 mb-3">Itens do pedido</h3>
                <div className="space-y-2">
                  {order.items.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-ink-100 flex items-center justify-center">
                          <Package className="w-5 h-5 text-ink-500" />
                        </div>
                        <div>
                          <p className="font-medium text-ink-900">{item.name}</p>
                          <p className="text-sm text-ink-500">Qtd: {item.qty}</p>
                        </div>
                      </div>
                      <span className="font-semibold text-ink-900">
                        {new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA", minimumFractionDigits: 0 }).format(item.price)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-ink-200 flex justify-end">
                  <span className="text-lg font-bold text-ink-900">
                    Total: {new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA", minimumFractionDigits: 0 }).format(order.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Tracking Timeline */}
            <div className="bg-white rounded-2xl border border-ink-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-ink-900 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-brand-600" />
                  Rastreamento
                </h2>
                <div className="text-sm text-ink-600">
                  Código: <span className="font-mono font-medium text-brand-600">{order.tracking.international}</span>
                </div>
              </div>

              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-ink-200" aria-hidden="true" />

                <div className="space-y-6">
                  {order.tracking.events.map((event: any, index: number) => {
                    const statusInfo = getStatusInfo(event.status);
                    const Icon = statusInfo.icon;
                    const isCurrent = ORDER_STATUSES.findIndex(s => s.key === event.status) === currentStatusIndex;
                    const isCompleted = ORDER_STATUSES.findIndex(s => s.key === event.status) <= currentStatusIndex;

                    return (
                      <div key={index} className="relative flex gap-4">
                        {/* Dot & Line */}
                        <div className="relative flex-shrink-0 w-12 h-12 flex items-center justify-center">
                          <div className={`w-4 h-4 rounded-full border-3 flex items-center justify-center ${
                            isCompleted 
                              ? statusInfo.color.replace("bg-", "border-").replace("text-", "bg-") 
                              : "border-ink-200 bg-white"
                          } ${isCurrent ? "ring-4 ring-brand-500/20" : ""}`}>
                            {isCompleted && <Icon className="w-3 h-3 text-white" />}
                          </div>
                        </div>

                        {/* Content */}
                        <div className={`flex-1 pb-6 ${isCurrent ? "relative" : ""}`}>
                          <div className="flex items-start gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className={`font-semibold ${isCompleted ? "text-ink-900" : "text-ink-500"}`}>
                                  {statusInfo.label}
                                </h3>
                                {isCurrent && (
                                  <span className="px-2 py-0.5 text-xs font-medium bg-brand-100 text-brand-700 rounded-full">
                                    Atual
                                  </span>
                                )}
                              </div>
                              <p className={isCompleted ? "text-ink-600" : "text-ink-400"}>{event.desc}</p>
                              <p className="text-xs text-ink-400 mt-1">
                                <Calendar className="w-3 h-3 inline" /> {new Date(event.date).toLocaleDateString("pt-AO", { day: "2-digit", month: "long", year: "numeric" })}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Carrier Info */}
              <div className="mt-8 p-4 bg-ink-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Truck className="w-6 h-6 text-brand-600" />
                  <div>
                    <p className="font-medium text-ink-900">Transportadora</p>
                    <p className="text-sm text-ink-600">{order.tracking.carrier}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="flex-1 py-3 px-6 border-2 border-brand-600 text-brand-600 font-semibold rounded-xl hover:bg-brand-50 transition">
                Copiar código de rastreio
              </button>
              <a
                href="https://wa.me/244922058136"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-3 px-6 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition text-center"
              >
                Falar com suporte
              </a>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-16 grid md:grid-cols-3 gap-6">
          <HelpCard icon={User} title="Não tem o código?" desc="Verifique o seu email ou WhatsApp. O código segue o formato SG-XXXXX." />
          <HelpCard icon={ClockIcon} title="Prazo de entrega" desc="Entregas em 15-25 dias úteis. O rastreio atualiza a cada etapa." />
          <HelpCard icon={MapPin} title="Entrega na morada" desc="O estafeta contacta antes da entrega. Certifique-se que está disponível." />
        </div>
      </div>
    </div>
  );
}

function HelpCard({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-xl border border-ink-200 p-6 text-center hover:border-brand-200 hover:shadow-md transition">
      <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-brand-100 flex items-center justify-center">
        <Icon className="w-6 h-6 text-brand-600" />
      </div>
      <h3 className="font-semibold text-ink-900 mb-1">{title}</h3>
      <p className="text-sm text-ink-600">{desc}</p>
    </div>
  );
}