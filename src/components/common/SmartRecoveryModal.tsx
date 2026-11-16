"use client";

import { useAdaptiveIntelligence } from "@/context/AdaptiveIntelligenceContext";
import { X, Sparkles, Phone, ShieldCheck, CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";

export function SmartRecoveryModal() {
  const { showRecoveryModal, closeRecoveryModal, persona, profile, strategy } = useAdaptiveIntelligence();

  if (!showRecoveryModal) return null;

  const whatsappHref = `https://wa.me/244922058136?text=${encodeURIComponent(
    `Olá ImportEasy! Estava no site a ver uma encomenda e gostaria de tirar uma dúvida antes de fechar: ${strategy.whatsAppPrompt}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/70 backdrop-blur-sm grid place-items-center p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border-2 border-brand-200 relative animate-slide-up">
        {/* Botão Fechar */}
        <button
          onClick={closeRecoveryModal}
          className="absolute right-4 top-4 p-1.5 rounded-xl text-ink-400 hover:text-ink-700 hover:bg-ink-100 transition"
          aria-label="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Cabeçalho Inteligente */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 grid place-items-center mx-auto mb-3">
            <Sparkles className="w-7 h-7" />
          </div>
          <span className="px-3 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-900 uppercase tracking-wider">
            {strategy.badgeText}
          </span>
          <h3 className="text-xl font-extrabold text-ink-950 mt-2.5 leading-snug">
            {persona === "PAYMENT_HESITATOR"
              ? "Precisas de ajuda com o teu pedido?"
              : persona === "RESELLER_PRO"
              ? "Tens dúvidas sobre a revenda em Luanda?"
              : "Queres rever o teu pedido?"}
          </h3>
          <p className="text-xs text-ink-600 mt-1.5 leading-relaxed">
            {persona === "PAYMENT_HESITATOR"
              ? "Consulte a referência do pedido e fale com a equipa para confirmar o estado, o valor e os próximos passos antes de pagar."
              : persona === "RESELLER_PRO"
              ? "Consolidamos múltiplos artigos num só fardo com desconto no frete aéreo por quilo."
              : "Veja como funciona o pedido e confirme com a equipa os custos e as opções disponíveis."}
          </p>
        </div>

        {/* Caixa de Ação Rápida */}
        <div className="bg-ink-50 p-4 rounded-2xl border border-ink-200 space-y-2 mb-5 text-xs">
          <div className="flex items-center justify-between text-ink-800 font-bold">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-brand-600" /> Multicaixa Express Oficial:
            </span>
            <span className="font-mono text-sm text-ink-950 font-extrabold">929 423 278</span>
          </div>
          <div className="flex items-center justify-between text-ink-600">
            <span>Referência Multicaixa:</span>
            <span className="font-mono">Entidade: 10116 · Ref: 929 423 278</span>
          </div>
          <div className="pt-2 border-t border-ink-200/60 flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Confirme os detalhes e o valor total do pedido antes de pagar.</span>
          </div>
        </div>

        {/* Botões de Conversão */}
        <div className="space-y-2.5">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={closeRecoveryModal}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 active:scale-[0.99] transition"
          >
            <Phone className="w-4 h-4" /> Falar com Apoio no WhatsApp (+244 922 058 136)
          </a>

          <Link
            href={strategy.ctaHref}
            onClick={closeRecoveryModal}
            className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition"
          >
            {strategy.ctaText} <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <button
            onClick={closeRecoveryModal}
            className="w-full text-center text-xs text-ink-400 hover:text-ink-600 font-medium py-1 transition"
          >
            Continuar a explorar o site
          </button>
        </div>
      </div>
    </div>
  );
}
