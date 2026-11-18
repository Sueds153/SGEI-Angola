---
description: Simplificar código sem alterar comportamento
---

Invoca a skill `code-simplification`.

Simplifica o código alterado recentemente (ou o âmbito indicado) preservando o comportamento exato:

1. Lê o `AGENTS.md` e estuda as convenções do projeto.
2. Identifica o alvo — alterações recentes, salvo âmbito diferente indicado.
3. Compreende o propósito, chamadores, casos-limite e cobertura de testes antes de mexer.
4. Procura oportunidades: aninhamento profundo (guard clauses), funções longas, ternários encadeados, nomes genéricos, lógica duplicada, código morto.
5. Aplica cada simplificação de forma incremental e corre os testes após cada passo.
6. Verifica que os testes passam, o build compila e o diff está limpo.

Se um teste falhar após uma simplificação, reverte essa alteração.
