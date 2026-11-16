"use client";

import { PackageCheck, ShieldCheck } from "lucide-react";

export function FlightStatusBanner() {
  return (
    <div className="w-full border-b border-brand-800 bg-brand-700 text-white text-xs font-medium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1.5 text-center">
          <div className="flex items-center gap-1.5">
            <PackageCheck className="w-3.5 h-3.5 opacity-80 shrink-0" />
            <span><strong>Encomendas acompanhadas:</strong> consulte o estado pela referência do pedido.</span>
          </div>
          <div className="hidden sm:block w-px h-3 bg-white/30" />
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 opacity-80 shrink-0" />
            <span>Prazo e modalidade de entrega são confirmados antes do pagamento.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
