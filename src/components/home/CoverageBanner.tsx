"use client";

import { MapPin, Truck, Bike, PackageCheck, ShieldCheck, Sparkles } from "lucide-react";

export function CoverageBanner() {
  const luandaZones = [
    "Talatona",
    "Kilamba",
    "Maianga",
    "Alvalade",
    "Miramar",
    "Mutamba",
    "Morro Bento",
    "Viana",
    "Zango",
    "Nova Vida",
    "Benfica",
    "Cacuaco",
    "Camama",
    "Sambizanga",
  ];

  const provinces = [
    { name: "Benguela" },
    { name: "Huambo" },
    { name: "Lubango (Huíla)" },
    { name: "Cabinda" },
    { name: "Namibe" },
    { name: "Malanje" },
    { name: "Soyo (Zaire)" },
  ];

  return (
    <section className="py-12 bg-ink-50/60 border-y border-ink-200/60" aria-label="Cobertura de entregas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header da Secção */}
        <div className="text-center max-w-2xl mx-auto mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold mb-3">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Consulta de cobertura
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-ink-950 tracking-tight">
            Onde entregamos a tua encomenda?
          </h2>
          <p className="text-sm text-ink-600 mt-2">
            A cobertura, modalidade e prazo de entrega são confirmados com os detalhes do pedido.
          </p>
        </div>

        {/* Grelha de Cobertura Mastigada */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Card Luanda - Entrega com Estafeta / Moto-boy */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-brand-200 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center">
                    <Bike className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-ink-950 text-base sm:text-lg flex items-center gap-1.5">
                      Luanda (Entrega em Mãos com Moto-boy)
                    </h3>
                    <p className="text-xs text-ink-500">
                      Entregamos na tua porta, no escritório ou no ponto de encontro combinado.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full whitespace-nowrap">
                  Porta a Porta
                </span>
              </div>

              {/* Bairros Mastigados */}
              <div className="mt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-400 block mb-2">
                  Municípios & Bairros com Entrega Rápida:
                </span>
                <div className="flex flex-wrap gap-2">
                  {luandaZones.map((b) => (
                    <span
                      key={b}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-ink-50 hover:bg-brand-50 border border-ink-200/80 hover:border-brand-300 text-ink-800 text-xs font-semibold transition"
                    >
                      <MapPin className="w-3 h-3 text-brand-600 shrink-0" />
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-ink-100 flex items-center justify-between text-xs text-ink-600 bg-brand-50/40 p-3 rounded-2xl">
              <span className="font-medium">Prefere levantar em mão?</span>
              <span className="font-bold text-brand-700">Ponto de Recolha Central: Talatona & Luanda Centro</span>
            </div>
          </div>

          {/* Card Províncias - Envio Expresso */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-200 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 grid place-items-center">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-ink-950 text-base sm:text-lg flex items-center gap-1.5">
                      Províncias de Angola (Envio Expresso)
                    </h3>
                    <p className="text-xs text-ink-500">
                      Cargas despachadas com guia de transporte e acompanhamento passo a passo no WhatsApp.
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-black bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full whitespace-nowrap">
                  Com Rastreio
                </span>
              </div>

              {/* Lista de Províncias */}
              <div className="mt-4">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-400 block mb-2">
                  Províncias Atendidas com Frequência Semanal:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {provinces.map((p) => (
                    <div
                      key={p.name}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-ink-50 border border-ink-100 text-xs"
                    >
                      <span className="font-bold text-ink-900 flex items-center gap-1.5">
                        <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {p.name}
                      </span>
                      <span className="text-[11px] text-ink-500 font-medium">Consultar prazo</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-ink-100 flex items-center justify-between text-xs text-ink-600 bg-emerald-50/40 p-3 rounded-2xl">
              <span className="font-medium">A tua província não está na lista?</span>
              <a
                href="https://wa.me/244922058136?text=Ol%C3%A1%20ImportEasy!%20Gostaria%20de%20saber%20se%20enviam%20para%20a%20minha%20prov%C3%ADncia."
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-emerald-700 hover:underline"
              >
                Consulta no WhatsApp (+244 922 058 136)
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
