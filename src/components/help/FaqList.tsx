"use client";

import { useState } from "react";
import { Reveal } from "@/components/motion";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";

const FAQS = [
  {
    q: "O que é a ImportEasy e como funciona?",
    a: "A ImportEasy ajuda clientes em Angola a solicitar produtos da Shein, AliExpress e Vinted. Envie o link, aguarde a validação do produto e do valor total pela equipa e, se concordar, conclua o pedido e o pagamento. A entrega depende da confirmação do pedido e da cobertura disponível.",
  },
  {
    q: "Como faço o pagamento em Kwanzas?",
    a: "Paga comodamente em Kwanzas através de dois métodos simples: 1) Pelo aplicativo Multicaixa Express enviando diretamente para o número 929 423 278; ou 2) No ATM / Express por Pagamento por Referência (Entidade: 10116 · Referência: 929 423 278). Não necessita de cartão de crédito internacional nem de dólares/euros.",
  },
  {
    q: "Tenho de pagar alguma taxa extra na alfândega quando a encomenda chegar?",
    a: "A simulação é uma estimativa. Antes do pagamento, a equipa confirma o produto, a disponibilidade e o valor total, incluindo os custos aplicáveis ao pedido. Avance apenas depois de rever e aceitar essa confirmação.",
  },
  {
    q: "E se a encomenda for extraviada ou tiver problemas na alfândega?",
    a: "Contacte o apoio com a referência do pedido assim que notar um problema. A equipa verificará o estado e explicará as opções aplicáveis ao caso, de acordo com a fase da encomenda e os direitos legais do consumidor.",
  },
  {
    q: "Quanto tempo demora a entrega em Angola?",
    a: "O prazo apresentado para cada pedido é estimado e depende da loja, disponibilidade, transporte internacional, alfândega e destino em Angola. A equipa confirma a previsão e a modalidade de entrega disponíveis antes do pagamento.",
  },
  {
    q: "Posso colar qualquer link da Shein, AliExpress ou Vinted?",
    a: "Pode colar um link suportado na página de simulação. Alguns produtos ou anúncios precisam de validação manual; nesses casos, a equipa confirma se pode tratar do pedido e informa o valor antes do pagamento.",
  },
  {
    q: "O preço pode mudar depois de eu fazer o pedido?",
    a: "O valor da simulação pode mudar após a verificação do preço, variante, disponibilidade, câmbio e custos de envio. O valor vinculativo é o confirmado pela equipa antes do pagamento.",
  },
  {
    q: "Como acompanho o estado do meu pedido?",
    a: "Consulte a página /rastrear com a referência do pedido. O estado é atualizado quando a equipa regista uma nova etapa. Para ajuda, contacte o WhatsApp de apoio (+244 922 058 136).",
  },
  {
    q: "Consigo encomendar gadgets e eletrónica do AliExpress?",
    a: "Pode enviar o link do artigo para análise. A equipa confirma se o produto pode ser transportado, a disponibilidade e o valor total do pedido antes de solicitar o pagamento.",
  },
  {
    q: "Dá para importar iPhones e ténis de marca da Vinted Europa?",
    a: "Envie o anúncio para a equipa verificar a disponibilidade, o estado descrito pelo vendedor e a possibilidade de compra e envio. Artigos usados dependem das informações e condições do próprio anúncio; confirme os detalhes antes de avançar.",
  },
  {
    q: "Posso juntar peças da SHEIN, AliExpress e Vinted na mesma encomenda?",
    a: "Pode adicionar vários artigos ao carrinho. A possibilidade de consolidação, custos e forma de pagamento serão confirmados pela equipa para o seu pedido antes do pagamento.",
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
