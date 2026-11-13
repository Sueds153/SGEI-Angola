"use client";

import { useEffect, useState } from "react";
import { Plane, Clock, ShieldCheck, AlertCircle, Sparkles } from "lucide-react";

export function FlightStatusBanner() {
  const [dayOfWeek, setDayOfWeek] = useState<number>(new Date().getDay()); // 0 = Domingo, 5 = Sexta

  useEffect(() => {
    setDayOfWeek(new Date().getDay());
  }, []);

  // Lógica dinâmica da carga da semana
  const isUrgentDay = dayOfWeek === 4 || dayOfWeek === 5; // Quinta ou Sexta
  const isWeekend = dayOfWeek === 6 || dayOfWeek === 0; // Sábado ou Domingo

  return (
    <div className="w-full bg-gradient-to-r from-ink-950 via-brand-950 to-ink-950 text-white border-y border-brand-500/30 py-3 px-4 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-400 grid place-items-center shrink-0">
            <Plane className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-white flex items-center gap-1.5">
              ✈️ Despacho Aéreo Semanal (Madrid → Luanda)
              {isUrgentDay && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-ink-950 animate-bounce">
                  ÚLTIMAS VAGAS
                </span>
              )}
            </span>
            <p className="text-ink-400 text-xs">
              {isWeekend
                ? "Carga da semana consolidada em voo para o Aeroporto 4 de Fevereiro. Nova remessa a abrir!"
                : isUrgentDay
                ? "Fecho da carga esta Sexta às 18h! Quem pagar hoje pelo Express garante embarque no voo de Domingo."
                : "Remessa aberta para o próximo voo de Domingo. Paga pelo Express para garantir lugar!"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Desalfandegamento 100% Garantido em Luanda</span>
          </div>
        </div>
      </div>
    </div>
  );
}
