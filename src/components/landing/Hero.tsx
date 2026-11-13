"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Globe, Smartphone, Shirt, Shield, Truck, CreditCard, ArrowRight, CheckCircle2 } from "lucide-react";

export default function Hero() {
  const router = useRouter();
  const [productUrl, setProductUrl] = useState("");

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = productUrl.trim();
    if (trimmed) {
      router.push(`/importar?url=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/importar");
    }
  };

  return (
    <section className="relative overflow-hidden bg-white pt-8 pb-14 sm:pt-12 sm:pb-20 lg:pt-20 lg:pb-32">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 text-brand-700 text-sm font-semibold mb-6 ring-1 ring-brand-100 shadow-sm animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
            </span>
            ✈️ Mala Coletiva Luanda: Junta as tuas peças e aproveita Frete Internacional Grátis!
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-ink-950 tracking-tighter mb-6 leading-[1.1] animate-slide-up">
            Importe da Shein e AliExpress <br className="hidden md:block" />
            <span className="text-brand-600">sem cartão internacional</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-ink-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '100ms' }}>
            Nós compramos por si e entregamos na sua porta em Angola. 
            Simule o preço final com taxas alfandegárias e transporte incluídos.
          </p>

          {/* CTA Form - O Foco da Conversão */}
          <div className="relative max-w-2xl mx-auto mb-16 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <form onSubmit={handleSimulate} className="bg-white p-2 rounded-2xl shadow-xl shadow-brand-500/10 border border-ink-200 flex flex-col sm:flex-row gap-2">
              <label htmlFor="product-url" className="sr-only">Link do produto</label>
              <input 
                id="product-url"
                type="url"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="Cole o link do produto da Shein, AliExpress ou Vinted..." 
                className="min-h-12 flex-1 p-4 bg-transparent outline-none text-ink-900 text-base sm:text-lg placeholder:text-ink-400"
              />
              <button 
                type="submit"
                className="min-h-12 bg-brand-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-brand-700 transition-all active:scale-[.99] flex items-center justify-center gap-2 text-base sm:text-lg shadow-lg shadow-brand-500/20 cursor-pointer"
              >
                Simular Preço <ArrowRight className="w-5 h-5" />
              </button>
            </form>
            
            {/* Small disclaimer */}
            <p className="mt-4 text-sm text-ink-600 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
              <strong>Garantia Alfândega Livre:</strong> Desalfandegamento 100% tratado por nós. Sem taxas surpresa no Aeroporto de Luanda.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm font-medium text-ink-600 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2 bg-ink-50 px-4 py-2 rounded-full ring-1 ring-ink-100">
              <div className="w-5 h-5 bg-brand-100 rounded-full flex items-center justify-center">
                <Truck className="w-3 h-3 text-brand-600" />
              </div>
              Entrega em Luanda e Províncias
            </div>
            <div className="flex items-center gap-2 bg-ink-50 px-4 py-2 rounded-full ring-1 ring-ink-100">
              <div className="w-5 h-5 bg-emerald-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-3 h-3 text-emerald-600" />
              </div>
              Multicaixa Express: 929 423 278
            </div>
            <div className="flex items-center gap-2 bg-ink-50 px-4 py-2 rounded-full ring-1 ring-ink-100">
              <div className="w-5 h-5 bg-blue-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-3 h-3 text-blue-600" />
              </div>
              Entidade: 10116
            </div>
          </div>
        </div>

        {/* Platform Marquee - Reforço de autoridade */}
        <div className="mt-24 border-y border-ink-100 py-10 opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
          <div className="flex flex-wrap justify-center items-center gap-12 md:gap-24 opacity-60">
             <div className="flex items-center gap-3">
               <Shirt className="w-8 h-8 text-pink-500" />
               <span className="text-2xl font-bold text-ink-900 tracking-tighter">SHEIN</span>
             </div>
             <div className="flex items-center gap-3">
               <Smartphone className="w-8 h-8 text-orange-500" />
               <span className="text-2xl font-bold text-ink-900 tracking-tighter">AliExpress</span>
             </div>
             <div className="flex items-center gap-3">
               <Globe className="w-8 h-8 text-brand-600" />
               <span className="text-2xl font-bold text-ink-900 tracking-tighter">VINTED</span>
             </div>
          </div>
        </div>
      </div>
    </section>
  );
}
