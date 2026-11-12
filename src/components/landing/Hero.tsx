"use client";

import Link from "next/link";
import { Globe, Smartphone, Shirt, Shield, Truck, CreditCard } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-brand-50 via-white to-white py-20 lg:py-32">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5" aria-hidden="true">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-600 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-100 text-brand-700 text-sm font-medium mb-6">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500" />
            </span>
            Novo: iPhones e acessórios da Vinted já disponíveis
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-ink-900 tracking-tight mb-6 leading-tight">
            O mundo na palma da sua mão.
            <br />
            <span className="text-brand-600">Importe da Shein, AliExpress e Vinted</span>
             diretamente para Angola.
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-ink-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Encontre a moda da <strong>Shein</strong>, produtos baratos no <strong>AliExpress</strong> e os melhores 
            <strong>iPhones na Vinted</strong>. Nós tratamos da compra, alfândega e entrega na sua porta. 
            Pagamento em Kz, tudo fácil.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/produtos"
              className="w-full sm:w-auto px-8 py-4 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-all duration-200 shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
            >
              <Globe className="w-5 h-5" />
              Ver Produtos em Destaque
            </Link>
            <Link
              href="/importar"
              className="w-full sm:w-auto px-8 py-4 border-2 border-brand-600 text-brand-600 font-semibold rounded-xl hover:bg-brand-50 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <Smartphone className="w-5 h-5" />
              Simular a minha Importação
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-ink-500">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-500" />
              <span>Sem surpresas na alfândega</span>
            </div>
            <div className="flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-brand-500" />
              <span>Pague em Kz (Multicaixa/Transferência)</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-brand-500" />
              <span>Entregas em toda Angola</span>
            </div>
          </div>
        </div>

        {/* Platform Cards - Visual showcase */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6" role="list" aria-label="Plataformas suportadas">
          {/* Shein Card */}
          <article className="group relative rounded-2xl border border-ink-200 bg-white p-6 shadow-sm hover:shadow-xl hover:border-brand-200 transition-all duration-300">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="px-2 py-1 text-xs font-medium text-white bg-brand-500 rounded-full">Moda</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center">
                <Shirt className="w-6 h-6 text-pink-600" />
              </div>
              <div>
                <h3 className="font-bold text-ink-900">Shein</h3>
                <p className="text-xs text-ink-500">USD → AOA</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-ink-600" role="list">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Vestuário feminino & masculino</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Calçados & acessórios</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Beleza & casa</li>
            </ul>
          </article>

          {/* AliExpress Card */}
          <article className="group relative rounded-2xl border border-ink-200 bg-white p-6 shadow-sm hover:shadow-xl hover:border-brand-200 transition-all duration-300">
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="px-2 py-1 text-xs font-medium text-white bg-orange-500 rounded-full">Tech & Gadgets</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-bold text-ink-900">AliExpress</h3>
                <p className="text-xs text-ink-500">USD/CNY → AOA</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-ink-600" role="list">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Eletrónicos & gadgets</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Casa & ferramentas</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Acessórios auto</li>
            </ul>
          </article>

          {/* Vinted Card - Highlight iPhones */}
          <article className="group relative rounded-2xl border-2 border-brand-500 bg-brand-50 p-6 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="absolute top-4 right-4">
              <span className="px-2 py-1 text-xs font-medium text-white bg-brand-600 rounded-full">Destaque</span>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-brand-100 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-brand-600" />
              </div>
              <div>
                <h3 className="font-bold text-ink-900">Vinted</h3>
                <p className="text-xs text-ink-500">EUR → AOA</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-ink-600" role="list">
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> <strong>iPhones seminovos</strong> com garantia</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Moda segunda mão premium</li>
              <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-brand-500" /> Marcas: Zara, Nike, Apple, Samsung</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}