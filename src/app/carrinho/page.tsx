"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { formatKzAmount } from "@/lib/money";
import { useRouter } from "next/navigation";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { FlightStatusBanner } from "@/components/home/FlightStatusBanner";

export default function CarrinhoPage() {
  const router = useRouter();
  const {
    items,
    removeItem,
    updateQuantity,
    totalKz,
    itemCount,
  } = useCart();

  const handleAdvanceToCheckout = () => {
    if (items.length === 0) return;
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Calendário do Voo da Semana */}
      <FlightStatusBanner />

      <div className="py-10 md:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Cabeçalho */}
        <div className="mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-ink-950 tracking-tight">
              A Tua Mala Coletiva
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> FRETE GRÁTIS ATIVO
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-600">
            Todas as tuas peças reunidas num único envio aéreo consolidado para Luanda.
          </p>
        </div>

        {/* Informação de pagamento e confirmação */}
        <div className="p-4 sm:p-5 rounded-2xl bg-brand-50 border border-brand-200 shadow-sm mb-6 space-y-2.5">
          <p className="text-sm font-semibold text-brand-900">Revê os artigos antes de continuar.</p>
          <p className="text-xs text-brand-800">A equipa confirma disponibilidade, custos e condições do pedido antes do pagamento. Só avances depois de receberes e aceitares o valor confirmado.</p>
        </div>

        {items.length === 0 ? (
          <div className="bg-white rounded-3xl border border-ink-200 p-6 sm:p-12 text-center shadow-sm space-y-3 sm:space-y-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-ink-100 text-ink-400 grid place-items-center mx-auto">
              <ShoppingBag className="w-8 h-8 sm:w-10 sm:h-10" />
            </div>
            <h2 className="text-xl font-bold text-ink-900">A tua mala coletiva está vazia</h2>
            <p className="text-sm text-ink-500 max-w-md mx-auto">
              Ainda não adicionaste nenhuma peça. Cola o link daquele vestido, ténis ou artigo que viste na SHEIN ou AliExpress e junta à mala coletiva da semana!
            </p>
            <Link
              href="/importar"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand-600 text-white font-bold text-sm hover:bg-brand-700 transition shadow-md shadow-brand-500/20"
            >
              Colar Link de Produto Agora →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Lista de Itens */}
            <div className="lg:col-span-2 space-y-3.5">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-5 rounded-2xl border border-ink-200 bg-white shadow-sm flex gap-4 items-center"
                >
                  <div className="relative w-20 h-20 rounded-xl bg-ink-100 shrink-0 overflow-hidden border border-ink-100">
                    {item.image ? (
                      <ResponsiveImage
                        src={item.image}
                        alt={item.title}
                        width={80}
                        height={80}
                        objectFit="cover"
                        className="h-full w-full object-cover"
                        fallbackText={item.platform}
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center text-xs font-bold text-ink-400">
                        {item.platform}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-ink-900 text-sm leading-snug line-clamp-2">
                        {item.title}
                      </h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="h-11 w-11 grid place-items-center text-ink-500 hover:text-red-600 transition"
                        aria-label={`Remover ${item.title} do carrinho`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs text-brand-700 font-semibold mt-0.5">{item.platform}</p>

                    <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center border border-ink-200 rounded-lg overflow-hidden bg-ink-50">
                        <button
                          type="button"
                          disabled={item.quantity <= 1}
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="h-11 w-11 grid place-items-center text-ink-700 hover:bg-ink-200 disabled:cursor-not-allowed disabled:opacity-40 transition"
                          aria-label={`Diminuir quantidade de ${item.title}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 py-1 text-xs font-bold text-ink-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="h-11 w-11 grid place-items-center text-ink-700 hover:bg-ink-200 transition"
                          aria-label={`Aumentar quantidade de ${item.title}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <span className="font-extrabold text-base text-ink-900 tabular-nums">
                        {formatKzAmount(item.priceKz * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}

              <div className="pt-2">
                <Link
                  href="/importar"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:text-brand-700 p-2"
                >
                  + Adicionar mais peças da SHEIN à mesma mala
                </Link>
              </div>
            </div>

            {/* Resumo da Compra */}
            <div>
              <div className="bg-white rounded-2xl border border-ink-200 p-5 shadow-sm space-y-4 sticky top-24">
                <h3 className="font-bold text-ink-900 text-base">Resumo da Mala Coletiva</h3>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-ink-600">
                    <span>Artigos ({itemCount}):</span>
                    <span className="font-semibold text-ink-900">{formatKzAmount(totalKz)}</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Frete Internacional Aéreo:</span>
                    <span className="line-through text-ink-400">4.500 Kz</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-bold bg-emerald-50 p-2 rounded-lg">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Desconto Mala Coletiva:
                    </span>
                    <span>100% GRÁTIS</span>
                  </div>
                  <div className="flex justify-between text-ink-600">
                    <span>Desalfandegamento em Luanda:</span>
                    <span className="font-semibold text-emerald-700">Incluído</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-ink-100 flex items-baseline justify-between">
                  <span className="font-bold text-ink-900 text-sm">Total Final em Kwanzas:</span>
                  <span className="text-2xl font-extrabold text-brand-700 tabular-nums">
                    {formatKzAmount(totalKz)}
                  </span>
                </div>

                <button
                  onClick={handleAdvanceToCheckout}
                  className="w-full py-4 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-brand-500/25 active:scale-[0.99] transition cursor-pointer"
                >
                  Continuar para confirmação <ArrowRight className="w-4 h-4" />
                </button>

                <div className="p-3 rounded-xl bg-ink-50 text-xs text-ink-600 text-center space-y-1">
                  <p className="font-semibold text-ink-800">Pagamento simples em Angola</p>
                  <p>Multicaixa Express (929 423 278) ou Referência (Entidade: 10116 / Ref: 929 423 278)</p>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
