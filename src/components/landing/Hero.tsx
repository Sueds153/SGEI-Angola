"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Clipboard, ShieldCheck, CreditCard, Truck, Check } from "lucide-react";

export default function Hero() {
  const router = useRouter();
  const [productUrl, setProductUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = productUrl.trim();
    if (trimmed) {
      router.push(`/importar?url=${encodeURIComponent(trimmed)}`);
    } else {
      router.push("/importar");
    }
  };

  const handlePaste = async () => {
    try {
      if (navigator?.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setProductUrl(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }
      }
    } catch {
      // Ignorar caso o navegador bloqueie permissão
    }
  };

  const stores = [
    { name: "SHEIN", className: "font-bold tracking-tight" },
    { name: "AliExpress", className: "font-medium tracking-tight" },
    { name: "Zara", className: "font-serif tracking-[0.08em]" },
    { name: "Vinted", className: "font-medium" },
    { name: "Amazon", className: "font-medium tracking-tight" },
  ];

  return (
    <section className="relative bg-white pt-8 pb-10 sm:pt-14 sm:pb-16 border-b border-ink-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Título Principal — Direto e Humano */}
        <div className="max-w-3xl mb-7 sm:mb-9">
          <p className="text-xs font-semibold tracking-[0.14em] uppercase text-ink-500 mb-3">Importação simples para Angola</p>
          <h1 className="text-[2.35rem] sm:text-6xl font-semibold text-ink-950 tracking-[-0.045em] leading-[1.02] mb-4 text-balance">
            O que encontras lá fora,
            <span className="block text-brand-600">recebes em Angola.</span>
          </h1>
          <p className="text-sm sm:text-base text-ink-600 max-w-2xl leading-relaxed">
            Sem cartão internacional. Paga em Kwanzas por Multicaixa Express ou referência bancária e nós tratamos de comprar, desalfandegar e entregar.
          </p>
        </div>

        {/* Card do Simulador Mobile First */}
        <div className="bg-white rounded-xl p-3 sm:p-5 border border-ink-200 max-w-3xl">
          <form onSubmit={handleSimulate} className="flex flex-col gap-2.5">
            <label htmlFor="hero-product-url" className="sr-only">
              Link do produto que pretende importar
            </label>
            <div className="relative flex items-center bg-white rounded-lg border border-ink-300 focus-within:border-brand-600 focus-within:ring-2 focus-within:ring-brand-600/15 transition-colors">
              <input
                id="hero-product-url"
                type="text"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="Cola aqui o link do artigo…"
                className="w-full py-3.5 pl-3.5 pr-20 bg-transparent text-sm sm:text-base text-ink-900 placeholder:text-ink-400 outline-none"
              />
              <button
                type="button"
                onClick={handlePaste}
                className="absolute right-2 min-h-11 px-2.5 rounded-lg bg-white border border-ink-200 text-xs font-semibold text-ink-800 hover:bg-ink-100 flex items-center gap-1 active:scale-95 transition"
                title="Colar da área de transferência"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clipboard className="w-3.5 h-3.5 text-ink-500" />}
                <span>{copied ? "Colado!" : "Colar"}</span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-lg bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <span>Simular Preço em Kwanzas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Lojas disponíveis */}
          <div className="mt-3.5 border-t border-ink-100 pt-3 sm:flex sm:items-center sm:justify-between sm:gap-4">
            <span className="text-[11px] font-medium text-ink-500">Lojas disponíveis</span>
            <ul aria-label="Lojas disponíveis para importação" className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-ink-700 sm:mt-0 sm:justify-end">
              {stores.map((store, index) => (
                <li key={store.name} className="flex items-center gap-3">
                  {index > 0 && <span aria-hidden="true" className="h-3 w-px bg-ink-200" />}
                  <span className={store.className}>{store.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 3 Reassurances Rápidos para o Cliente Angolano */}
        <div className="grid grid-cols-3 gap-3 mt-6 max-w-3xl text-left">
          <div className="flex items-start gap-2.5 py-3 border-t border-ink-200">
            <CreditCard aria-hidden="true" className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
            <span className="text-xs leading-snug"><strong className="block text-ink-900 font-semibold">Pagamento local</strong><span className="text-ink-600">Sem cartão internacional</span></span>
          </div>
          <div className="flex items-start gap-2.5 py-3 border-t border-ink-200">
            <ShieldCheck aria-hidden="true" className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
            <span className="text-xs leading-snug"><strong className="block text-ink-900 font-semibold">Preço confirmado</strong><span className="text-ink-600">Antes de pagar</span></span>
          </div>
          <div className="flex items-start gap-2.5 py-3 border-t border-ink-200">
            <Truck aria-hidden="true" className="w-4 h-4 text-brand-600 mt-0.5 shrink-0" />
            <span className="text-xs leading-snug"><strong className="block text-ink-900 font-semibold">Entrega em Angola</strong><span className="text-ink-600">Luanda e províncias</span></span>
          </div>
        </div>
      </div>
    </section>
  );
}
