"use client";

import React, { useEffect } from "react";
import { useCart } from "@/context/CartContext";
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Plus,
  Minus,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { formatKz } from "@/lib/types";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { useRouter } from "next/navigation";
import { useAdaptiveIntelligence } from "@/context/AdaptiveIntelligenceContext";

export function CartDrawer() {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    isOpen,
    setIsOpen,
    totalKz,
    itemCount,
    freightSavedKz,
  } = useCart();
  const { recordEvent } = useAdaptiveIntelligence();

  useEffect(() => {
    if (items.length > 0) {
      recordEvent("CART_UPDATE", { count: items.length, totalKz });
    }
  }, [items, totalKz, recordEvent]);

  // Relógio de urgência decrescente (ex: 04h 28m 15s)
  if (!isOpen) return null;

  const handleCheckout = () => {
    setIsOpen(false);
    router.push("/checkout");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop escuro */}
      <div
        className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm transition-opacity"
        onClick={() => setIsOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Cabeçalho da Mala Coletiva */}
          <div className="p-4 sm:p-5 border-b border-ink-100 bg-brand-600 text-white flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-white/10 grid place-items-center">
                <ShoppingBag className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <h2 className="text-base font-bold flex items-center gap-1.5">
                  Mala Coletiva da Semana
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-400 text-ink-950">
                    FRETE GRÁTIS
                  </span>
                </h2>
                <p className="text-xs text-brand-100">
                  {itemCount} {itemCount === 1 ? "artigo adicionado" : "artigos adicionados"}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-xl hover:bg-white/10 text-brand-100 hover:text-white transition"
              aria-label="Fechar carrinho"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-3.5 bg-brand-50 border-b border-brand-100 text-xs text-brand-900">
            Confirma o conteúdo e o valor do pedido com a equipa antes de pagar.
          </div>

          {/* Lista de Itens no Carrinho */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-ink-100 text-ink-400 grid place-items-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-ink-900 text-base">A tua mala coletiva está vazia</h3>
                <p className="text-xs text-ink-500 max-w-xs">
                  Cola o link de qualquer vestido, ténis ou artigo da SHEIN para juntar à mala e garantir frete grátis na entrega em Angola!
                </p>
                <Link
                  href="/importar"
                  onClick={() => setIsOpen(false)}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition"
                >
                  Colar Link da SHEIN Agora →
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl border border-ink-200 bg-white hover:border-brand-300 transition shadow-sm flex gap-3.5"
                >
                  {/* Foto do Artigo */}
                  <div className="w-16 h-16 rounded-xl bg-ink-100 shrink-0 overflow-hidden border border-ink-100">
                    {item.image ? (
                      <ResponsiveImage
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover"
                        fallbackText={item.platform}
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-ink-400 text-xs font-bold">
                        {item.platform}
                      </div>
                    )}
                  </div>

                  {/* Informações */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-bold text-ink-900 text-xs leading-snug line-clamp-2">
                        {item.title}
                      </h4>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-ink-400 hover:text-red-500 p-1 transition"
                        title="Remover"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-ink-500 mt-1">
                      <span className="font-semibold text-brand-700">{item.platform}</span>
                      {item.variantSize && <span>· Tam: {item.variantSize}</span>}
                      {item.variantColor && <span>· Cor: {item.variantColor}</span>}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                      {/* Controles de Quantidade */}
                      <div className="flex items-center border border-ink-200 rounded-lg overflow-hidden bg-ink-50">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1 text-ink-600 hover:bg-ink-200 transition"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 py-0.5 text-xs font-bold text-ink-900">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1 text-ink-600 hover:bg-ink-200 transition"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Preço em Kwanzas */}
                      <span className="font-extrabold text-sm text-ink-900 tabular-nums">
                        {formatKz(item.priceKz * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Rodapé: Resumo Financeiro & Finalização Papa Feita */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-ink-200 bg-ink-50 space-y-3">
              {/* Vantagem da Mala Coletiva em Destaque */}
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="flex justify-between font-semibold">
                  <span>Frete Internacional Aéreo:</span>
                  <span className="line-through text-ink-400">4.500 Kz</span>
                </div>
                <div className="flex justify-between font-extrabold text-emerald-800">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Benefício Mala Coletiva:
                  </span>
                  <span>100% GRÁTIS</span>
                </div>
              </div>

              {/* Total Final */}
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-xs text-ink-500 font-semibold uppercase">Total a Pagar:</span>
                  <p className="text-[11px] text-emerald-700 font-medium">Tudo incluído até Luanda</p>
                </div>
                <span className="text-2xl font-extrabold text-brand-700 tabular-nums">
                  {formatKz(totalKz)}
                </span>
              </div>

              {/* Botões de Ação */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 active:scale-[0.99] transition cursor-pointer"
                >
                  Garantir Vaga e Pagar Agora <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex gap-2">
                  <Link
                    href="/importar"
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-2 px-3 rounded-xl border border-ink-300 bg-white hover:bg-ink-100 text-ink-800 text-xs font-bold text-center transition flex items-center justify-center gap-1"
                  >
                    + Colar Mais Links
                  </Link>
                  <Link
                    href="/carrinho"
                    onClick={() => setIsOpen(false)}
                    className="py-2 px-3 rounded-xl border border-brand-200 bg-brand-50 hover:bg-brand-100 text-brand-800 text-xs font-bold text-center transition"
                  >
                    Ver Tudo
                  </Link>
                </div>
              </div>

              {/* Selo Papa Feita */}
              <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-ink-500 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Pague por Express (929 423 278) ou Ref. Entidade: 10116</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
