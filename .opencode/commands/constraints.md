---
description: Definir e impor o nível de qualidade do projeto em CONSTRAINTS.md
---

Invoca a skill `constraint-driven-development`.

Argumentos recebidos: `$ARGUMENTS`. Sem argumentos, define as restrições do repositório.

1. **Deteta primeiro.** Lê `package.json`, configs de lint, testes, cobertura e CI. Nunca perguntes o que podes ler.
2. **Entrevista, no máximo quatro perguntas**, uma de cada vez, com uma sugestão e um valor por omissão utilizável.
3. **Escreve `CONSTRAINTS.md`** na raiz com secção de base mínima, números impostos, métricas apenas medidas e tabela de exceções com responsável e validade.
4. **Instala a ferramenta de cada dimensão escolhida.** Uma dimensão com número e sem ferramenta é uma aspiração.
5. **Coloca cada verificação no momento certo**: tipos e lint no ciclo de edição; testes no fim da tarefa; o resto na revisão ou CI.
6. **Aponta o agente para o ficheiro**: acrescenta ao `AGENTS.md` a regra de ler `CONSTRAINTS.md` e nunca enfraquecê-lo para fazer passar uma alteração.
7. **Verifica** contra o ramo atual.

Subcomandos: `/constraints check`, `/constraints guard`, `/constraints ratchet`.
