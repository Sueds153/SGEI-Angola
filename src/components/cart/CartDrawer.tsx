"use client";

import React, { useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";
import { useModalAccessibility } from "@/hooks/useModalAccessibility";
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Plus,
  Minus,
} from "lucide-react";
import Link from "next/link";
import { formatKzAmount } from "@/lib/money";
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
  } = useCart();
  const { recordEvent } = useAdaptiveIntelligence();
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (items.length > 0) {
      recordEvent("CART_UPDATE", { count: items.length, totalKz });
    }
  }, [items, totalKz, recordEvent]);

  useModalAccessibility({
    isOpen,
    onClose: () => setIsOpen(false),
    dialogRef,
    initialFocusRef: closeButtonRef,
  });

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
        <div
          ref={dialogRef}
          id="cart-drawer"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cart-drawer-title"
          tabIndex={-1}
          className="w-screen max-w-md bg-white shadow-2xl flex flex-col"
        >
          <div className="p-4 sm:p-5 border-b border-ink-200 bg-white text-ink-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-ink-100 grid place-items-center">
                <ShoppingBag className="w-5 h-5 text-ink-700" />
              </div>
              <div>
                <h2 id="cart-drawer-title" className="text-base font-semibold">
                  Carrinho
                </h2>
                <p className="text-xs text-ink-600">
                  {itemCount} {itemCount === 1 ? "artigo adicionado" : "artigos adicionados"}
                </p>
              </div>
            </div>
            <button
              ref={closeButtonRef}
              type="button"
              onClick={() => setIsOpen(false)}
              className="h-11 w-11 grid place-items-center hover:bg-ink-100 text-ink-600 hover:text-ink-900 transition-colors"
              aria-label="Fechar carrinho"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de Itens no Carrinho */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-ink-100 text-ink-400 grid place-items-center">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-semibold text-ink-900 text-base">Ainda não tens artigos no carrinho</h3>
                <p className="text-xs text-ink-500 max-w-xs">
                  Cola o link de um artigo para veres uma estimativa em Kwanzas.
                </p>
                <Link
                  href="/importar"
                  onClick={() => setIsOpen(false)}
                  className="mt-2 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 text-white font-bold text-xs hover:bg-brand-700 transition"
                >
                  Adicionar artigo
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 border-b border-ink-200 bg-white transition-colors flex gap-3.5"
                >
                  {/* Foto do Artigo */}
                  <div
                    className="relative isolate w-16 h-16 rounded-xl bg-ink-100 shrink-0 overflow-hidden border border-ink-100"
                    style={{ width: 64, height: 64, minWidth: 64, minHeight: 64, flex: "0 0 64px" }}
                  >
                    {item.image ? (
                      <ResponsiveImage
                        src={item.image}
                        alt={item.title}
                        width={64}
                        height={64}
                        objectFit="cover"
                        className="h-full w-full object-cover"
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
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="h-11 w-11 grid place-items-center text-ink-500 hover:text-red-600 transition"
                        aria-label={`Remover ${item.title} do carrinho`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-ink-500 mt-1">
                      <span className="font-semibold text-brand-700">{item.platform}</span>
                      {item.variantSize && <span>· Tam: {item.variantSize}</span>}
                      {item.variantColor && <span>· Cor: {item.variantColor}</span>}
                    </div>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                      {/* Controles de Quantidade */}
                      <div className="flex items-center border border-ink-200 rounded-lg overflow-hidden bg-ink-50">
                        <button
                          type="button"
                          disabled={item.quantity <= 1}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-11 w-11 grid place-items-center text-ink-700 hover:bg-ink-200 disabled:cursor-not-allowed disabled:opacity-40 transition"
                          aria-label={`Diminuir quantidade de ${item.title}`}
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 py-0.5 text-xs font-bold text-ink-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-11 w-11 grid place-items-center text-ink-700 hover:bg-ink-200 transition"
                          aria-label={`Aumentar quantidade de ${item.title}`}
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Preço em Kwanzas */}
                      <span className="font-extrabold text-sm text-ink-900 tabular-nums">
                        {formatKzAmount(item.priceKz * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Resumo e confirmação do pedido */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-ink-200 bg-white space-y-3">
              <div className="flex items-baseline justify-between pt-1">
                <div>
                  <span className="text-sm text-ink-700 font-semibold">Estimativa dos artigos</span>
                  <p className="text-xs text-ink-500 mt-1">Entrega e condições confirmadas antes do pagamento</p>
                </div>
                <span className="text-xl font-semibold text-ink-950 tabular-nums">
                  {formatKzAmount(totalKz)}
                </span>
              </div>

              {/* Botões de Ação */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleCheckout}
                  className="w-full py-3.5 px-4 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  Continuar para confirmação <ArrowRight className="w-4 h-4" />
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
                <span>Pague por Express ou referência bancária · dados mostrados no checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
