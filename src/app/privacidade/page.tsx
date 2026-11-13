import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Como a ImportEasy utiliza e protege os dados pessoais dos clientes.",
};

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="mb-8"><h2 className="text-xl font-semibold text-ink-900">{title}</h2><div className="mt-3 space-y-3 text-ink-600 leading-7">{children}</div></section>
);

export default function PrivacyPage() {
  return <main className="mx-auto max-w-3xl px-5 py-14 md:py-20">
    <p className="text-sm font-medium text-brand-700">ImportEasy · Angola</p>
    <h1 className="mt-2 text-4xl font-bold tracking-tight text-ink-950">Política de Privacidade</h1>
    <p className="mt-4 text-ink-500">Última atualização: 13 de Novembro de 2026</p>
    <p className="mt-6 text-ink-600 leading-7">Esta política descreve, em linguagem simples, como a ImportEasy trata dados pessoais quando utiliza o site, pede uma cotação ou faz uma encomenda. O tratamento deve respeitar a legislação angolana de protecção de dados, incluindo a Lei n.º 22/11, e os direitos aplicáveis dos titulares.</p>
    <div className="mt-10">
      <Section title="1. Quem trata os dados"><p>O serviço é apresentado sob a marca ImportEasy. A entidade legal que opera o serviço deve ser identificada aqui antes da publicação: <strong>[inserir denominação legal e NIF]</strong>, com endereço de contacto em Angola. Até essa identificação estar completa, contacte <a className="text-brand-700 underline" href="mailto:apoio@importeasy.ao">apoio@importeasy.ao</a> para questões de privacidade.</p></Section>
      <Section title="2. Dados que podemos recolher"><p>Consoante a utilização, podemos tratar nome, telefone, e-mail, endereço de entrega, referência e estado do pedido, detalhes do produto e variante, mensagens de apoio e comprovativos de pagamento enviados pelo cliente. O site também pode processar dados técnicos de navegação, como endereço IP, tipo de dispositivo e registos de segurança. Evite enviar dados que não sejam necessários; nunca envie PIN ou palavra-passe bancária.</p></Section>
      <Section title="3. Para que usamos os dados"><p>Usamos os dados para preparar cotações, registar e acompanhar pedidos, confirmar pagamentos, coordenar compras e entregas, responder a dúvidas e reclamações, prevenir fraude, manter a segurança e cumprir obrigações legais e contabilísticas. Comunicações promocionais só devem ser enviadas quando houver fundamento válido; o cliente pode pedir para deixar de as receber.</p></Section>
      <Section title="4. Fundamento e minimização"><p>O tratamento deve limitar-se ao necessário para responder ao pedido do cliente, executar o serviço, cumprir obrigações legais ou proteger interesses legítimos compatíveis com os direitos do titular. Quando a lei exigir consentimento, este será solicitado de forma específica e pode ser retirado. Dados não necessários para a finalidade não devem ser recolhidos.</p></Section>
      <Section title="5. Partilha e transferências"><p>Para executar uma encomenda, alguns dados necessários podem ser partilhados com vendedores, transportadoras, prestadores de pagamento, alojamento e ferramentas técnicas, apenas na medida necessária. Como o serviço envolve compras e transporte internacionais, certos dados podem ser processados fora de Angola. A ImportEasy deve selecionar prestadores adequados, limitar o acesso e adotar as salvaguardas e formalidades exigidas pela legislação aplicável. Não vendemos dados pessoais.</p></Section>
      <Section title="6. Conservação e segurança"><p>Conservamos os dados apenas durante o tempo necessário para as finalidades descritas e para cumprir prazos legais, resolver litígios e manter registos de transações. O período concreto depende do tipo de dado e da obrigação aplicável. Aplicamos medidas técnicas e organizativas razoáveis para proteger os dados; nenhum sistema de transmissão ou armazenamento pode ser prometido como absolutamente inviolável.</p></Section>
      <Section title="7. Direitos do titular"><p>Nos termos da lei aplicável, o titular pode solicitar informação sobre os seus dados, acesso, correção e, quando cabível, eliminação ou oposição ao tratamento. Pode também apresentar reclamação à autoridade competente. Para exercer direitos ou retirar consentimento quando aplicável, escreva para <a className="text-brand-700 underline" href="mailto:apoio@importeasy.ao">apoio@importeasy.ao</a>, indicando o pedido e um meio seguro para confirmar a identidade. Não envie documentos de identificação completos salvo se forem estritamente necessários e solicitados por canal apropriado.</p></Section>
      <Section title="8. Cookies e tecnologias semelhantes"><p>O site pode utilizar armazenamento técnico necessário ao funcionamento e segurança. Se forem usados cookies de análise ou publicidade não essenciais, a plataforma deve informar o visitante e recolher as escolhas ou consentimentos exigidos antes de os ativar. Pode gerir cookies nas definições do navegador.</p></Section>
      <Section title="9. Alterações e contacto"><p>Esta política pode ser atualizada quando os processos ou a legislação mudarem. A versão atual estará nesta página. Para questões de privacidade, contacte <a className="text-brand-700 underline" href="mailto:apoio@importeasy.ao">apoio@importeasy.ao</a> ou WhatsApp <a className="text-brand-700 underline" href="https://wa.me/244922058136">+244 922 058 136</a>.</p></Section>
    </div>
    <p className="mt-10 rounded-xl bg-amber-50 p-4 text-sm leading-6 text-amber-900">Antes da publicação, substitua a identificação legal em falta e confirme com apoio jurídico os prazos reais de conservação, fornecedores com acesso a dados, transferências internacionais e mecanismos de cookies usados no site. A política deve descrever a prática real; não cria, por si só, conformidade legal.</p>
  </main>;
}
