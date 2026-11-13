import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Termos e Condições",
  description: "Condições de utilização do serviço ImportEasy em Angola.",
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8"><h2 className="text-xl font-semibold text-ink-900">{title}</h2><div className="mt-3 space-y-3 text-ink-600 leading-7">{children}</div></section>
);

export default function TermsPage() {
  return <main className="mx-auto max-w-3xl px-5 py-14 md:py-20">
    <p className="text-sm font-medium text-brand-700">ImportEasy · Angola</p>
    <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink-950">Termos e Condições</h1>
    <p className="mt-4 text-ink-500">Última atualização: 13 de Novembro de 2026</p>
    <p className="mt-6 text-ink-600 leading-7">Estes termos explicam como funciona o serviço de intermediação de compras da ImportEasy. Ao solicitar uma cotação ou criar um pedido, recomendamos que os leia. Os direitos obrigatórios do consumidor previstos na legislação angolana mantêm-se aplicáveis.</p>
    <div className="mt-10">
      <Section title="1. O serviço"><p>A ImportEasy facilita, mediante solicitação do cliente, a aquisição de produtos disponibilizados por vendedores terceiros em plataformas como SHEIN, AliExpress e Vinted, e coordena o transporte e a entrega em Angola. A ImportEasy não é proprietária dessas plataformas nem representa oficialmente essas marcas. A disponibilidade, descrição, cor, tamanho, composição e autenticidade anunciadas são da responsabilidade do vendedor de origem, sem prejuízo dos direitos que a lei reconhece ao consumidor perante a ImportEasy.</p></Section>
      <Section title="2. Cotação, preço e confirmação"><p>Uma simulação ou cotação é uma estimativa até ser revista e confirmada pela ImportEasy. O preço pode depender da disponibilidade, variante, preço e moeda do vendedor, câmbio, peso/dimensões, transporte e encargos aplicáveis. Antes do pagamento, o cliente deve receber o valor total e os elementos relevantes do pedido. A compra só avança após confirmação do pedido, aceitação do valor final e validação do pagamento pela ImportEasy. Se o valor ou produto não puder ser confirmado, o cliente pode não prosseguir e qualquer montante recebido para esse pedido será tratado e devolvido conforme acordado e a lei aplicável.</p><p>Não pague valores diferentes dos comunicados nos canais oficiais. Guarde a referência do pedido e o comprovativo.</p></Section>
      <Section title="3. Pagamento"><p>Os métodos e instruções de pagamento são apresentados no site ou comunicados pela equipa para cada pedido. O envio de comprovativo não equivale, por si só, à validação: a equipa confirma a recepção e o estado do pagamento. Nunca partilhe PIN, palavra-passe ou códigos de autenticação do Multicaixa.</p></Section>
      <Section title="4. Entrega e acompanhamento"><p>Os prazos apresentados são estimativas e contam, em regra, após confirmação do pagamento e aquisição junto do vendedor. Podem ocorrer atrasos por disponibilidade do vendedor, transporte internacional, alfândega, força maior ou operação das transportadoras. A ImportEasy informará o cliente sobre alterações relevantes e disponibilizará o acompanhamento disponível. A modalidade e o local de entrega são os indicados na confirmação do pedido; podem existir limitações de cobertura ou custos comunicados previamente.</p></Section>
      <Section title="5. Cancelamentos, problemas e reembolsos"><p>Contacte o apoio assim que pretender cancelar ou comunicar falta, dano, divergência ou atraso. A possibilidade de cancelamento depende da fase da compra e do transporte; a ImportEasy informará o cliente sobre custos já incorridos e opções antes de qualquer decisão, respeitando os direitos legais aplicáveis. Quando houver lugar a reembolso, será feito pelo meio acordado com o cliente, dentro do prazo comunicado, após confirmação dos dados necessários. Estes termos não excluem garantias, direitos de reclamação ou outros direitos imperativos do consumidor.</p><p>Para facilitar a análise, conserve a referência, comprovativos, fotografias da embalagem/produto e mensagens relativas ao pedido.</p></Section>
      <Section title="6. Deveres do cliente"><p>O cliente deve fornecer contactos, endereço, produto e variante corretos; verificar a cotação antes de pagar; assegurar que o produto solicitado pode ser importado; e responder a pedidos razoáveis de informação necessários para executar a encomenda. Não aceitamos solicitações de bens proibidos por lei ou pelas regras de transporte.</p></Section>
      <Section title="7. Apoio e reclamações"><p>Para dúvidas, reclamações, cancelamentos ou pedidos relativos a uma encomenda, contacte <a className="text-brand-700 underline" href="mailto:apoio@importeasy.ao">apoio@importeasy.ao</a> ou o WhatsApp <a className="text-brand-700 underline" href="https://wa.me/244922058136">+244 922 058 136</a>, indicando a referência do pedido. A ImportEasy analisará a situação e responderá pelos canais de contacto fornecidos.</p></Section>
      <Section title="8. Dados pessoais"><p>Os dados necessários para gerir pedidos e prestar apoio são tratados conforme a <Link className="text-brand-700 underline" href="/privacidade">Política de Privacidade</Link>. O cliente pode exercer os direitos aplicáveis através dos contactos acima.</p></Section>
      <Section title="9. Alterações e lei aplicável"><p>Estes termos podem ser atualizados para refletir alterações do serviço ou da lei. A versão aplicável ao pedido será disponibilizada ao cliente no momento da contratação. Aplicam-se as leis da República de Angola, sem prejuízo dos direitos imperativos do consumidor e das regras de competência legalmente aplicáveis.</p></Section>
    </div>
    <p className="mt-10 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">Nota: esta informação é geral e não substitui aconselhamento jurídico. Para publicar, confirme que os procedimentos descritos correspondem à operação real da empresa e complete a identificação legal do operador, morada e contactos formais.</p>
  </main>;
}
