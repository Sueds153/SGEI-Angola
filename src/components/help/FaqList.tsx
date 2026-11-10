"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";

const FAQS = [
  {
    q: "Vocês são a SHEIN?",
    a: "Não. A SGEI é uma plataforma angolana de intermediação de compras. Nós tratamos da compra e entrega de produtos encontrados na SHEIN para clientes em Angola. Não somos afiliados oficialmente à SHEIN.",
  },
  {
    q: "Eu pago à SHEIN?",
    a: "Não. Tu pagas diretamente à SGEI, em Kwanzas (Kz), através dos métodos disponíveis (transferência, referência, pagamento digital).",
  },
  {
    q: "Como calculam o preço?",
    a: "O preço em Kz inclui: o valor do produto (convertido com o câmbio do dia), uma taxa de serviço, custos de logística internacional e entrega em Angola. O valor total é sempre apresentado de forma transparente antes de confirmares o pedido.",
  },
  {
    q: "Quanto tempo demora a entrega?",
    a: "Tipicamente entre 15 a 25 dias úteis após confirmação do pagamento. Esse prazo inclui compra, envio internacional e entrega local. Podes acompanhar tudo pela página do pedido.",
  },
  {
    q: "Como acompanho o meu pedido?",
    a: "Em /pedidos, usando a referência que recebes ao criar o pedido (ex: SG-28491). Também receberás atualizações via WhatsApp em etapas chave.",
  },
  {
    q: "Posso mandar um link direto da SHEIN?",
    a: "Sim! Na página inicial há um campo para colar o link do produto. Se o produto já estiver no nosso catálogo, verás o preço em Kz imediatamente. Se não, a nossa equipa irá confirmar o preço antes do pagamento.",
  },
  {
    q: "O preço pode mudar depois do pedido?",
    a: "Não. O preço é congelado no momento em que o pedido é criado. Caso haja alguma alteração excepcional antes da compra, entramos em contacto contigo antes de prosseguir.",
  },
  {
    q: "Como funciona a entrega?",
    a: "Entregamos em todas as províncias de Angola. Em Luanda a entrega é feita por estafeta. Para outras províncias, a entrega pode ser feita através de transportadora ou ponto de recolha.",
  },
];

export function FaqList() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-ink-200 border-t border-b border-ink-200">
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <Reveal key={i} delay={i * 40} amount={14}>
            <button
              onClick={() => setOpen(isOpen ? null : i)}
              className="w-full py-6 md:py-8 flex items-start gap-6 text-left group"
              aria-expanded={isOpen}
            >
              <span
                className={cn(
                  "font-mono text-[11px] uppercase tracking-[0.2em] pt-1 transition-colors",
                  isOpen ? "text-primary-600" : "text-ink-400"
                )}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <h3
                  className={cn(
                    "text-lg md:text-2xl font-semibold tracking-tight leading-tight transition-colors",
                    isOpen ? "text-ink-900" : "text-ink-700 group-hover:text-ink-900"
                  )}
                >
                  {f.q}
                </h3>
                <div
                  className={cn(
                    "grid transition-all duration-500",
                    isOpen ? "grid-rows-[1fr] opacity-100 mt-4" : "grid-rows-[0fr] opacity-0"
                  )}
                >
                  <p className="overflow-hidden text-[15px] md:text-base text-ink-600 leading-relaxed">
                    {f.a}
                  </p>
                </div>
              </div>
              <span
                className={cn(
                  "h-8 w-8 rounded-full grid place-items-center flex-shrink-0 transition-colors",
                  isOpen ? "bg-ink-900 text-white" : "bg-ink-100 text-ink-700 group-hover:bg-ink-200"
                )}
              >
                {isOpen ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              </span>
            </button>
          </Reveal>
        );
      })}
    </div>
  );
}
