"use client";

import { useState, useEffect } from "react";
import { MessageCircle, X, Sparkles, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";
import { useAdaptiveIntelligence } from "@/context/AdaptiveIntelligenceContext";

export function FloatingWhatsApp() {
  const pathname = usePathname();
  const [showTooltip, setShowTooltip] = useState(false);
  const { persona, strategy, recordEvent } = useAdaptiveIntelligence();

  // Não exibe dentro da área de administração para não atrapalhar o trabalho do gestor
  const isAdmin = pathname.startsWith("/admin");

  useEffect(() => {
    // Tooltip mantido desativado para garantir UX limpa
  }, []);

  if (isAdmin) return null;

  // Mensagem dinâmica inteligente adaptada à persona e página do cliente
  const getContextualMessage = () => {
    if (strategy.whatsAppPrompt) {
      return strategy.whatsAppPrompt;
    }
    if (pathname.includes("/importar")) {
      return "Olá ImportEasy! Estou no simulador e quero tirar uma dúvida rápida sobre uma encomenda da SHEIN.";
    }
    if (pathname.includes("/carrinho")) {
      return "Olá ImportEasy! Tenho artigos na Mala Coletiva e quero confirmar o pagamento pelo Express.";
    }
    if (pathname.includes("/rastrear")) {
      return "Olá ImportEasy! Gostaria de falar com o suporte sobre o rastreio da minha encomenda.";
    }
    return "Olá ImportEasy! Estou no site e quero tirar uma dúvida rápida sobre uma encomenda.";
  };

  const whatsappUrl = `https://wa.me/244922058136?text=${encodeURIComponent(getContextualMessage())}`;

  const handleClick = () => {
    setShowTooltip(false);
    recordEvent("WHATSAPP_CLICK");
  };

  return (
    <div className="hidden md:flex fixed bottom-6 right-6 z-40 flex-col items-end gap-2 animate-fade-in">
      {/* Balão de Notificação Inteligente (Adaptado pelo Motor Comportamental) */}
      {showTooltip && (
        <div className="relative max-w-xs bg-white rounded-2xl p-3.5 shadow-2xl border-2 border-emerald-300 text-xs text-ink-800 animate-slide-up flex items-start gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0 mt-1" />
          <div className="flex-1">
            <p className="font-extrabold text-emerald-950 flex items-center gap-1">
              Atendimento Oficial Angola
            </p>
            <p className="text-ink-600 mt-0.5 leading-snug">
              {strategy.floatingTooltip || "Tens dúvidas de como pagar ou como encomendar? Clica aqui e fala connosco no WhatsApp!"}
            </p>
          </div>
          <button
            onClick={() => setShowTooltip(false)}
            className="text-ink-400 hover:text-ink-700 p-0.5"
            aria-label="Fechar aviso"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Botão Flutuante Principal */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        onMouseEnter={() => setShowTooltip(false)}
        className="group relative flex items-center gap-2.5 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-full shadow-xl shadow-emerald-600/30 active:scale-95 transition-all duration-300 cursor-pointer"
        aria-label="Apoio ao cliente no WhatsApp"
      >
        <span className="relative flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-300" />
        </span>
        <MessageCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
        <span className="hidden sm:inline font-extrabold">Apoio WhatsApp (922 058 136)</span>
      </a>
    </div>
  );
}
