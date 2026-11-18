---
description: Escrever uma especificação estruturada antes de escrever código
---

Invoca a skill `spec-driven-development`.

Verifica primeiro se existe `SPEC.md` na raiz do projeto para decidir o fluxo.

**Nova especificação** (não existe `SPEC.md`, ou o pedido não tem relação com o que está descrito):
1. Compreende o objetivo e os utilizadores-alvo.
2. Levanta os requisitos funcionais e critérios de aceitação.
3. Confirma stack e restrições técnicas (Next.js, Drizzle, Neon, Vercel).
4. Define fronteiras: o que fazer sempre, o que perguntar antes, o que nunca fazer.

Gera depois a especificação com objetivo, comandos, estrutura do projeto, estilo de código, estratégia de testes e fronteiras.
Guarda em `SPEC.md` e confirma com o utilizador antes de avançar.

**Especificação delta** (`SPEC.md` existe e o pedido altera o que está descrito): não a substituas — cria `SPEC-<alteracao>.md` a cobrir apenas a alteração.
