"use client";

import Link from "next/link";
import { Globe, Smartphone, Shirt, Shield, Truck, CreditCard, ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-white pt-12 pb-20 lg:pt-20 lg:pb-32">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-50 text-brand-700 text-sm font-semibold mb-8 ring-1 ring-brand-100 shadow-sm animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
            </span>
            Pagamento em Kwanzas via Multicaixa ou IBAN
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-ink-950 tracking-tighter mb-6 leading-[1.1] animate-slide-up">
            Importe da Shein e AliExpress <br className="hidden md:block" />
            <span className="text-brand-600">sem cartão internacional</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-ink-600 mb-12 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: '100ms' }}>
            Nós compramos para si e entregamos à sua porta em Angola. 
            Simule o preço final com taxas e transporte em segundos.
          </p>

          {/* CTA Form - O Foco da Conversão */}
          <div className="relative max-w-2xl mx-auto mb-16 animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="bg-white p-2 rounded-2xl shadow-2xl shadow-brand-500/15 border border-ink-200 flex flex-col sm:flex-row gap-2">
              <input 
                type="url"
                placeholder="Cole o link do produto aqui..." 
                className="flex-1 p-4 bg-transparent outline-none text-ink-900 text-lg placeholder:text-ink-400"
              />
              <Link 
                href="/importar"
                className="bg-brand-600 text-white px-10 py-4 rounded-xl font-bold hover:bg-brand-700 transition-all active:scale-95 flex items-center justify-center gap-2 text-lg shadow-lg shadow-brand-500/30"
              >
                Simular Preço <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            
            {/* Small disclaimer */}
            <p className="mt-4 text-sm text-ink-500 flex items-center justify-center gap-2">
              <Shield className="w-4 h-4 text-success-600" /> Preço final garantido, sem taxas surpresa na entrega.
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-medium text-ink-600 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="flex items-center gap-2 bg-ink-50 px-4 py-2 rounded-full ring-1 ring-ink-100">
              <div className="w-5 h-5 bg-brand-100 rounded-full flex items-center justify-center">
                <Truck className="w-3 h-3 text-brand-600" />
              </div>
              Entrega em Luanda e Províncias
            </div>
            <div className="flex items-center gap-2 bg-ink-50 px-4 py-2 rounded-full ring-1 ring-ink-100">
              <div className="w-5 h-5 bg-brand-100 rounded-full flex items-center justify-center">
                <CreditCard className="w-3 h-3 text-brand-600" />
              </div>
              Multicaixa / Transferência
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