"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  Link as LinkIcon, 
  ShieldCheck, 
  Clock, 
  Calculator, 
  ArrowRight, 
  ShoppingBag, 
  Sparkles, 
  Share2, 
  Clipboard, 
  Check, 
  MessageCircle,
  ExternalLink
} from "lucide-react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { formatKzAmount, formatForeign as formatForeignMoney } from "@/lib/money";

interface SimulationResult {
  success: boolean;
  status: "found" | "needs_price" | "unsupported";
  platform: string;
  productId?: string;
  title: string;
  price?: number;
  currency: string;
  images: string[];
  defaultImage?: string;
  sourceUrl: string;
  estimatedTotalAOA?: number;
  exchangeRate?: number;
  serviceFee?: number;
  logisticsFee?: number;
  deliveryFee?: number;
  estimatedDays?: number;
  error?: string;
}

const PLATFORMS = [
  { name: "SHEIN", color: "bg-pink-50 text-pink-700 border-pink-200" },
  { name: "AliExpress", color: "bg-orange-50 text-orange-700 border-orange-200" },
  { name: "Zara", color: "bg-neutral-100 text-neutral-800 border-neutral-200" },
  { name: "Vinted", color: "bg-brand-50 text-brand-700 border-brand-200" },
  { name: "Amazon", color: "bg-amber-50 text-amber-800 border-amber-200" },
];

export default function ImportarPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-ink-50 grid place-items-center"><Loader2 className="w-8 h-8 animate-spin text-brand-600" /></div>}>
      <ImportarContent />
    </Suspense>
  );
}

function ImportarContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const resolveUrl = useCallback(async (targetUrl: string) => {
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch("/api/products/resolve-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Não foi possível identificar o artigo. Verifique o link e tente novamente.");
      }

      setResult({
        success: true,
        status: data.status || "found",
        platform: data.platform || "Loja Internacional",
        productId: data.productId,
        title: data.title || "Artigo Internacional",
        price: data.price,
        currency: data.currency || "USD",
        images: Array.isArray(data.images) ? data.images : [],
        defaultImage: data.defaultImage || (data.images?.[0] || undefined),
        sourceUrl: data.sourceUrl || targetUrl,
        estimatedTotalAOA: data.estimatedTotalAOA,
        exchangeRate: data.exchangeRate || 920,
        serviceFee: data.serviceFee,
        logisticsFee: data.logisticsFee,
        deliveryFee: data.deliveryFee,
        estimatedDays: data.estimatedDays || 18,
      });
    } catch (err: any) {
      setError(err instanceof Error ? err.message : "Erro ao processar o link. Verifique e tente novamente.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Lê parâmetro url da rota se vier do Hero
  useEffect(() => {
    const initialUrl = searchParams.get("url");
    if (initialUrl && !url) {
      setUrl(initialUrl);
      void resolveUrl(initialUrl);
    }
  }, [searchParams, url, resolveUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    resolveUrl(url.trim());
  };

  const handlePaste = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setUrl(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }
    } catch {
      // Ignorar caso navegador bloqueie
    }
  };

  const handleNewSimulation = () => {
    setUrl("");
    setResult(null);
    setError(null);
  };

  return (
    <div className="py-6 sm:py-12 bg-ink-50/50 min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Cabeçalho */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-3 border border-brand-200">
            <ShieldCheck className="w-3.5 h-3.5 text-brand-600" />
            <span>Simulador Oficial ImportEasy</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-ink-950 tracking-tight">
            Simula a tua Importação
          </h1>
          <p className="text-xs sm:text-sm text-ink-600 max-w-lg mx-auto mt-2 leading-relaxed">
            Cola o link de qualquer artigo da SHEIN, AliExpress, Zara ou Vinted para calcular o valor total em Kwanzas.
          </p>
        </div>

        {/* Lojas Suportadas */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 mb-5">
          <span className="text-xs text-ink-500 font-medium mr-1">Compatível com:</span>
          {PLATFORMS.map((p) => (
            <span key={p.name} className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${p.color}`}>
              {p.name}
            </span>
          ))}
        </div>

        {/* Formulário de Importação */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md shadow-brand-950/5 border border-ink-200/80 mb-6">
          <form onSubmit={handleSubmit} className="space-y-3">
            <label htmlFor="import-url" className="block text-xs sm:text-sm font-bold text-ink-900">
              Link do artigo na loja internacional
            </label>
            <div className="relative flex items-center bg-ink-50 rounded-xl sm:rounded-2xl border border-ink-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/10 focus-within:bg-white transition-all">
              <input
                id="import-url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Ex: https://shein.com/... ou https://aliexpress.com/..."
                className="w-full py-3.5 pl-3.5 pr-20 bg-transparent text-sm sm:text-base text-ink-900 placeholder:text-ink-400 outline-none"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={handlePaste}
                className="absolute right-2 px-2.5 py-1.5 rounded-lg bg-white border border-ink-200 text-ink-700 text-xs font-semibold hover:bg-ink-100 flex items-center gap-1 active:scale-95 transition"
                title="Colar da área de transferência"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clipboard className="w-3.5 h-3.5 text-ink-500" />}
                <span>{copied ? "Colado!" : "Colar"}</span>
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="w-full py-3.5 px-6 rounded-xl sm:rounded-2xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition active:scale-[0.99] cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>A analisar link e calcular preço em Kwanzas...</span>
                </>
              ) : (
                <>
                  <Calculator className="w-4 h-4" />
                  <span>Calcular Preço em Kwanzas</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3 text-red-700 text-xs sm:text-sm animate-fade-in" role="alert">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{error}</p>
              <p className="mt-1 text-red-600 text-xs">
                Dica: Certifique-se de que copiou o link completo da barra de endereços ou do botão de partilha da aplicação.
              </p>
            </div>
          </div>
        )}

        {/* Card do Resultado da Simulação */}
        {result && (
          <div className="mb-8 animate-fade-in">
            <SimulationResultCard
              result={result}
              onNewSimulation={handleNewSimulation}
            />
          </div>
        )}

        {/* 3 Garantias Rápidas */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className="bg-white p-4 rounded-2xl border border-ink-200/80 shadow-xs">
            <ShieldCheck className="w-5 h-5 text-brand-600 mx-auto mb-1.5" />
            <h2 className="text-xs font-bold text-ink-950">Preço Confirmado</h2>
            <p className="text-[11px] text-ink-500 mt-0.5">Sem custos ocultos de alfândega.</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-ink-200/80 shadow-xs">
            <Clock className="w-5 h-5 text-emerald-600 mx-auto mb-1.5" />
            <h2 className="text-xs font-bold text-ink-950">Envio Semanal</h2>
            <p className="text-[11px] text-ink-500 mt-0.5">Carga aérea direta para Luanda.</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-ink-200/80 shadow-xs">
            <MessageCircle className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
            <h2 className="text-xs font-bold text-ink-950">Apoio no WhatsApp</h2>
            <p className="text-[11px] text-ink-500 mt-0.5">Atendimento humano oficial.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SimulationResultCard({
  result,
  onNewSimulation,
}: {
  result: SimulationResult;
  onNewSimulation: () => void;
}) {
  const { addItem } = useCart();
  const [customPrice, setCustomPrice] = useState<number>(result.price || 15);

  const activePrice = result.price && result.price > 0 ? result.price : customPrice;
  const currency = result.currency || "USD";
  const exchangeRate = result.exchangeRate || 920;

  // Cálculo cambial transparente em Kwanzas
  const convertedKz = Math.round(activePrice * exchangeRate);
  const serviceFeeKz = Math.max(1500, Math.round(convertedKz * 0.12));
  const logisticsFeeKz = 2500;
  const deliveryFeeKz = 1000;
  const totalAOA = convertedKz + serviceFeeKz + logisticsFeeKz + deliveryFeeKz;

  const formatAOA = (val: number) => formatKzAmount(val);

  const formatForeign = (val: number, cur: string) => formatForeignMoney(val, cur);

  const checkoutUrl = `/checkout?externalUrl=${encodeURIComponent(result.sourceUrl)}&productName=${encodeURIComponent(result.title)}&externalPriceUsd=${activePrice}&productCurrency=${currency}`;

  const handleAddToCart = () => {
    addItem({
      title: result.title,
      priceUsd: activePrice,
      priceKz: totalAOA,
      image: result.images?.[0] || result.defaultImage,
      platform: result.platform,
      sourceUrl: result.sourceUrl,
      quantity: 1,
    });
  };

  return (
    <div className="bg-white rounded-2xl sm:rounded-3xl border-2 border-brand-200 shadow-xl overflow-hidden">
      {/* Topo do Card */}
      <div className="bg-brand-600 text-white p-4 sm:p-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <div>
            <h2 className="text-base sm:text-lg font-bold leading-tight">Simulação Concluída</h2>
            <p className="text-brand-100 text-xs">Loja: {result.platform}</p>
          </div>
        </div>
        <button
          onClick={onNewSimulation}
          className="text-xs font-semibold px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white transition active:scale-95"
        >
          Novo Link
        </button>
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        {/* Foto e Título */}
        <div className="flex gap-3.5 items-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl sm:rounded-2xl bg-ink-100 shrink-0 overflow-hidden border border-ink-200 relative">
            {result.images?.[0] || result.defaultImage ? (
              <ResponsiveImage
                src={result.images?.[0] || result.defaultImage!}
                alt={result.title}
                fill
                className="object-cover"
                fallbackText={result.platform}
              />
            ) : (
              <div className="w-full h-full grid place-items-center text-ink-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-brand-600 uppercase tracking-wider bg-brand-50 px-2 py-0.5 rounded-md">
              {result.platform}
            </span>
            <h2 className="font-bold text-ink-900 text-sm sm:text-base leading-snug line-clamp-2 mt-1">
              {result.title}
            </h2>
            <a
              href={result.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] text-ink-500 hover:text-brand-600 flex items-center gap-1 mt-1 truncate"
            >
              <span>Ver na loja oficial</span>
              <ExternalLink className="w-3 h-3 shrink-0" />
            </a>
          </div>
        </div>

        {/* Ajuste de Preço Manual Caso a Loja não tenha exposto o valor */}
        {result.status === "needs_price" && (
          <div className="p-3.5 bg-amber-50/80 rounded-xl border border-amber-200 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <Calculator className="w-4 h-4 text-amber-700" />
              <span>Indique o preço que visualiza no ecrã da {result.platform}:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-ink-700">{currency === "EUR" ? "€" : "$"}</span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={customPrice}
                onChange={(e) => setCustomPrice(Math.max(1, parseFloat(e.target.value) || 1))}
                className="w-32 px-3 py-1.5 rounded-lg border border-amber-300 bg-white text-base font-bold text-ink-950 outline-none focus:ring-2 focus:ring-amber-500"
              />
              <span className="text-ink-500 text-[11px]">Calculado instantaneamente abaixo</span>
            </div>
          </div>
        )}

        {/* Tabela de Valores Transparente */}
        <div className="bg-brand-50/40 rounded-xl sm:rounded-2xl p-4 border border-brand-100 space-y-2.5 text-xs sm:text-sm">
          <div className="flex justify-between text-ink-700">
            <span>Preço do artigo ({currency})</span>
            <span className="font-semibold text-ink-950">{formatForeign(activePrice, currency)}</span>
          </div>
          <div className="flex justify-between text-ink-700">
            <span>Conversão cambial (1 {currency} ≈ {exchangeRate} Kz)</span>
            <span className="font-semibold text-ink-950">{formatAOA(convertedKz)}</span>
          </div>
          <div className="flex justify-between text-ink-700">
            <span>Taxa de serviço e gestão</span>
            <span className="font-medium text-ink-950">{formatAOA(serviceFeeKz)}</span>
          </div>
          <div className="flex justify-between text-ink-700">
            <span>Frete aéreo internacional e alfândega</span>
            <span className="font-medium text-ink-950">{formatAOA(logisticsFeeKz)}</span>
          </div>
          <div className="flex justify-between text-ink-700">
            <span>Entrega ao domicílio em Angola</span>
            <span className="font-medium text-ink-950">{formatAOA(deliveryFeeKz)}</span>
          </div>

          <div className="border-t border-brand-200/80 pt-2.5 flex justify-between items-baseline">
            <div>
              <span className="text-sm sm:text-base font-extrabold text-ink-950 block">Total Final em Kwanzas</span>
              <span className="text-[10px] text-ink-500">Tudo incluído até à sua porta</span>
            </div>
            <span className="text-lg sm:text-2xl font-black text-brand-600">
              {formatAOA(totalAOA)}
            </span>
          </div>
        </div>

        {/* Prazo */}
        <div className="flex items-center gap-2 text-xs text-ink-600 bg-ink-50 p-3 rounded-xl border border-ink-100">
          <Clock className="w-4 h-4 text-brand-600 shrink-0" />
          <span>Entrega estimada em <strong>15 a 25 dias úteis</strong> com código de rastreio.</span>
        </div>

        {/* Ações */}
        <div className="space-y-2.5 pt-2">
          {/* Adicionar à Mala Coletiva */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full py-3.5 px-5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm sm:text-base rounded-xl transition flex items-center justify-center gap-2 shadow-sm active:scale-[0.99] cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Adicionar ao Carrinho ({formatAOA(totalAOA)})</span>
          </button>

          {/* Encomendar Direto */}
          <Link
            href={checkoutUrl}
            className="w-full py-3 px-5 bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm rounded-xl transition flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <span>Avançar para Pagamento</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Suporte WhatsApp */}
          <a
            href={`https://wa.me/244922058136?text=${encodeURIComponent(
              `Olá ImportEasy! Gostaria de encomendar este artigo: "${result.title}" (${result.platform}). Valor: ${formatAOA(totalAOA)}. Link: ${result.sourceUrl}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            <span>Pedir Ajuda no WhatsApp (+244 922 058 136)</span>
          </a>
        </div>
      </div>
    </div>
  );
}
