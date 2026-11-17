"use client";

import { Search, CreditCard, Truck, ArrowRight } from "lucide-react";
import Link from "next/link";

const steps = [
  {
    number: "1",
    title: "Escolhe o que gostas",
    description: "Navega no app da SHEIN, AliExpress ou Zara. Encontrou o que quer? Clica em partilhar e copia o link.",
    icon: Search,
    color: "bg-pink-50 text-pink-600 border-pink-200",
  },
  {
    number: "2",
    title: "Paga em Kwanzas pelo Express",
    description: "Cola o link aqui e vê o valor final em Kz. Paga pelo Multicaixa Express ou Referência sem precisar de cartão Visa.",
    icon: CreditCard,
    color: "bg-brand-50 text-brand-600 border-brand-200",
  },
  {
    number: "3",
    title: "Recebe na tua porta em Angola",
    description: "Compramos, tratamos do frete aéreo internacional e da alfândega. Entregamos direto a você em Luanda ou províncias.",
    icon: Truck,
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-10 sm:py-16 bg-ink-50/70 border-t border-ink-100" aria-labelledby="how-it-works-title">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
            Simples e Direto
          </span>
          <h2 id="how-it-works-title" className="text-2xl sm:text-3xl font-extrabold text-ink-950 tracking-tight mt-1">
            Como funciona a ImportEasy
          </h2>
          <p className="text-xs sm:text-sm text-ink-600 max-w-md mx-auto mt-1.5">
            Três passos para ter as tuas encomendas internacionais sem complicações cambiais.
          </p>
        </div>

        {/* 3 Passos em Cartões Limpos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-5">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="bg-white rounded-2xl p-4 sm:p-5 border border-ink-200/80 shadow-xs flex sm:flex-col items-start gap-3.5 sm:gap-4 relative overflow-hidden"
              >
                <div className={`w-10 h-10 rounded-xl ${step.color} border flex items-center justify-center shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-extrabold text-brand-600 uppercase tracking-wider">
                      Passo {step.number}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-ink-950 mb-1 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-xs text-ink-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Botão de Ação Rápida */}
        <div className="mt-8 text-center">
          <Link
            href="/importar"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs sm:text-sm shadow-sm active:scale-95 transition"
          >
            <span>Experimentar com um link agora</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
