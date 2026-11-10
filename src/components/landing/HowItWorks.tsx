"use client";

import { Search, CreditCard, Truck, CheckCircle, MessageSquare } from "lucide-react";

const steps = [
  {
    number: "01",
    title: "Encontrou o produto?",
    description: "Copie o link do produto na Shein, AliExpress ou Vinted e cole no nosso simulador. Ou escolha um dos nossos produtos em destaque.",
    icon: Search,
    details: [
      "Funciona com qualquer link de produto",
      "Calculamos o preço final em Kz na hora",
      "Mostramos o prazo estimado de entrega"
    ]
  },
  {
    number: "02",
    title: "Pagamento facilitado",
    description: "Pague em Kwanzas via Transferência Bancária, Multicaixa Express ou Referência Multicaixa. Sem cartão internacional, sem IOF.",
    icon: CreditCard,
    details: [
      "Taxa de câmbio fixa no momento do pedido",
      "Comprovativo enviado por WhatsApp",
      "Suporte humano no 922 058 136"
    ]
  },
  {
    number: "03",
    title: "Nós tratamos de tudo",
    description: "Compramos, despachamos, passamos pela alfândega e entregamos na sua morada. Você só acompanha pelo rastreio.",
    icon: Truck,
    details: [
      "Desalfandegamento incluído no preço",
      "Rastreio em tempo real no painel",
      "Entrega em Luanda e principais províncias"
    ]
  },
  {
    number: "04",
    title: "Recebeu? Avalie!",
    description: "Confirme a receção, deixe a sua avaliação e ajude a comunidade. Ganhe desconto no próximo pedido.",
    icon: CheckCircle,
    details: [
      "Garantia de satisfação",
      "Programa de fidelidade",
      "Partilhe na comunidade ImportEasy"
    ]
  }
];

export default function HowItWorks() {
  return (
    <section className="py-20 lg:py-32 bg-white" aria-labelledby="how-it-works-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 id="how-it-works-title" className="text-3xl sm:text-4xl font-bold text-ink-900 mb-4">
            Como funciona a <span className="text-brand-600">ImportEasy</span>
          </h2>
          <p className="text-lg text-ink-600">
            Em 4 passos simples, o produto que você viu no estrangeiro chega na sua porta em Angola.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <article
              key={step.number}
              className="relative group p-6 rounded-2xl bg-ink-50 border border-ink-100 hover:border-brand-200 hover:bg-white transition-all duration-300"
            >
              {/* Connector line (except last) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 right-[-50%] w-full h-0.5 bg-gradient-to-r from-brand-200 to-transparent" aria-hidden="true" />
              )}

              {/* Step Number */}
              <div className="mb-6">
                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-brand-100 text-brand-600 font-bold text-lg">
                  {step.number}
                </span>
              </div>

              {/* Icon */}
              <div className="mb-4">
                <step.icon className="w-8 h-8 text-brand-600 group-hover:scale-110 transition-transform" aria-hidden="true" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-ink-900 mb-2">{step.title}</h3>
              <p className="text-ink-600 mb-6">{step.description}</p>

              {/* Details */}
              <ul className="space-y-2" role="list">
                {step.details.map((detail, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink-600">
                    <CheckCircle className="w-4 h-4 text-brand-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <span>{detail}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* CTA for paste link */}
        <div className="mt-16 text-center">
          <PasteLinkCTA />
        </div>
      </div>
    </section>
  );
}

function PasteLinkCTA() {
  return (
    <div className="inline-block w-full max-w-2xl p-8 rounded-2xl bg-brand-600 text-white">
      <MessageSquare className="w-10 h-10 mx-auto mb-4 text-brand-100" />
      <h3 className="text-2xl font-bold mb-2">Tem um link de um produto específico?</h3>
      <p className="text-brand-100 mb-6">
        Cole o link da Shein, AliExpress ou Vinted e nós calculamos o preço final com entrega em Angola.
      </p>
      <a
        href="/importar"
        className="inline-flex items-center gap-2 px-6 py-3 bg-white text-brand-600 font-semibold rounded-xl hover:bg-brand-50 transition-colors"
      >
        Colar Link e Simular
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
      </a>
    </div>
  );
}