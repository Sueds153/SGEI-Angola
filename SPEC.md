# Spec: Descoberta de produtos — V1

## Objectivo

Permitir que clientes descubram produtos dentro do ImportEasy, pesquisando o catálogo já disponível no projecto e filtrando por loja e intenção de compra. O fluxo deve ser simples em telemóvel e explicar que o cliente tem de confirmar os detalhes do produto na loja de origem antes de concluir o pedido.

### Critérios de aceitação

- A página de pesquisa permite introduzir uma expressão e filtrar por SHEIN, AliExpress ou Vinted.
- A SHEIN apresenta vestuário; o AliExpress apresenta gadgets e acessórios electrónicos; a Vinted apresenta apenas iPhones elegíveis.
- Um produto Vinted só é elegível para o filtro de 72 horas quando existe uma data de publicação fornecida e validada pela fonte. A data de recolha ou última verificação do ImportEasy não pode ser usada como substituto.
- Quando não houver dados Vinted com data de publicação verificável, a interface explica essa limitação e permite continuar a usar a pesquisa por link.
- Os resultados provêm apenas do catálogo já disponível no ImportEasy nesta versão. A interface não sugere que está a consultar todo o inventário das lojas nem que os resultados são em tempo real.
- Antes de adicionar/confirmar um produto, o cliente é lembrado de verificar na loja de origem o artigo, variantes, disponibilidade e preço actual.
- Pesquisa, filtros, resultados e estados vazios são utilizáveis em ecrãs móveis e desktop, com controlos acessíveis por teclado e leitores de ecrã.

## Stack

- Next.js 16 App Router, React 19 e TypeScript.
- Tailwind CSS 4, Drizzle ORM e Neon Postgres.
- Pesquisa V1 sobre os providers/catálogo interno existentes; sem novo serviço externo ou dependência.

## Comandos

- Desenvolvimento: `npm run dev`
- Testes: `npx playwright test`
- Tipos: `npx tsc --noEmit`
- Build: `npx next build`

## Estrutura do projecto

- `src/app/pesquisa/`: página e experiência de pesquisa.
- `src/lib/providers/`: pesquisa e normalização do catálogo existente.
- `src/components/product/`: cartões de produto reutilizados.
- `tests/`: testes Playwright existentes e cobertura da nova experiência.
- `.opencode/`: skills, comandos e referências do projecto.

## Estilo de código

Manter a pesquisa tipada e os filtros explícitos, sem transformar dados desconhecidos em dados confirmados. Por exemplo:

```ts
type StoreFilter = "ALL" | "SHEIN" | "ALIEXPRESS" | "VINTED";

function isRecentlyPublished(publishedAt: Date | null, now: Date): boolean {
  if (!publishedAt) return false;
  const age = now.getTime() - publishedAt.getTime();
  return age >= 0 && age <= 72 * 60 * 60 * 1000;
}
```

Não usar `createdAt` ou `lastPriceCheckAt` como data de publicação. Não adicionar emojis à interface. Imagens CDN externas mantêm o tratamento actual com `<img>` directo quando aplicável.

## Estratégia de testes

- Testes unitários para pesquisa/filtros: loja, categoria e janela de 72 horas, incluindo datas ausentes, futuras e no limite.
- Testes Playwright para pesquisa no mobile e desktop, filtros, resultados vazios, aviso de verificação na origem e fallback para colar link.
- Verificação final de tipos com `npx tsc --noEmit`; build e suite Playwright antes de publicar.

## Fronteiras

- **Fazer sempre:** usar apenas produtos que o catálogo existente disponibiliza; validar os filtros no servidor quando a consulta for servida pela API; indicar limitações e pedir confirmação do produto na loja original.
- **Perguntar antes:** adicionar uma migração de base de dados ou integração/API externa, activar recolha automatizada adicional, ou introduzir dependências.
- **Nunca fazer:** apresentar `lastPriceCheckAt`/`createdAt` como data de publicação; anunciar inventário completo ou pesquisa em tempo real sem cobertura comprovada; recolher sistematicamente dados de lojas sem autorização; expor segredos.

## Fora do âmbito desta versão

- Pesquisa em tempo real nos marketplaces e recolha adicional por scraping.
- Integração com APIs de afiliados ou feeds autorizados, dependente de credenciais e permissões ainda não configuradas.
- Garantia de anúncios Vinted publicados nas últimas 72 horas enquanto a fonte não fornecer uma data de publicação verificável.

## Questões em aberto

- A implementação V1 assume o catálogo interno existente como fonte de resultados e falha em segurança para Vinted quando não há data de publicação verificável. Esta limitação decorre do modelo actual e mantém a pesquisa por link como alternativa.
