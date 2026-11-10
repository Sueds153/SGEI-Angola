"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, CheckCircle, Link as LinkIcon, Shield, Clock, Calculator } from "lucide-react";
import Link from "next/link";

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
  error?: string;
}

const PLATFORMS = [
  { name: "Shein", icon: "🛍️", color: "bg-pink-100 text-pink-600", domains: ["shein.com"] },
  { name: "AliExpress", icon: "📱", color: "bg-orange-100 text-orange-600", domains: ["aliexpress.com", "pt.aliexpress.com"] },
  { name: "Vinted", icon: "👗", color: "bg-brand-100 text-brand-600", domains: ["vinted.com", "vinted.pt", "vinted.fr", "vinted.es"] },
];

export default function ImportarPage() {
  const router = useRouter();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const response = await fetch("/api/products/resolve-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar o link");
      }

      // Se precisa de confirmação (Shein/AliExpress sem premium)
      if (data.needs_confirmation) {
        setResult({
          success: true,
          platform: data.platform,
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
        });
      } else if (data.product) {
        setResult(data.product);
      } else {
        throw new Error("Não foi possível obter os dados do produto");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setLoading(false);
    }
  };

  const handleNewSimulation = () => {
    setUrl("");
    setResult(null);
    setError(null);
  };

  const platform = url ? detectPlatform(url) : null;

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
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/produtos" className="text-ink-600 hover:text-brand-600">Produtos</Link>
              <Link href="/comunidade" className="text-ink-600 hover:text-brand-600">Comunidade</Link>
              <Link href="/rastrear" className="text-ink-600 hover:text-brand-600">Rastrear</Link>
              <a href="https://wa.me/244922058136" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 text-sm font-medium">
                Suporte
              </a>
            </nav>
          </div>
        </div>
      </header>

      <main className="py-12 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-ink-900 mb-4">
              Simule a sua <span className="text-brand-600">importação</span>
            </h1>
            <p className="text-lg text-ink-600">
              Cole o link de qualquer produto da Shein, AliExpress ou Vinted e veja o preço final em Kwanzas com entrega incluída.
            </p>
          </div>

          {/* Platform Selector / Detection */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              <span className="text-sm text-ink-500">Plataformas suportadas:</span>
              {PLATFORMS.map((p) => (
                <span key={p.name} className={`px-3 py-1 rounded-full text-sm font-medium ${p.color} flex items-center gap-1`}>
                  {p.icon} {p.name}
                </span>
              ))}
            </div>
            
            {platform && (
              <div className="text-center text-sm text-brand-600 font-medium mb-4">
                ✓ Detectado: <strong>{platform.name}</strong> — {platform.domains[0]}
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-ink-200 p-6 shadow-sm">
              <label htmlFor="product-url" className="block text-sm font-medium text-ink-700 mb-3">
                Link do produto
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-ink-400" aria-hidden="true" />
                <input
                  id="product-url"
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://www.shein.com/... ou https://pt.aliexpress.com/... ou https://www.vinted.pt/..."
                  className="w-full pl-12 pr-4 py-4 border border-ink-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent text-ink-900 placeholder-ink-400 transition"
                  required
                  disabled={loading}
                />
              </div>
              <p className="mt-2 text-xs text-ink-500 text-center">
                Exemplo: <code className="bg-ink-100 px-1.5 py-0.5 rounded">https://www.vinted.pt/items/123456789-iphone-13-pro</code>
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || !url}
              className="w-full py-4 px-6 bg-brand-600 text-white font-semibold text-lg rounded-xl hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  A calcular preço final...
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5" />
                  Simular Importação
                </>
              )}
            </button>
          </form>

          {/* Error */}
          {error && (
            <div className="max-w-2xl mx-auto mt-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-700" role="alert">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="max-w-2xl mx-auto mt-8 animate-fade-in">
              <SimulationResultCard 
                result={result} 
                onNewSimulation={handleNewSimulation}
              />
            </div>
          )}

          {/* Features */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <FeatureCard icon={Shield} title="Preço Final Garantido" desc="O valor simulado já inclui: produto + taxa de câmbio + taxa de serviço + logística + alfândega + entrega. Sem surpresas." />
            <FeatureCard icon={Clock} title="Prazo Realista" desc="Entrega estimada em 15-25 dias úteis. Acompanha tudo no seu painel com rastreio em tempo real." />
            <FeatureCard icon={Calculator} title="Pagamento em Kz" desc="Transferência, Multicaixa Express ou Referência. Comprovativo validado em minutos via WhatsApp." />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-ink-900 text-ink-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-bold text-white text-lg mb-2">ImportEasy</p>
          <p className="mb-4">Sua ponte para o mundo. Shein, AliExpress e Vinted entregues em Angola.</p>
          <p className="text-sm">Suporte: +244 922 058 136 | apoio@importeasy.ao</p>
        </div>
      </footer>
    </div>
  );
}

