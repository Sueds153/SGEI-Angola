import { getFeaturedProducts } from "@/lib/actions/products";
import Hero from "@/components/landing/Hero";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import HowItWorks from "@/components/landing/HowItWorks";
import { ShieldCheck, CreditCard } from "lucide-react";

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

      {/* 4. Pagamento e confirmação do pedido */}
      <TrustSection />
    </>
  );
}

function TrustSection() {
  return (
    <section className="py-12 sm:py-16 bg-ink-50 border-y border-ink-200" aria-labelledby="trust-title">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-8">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase text-ink-500 mb-2">Pagamento e confirmação</p>
          <h2 id="trust-title" className="text-2xl sm:text-3xl font-semibold text-ink-950 tracking-tight mt-1">
            Primeiro confirmas. Depois pagas.
          </h2>
          <p className="text-sm text-ink-600 max-w-xl mt-2 leading-relaxed">
            Envia o artigo para receberes uma estimativa. A equipa confirma disponibilidade, custos e condições antes de qualquer pagamento.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 border-y border-ink-300">
          <div className="py-5 sm:pr-8 sm:border-r border-ink-300">
            <div className="flex items-center gap-2 mb-2 text-ink-900">
              <CreditCard aria-hidden="true" className="w-4 h-4 text-brand-600" />
              <h3 className="font-semibold text-sm">Pagamento em Kwanzas</h3>
            </div>
            <p className="text-sm text-ink-600 leading-relaxed">
              Multicaixa Express ou referência bancária, conforme as opções apresentadas durante o pedido.
            </p>
          </div>

          <div className="py-5 sm:pl-8 border-t sm:border-t-0 border-ink-300">
            <div className="flex items-center gap-2 mb-2 text-ink-900">
              <ShieldCheck aria-hidden="true" className="w-4 h-4 text-brand-600" />
              <h3 className="font-semibold text-sm">Sem cartão internacional</h3>
            </div>
            <p className="text-sm text-ink-600 leading-relaxed">
              A confirmação do valor e das condições é feita antes de pagares.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
