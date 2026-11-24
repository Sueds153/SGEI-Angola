"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: "1",
    title: "Escolhe o que gostas",
    description: "Copia o link do artigo na loja onde o encontraste.",
  },
  {
    number: "2",
    title: "Confirma o valor e paga",
    description: "Envia o link para receberes uma estimativa em Kwanzas. O valor final é confirmado antes do pagamento.",
  },
  {
    number: "3",
    title: "Recebe na tua porta em Angola",
    description: "Depois de confirmares o pedido, tratamos da compra e acompanhamos a entrega em Angola.",
  },
];

export default function HowItWorks() {
  const stepsRef = useRef<HTMLOListElement>(null);
  const [stepsVisible, setStepsVisible] = useState(false);

  useEffect(() => {
    const element = stepsRef.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setStepsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.25 });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-12 sm:py-16 bg-white border-t border-ink-100" aria-labelledby="how-it-works-title">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 sm:mb-10">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase text-ink-500 mb-2">Do link à entrega</p>
          <h2 id="how-it-works-title" className="text-2xl sm:text-3xl font-semibold text-ink-950 tracking-tight mt-1">
            Como funciona a ImportEasy
          </h2>
          <p className="text-sm text-ink-600 max-w-md mt-2">
            Três passos para ter as tuas encomendas internacionais sem complicações cambiais.
          </p>
        </div>

        {/* A sequência só se anima quando entra no campo de visão */}
        <ol
          ref={stepsRef}
          className={`journey-sequence grid grid-cols-1 md:grid-cols-3 gap-0 border-y border-ink-200${stepsVisible ? " is-visible" : ""}`}
        >
          {steps.map((step) => {
            return (
              <li
                key={step.number}
                className="journey-step py-5 sm:py-6 md:px-6 first:md:pl-0 md:border-l md:border-ink-200 first:border-0 flex items-start gap-4 sm:gap-5"
              >
                <div className="text-2xl sm:text-3xl font-light tracking-tight text-brand-600 shrink-0 tabular-nums">
                  0{step.number}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold text-ink-950 mb-1 leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-sm text-ink-600 leading-relaxed max-w-sm">
                    {step.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>

        {/* Botão de Ação Rápida */}
        <div className="mt-8 text-center">
          <Link
            href="/importar"
            className="inline-flex items-center justify-center gap-2 py-3 border-b border-brand-600 text-brand-700 font-semibold text-sm hover:text-brand-800 transition-colors"
          >
            <span>Experimentar com um link agora</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
