"use client";

import { useState } from "react";
import { Calculator, ArrowRight, Sparkles, CheckCircle2, Globe, Shirt, Cpu } from "lucide-react";
import { formatKz } from "@/lib/types";
import Link from "next/link";

export function SmartDollarConverter() {
  const [currency, setCurrency] = useState<"USD" | "EUR">("USD");
  const [inputValue, setInputValue] = useState<number>(15);

  // Taxas médias de referência informal
  const exchangeRateUsd = 1150;
  const exchangeRateEur = 1250;

  const activeRate = currency === "USD" ? exchangeRateUsd : exchangeRateEur;
  const convertedKz = inputValue * activeRate;
  const serviceFeeKz = Math.max(1500, Math.round(convertedKz * 0.12));
  const logisticsFeeKz = 3500; // Frete consolidado
  const totalEstimadoKz = convertedKz + serviceFeeKz + logisticsFeeKz;

  const usdPresets = [
    { val: 10, label: "$10 (SHEIN Moda)" },
    { val: 20, label: "$20 (AliExpress Gadget)" },
    { val: 35, label: "$35 (Conjunto/Ténis)" },
    { val: 60, label: "$60 (Peruca/Relógio)" },
    { val: 100, label: "$100 (Lote Atacado)" },
  ];

  const eurPresets = [
    { val: 30, label: "€30 (Sapatilhas Europa)" },
    { val: 60, label: "€60 (Roupa de Marca)" },
    { val: 120, label: "€120 (Apple Watch)" },
    { val: 250, label: "€250 (iPhone 11/12)" },
    { val: 450, label: "€450 (iPhone 13/14 Pro)" },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-brand-100 shadow-xl shadow-brand-500/5 max-w-2xl mx-auto my-8">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-ink-950 text-base sm:text-lg">
              Calculadora Rápida em Kwanzas
            </h3>
            <p className="text-xs text-ink-500">
              SHEIN ($ USD), AliExpress ($ USD) e Vinted Europa (€ EUR)
            </p>
          </div>
        </div>

        {/* Seletor de Moeda */}
        <div className="inline-flex p-1 bg-ink-100 rounded-2xl self-start sm:self-center">
          <button
            type="button"
            onClick={() => {
              setCurrency("USD");
              setInputValue(15);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1 ${
              currency === "USD"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-ink-600 hover:text-ink-900"
            }`}
          >
            $ USD (SHEIN / AliExpress)
          </button>
          <button
            type="button"
            onClick={() => {
              setCurrency("EUR");
              setInputValue(50);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1 ${
              currency === "EUR"
                ? "bg-brand-600 text-white shadow-sm"
                : "text-ink-600 hover:text-ink-900"
            }`}
          >
            € EUR (Vinted Europa)
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Campo de Entrada */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink-700 mb-1.5">
            Digita o preço do artigo em {currency === "USD" ? "Dólares ($)" : "Euros (€)"}:
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-extrabold text-ink-400">
              {currency === "USD" ? "$" : "€"}
            </span>
            <input
              type="number"
              min="1"
              max="2000"
              value={inputValue || ""}
              onChange={(e) => setInputValue(Math.max(1, Number(e.target.value)))}
              placeholder="Ex: 15"
              className="w-full pl-9 pr-4 py-3.5 text-2xl font-extrabold rounded-2xl border-2 border-brand-200 bg-brand-50/20 text-ink-950 focus:outline-none focus:ring-4 focus:ring-brand-500/20 tabular-nums"
            />
          </div>
        </div>

        {/* Botões Rápidos por Loja */}
        <div className="space-y-1.5">
          <span className="text-xs text-ink-500 font-semibold block">
            Exemplos comuns {currency === "USD" ? "(SHEIN & AliExpress)" : "(Vinted Europa)"}:
          </span>
          <div className="flex flex-wrap gap-2">
            {(currency === "USD" ? usdPresets : eurPresets).map((p) => (
              <button
                key={p.val}
                type="button"
                onClick={() => setInputValue(p.val)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  inputValue === p.val
                    ? "bg-brand-600 text-white shadow-sm"
                    : "bg-ink-100 text-ink-700 hover:bg-ink-200"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resultado Transparente em Kwanzas */}
        <div className="p-4 rounded-2xl bg-ink-50 border border-ink-200/80 space-y-2 text-xs">
          <div className="flex justify-between items-baseline">
            <span className="font-bold text-ink-900 text-sm">
              Preço Final Estimado em Angola ({currency === "USD" ? "1 $ ≈ 1.150 Kz" : "1 € ≈ 1.250 Kz"}):
            </span>
            <span className="text-2xl font-black text-brand-700 tabular-nums">
              {formatKz(totalEstimadoKz)}
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            Estimativa de compra, conversão e envio. O total e os encargos aplicáveis são confirmados pela equipa antes do pagamento.
          </p>
        </div>

        {/* Botão de Encomenda */}
        <Link
          href="/importar"
          className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 active:scale-[0.99] transition"
        >
          Colar Link (SHEIN, AliExpress ou Vinted) <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
