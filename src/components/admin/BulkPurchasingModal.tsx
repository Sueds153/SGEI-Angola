"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  ShoppingBag,
  ExternalLink,
  Copy,
  CheckCircle2,
  X,
  Layers,
  Sparkles,
  Package,
} from "lucide-react";
import { formatUsd } from "@/lib/types";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";

interface BulkItem {
  id: number;
  orderReference: string;
  customerName: string;
  productName: string;
  productImage: string | null;
  sourceUrl: string | null;
  quantity: number;
  variantColor: string | null;
  variantSize: string | null;
  originalPriceUsd: string | null;
}

export function BulkPurchasingModal({ items }: { items: BulkItem[] }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyList = () => {
    const text = items
      .map(
        (i, idx) =>
          `${idx + 1}. [${i.orderReference}] ${i.productName}\n` +
          `   - Qtd: ${i.quantity} | Tam: ${i.variantSize || "Único"} | Cor: ${i.variantColor || "Padrão"}\n` +
          (i.sourceUrl ? `   - Link: ${i.sourceUrl}\n` : "")
      )
      .join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => setOpen(true)}
        className="bg-brand-50 hover:bg-brand-100 text-brand-800 font-bold border-brand-200"
      >
        <Layers className="w-4 h-4 mr-1.5 text-brand-600" />
        Lista de Compra SHEIN ({items.length})
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/60 backdrop-blur-sm grid place-items-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-ink-200">
            {/* Cabeçalho */}
            <div className="p-5 border-b border-ink-100 flex items-center justify-between bg-ink-50 rounded-t-3xl">
              <div>
                <h3 className="font-extrabold text-ink-900 text-lg flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-brand-600" />
                  Lista de Encomendas Prontas para Comprar na SHEIN
                </h3>
                <p className="text-xs text-ink-500 mt-0.5">
                  {items.length} artigo(s) pagos e validados a aguardar compra no fornecedor internacional.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="secondary" onClick={handleCopyList}>
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 mr-1" />}
                  {copied ? "Copiado!" : "Copiar Lista"}
                </Button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 text-ink-400 hover:text-ink-700 rounded-xl hover:bg-ink-200 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lista dos Artigos */}
            <div className="p-5 overflow-y-auto flex-1 divide-y divide-ink-100">
              {items.length === 0 ? (
                <div className="py-12 text-center text-ink-500">
                  <Package className="w-10 h-10 mx-auto text-ink-300 mb-2" />
                  <p>Nenhum artigo com pagamento aprovado a aguardar compra no momento.</p>
                </div>
              ) : (
                items.map((i, idx) => (
                  <div key={i.id} className="py-3.5 flex items-center gap-4 first:pt-0 last:pb-0">
                    <span className="font-mono text-xs font-bold text-ink-400 w-6">#{idx + 1}</span>

                    <div className="w-14 h-14 rounded-xl bg-ink-100 shrink-0 overflow-hidden border border-ink-200">
                      {i.productImage ? (
                        <ResponsiveImage
                          src={i.productImage}
                          alt={i.productName}
                          fill
                          className="object-cover"
                          fallbackText="Item"
                        />
                      ) : (
                        <div className="w-full h-full grid place-items-center text-ink-400 text-xs font-bold">
                          Item
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md">
                          #{i.orderReference}
                        </span>
                        <span className="text-xs text-ink-500 truncate">({i.customerName})</span>
                      </div>
                      <p className="font-bold text-ink-900 text-sm truncate mt-0.5">{i.productName}</p>
                      <div className="flex items-center gap-3 text-xs text-ink-600 mt-1">
                        <span>Qtd: <strong>{i.quantity}</strong></span>
                        {i.variantSize && <span>Tam: <strong>{i.variantSize}</strong></span>}
                        {i.variantColor && <span>Cor: <strong>{i.variantColor}</strong></span>}
                        {i.originalPriceUsd && (
                          <span className="text-emerald-700 font-semibold font-mono">
                            ${Number(i.originalPriceUsd).toFixed(2)} USD
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      {i.sourceUrl ? (
                        <a
                          href={i.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-ink-900 hover:bg-black text-white text-xs font-bold shadow-sm transition"
                        >
                          Abrir na SHEIN <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      ) : (
                        <span className="text-xs text-ink-400">Sem link direto</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Rodapé */}
            <div className="p-4 border-t border-ink-100 bg-ink-50 rounded-b-3xl flex justify-between items-center text-xs text-ink-500">
              <span>Dica: Abra cada link, adicione ao seu carrinho na SHEIN e conclua com o seu cartão corporativo.</span>
              <Button size="sm" variant="primary" onClick={() => setOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