function SimulationResultCard({ result, onNewSimulation }: { result: SimulationResult; onNewSimulation: () => void }) {
  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat("pt-AO", { style: "currency", currency }).format(value);
  };

  const formatAOA = (value: number) => {
    return new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA", minimumFractionDigits: 0 }).format(value);
  };

  const originalPrice = result.originalPrice || result.price || 0;
  const originalCurrency = result.originalCurrency || result.currency || "USD";
  const totalAOA = result.estimatedTotalAOA || 0;

  return (
    <div className="bg-white rounded-2xl border border-brand-200 shadow-lg overflow-hidden">
      {/* Success Header */}
      <div className="bg-brand-600 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-8 h-8" />
          <div>
            <h2 className="text-xl font-bold">Simulação concluída</h2>
            <p className="text-brand-100 text-sm">{result.platform} • {result.title?.substring(0, 60)}...</p>
          </div>
        </div>
        <button onClick={onNewSimulation} className="text-brand-100 hover:text-white text-sm font-medium">
          Nova simulação
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* Product Info */}
        <div className="flex gap-4">
          <div className="w-24 h-24 rounded-xl bg-ink-100 flex items-center justify-center flex-shrink-0">
            {result.images?.[0] ? (
              <img src={result.images[0]} alt={result.title} className="w-full h-full object-cover rounded-xl" />
            ) : (
              <span className="text-4xl">📦</span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-ink-900 truncate">{result.title}</h3>
            <p className="text-sm text-ink-500">ID: {result.productId} • {result.platform}</p>
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="border-t border-ink-200 pt-6 space-y-3">
          <h4 className="font-semibold text-ink-900">Detalhe do preço</h4>
          
          <div className="bg-brand-50 rounded-xl p-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-ink-600">Preço original ({originalCurrency})</span>
              <span className="font-medium text-ink-900">{formatCurrency(originalPrice, originalCurrency)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-ink-600">Taxa de câmbio</span>
              <span className="font-medium text-ink-900">1 {originalCurrency} = {result.exchangeRate?.toFixed(2)} AOA</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-ink-600">Taxa de serviço (12%)</span>
              <span className="font-medium text-ink-900">{formatAOA(result.serviceFee || 0)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-ink-600">Logística & Alfândega</span>
              <span className="font-medium text-ink-900">{formatAOA(result.logisticsFee || 0)}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-ink-600">Entrega em Angola</span>
              <span className="font-medium text-ink-900">{formatAOA(result.deliveryFee || 0)}</span>
            </div>
            <div className="border-t border-brand-200 pt-3 flex justify-between text-lg font-bold">
              <span className="text-ink-900">Total a pagar</span>
              <span className="text-brand-600">{formatAOA(totalAOA)}</span>
            </div>
          </div>

          {/* Estimated Delivery */}
          <div className="flex items-center gap-3 p-4 bg-ink-50 rounded-xl">
            <Clock className="w-5 h-5 text-brand-600" />
            <div>
              <p className="font-medium text-ink-900">Entrega estimada</p>
              <p className="text-sm text-ink-600">{result.estimatedDays || 18} a {result.estimatedDays ? result.estimatedDays + 7 : 25} dias úteis</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="border-t border-ink-200 pt-6">
          <a
            href={`https://wa.me/244922058136?text=${encodeURIComponent(
              `Olá ImportEasy! Quero encomendar: ${result.title} (${result.platform}). Total: ${formatAOA(totalAOA)}. Link: ${url}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378 9.86 9.86 0 01-1.716-4.92 9.877 9.877 0 014.58-5.377 9.87 9.87 0 015.377 1.293c.66.786 1.067 1.87 1.067 3.071 0 2.454-2.4 4.547-5.377 4.547z"/></svg>
            Encomendar via WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: React.ComponentType<{ className?: string }>; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl border border-ink-200 p-6 hover:border-brand-300 hover:shadow-lg transition">
      <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center mb-4">
        <Icon className="w-6 h-6 text-brand-600" />
      </div>
      <h3 className="font-bold text-ink-900 mb-2">{title}</h3>
      <p className="text-ink-600 text-sm">{desc}</p>
    </div>
  );
}