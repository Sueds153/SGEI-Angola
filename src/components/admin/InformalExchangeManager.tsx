"use client";

import { useState } from "react";
import { Card, Input } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import {
  Banknote,
  TrendingUp,
  ShieldAlert,
  Calculator,
  History,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Zap,
} from "lucide-react";
import { formatKz, formatDateTime } from "@/lib/types";
import { formatNumber } from "@/lib/money";
import { useRouter } from "next/navigation";

interface InformalExchangeProps {
  initialUsd: number;
  initialEur: number;
  initialCny: number;
  initialBuffer: number;
  initialMode: string;
  updatedAt: string;
  historyLogs: any[];
}

const COMMON_INFORMAL_RATES = [1000, 1050, 1100, 1150, 1200, 1250, 1300];

export function InformalExchangeManager({
  initialUsd,
  initialEur,
  initialCny,
  initialBuffer,
  initialMode,
  updatedAt,
  historyLogs,
}: InformalExchangeProps) {
  const router = useRouter();

  const [usdRate, setUsdRate] = useState<number>(initialUsd);
  const [eurRate, setEurRate] = useState<number>(initialEur || Math.round(initialUsd * 1.09));
  const [cnyRate, setCnyRate] = useState<number>(initialCny || Math.round(initialUsd / 7.2));
  const [bufferPct, setBufferPct] = useState<number>(initialBuffer);
  const [exchangeMode, setExchangeMode] = useState<string>(initialMode || "INFORMAL_MANUAL");
  const [notes, setNotes] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Estado do Simulador de Teste Rápido
  const [simUsdProduct, setSimUsdProduct] = useState<number>(20);

  // Cálculos do simulador com a taxa atual
  const effectiveUsdRate = usdRate * (1 + bufferPct / 100);
  const convertedProductKz = Math.round(simUsdProduct * effectiveUsdRate);
  // Simulação típica: taxa 12% (mín 1.500) + logística consolidada (~8.000 Kz = ~8.7 USD) + alfândega 5% (mín 500) + entrega local (1.000)
  const serviceFeeKz = Math.max(1500, Math.round(convertedProductKz * 0.12));
  const logisticsKz = 8000; // base consolidada
  const cifBaseKz = convertedProductKz + logisticsKz;
  const customsKz = Math.max(500, Math.round(cifBaseKz * 0.05));
  const deliveryKz = 1000;
  const finalPriceKz = convertedProductKz + serviceFeeKz + logisticsKz + customsKz + deliveryKz;
  const estimatedProfitKz = serviceFeeKz + logisticsKz + customsKz + deliveryKz - Math.round(finalPriceKz * 0.62);

  const handleSelectPresetRate = (rate: number) => {
    setUsdRate(rate);
    setEurRate(Math.round(rate * 1.09));
    setCnyRate(Math.round(rate / 7.2));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/cambio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exchangeRateUsdToAoa: Number(usdRate),
          exchangeRateEurToAoa: Number(eurRate),
          exchangeRateCnyToAoa: Number(cnyRate),
          currencyBufferPct: Number(bufferPct),
          exchangeMode,
          notes: notes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar taxa de câmbio.");

      setSuccessMsg(data.message || "Câmbio atualizado com sucesso!");
      router.refresh();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900">
            Câmbio & Mercado Informal (Angola)
          </h1>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Modo Rua / Kinguilas
          </span>
        </div>
        <p className="mt-1 text-sm text-ink-500">
          Defina diretamente a cotação real da rua para conversão de produtos da SHEIN (USD) para Kwanzas (Kz). Todos os simuladores e pedidos respeitam esta taxa em tempo real.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-sm font-semibold text-emerald-800 flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-sm font-semibold text-red-800 flex items-center gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Edição Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 md:p-8 rounded-3xl border border-ink-200/80 shadow-sm">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Cotação USD Principal em Grande Destaque */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-ink-700 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    Cotação Informal Principal: 1 USD em Kwanzas (Kz) *
                  </label>
                  <span className="text-xs text-ink-500">
                    Última alteração: {formatDateTime(updatedAt)}
                  </span>
                </div>

                <div className="relative">
                  <input
                    type="number"
                    step="1"
                    required
                    value={usdRate}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      setUsdRate(val);
                      setEurRate(Math.round(val * 1.09));
                      setCnyRate(Math.round(val / 7.2));
                    }}
                    className="w-full text-3xl font-extrabold px-4 py-3.5 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/20 text-ink-900 focus:outline-none focus:ring-4 focus:ring-emerald-500/20 tabular-nums"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-xl">
                    Kz por $1 USD
                  </div>
                </div>

                {/* Botões de Atalho com Taxas Comuns da Rua */}
                <div className="mt-3">
                  <p className="text-xs font-medium text-ink-500 mb-1.5">
                    Atalhos rápidos de cotação da rua:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_INFORMAL_RATES.map((rate) => (
                      <button
                        type="button"
                        key={rate}
                        onClick={() => handleSelectPresetRate(rate)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                          usdRate === rate
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-ink-100 text-ink-700 hover:bg-ink-200"
                        }`}
                      >
                        {rate} Kz
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Margem de Segurança / Buffer Cambial */}
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  <label className="text-xs font-bold uppercase tracking-wider text-amber-900">
                    Margem de Proteção Cambial (Buffer Anti-Oscilação)
                  </label>
                </div>
                <p className="text-xs text-amber-800/80 mb-3">
                  Protege a sua margem de lucro se a kinguila subir entre o momento do pedido e a compra no cartão internacional.
                </p>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="15"
                    step="0.5"
                    value={bufferPct}
                    onChange={(e) => setBufferPct(Number(e.target.value))}
                    className="flex-1 accent-amber-600"
                  />
                  <span className="text-sm font-extrabold text-amber-950 bg-amber-200 px-3 py-1 rounded-xl tabular-nums min-w-[65px] text-center">
                    +{bufferPct}%
                  </span>
                </div>
                <p className="text-[11px] text-amber-800 mt-2 font-medium">
                  Taxa efetiva aplicada ao simulador do cliente:{" "}
                  <strong>{formatNumber(Math.round(effectiveUsdRate))} Kz / USD</strong>
                </p>
              </div>

              {/* Moedas Secundárias: EUR e CNY */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600 mb-1">
                    Câmbio 1 EUR → Kz
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={eurRate}
                    onChange={(e) => setEurRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-white text-sm font-bold text-ink-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600 mb-1">
                    Câmbio 1 CNY (Yuan) → Kz
                  </label>
                  <input
                    type="number"
                    step="1"
                    value={cnyRate}
                    onChange={(e) => setCnyRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-white text-sm font-bold text-ink-900"
                  />
                </div>
              </div>

              {/* Notas da Alteração */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-600 mb-1">
                  Motivo da Atualização (Opcional - registado em auditoria)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Cotação no São Paulo / Mutamba subiu hoje de manhã..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-ink-200 bg-white text-sm text-ink-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-ink-500">
                  Os pedidos já concluídos no passado mantêm o câmbio original congelado.
                </span>
                <Button
                  type="submit"
                  size="lg"
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm px-6 shadow-sm"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                  )}
                  {loading ? "A Guardar..." : "Salvar Câmbio Imediatamente"}
                </Button>
              </div>
            </form>
          </Card>

          {/* Histórico Recente de Mudanças de Câmbio */}
          <Card className="p-6 rounded-2xl border border-ink-200/80 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-ink-600" />
              <h3 className="text-sm font-bold text-ink-900 uppercase tracking-wider">
                Histórico de Cotações da Rua (Auditoria)
              </h3>
            </div>

            <div className="space-y-3">
              {historyLogs.length === 0 ? (
                <p className="text-xs text-ink-500 py-2">Nenhuma alteração manual registada ainda.</p>
              ) : (
                historyLogs.map((log) => {
                  const val = log.newValue || {};
                  return (
                    <div
                      key={log.id}
                      className="p-3 rounded-xl bg-ink-50 border border-ink-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-extrabold text-ink-900 text-sm">
                          1 USD = {val.usdToAoa} Kz
                        </span>
                        {val.bufferPct ? (
                          <span className="text-amber-700 font-semibold ml-2">
                            (+{val.bufferPct}% buffer)
                          </span>
                        ) : null}
                        <p className="text-[11px] text-ink-500 mt-0.5">
                          {val.notes || "Atualização de rotina"}
                        </p>
                      </div>
                      <div className="text-right text-ink-400">
                        <div>{formatDateTime(log.createdAt)}</div>
                        <div className="text-[10px]">{log.actorEmail || "Admin"}</div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        {/* Coluna 3: Simulador de Rentabilidade ao Vivo */}
        <div className="space-y-6">
          <Card className="p-6 rounded-3xl border-2 border-brand-500/20 bg-brand-50/20 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-5 h-5 text-brand-600" />
              <h3 className="font-bold text-ink-900 text-base">Simulador de Lucro ao Vivo</h3>
            </div>
            <p className="text-xs text-ink-600 mb-4">
              Teste um valor qualquer de um produto da SHEIN para ver exatamente quanto o cliente pagará e o seu lucro com a cotação informal definida.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-ink-700 mb-1">
                  Preço do Artigo na SHEIN ($ USD)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={simUsdProduct}
                    onChange={(e) => setSimUsdProduct(Math.max(1, Number(e.target.value)))}
                    className="w-full text-xl font-bold px-3 py-2 rounded-xl border border-ink-300 bg-white text-ink-900 tabular-nums focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                  <span className="text-sm font-bold text-ink-500">USD</span>
                </div>
              </div>

              {/* Botões rápidos de exemplo na SHEIN */}
              <div className="flex gap-1.5 flex-wrap">
                {[5, 12, 25, 40, 80].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setSimUsdProduct(v)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                      simUsdProduct === v
                        ? "bg-brand-600 text-white"
                        : "bg-white border border-ink-200 text-ink-700 hover:bg-ink-100"
                    }`}
                  >
                    ${v}
                  </button>
                ))}
              </div>

              {/* Detalhamento de Cálculo */}
              <div className="p-4 rounded-2xl bg-white border border-ink-200/80 space-y-2 text-xs">
                <div className="flex justify-between text-ink-600">
                  <span>Custo convertido (${simUsdProduct} × {Math.round(effectiveUsdRate)} Kz):</span>
                  <span className="font-semibold text-ink-900">{formatKz(convertedProductKz * 100)}</span>
                </div>
                <div className="flex justify-between text-ink-600">
                  <span>Taxa de serviço ImportEasy (12%):</span>
                  <span className="font-semibold text-brand-700">+{formatKz(serviceFeeKz * 100)}</span>
                </div>
                <div className="flex justify-between text-ink-600">
                  <span>Frete Internacional & Local:</span>
                  <span className="font-semibold text-ink-900">+{formatKz(logisticsKz * 100)}</span>
                </div>

                <div className="pt-2 border-t border-ink-100 flex justify-between items-baseline">
                  <span className="font-bold text-ink-900 text-sm">Preço Final ao Cliente:</span>
                  <span className="font-extrabold text-base text-brand-700 tabular-nums">
                    {formatKz(finalPriceKz * 100)}
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 mt-2 flex justify-between items-center text-xs">
                  <span className="font-bold text-emerald-900 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Lucro Líquido Estimado:
                  </span>
                  <span className="font-extrabold text-emerald-800 text-sm">
                    {formatKz(estimatedProfitKz * 100)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
