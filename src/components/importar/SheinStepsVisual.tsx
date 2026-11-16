"use client";

import { useState } from "react";
import { Smartphone, Share2, ClipboardCheck, Shirt, Globe, Cpu } from "lucide-react";

export function SheinStepsVisual({ className = "" }: { className?: string }) {
  const [activePlatform, setActivePlatform] = useState<"ALL" | "SHEIN" | "ALIEXPRESS" | "VINTED">("ALL");

  const stepsData = {
    ALL: [
      {
        num: "1",
        icon: Smartphone,
        title: "Abre o artigo na Loja",
        desc: "Escolhe no aplicativo da SHEIN, AliExpress ou Vinted no teu telemóvel.",
        badge: "📱 1. Escolher",
        color: "bg-pink-50/50 text-pink-700 border-pink-200",
        iconBg: "bg-pink-100 text-pink-600",
      },
      {
        num: "2",
        icon: Share2,
        title: "Toca em Partilhar ↗️",
        desc: "Clica na setinha ou nos 3 pontinhos e escolhe 'Copiar Link'.",
        badge: "↗️ 2. Copiar Link",
        color: "bg-blue-50/50 text-blue-700 border-blue-200",
        iconBg: "bg-blue-100 text-blue-600",
      },
      {
        num: "3",
        icon: ClipboardCheck,
        title: "Cola aqui na ImportEasy",
        desc: "Recebe a estimativa em Kwanzas e aguarda a confirmação do valor total.",
        badge: "📋 3. Preço em Kwanzas",
        color: "bg-emerald-50/50 text-emerald-800 border-emerald-200",
        iconBg: "bg-emerald-100 text-emerald-600",
      },
    ],
    SHEIN: [
      {
        num: "1",
        icon: Shirt,
        title: "Abre a peça no app da SHEIN",
        desc: "Vê o vestido, conjunto ou sapatos favoritos.",
        badge: "👗 Moda & Calçado",
        color: "bg-pink-50 text-pink-700 border-pink-200",
        iconBg: "bg-pink-100 text-pink-600",
      },
      {
        num: "2",
        icon: Share2,
        title: "Toca no botão de Partilha ↗️",
        desc: "No topo direito da foto, clica em 'Copiar Link'.",
        badge: "↗️ Copiar Link",
        color: "bg-pink-50/70 text-pink-700 border-pink-200",
        iconBg: "bg-pink-100 text-pink-600",
      },
      {
        num: "3",
        icon: ClipboardCheck,
        title: "Cola no Simulador em Kwanzas",
        desc: "Junta à Mala Coletiva e tem Frete Grátis para Luanda!",
        badge: "🔥 Mala Coletiva",
        color: "bg-emerald-50 text-emerald-800 border-emerald-200",
        iconBg: "bg-emerald-100 text-emerald-600",
      },
    ],
    ALIEXPRESS: [
      {
        num: "1",
        icon: Cpu,
        title: "Escolhe no app do AliExpress",
        desc: "Relógios, eletrónica, perucas, capas ou ferramentas.",
        badge: "📦 Gadgets & Peças",
        color: "bg-orange-50 text-orange-700 border-orange-200",
        iconBg: "bg-orange-100 text-orange-600",
      },
      {
        num: "2",
        icon: Share2,
        title: "Partilha e clica em Copiar ↗️",
        desc: "No canto superior direito, copia o link do produto.",
        badge: "↗️ Copiar Link",
        color: "bg-orange-50/70 text-orange-700 border-orange-200",
        iconBg: "bg-orange-100 text-orange-600",
      },
      {
        num: "3",
        icon: ClipboardCheck,
        title: "Sem retenção na alfândega!",
        desc: "A equipa coordena os próximos passos e partilha atualizações do pedido.",
        badge: "Acompanhamento do pedido",
        color: "bg-emerald-50 text-emerald-800 border-emerald-200",
        iconBg: "bg-emerald-100 text-emerald-600",
      },
    ],
    VINTED: [
      {
        num: "1",
        icon: Globe,
        title: "Abre o anúncio na Vinted Europa",
        desc: "iPhones seminovos, sapatilhas Nike/Jordan ou grifes da Europa.",
        badge: "🇪🇺 Europa Direta",
        color: "bg-brand-50 text-brand-700 border-brand-200",
        iconBg: "bg-brand-100 text-brand-600",
      },
      {
        num: "2",
        icon: Share2,
        title: "Copia o Link do Artigo ↗️",
        desc: "Toca em partilhar ou copia o link do anúncio em França/Portugal.",
        badge: "↗️ Link da Vinted",
        color: "bg-brand-50/70 text-brand-700 border-brand-200",
        iconBg: "bg-brand-100 text-brand-600",
      },
      {
        num: "3",
        icon: ClipboardCheck,
        title: "Inspeção & Entrega Segura",
        desc: "Compramos na Europa, testamos o iPhone/peça e entregamos em Luanda.",
        badge: "✅ 100% Original",
        color: "bg-emerald-50 text-emerald-800 border-emerald-200",
        iconBg: "bg-emerald-100 text-emerald-600",
      },
    ],
  };

  const currentSteps = stepsData[activePlatform];

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Seletor de Loja */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-ink-500">
          Como encomendar em 3 passos simples (Papa Feita):
        </span>
        <div className="inline-flex p-1 bg-ink-100/80 rounded-xl gap-1">
          {[
            { id: "ALL", label: "✨ Todas as Lojas" },
            { id: "SHEIN", label: "👗 SHEIN" },
            { id: "ALIEXPRESS", label: "📱 AliExpress" },
            { id: "VINTED", label: "🇪🇺 Vinted" },
          ].map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePlatform(p.id as any)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                activePlatform === p.id
                  ? "bg-white text-ink-950 shadow-sm"
                  : "text-ink-600 hover:text-ink-900"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cartões dos 3 Passos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {currentSteps.map((s) => {
          const Icon = s.icon;
          return (
            <div
              key={s.num}
              className={`relative p-4 rounded-2xl border ${s.color} bg-white shadow-sm hover:shadow-md transition flex items-start gap-3`}
            >
              <div className={`w-10 h-10 rounded-xl ${s.iconBg} grid place-items-center shrink-0`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-black uppercase tracking-wider block opacity-75">
                  {s.badge}
                </span>
                <h4 className="font-extrabold text-ink-950 text-sm leading-snug mt-0.5">
                  {s.title}
                </h4>
                <p className="text-xs text-ink-600 mt-1 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
