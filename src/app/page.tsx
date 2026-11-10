import { Suspense } from "react";
import Hero from "@/components/landing/Hero";
import HowItWorks from "@/components/landing/HowItWorks";
import FeaturedProducts from "@/components/landing/FeaturedProducts";
import { getFeaturedProducts } from "@/lib/actions/products";
import Link from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";

export default async function HomePage() {
  const featured = await getFeaturedProducts(8);

  return (
    <>
      {/* HERO - Novo componente com ImportEasy branding */}
      <Hero />

      {/* COMO FUNCIONA - 4 passos + CTA "Cole o link" */}
      <HowItWorks />

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
            Confiam na <span className="text-brand-600">ImportEasy</span>
          </h2>
          <p className="text-lg text-ink-600">
            Milhares de angolanos já receberam as suas encomendas sem stress.
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
        <div className="text-center">
          <Link
            href="/comunidade"
            className="inline-flex items-center gap-2 px-6 py-3 border-2 border-brand-600 text-brand-600 font-semibold rounded-xl hover:bg-brand-50 transition"
          >
            <MessageCircle className="w-5 h-5" />
            Ver Comunidade Ativa
            <ArrowRight className="w-5 h-5" />
          </Link>
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
          Pronto para importar sem complicações?
        </h2>
        <p className="text-brand-100 text-lg mb-8 max-w-2xl mx-auto">
          Cole o link do produto que você viu na Shein, AliExpress ou Vinted e veja o preço final em Kwanzas com entrega incluída.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/importar"
            className="w-full sm:w-auto px-8 py-4 bg-white text-brand-600 font-semibold rounded-xl hover:bg-brand-50 transition flex items-center justify-center gap-2"
          >
            Simular Importação
            <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="https://wa.me/244922058136"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-8 py-4 border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition flex items-center justify-center gap-2"
          >
            <MessageCircle className="w-5 h-5" />
            Falar no WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}