import { getFeaturedProducts } from "@/lib/actions/products";
import Hero from "@/components/landing/Hero";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import HowItWorks from "@/components/landing/HowItWorks";
import { SmartDollarConverter } from "@/components/home/SmartDollarConverter";
import Link from "next/link";
import { ArrowRight, MessageCircle, ShieldCheck, CreditCard, Truck, CheckCircle2 } from "lucide-react";

export default async function HomePage() {
  const featured = await getFeaturedProducts(16);

  return (
    <>
      {/* 1. HERO COM SIMULADOR MOBILE-FIRST */}
      <Hero />

      {/* 2. CATÁLOGO DE DESTAQUES IMEDIATO (2 colunas mobile) */}
      <FeaturedProducts featuredProducts={featured} />

      {/* 3. COMO FUNCIONA (3 passos simples) */}
      <HowItWorks />

      {/* 4. CONVERSOR RÁPIDO DÓLAR/EURO -> KWANZA */}
      <section className="py-8 sm:py-14 bg-brand-50/30 border-y border-brand-100/60 px-4">
        <SmartDollarConverter />
      </section>

      {/* 5. SEGURANÇA E PAGAMENTO EM ANGOLA (Human Senior Trust) */}
      <TrustSection />

      {/* 6. CTA FINAL RÁPIDO */}
      <FinalCTA />
    </>
  );
}

function TrustSection() {
  return (
    <section className="py-10 sm:py-16 bg-white" aria-labelledby="trust-title">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            100% Seguro em Angola
          </span>
          <h2 id="trust-title" className="text-2xl sm:text-3xl font-extrabold text-ink-950 tracking-tight mt-1">
            Paga com tranquilidade em Kwanzas
          </h2>
          <p className="text-xs sm:text-sm text-ink-600 max-w-md mx-auto mt-1.5">
            Sem necessidade de cartões Visa ou Mastercard internacionais. Usamos os canais oficiais do sistema bancário angolano.
          </p>
        </div>

        {/* Garantias de Pagamento (sem dados sensíveis) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 mb-8">
          <div className="p-4 sm:p-5 rounded-2xl bg-ink-50 border border-ink-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-600 grid place-items-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-ink-900 text-sm">Pagamento Local</h3>
            </div>
            <p className="text-xs text-ink-600">
              Paga em Kwanzas por Multicaixa Express ou referência bancária. Os dados de pagamento são mostrados apenas quando o cliente inicia o checkout.
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-ink-50 border border-ink-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 grid place-items-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-ink-900 text-sm">Sem Cartão Internacional</h3>
            </div>
            <p className="text-xs text-ink-600">
              Não precisa de cartão Visa ou Mastercard. Usamos os canais oficiais do sistema bancário angolano.
            </p>
          </div>
        </div>

        {/* Garantias em Linha */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center text-xs text-ink-700">
          <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100">
            <span className="font-extrabold block text-brand-700 text-sm sm:text-base">100%</span>
            <span>Sem Taxas Ocultas</span>
          </div>
          <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100">
            <span className="font-extrabold block text-brand-700 text-sm sm:text-base">Luanda</span>
            <span>Entrega ao Domicílio</span>
          </div>
          <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100">
            <span className="font-extrabold block text-brand-700 text-sm sm:text-base">18 Províncias</span>
            <span>Envio Rápido</span>
          </div>
          <div className="p-3 bg-brand-50/50 rounded-xl border border-brand-100">
            <span className="font-extrabold block text-brand-700 text-sm sm:text-base">WhatsApp</span>
            <span>Suporte em Português</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-10 sm:py-14 bg-gradient-to-br from-brand-700 via-brand-600 to-brand-800 text-white" aria-labelledby="cta-title">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
        <h2 id="cta-title" className="text-2xl sm:text-3xl font-extrabold mb-2.5 tracking-tight">
          Pronto para encomendar da SHEIN?
        </h2>
        <p className="text-brand-100 text-xs sm:text-sm mb-6 max-w-lg mx-auto leading-relaxed">
          Cola o link da peça que viste na SHEIN ou AliExpress. Vê o valor em Kwanzas na hora e fala com a nossa equipa.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Link
            href="/importar"
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-brand-700 font-bold rounded-xl hover:bg-brand-50 active:scale-95 transition flex items-center justify-center gap-2 text-sm shadow-md"
          >
            <span>Simular Preço Agora</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="https://wa.me/244922058136?text=Ol%C3%A1%20ImportEasy!%20Gostaria%20de%20ajuda%20para%20fazer%20uma%20encomenda."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-6 py-3.5 bg-brand-800/80 hover:bg-brand-900 border border-brand-400/40 text-white font-bold rounded-xl active:scale-95 transition flex items-center justify-center gap-2 text-sm"
          >
            <MessageCircle className="w-4 h-4 text-emerald-400" />
            <span>Falar no WhatsApp</span>
          </a>
        </div>
      </div>
    </section>
  );
}
