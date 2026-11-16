"use client";

import { useAdaptiveIntelligence } from "@/context/AdaptiveIntelligenceContext";
import { Sparkles, ArrowRight, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";

export function AdaptiveSmartBanner() {
  const { persona, strategy, recordEvent } = useAdaptiveIntelligence();
  const [dismissed, setDismissed] = useState(false);
  const pathname = usePathname();

  // Ocultar em rotas de administração
  if (pathname.startsWith("/admin") || dismissed) return null;

  return (
    <aside aria-label="Aviso dinâmico" className="bg-gradient-to-r from-brand-900 via-brand-800 to-ink-950 text-white py-2.5 px-4 text-xs sm:text-sm border-b border-brand-500/20 shadow-sm animate-fade-in">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-400 text-ink-950 uppercase tracking-wider shrink-0">
            {strategy.badgeText}
          </span>
          <p className="text-ink-100 leading-snug">
            <strong className="text-white">{strategy.bannerTitle}</strong>{" "}
            <span className="hidden md:inline text-brand-200">— {strategy.bannerDescription}</span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href={strategy.ctaHref}
            className="px-3.5 py-1 rounded-xl bg-white text-ink-950 hover:bg-brand-50 font-extrabold text-xs transition flex items-center gap-1 shadow-sm active:scale-95"
          >
            {strategy.ctaText} <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="p-1 rounded-lg text-brand-300 hover:text-white hover:bg-white/10 transition"
            aria-label="Dispensar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
