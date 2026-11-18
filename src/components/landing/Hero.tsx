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

  const storePills = [
    { name: "SHEIN", color: "hover:border-pink-300 hover:bg-pink-50 text-pink-700 bg-pink-50/50 border-pink-200" },
    { name: "AliExpress", color: "hover:border-orange-300 hover:bg-orange-50 text-orange-700 bg-orange-50/50 border-orange-200" },
    { name: "Zara & Vinted", color: "hover:border-blue-300 hover:bg-blue-50 text-blue-700 bg-blue-50/50 border-blue-200" },
    { name: "Amazon", color: "hover:border-amber-300 hover:bg-amber-50 text-amber-700 bg-amber-50/50 border-amber-200" },
  ];

  return (
    <section className="relative bg-gradient-to-b from-brand-50/40 via-white to-white pt-4 pb-10 sm:pt-10 sm:pb-16 border-b border-ink-100/60">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Aviso de Lote / Status */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-200/80 text-brand-900 text-xs font-semibold shadow-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Encomendas abertas para o próximo lote Luanda</span>
          </div>
        </div>

        {/* Título Principal — Direto e Humano */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-ink-950 tracking-tight leading-[1.15] mb-3">
            SHEIN e AliExpress <br className="hidden sm:inline" />
            <span className="text-brand-600">entregues na tua porta em Angola</span>
          </h1>
          <p className="text-sm sm:text-base text-ink-600 max-w-xl mx-auto leading-relaxed">
            Sem cartão internacional. Paga em Kwanzas por Multicaixa Express ou referência bancária e nós tratamos de comprar, desalfandegar e entregar.
          </p>
        </div>

        {/* Card do Simulador Mobile First */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-xl shadow-brand-950/5 border border-brand-100 max-w-2xl mx-auto">
          <form onSubmit={handleSimulate} className="flex flex-col gap-2.5">
            <div className="relative flex items-center bg-ink-50/80 rounded-xl sm:rounded-2xl border border-ink-200 focus-within:border-brand-500 focus-within:ring-2 focus-within:ring-brand-500/10 focus-within:bg-white transition-all">
              <input
                id="hero-product-url"
                type="text"
                value={productUrl}
                onChange={(e) => setProductUrl(e.target.value)}
                placeholder="Cola aqui o link da SHEIN ou AliExpress..."
                className="w-full py-3.5 pl-3.5 pr-20 bg-transparent text-sm sm:text-base text-ink-900 placeholder:text-ink-400 outline-none"
              />
              <button
                type="button"
                onClick={handlePaste}
                className="absolute right-2 px-2.5 py-1.5 rounded-lg bg-white border border-ink-200 text-ink-700 text-xs font-semibold hover:bg-ink-100 flex items-center gap-1 active:scale-95 transition"
                title="Colar da área de transferência"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Clipboard className="w-3.5 h-3.5 text-ink-500" />}
                <span>{copied ? "Colado!" : "Colar"}</span>
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 px-6 rounded-xl sm:rounded-2xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md shadow-brand-600/20 active:scale-[0.99] transition cursor-pointer"
            >
              <span>Simular Preço em Kwanzas</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Lojas Compatíveis */}
          <div className="mt-3.5 pt-3 border-t border-ink-100 flex flex-wrap items-center justify-between gap-2">
            <span className="text-[11px] font-medium text-ink-500">Lojas que trazemos:</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {storePills.map((store) => (
                <span
                  key={store.name}
                  className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border transition ${store.color}`}
                >
                  {store.name}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 3 Reassurances Rápidos para o Cliente Angolano */}
        <div className="grid grid-cols-3 gap-2 mt-6 max-w-xl mx-auto text-center">
          <div className="flex flex-col items-center p-2 rounded-xl bg-ink-50/60 border border-ink-100">
            <CreditCard className="w-4 h-4 text-brand-600 mb-1" />
            <span className="text-[11px] font-bold text-ink-900 leading-tight">Pagamento Local</span>
            <span className="text-[10px] text-ink-500">Sem cartão Visa</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-ink-50/60 border border-ink-100">
            <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
            <span className="text-[11px] font-bold text-ink-900 leading-tight">Valor Confirmado</span>
            <span className="text-[10px] text-ink-500">Antes de pagar</span>
          </div>
          <div className="flex flex-col items-center p-2 rounded-xl bg-ink-50/60 border border-ink-100">
            <Truck className="w-4 h-4 text-blue-600 mb-1" />
            <span className="text-[11px] font-bold text-ink-900 leading-tight">Entrega em Angola</span>
            <span className="text-[10px] text-ink-500">Luanda e Províncias</span>
          </div>
        </div>
      </div>
    </section>
  );
}
