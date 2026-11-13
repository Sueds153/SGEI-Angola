"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";

const FAQS = [
  {
    q: "O que é a ImportEasy e como funciona?",
    a: "A ImportEasy é uma plataforma angolana especializada em intermediação de compras internacionais da Shein, AliExpress e Vinted para clientes em Angola. Você escolhe o produto que deseja, nós compramos ao fornecedor internacional, tratamos de toda a logística e alfândega, e entregamos na sua porta.",
  },
  {
    q: "Como faço o pagamento em Kwanzas?",
    a: "Paga comodamente em Kwanzas através de dois métodos simples: 1) Pelo aplicativo Multicaixa Express enviando diretamente para o número 929 423 278; ou 2) No ATM / Express por Pagamento por Referência (Entidade: 10116 · Referência: 929 423 278). Não necessita de cartão de crédito internacional nem de dólares/euros.",
  },
  {
    q: "Tenho de pagar alguma taxa extra na alfândega quando a encomenda chegar?",
    a: "Não. O preço calculado e apresentado no simulador e no checkout é final e garantido. O desalfandegamento, impostos alfandegários (AGT) e frete internacional já estão 100% incluídos. Não existem taxas surpresa na entrega.",
  },
  {
    q: "E se a encomenda for extraviada ou tiver problemas na alfândega?",
    a: "Com a nossa Garantia 100% de Entrega, você está totalmente protegido. Se houver qualquer extravio internacional ou problema irreversível na alfândega, nós realizamos novo envio sem qualquer custo adicional ou reembolsamos a totalidade do valor pago em Kwanzas.",
  },
  {
    q: "Quanto tempo demora a entrega em Angola?",
    a: "O prazo médio de entrega por frete aéreo expresso é de 15 a 25 dias úteis após a confirmação do pagamento. Em Luanda a entrega é feita ao domicílio por estafeta; nas províncias (Benguela, Huambo, Lubango, Cabinda, etc.) a entrega é feita via transportadora ou ponto de recolha.",
  },
  {
    q: "Posso colar qualquer link da Shein, AliExpress ou Vinted?",
    a: "Sim! Na nossa página de simulação (/importar) pode colar o link de qualquer produto destas plataformas. O nosso sistema calcula automaticamente o valor em Kwanzas na hora.",
  },
  {
    q: "O preço pode mudar depois de eu fazer o pedido?",
    a: "Não. O preço fica congelado e garantido a partir do momento em que o pedido é submetido. O valor que você vê é o valor exato que paga.",
  },
  {
    q: "Como acompanho o estado do meu pedido?",
    a: "Pode acompanhar em tempo real na página /rastrear usando a referência do pedido (ex: SG-14023) ou o seu número de telefone. Além disso, a nossa equipa envia notificações e confirmações pelo WhatsApp de apoio (+244 922 058 136).",
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
