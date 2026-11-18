# Agent Skills no ImportEasy

Este projeto usa o pacote [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills)
como base de qualidade para o trabalho do agente.

## O que foi instalado

| Caminho | Conteúdo |
| --- | --- |
| `.opencode/skills/<nome>/SKILL.md` | 25 skills (especificação, planeamento, TDD, revisão, segurança, desempenho, etc.) |
| `.opencode/references/*.md` | Listas de verificação partilhadas (segurança, desempenho, acessibilidade, testes, definição de concluído) |
| `.opencode/commands/*.md` | Comandos `/spec`, `/plan`, `/build`, `/test`, `/review`, `/constraints`, `/ship`, `/webperf`, `/code-simplify` |
| `AGENTS.md` | Regras do projeto e mapeamento intenção → skill |

Os caminhos `../../references/...` referidos dentro das skills apontam para
`.opencode/references/`, por isso essa pasta tem de acompanhar as skills.

## Como funciona

1. O OpenCode descobre as skills automaticamente nos caminhos do projeto.
2. O `AGENTS.md` instrui o agente a carregar a skill adequada antes de agir.
3. Os comandos são atalhos explícitos para os fluxos mais usados.

## Atualizar as skills

```powershell
git clone --depth 1 https://github.com/addyosmani/agent-skills.git "$env:TEMP\agent-skills"
Copy-Item "$env:TEMP\agent-skills\skills\*" .opencode\skills\ -Recurse -Force
Copy-Item "$env:TEMP\agent-skills\references\*" .opencode\references\ -Recurse -Force
```

Depois de atualizar, rever o `AGENTS.md` (o mapeamento pode mudar) e confirmar
que as skills continuam a referir `../../references/`.

## Notas

- Não copiar o `AGENTS.md` nem o `CLAUDE.md` do repositório de origem: são
  específicos do desenvolvimento desse pacote.
- A skill `browser-testing-with-devtools` exige o servidor MCP `chrome-devtools`
  configurado; sem ele, usar o Playwright que já existe no projeto.
- A skill `constraint-driven-development` cria `CONSTRAINTS.md` na raiz quando
  for executada com `/constraints`.
