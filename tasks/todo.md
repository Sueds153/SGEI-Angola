# Tarefas — Descoberta de produtos V1

## [x] Tarefa 1: Regras de pesquisa e testes

**Aceitação:** origem normalizada por source/URL; SHEIN restringida a vestuário; AliExpress restringido a electrónica; Vinted restringida a iPhones elegíveis com data comprovada <=72h; datas ausentes, futuras e antigas são rejeitadas.

**Verificação:** teste focado `npx playwright test tests/product-discovery.spec.ts`; `npx tsc --noEmit`.

**Ficheiros:** `src/lib/types.ts`, `src/lib/search/product-discovery.ts`, `tests/product-discovery.spec.ts`.

## [x] Tarefa 2: Pesquisa mobile-first

**Aceitação:** pesquisa por termo com filtros persistentes de loja/categoria, resultados compatíveis com a loja, estado vazio útil, limitação Vinted explícita e acesso à pesquisa por link.

**Verificação:** testes focados; browser local em mobile e desktop.

**Ficheiros:** `src/app/pesquisa/page.tsx`, `tests/product-discovery.spec.ts`.

## [x] Tarefa 3: Lembrete no checkout

**Aceitação:** antes de confirmar, o cliente é instruído a conferir artigo, variantes, disponibilidade e preço na loja de origem.

**Verificação:** teste de renderização/browser e `npx tsc --noEmit`.

**Ficheiros:** `src/components/checkout/CheckoutFlow.tsx`, `tests/product-discovery.spec.ts`.

## Checkpoint final

- [x] Testes focados passam; suite completa executada (ver resultado no plano).
- [x] `npx tsc --noEmit` passa.
- [x] `npx next build` passa.
- [x] Interface verificada no browser local, incluindo mobile e lembrete de checkout.
