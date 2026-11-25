"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "O que é a ImportEasy e como funciona?",
    a: "A ImportEasy ajuda clientes em Angola a solicitar produtos da Shein, AliExpress e Vinted. Envie o link, aguarde a validação do produto e do valor total pela equipa e, se concordar, conclua o pedido e o pagamento. A entrega depende da confirmação do pedido e da cobertura disponível.",
  },
  {
    q: "Como faço o pagamento em Kwanzas?",
    a: "Paga comodamente em Kwanzas por Multicaixa Express ou referência bancária. Os dados de pagamento (número de entidade e referência) só são mostrados quando inicia o checkout, para garantir a segurança da sua transação. Não necessita de cartão de crédito internacional nem de dólares/euros.",
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
          <div key={i}>
            <button
              id={`faq-question-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
              className="group flex min-h-16 w-full items-center justify-between gap-4 py-5 text-left"
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${i}`}
            >
              <span
                className={cn(
                  "text-base sm:text-lg font-medium leading-snug transition-colors",
                  isOpen ? "text-ink-950" : "text-ink-700 group-hover:text-ink-950"
                )}
              >
                {f.q}
              </span>
              <ChevronDown
                aria-hidden="true"
                className={cn(
                  "h-5 w-5 shrink-0 text-ink-500 transition-transform duration-200",
                  isOpen && "rotate-180"
                )}
              />
            </button>
            <div
              id={`faq-answer-${i}`}
              role="region"
              aria-labelledby={`faq-question-${i}`}
              aria-hidden={!isOpen}
              hidden={!isOpen}
              className="max-w-3xl pb-5 pr-8 text-sm sm:text-base leading-relaxed text-ink-600"
            >
              {f.a}
            </div>
          </div>
        );
      })}
    </div>
  );
}
