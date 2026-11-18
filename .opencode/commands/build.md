---
description: Implementar a próxima tarefa (ou o plano completo, com "auto")
---

Invoca as skills `incremental-implementation` e `test-driven-development`.

## Modos

- `/build` — implementa a próxima tarefa pendente e para.
- `/build auto` — gera o plano se necessário, pede uma única aprovação e executa todas as tarefas sem parar entre elas.

Os argumentos recebidos são: `$ARGUMENTS`. Trata `auto` ou `all` como modo autónomo; vazio ou qualquer outro valor como modo de tarefa única.

## Tarefa única

1. Lê os critérios de aceitação da tarefa.
2. Carrega o contexto relevante (código existente, padrões, tipos).
3. Escreve o teste que falha (RED).
4. Implementa o mínimo para passar (GREEN).
5. Corre a suite completa para detetar regressões.
6. Corre `npx tsc --noEmit` e o build.
7. Faz commit descritivo.
8. Marca a tarefa como concluída e para.

## Autónomo (`/build auto`)

1. Exige uma especificação em `SPEC.md`, `docs/SPEC.md`, `spec/` ou uma especificação delta.
2. Confirma que a árvore de trabalho está limpa (`git status --porcelain`); se houver alterações alheias ao trabalho, para e pergunta.
3. Gera ou reutiliza o plano, registando `Source spec: <caminho>` no topo.
4. Apresenta o plano e espera aprovação inequívoca. Respostas hesitantes não contam como aprovação.
5. Executa cada tarefa pela ordem de dependências, com um commit por tarefa (nunca `git add -A` às cegas).
6. Para e pergunta quando um teste não passar, a especificação for ambígua, ou a tarefa for de alto risco (autenticação, migrações destrutivas, pagamentos, segredos, deploy).
7. No fim, resume: tarefas concluídas, testes acrescentados, commits feitos e o que ficou pendente.
