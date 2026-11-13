"use client";

import { useState } from "react";
import { Calculator, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { formatKz } from "@/lib/types";
import Link from "next/link";

export function SmartDollarConverter() {
  const [usdValue, setUsdValue] = useState<number>(15);

  // Estimativa baseada no câmbio informal médio + taxa de serviço + frete coletivo da semana
  const exchangeRate = 1150; // Taxa informal média de referência
  const convertedKz = usdValue * exchangeRate;
  const serviceFeeKz = Math.max(1500, Math.round(convertedKz * 0.12));
  const logisticsFeeKz = 3500; // Frete consolidado
  const totalEstimadoKz = convertedKz + serviceFeeKz + logisticsFeeKz;

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-brand-100 shadow-xl shadow-brand-500/5 max-w-2xl mx-auto my-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 grid place-items-center">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-ink-950 text-base">
              Calculadora Rápida: De Dólar ($) para Kwanzas (Kz)
            </h3>
            <p className="text-xs text-ink-500">
              Viste um preço na SHEIN e queres saber quanto fica em Kwanzas com tudo incluído?
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-ink-700 mb-1.5">
            Digita o preço do artigo em Dólares ($ USD na SHEIN):
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-extrabold text-ink-400">
              $
            </span>
            <input
              type="number"
              min="1"
              max="1000"
              value={usdValue || ""}
              onChange={(e) => setUsdValue(Math.max(1, Number(e.target.value)))}
              placeholder="Ex: 15"
              className="w-full pl-9 pr-4 py-3.5 text-2xl font-extrabold rounded-2xl border-2 border-brand-200 bg-brand-50/20 text-ink-950 focus:outline-none focus:ring-4 focus:ring-brand-500/20 tabular-nums"
            />
          </div>
        </div>

        {/* Botões Rápidos */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-ink-500 font-semibold self-center mr-1">Valores comuns:</span>
          {[8, 12, 15, 20, 35, 50].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setUsdValue(v)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                usdValue === v
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-ink-100 text-ink-700 hover:bg-ink-200"
              }`}
            >
              ${v}
            </button>
          ))}
        </div>

        {/* Resultado Dinâmico Papa Feita */}
        <div className="p-4 rounded-2xl bg-ink-50 border border-ink-200/80 space-y-2 text-xs">
          <div className="flex justify-between items-baseline">
            <span className="font-bold text-ink-900 text-sm">Preço Final Estimado em Angola:</span>
            <span className="text-2xl font-black text-brand-700 tabular-nums">
              {formatKz(totalEstimadoKz)}
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Já inclui: compra ao fornecedor + câmbio informal + desalfandegamento em Luanda + entrega.
          </p>
        </div>

        <Link
          href="/importar"
          className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 active:scale-[0.99] transition"
        >
          Colar Link da SHEIN para Encomendar <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
