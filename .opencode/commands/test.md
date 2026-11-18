---
description: Fluxo TDD — teste que falha primeiro, depois implementação
---

Invoca a skill `test-driven-development`.

**Funcionalidade nova:**
1. Escreve os testes que descrevem o comportamento esperado (devem falhar).
2. Implementa o código para os passar.
3. Refatora mantendo os testes verdes.

**Correção de bug (padrão Prove-It):**
1. Escreve um teste que reproduz o bug (deve falhar).
2. Confirma que falha.
3. Implementa a correção.
4. Confirma que passa.
5. Corre a suite completa para detetar regressões.

Neste projeto os testes end-to-end usam Playwright (`npx playwright test`) e a verificação de tipos é `npx tsc --noEmit`. Para problemas de interface, invoca também `browser-testing-with-devtools`.
