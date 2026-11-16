"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle, Link as LinkIcon, Shield, Clock, Calculator, CheckCircle2, ArrowRight, ShoppingBag, Sparkles, Share2, MapPin, Truck, Building2 } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { useCart } from "@/context/CartContext";
import { SheinTutorialModal } from "@/components/importar/SheinTutorialModal";
import { SheinStepsVisual } from "@/components/importar/SheinStepsVisual";
import { FlightStatusBanner } from "@/components/home/FlightStatusBanner";
import { SmartDollarConverter } from "@/components/home/SmartDollarConverter";
import { CoverageBanner } from "@/components/home/CoverageBanner";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { useAdaptiveIntelligence } from "@/context/AdaptiveIntelligenceContext";

interface SimulationResult {
  success: boolean;
  platform?: string;
  productId?: string;
  title?: string;
  price?: number;
  currency?: string;
  images?: string[];
  originalPrice?: number;
  originalCurrency?: string;
  estimatedTotalAOA?: number;
  exchangeRate?: number;
  serviceFee?: number;
  logisticsFee?: number;
  deliveryFee?: number;
  estimatedDays?: number;
  sourceUrl?: string;
  error?: string;
}

const PLATFORMS = [
  { name: "Shein", icon: "Shein", color: "bg-pink-100 text-pink-700", domains: ["shein.com"] },
  { name: "AliExpress", icon: "AliExpress", color: "bg-orange-100 text-orange-700", domains: ["aliexpress.com", "pt.aliexpress.com"] },
  { name: "Vinted", icon: "Vinted", color: "bg-brand-100 text-brand-700", domains: ["vinted.com", "vinted.pt", "vinted.fr", "vinted.es"] },
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
  const { recordEvent } = useAdaptiveIntelligence();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const detectPlatform = (inputUrl: string) => {
    try {
      const hostname = new URL(inputUrl).hostname.replace("www.", "");
      return PLATFORMS.find(p => p.domains.some(d => hostname.includes(d))) || null;
    } catch {
      return null;
    }
  };

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

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar o link");
      }

      if (data.needs_confirmation) {
        setResult({
          success: true,
          platform: data.platform || "Shein/AliExpress",
          productId: data.productId,
          title: data.title || "Produto detectado",
          price: data.price,
          currency: data.currency,
          images: data.images,
          originalPrice: data.price,
          originalCurrency: data.currency,
          estimatedTotalAOA: data.estimatedTotalAOA,
          exchangeRate: data.exchangeRate,
          serviceFee: data.serviceFee,
          logisticsFee: data.logisticsFee,
          deliveryFee: data.deliveryFee,
          estimatedDays: data.estimatedDays,
          sourceUrl: targetUrl,
        });
      } else if (data.product) {
        setResult({
          ...data.product,
          sourceUrl: targetUrl,
        });
      } else {
        throw new Error("Não foi possível obter os dados do produto");
      }

      // Regista evento no motor de inteligência adaptativa (Aprendizagem da Máquina Multi-Plataforma)
      const simulatedPrice = data.price || data.product?.originalPriceUsd || 15;
      const detectedPlat = data.platform || (targetUrl.includes("vinted") ? "Vinted" : targetUrl.includes("aliexpress") ? "AliExpress" : "Shein");
      recordEvent("SIMULATE", { priceUsd: simulatedPrice, platform: detectedPlat });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido ao processar");
    } finally {
      setLoading(false);
    }
  }, [recordEvent]);

  // Lê parâmetro url da rota se vier do Hero
  useEffect(() => {
    const initialUrl = searchParams.get("url");
    if (initialUrl && !url) {
      const initialResolve = window.setTimeout(() => {
        setUrl(initialUrl);
        void resolveUrl(initialUrl);
      }, 0);
      return () => window.clearTimeout(initialResolve);
    }
  }, [searchParams, url, resolveUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    resolveUrl(url.trim());
  };

  const handleNewSimulation = () => {
    setUrl("");
    setResult(null);
    setError(null);
  };

  const platform = url ? detectPlatform(url) : null;

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Banner Dinâmico da Carga Aérea Semanal */}
      <FlightStatusBanner />

      {/* Header */}
      <header className="bg-white border-b border-ink-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <Logo size="md" />
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link href="/produtos" className="text-ink-600 hover:text-brand-600 transition">Produtos</Link>
              <Link href="/comunidade" className="text-ink-600 hover:text-brand-600 transition">Comunidade</Link>
              <Link href="/rastrear" className="text-ink-600 hover:text-brand-600 transition">Rastrear</Link>
              <a 
                href="https://wa.me/244922058136?text=Ol%C3%A1%20ImportEasy!" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="px-4 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 text-sm font-semibold transition"
              >
                WhatsApp (+244 922 058 136)
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-50 text-brand-700 text-xs font-semibold mb-4 border border-brand-100">
              <Shield className="w-3.5 h-3.5 text-emerald-600" />
              Preço Final Sem Surpresas Alfandegárias
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-ink-950 tracking-tight mb-4">
              Simule a sua <span className="text-brand-600">Importação</span>
            </h1>
            <p className="text-base sm:text-lg text-ink-600">
              Cole um link da Shein, AliExpress ou Vinted para obter uma estimativa em Kwanzas. A equipa confirma o produto e o valor total antes do pagamento.
            </p>
          </div>

          {/* Platform Selector / Detection */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              <span className="text-sm text-ink-500 font-medium">Lojas suportadas:</span>
              {PLATFORMS.map((p) => (
                <span key={p.name} className={`px-3.5 py-1 rounded-full text-xs font-semibold ${p.color} border border-black/5`}>
                  {p.name}
                </span>
              ))}
            </div>
            
            {platform && (
              <div className="text-center text-sm text-brand-600 font-semibold mb-4 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 inline mr-1 text-emerald-600" /> Detectado: <strong>{platform.name}</strong>
              </div>
            )}
          </div>

          {/* Mini-guia visual de 3 passos (Papa Feita) */}
          <SheinStepsVisual className="mb-8" />

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-ink-200 p-6 shadow-sm">
              <label htmlFor="product-url" className="block text-sm font-semibold text-ink-800 mb-3">
                Link do produto no fornecedor
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" aria-hidden="true" />
                <input
                  id="product-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Cole aqui: https://www.shein.com/... ou https://pt.aliexpress.com/..."
                  className="w-full pl-12 pr-4 py-4 border border-ink-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent text-ink-900 placeholder-ink-400 transition"
                  required
                  disabled={loading}
                />
              </div>
              <div className="mt-3.5 flex flex-col sm:flex-row items-center justify-between gap-2">
                <SheinTutorialModal />
                <p className="text-xs text-ink-500">
                  Ex: <code className="bg-ink-100 px-1.5 py-0.5 rounded text-ink-700">shein.com/...</code>
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !url}
              className="w-full py-4 px-6 bg-brand-600 text-white font-bold text-lg rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 active:scale-[0.99] cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  A calcular preço final em Kwanzas...
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5" />
                  Simular Importação Agora
                </>
              )}
            </button>
          </form>

          {/* Error */}
          {error && (
            <div className="max-w-2xl mx-auto mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700" role="alert">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="max-w-2xl mx-auto mt-8 animate-fade-in">
              <SimulationResultCard 
                result={result} 
                url={url}
                onNewSimulation={handleNewSimulation}
              />
            </div>
          )}

          {/* Conversor Dinâmico Dólar -> Kwanza (Câmbio Informal em Tempo Real) */}
          <div className="mt-14 max-w-4xl mx-auto">
            <SmartDollarConverter />
          </div>

          {/* Features */}
          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <FeatureCard 
              icon={Shield} 
              title="Preço Final Garantido" 
              desc="O valor simulado inclui: produto + conversão cambial + logística aérea + taxas alfandegárias + entrega em Angola. Sem cobranças surpresa." 
            />
            <FeatureCard 
              icon={Clock} 
              title="Prazos Realistas" 
              desc="Entrega estimada em 15–25 dias úteis. Acompanhamento completo no seu painel com atualizações no WhatsApp." 
            />
            <FeatureCard 
              icon={Calculator} 
              title="Pagamento em Kwanzas" 
              desc="Pague via Multicaixa Express (929 423 278) ou Pagamento por Referência (Entidade: 10116 / Ref: 929 423 278)." 
            />
          </div>

          {/* Cobertura de Entregas em Luanda & Províncias de Angola */}
          <div className="mt-14">
            <CoverageBanner />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-ink-900 text-ink-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-2">
          <p className="font-bold text-white text-lg">ImportEasy</p>
          <p className="text-sm">A sua ponte para o mundo. Shein, AliExpress e Vinted entregues em Angola.</p>
          <p className="text-xs text-ink-400">Suporte WhatsApp: +244 922 058 136 | Luanda, Angola</p>
        </div>
      </footer>
    </div>
  );
}

