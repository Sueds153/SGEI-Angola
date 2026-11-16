import { Suspense } from "react";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import { getFeaturedProducts } from "@/lib/actions/products";
import Link from "next/link";
import { ArrowRight, MessageCircle, Shield, Truck, CreditCard, CheckCircle2 } from "lucide-react";
import { FlightStatusBanner } from "@/components/home/FlightStatusBanner";
import { SmartDollarConverter } from "@/components/home/SmartDollarConverter";
import { CoverageBanner } from "@/components/home/CoverageBanner";

export default async function HomePage() {
  const featured = await getFeaturedProducts(24);

  return (
    <>
      {/* GATILHO VOO DA SEMANA - Calendário do Lote Luanda */}
      <FlightStatusBanner />

      {/* HERO - Com mini-guia visual de 3 passos */}
      <Hero />

      {/* CONVERSOR RÁPIDO DÓLAR -> KWANZA (Modo Rápido Papa Feita) */}
      <section className="py-6 bg-brand-50/40 border-y border-brand-100/60 px-4">
        <SmartDollarConverter />
      </section>

      {/* COMO FUNCIONA - 4 passos + CTA "Cole o link" */}
      <HowItWorks />

      {/* QUEBRA DE OBJEÇÃO: LOCAIS DE ENTREGA EM LUANDA & PROVÍNCIAS */}
      <CoverageBanner />

      {/* DESTAQUES: iPhones Vinted + Moda Shein + Gadgets AliExpress */}
      <FeaturedProducts featuredProducts={featured} />

      {/* DEPOIMENTOS / CONFIANÇA */}
      <TrustSection />

      {/* CTA FINAL */}
      <FinalCTA />
    </>
  );
}

function TrustSection() {
  const stats = [
    { value: "2.500+", label: "Clientes em Angola" },
    { value: "8.300+", label: "Pedidos entregues" },
    { value: "18 dias", label: "Média de entrega" },
    { value: "4.8/5", label: "Avaliação média" },
  ];

  return (
    <section className="py-20 bg-white" aria-labelledby="trust-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 id="trust-title" className="text-3xl sm:text-4xl font-bold text-ink-900 mb-4">
            Quem encomenda connosco <span className="text-brand-600">não se arrepende</span>
          </h2>
          <p className="text-lg text-ink-600">
            Mais de 8.300 encomendas já desalfandegadas e entregues diretamente na mão dos nossos clientes em Luanda e nas províncias.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, i) => (
            <div key={i} className="text-center p-6 bg-ink-50 rounded-2xl border border-ink-100">
              <div className="text-3xl sm:text-4xl font-bold text-brand-600 mb-1">{stat.value}</div>
              <div className="text-sm text-ink-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Link para Comunidade */}
        <div className="text-center mb-16">
          <Link
            href="/comunidade"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-brand-600 text-brand-600 font-semibold rounded-xl hover:bg-brand-50 transition"
          >
            <MessageCircle className="w-5 h-5" />
            Ver Comunidade & Testemunhos
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>

        {/* Banner de Garantia & Pagamento Seguro em Angola */}
        <div className="bg-gradient-to-br from-ink-900 to-ink-950 text-white p-8 sm:p-12 rounded-3xl shadow-xl">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
              <Shield className="w-4 h-4" /> Apoio durante a encomenda
            </span>
            <h3 className="text-2xl sm:text-3xl font-bold">
              Saiba o valor confirmado antes de pagar.
            </h3>
            <p className="text-ink-300 text-sm sm:text-base leading-relaxed">
              A simulação é uma estimativa. A equipa valida o produto, a disponibilidade e o valor total; só depois decide se quer avançar. O pagamento é feito em Kwanzas pelos métodos indicados no pedido.
            </p>
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto text-left">
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <span className="text-xs text-ink-300 block">App Multicaixa Express</span>
                <span className="text-lg font-mono font-bold text-white">929 423 278</span>
              </div>
              <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                <span className="text-xs text-ink-300 block">Pagamento por Referência</span>
                <span className="text-sm font-mono text-white">Entidade: <strong className="text-base text-emerald-400">10116</strong> · Ref: <strong className="text-base text-emerald-400">929 423 278</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCTA() {
  return (
    <section className="py-20 bg-brand-600 text-white" aria-labelledby="cta-title">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 id="cta-title" className="text-3xl sm:text-4xl font-bold mb-4">
          Pronto para fazer a tua encomenda da SHEIN?
        </h2>
        <p className="text-brand-100 text-lg mb-8 max-w-2xl mx-auto">
          Cola o link da peça que viste na SHEIN, AliExpress ou Vinted. Recebe uma estimativa em Kwanzas e pede confirmação do valor e das opções de entrega.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/importar"
            className="w-full sm:w-auto px-8 py-4 bg-white text-brand-600 font-bold rounded-xl hover:bg-brand-50 transition flex items-center justify-center gap-2 shadow-lg"
          >
            Simular Preço Agora
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="https://wa.me/244922058136?text=Ol%C3%A1%20ImportEasy!%20Gostaria%20de%20fazer%20uma%20encomenda."
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Falar no WhatsApp (+244 922 058 136)
          </a>
        </div>
      </div>
    </section>
  );
}
