# Plano de implementação: Descoberta de produtos V1

Especificação de origem: `SPEC.md`

## Resumo

Adicionar pesquisa do catálogo interno por termo, loja e categoria. SHEIN fica limitada a vestuário, AliExpress a gadgets/acessórios electrónicos e Vinted a iPhones com data de publicação comprovada nas últimas 72 horas. Como o catálogo actual não fornece essa data, a experiência Vinted deve falhar em segurança, explicar a limitação e encaminhar para a pesquisa por link. O checkout mostra um lembrete para confirmar o artigo, as opções, disponibilidade e preço na origem.

## Decisões

- Manter a consulta no catálogo/provider já existente, sem integrações externas, scraping adicional ou migração de base de dados.
- Adicionar `publishedAt` como campo opcional de produto normalizado; só fontes que forneçam a data podem preencher o campo.
- Centralizar classificação, filtragem por loja e janela temporal numa função pura testável.
- Usar filtros GET na página de pesquisa para manter URL partilhável e funcionamento sem JavaScript adicional.
- Tratar a ausência de data Vinted como não elegível, nunca usar `createdAt` ou `lastPriceCheckAt` como aproximação.

## Tarefas

### Fase 1: Regras de pesquisa
- [x] Tarefa 1: Adicionar filtros/classificação e testes unitários.

### Checkpoint: Regras
- [x] Testes da função de descoberta passam.
- [x] Tipos passam.

### Fase 2: Pesquisa e confirmação
- [x] Tarefa 2: Implementar formulário mobile-first, filtros, estados vazios e aviso Vinted.
- [x] Tarefa 3: Incluir lembrete de verificação no checkout e cobertura de UI.

### Checkpoint: Completo
- [x] Testes focados passam (4/4); verificação local em viewport móvel e checkout passou.
- [x] `npx tsc --noEmit` passa.
- [x] `npx next build` passa.
- [x] Experiência local verificada a 390 px, sem overflow horizontal.
- [ ] Suite completa: 22 passaram; 1 falhou numa asserção antiga da página Comunidade e 1 teste do catálogo foi instável por timeout na produção, passando na repetição.

## Riscos e mitigação

| Risco | Impacto | Mitigação |
|---|---|---|
| Catálogo Vinted sem data de publicação | Pesquisa Vinted fica sem resultados elegíveis | Mensagem explícita e link para pesquisa por URL; sem inferir data |
| Produtos com origem/categoria incompletas | Classificação pode excluir resultados | Classificar por origem e termos controlados; testar exemplos positivos/negativos |
| Playwright existente aponta para produção | Testes podem verificar versão errada ou causar efeitos | Novos testes puros sem mutações; verificação browser manual em servidor local |

## Perguntas em aberto

- Nenhuma para a V1. API/feeds autorizados e disponibilidade de `publishedAt` ficam para uma fase posterior.