function SimulationResultCard({ 
  result, 
  url,
  onNewSimulation 
}: { 
  result: SimulationResult; 
  url: string;
  onNewSimulation: () => void 
}) {
  const { addItem } = useCart();
  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat("pt-AO", { style: "currency", currency }).format(value);
  };

  const formatAOA = (value: number) => {
    return new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA", minimumFractionDigits: 0 }).format(value);
  };

  const originalPrice = result.originalPrice || result.price || 0;
  const originalCurrency = result.originalCurrency || result.currency || "USD";
  const totalAOA = result.estimatedTotalAOA || 0;

  const checkoutUrl = `/checkout?externalUrl=${encodeURIComponent(url || result.sourceUrl || "")}&productName=${encodeURIComponent(result.title || "Produto Importado")}&externalId=${encodeURIComponent(result.productId || "")}`;

  const handleAddToCart = () => {
    addItem({
      title: result.title || "Artigo Importado",
      priceUsd: originalPrice,
      priceKz: totalAOA,
      image: result.images?.[0],
      platform: result.platform || "Shein",
      sourceUrl: url || result.sourceUrl,
      quantity: 1,
    });
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-brand-200 shadow-xl overflow-hidden">
      {/* Success Header */}
      <div className="bg-brand-600 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-7 h-7 text-emerald-300" />
          <div>
            <h2 className="text-xl font-bold">Simulação Concluída</h2>
            <p className="text-brand-100 text-xs">{result.platform} · {result.title?.substring(0, 45)}...</p>
          </div>
        </div>
        <button onClick={onNewSimulation} className="text-brand-100 hover:text-white text-xs font-semibold px-3 py-1 bg-white/10 rounded-lg transition">
          Nova simulação
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Product Info */}
        <div className="flex gap-4 items-center">
          <div className="w-20 h-20 rounded-xl bg-ink-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-ink-200">
            {result.images?.[0] ? (
              <ResponsiveImage
                src={result.images[0]}
                alt={result.title || "Produto"}
                fill
                className="object-cover"
                fallbackText={result.platform || "—" }
              />
            ) : (
              <LinkIcon className="w-8 h-8 text-ink-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-ink-900 text-base leading-snug line-clamp-2">{result.title}</h3>
            <p className="text-xs text-ink-500 mt-1">Plataforma: <strong>{result.platform}</strong></p>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-ink-100 pt-5 space-y-3">
          <h4 className="font-bold text-ink-900 text-sm">Decomposição Transparente do Preço</h4>
          
          <div className="bg-brand-50/70 rounded-xl p-4 space-y-2 border border-brand-100">
            <div className="flex justify-between text-sm">
              <span className="text-ink-600">Preço original no fornecedor</span>
              <span className="font-semibold text-ink-900">{formatCurrency(originalPrice, originalCurrency)}</span>
            </div>
            {result.exchangeRate && (
              <div className="flex justify-between text-sm">
                <span className="text-ink-600">Câmbio de conversão</span>
                <span className="font-medium text-ink-900">1 {originalCurrency} ≈ {result.exchangeRate?.toFixed(2)} Kz</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-ink-600">Taxa de intermediação & serviço</span>
              <span className="font-medium text-ink-900">{formatAOA(result.serviceFee || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-600">Transporte internacional & desalfandegamento</span>
              <span className="font-medium text-ink-900">{formatAOA(result.logisticsFee || 0)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-ink-600">Entrega ao domicílio em Angola</span>
              <span className="font-medium text-ink-900">{formatAOA(result.deliveryFee || 0)}</span>
            </div>
            <div className="border-t border-brand-200 pt-3 flex justify-between text-lg font-bold">
              <span className="text-ink-950">Total Final a Pagar</span>
              <span className="text-brand-600 text-xl font-extrabold">{formatAOA(totalAOA)}</span>
            </div>
          </div>

          {/* Delivery & Payment note */}
          <div className="flex items-center gap-3 p-3.5 bg-ink-50 rounded-xl border border-ink-100">
            <Clock className="w-5 h-5 text-brand-600 flex-shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-ink-900">Prazo de entrega estimado</p>
              <p className="text-ink-600">{result.estimatedDays || 15} a {result.estimatedDays ? result.estimatedDays + 8 : 25} dias úteis com rastreio</p>
            </div>
          </div>
        </div>

        {/* Call to Actions (Conversão Tripla: Mala Coletiva Frete Grátis, Checkout Direto ou WhatsApp) */}
        <div className="border-t border-ink-100 pt-5 space-y-3">
          {/* Opção Recomendada: Mala Coletiva com Frete Grátis */}
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full flex items-center justify-center gap-2.5 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-base rounded-xl transition shadow-lg shadow-emerald-600/25 active:scale-[0.99] cursor-pointer"
          >
            <Sparkles className="w-5 h-5 text-emerald-200" />
            Adicionar à Mala Coletiva (Frete Grátis)
          </button>

          {/* Opção Encomenda Imediata Individual */}
          <Link
            href={checkoutUrl}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-brand-600 text-white font-bold text-sm rounded-xl hover:bg-brand-700 transition"
          >
            Comprar Já Sozinho (Envio Expresso) <ArrowRight className="w-4 h-4" />
          </Link>

          {/* Botão Viral: Partilhar com Amiga no WhatsApp (Crescimento Orgânico Luanda) */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Olha este artigo: "${result.title}"!\n\nA estimativa da ImportEasy é *${formatAOA(totalAOA)}*, sujeita à confirmação do produto, custos e disponibilidade antes do pagamento.\n\nVê aqui: ${url || result.sourceUrl || ''}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] font-black rounded-xl border-2 border-[#25D366]/40 transition text-sm shadow-sm active:scale-[0.99]"
          >
            <Share2 className="w-4 h-4 text-[#25D366]" />
            📲 Partilhar com Amiga no WhatsApp (“Vamos pedir juntas?”)
          </a>

          {/* Suporte WhatsApp */}
          <a
            href={`https://wa.me/244922058136?text=${encodeURIComponent(
              `Olá ImportEasy! Simulei este produto e pretendo encomendar: ${result.title} (${result.platform}). Total: ${formatAOA(totalAOA)}. Link: ${url || result.sourceUrl || ''}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 px-6 py-2.5 border border-ink-300 text-ink-700 font-semibold rounded-xl hover:bg-ink-50 transition text-xs"
          >
            Tirar Dúvida no WhatsApp (+244 922 058 136)
          </a>

          {/* Informação sobre validação do pedido */}
          <div className="p-3 rounded-xl bg-ink-50 border border-ink-100 text-[11px] text-ink-600 text-center flex items-center justify-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>Antes de pagar:</strong> a equipa confirma disponibilidade, custos aplicáveis, modalidade e valor total do pedido.</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl border border-ink-200 p-6 hover:border-brand-300 hover:shadow-md transition">
      <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-brand-600" />
      </div>
      <h3 className="font-bold text-ink-900 mb-2">{title}</h3>
      <p className="text-ink-600 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}
