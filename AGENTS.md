<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ImportEasy Angola — regras do projeto

Plataforma de intermediação para importar produtos (SHEIN, AliExpress, Vinted) para Angola.
Stack: Next.js (App Router), TypeScript, Drizzle ORM, Neon Postgres, Tailwind, deploy na Vercel.

## Regras de trabalho

- Responder sempre em português de Portugal.
- Nunca escrever segredos (`DATABASE_URL`, `JWT_SECRET`, `CRON_SECRET`, chaves de API) no código, em commits ou no chat. Usar variáveis de ambiente.
- `next.config.ts` tem `typescript.ignoreBuildErrors: true`: correr sempre `npx tsc --noEmit` antes de concluir.
- Antes de publicar: `npx tsc --noEmit`, `npx next build` e `npx playwright test`.
- Sem emojis na interface do site.
- Imagens: ficheiros locais via `next/image`; URLs externas (CDN dos fornecedores) via `<img>` direto, porque o otimizador devolve 400 para origens não configuradas.

## Agent Skills (OpenCode)

Este projeto usa as skills instaladas em `.opencode/skills/` (pacote `addyosmani/agent-skills`) e os comandos em `.opencode/commands/`.

### Regras centrais

- Se a tarefa corresponder a uma skill, invocá-la com a ferramenta `skill` antes de agir.
- Seguir o fluxo da skill por inteiro; não aplicar apenas parte dele.
- Não saltar passos obrigatórios (especificação, plano, testes) quando a skill os exige.
- O material partilhado está em `.opencode/references/`; caminhos `../../references/...` dentro das skills apontam para lá.

### Mapeamento intenção → skill

- Funcionalidade nova → `spec-driven-development`, depois `incremental-implementation` + `test-driven-development`
- Planeamento / divisão de trabalho → `planning-and-task-breakdown`
- Bug, falha, comportamento inesperado → `debugging-and-error-recovery`
- Revisão de código → `code-review-and-quality`
- Refatoração / simplificação → `code-simplification`
- API ou contrato entre módulos → `api-and-interface-design`
- Interface / componentes / acessibilidade → `frontend-ui-engineering`
- Segurança, entradas não confiáveis, autenticação → `security-and-hardening`
- Desempenho, Core Web Vitals, consultas lentas → `performance-optimization`
- Registo, métricas, diagnóstico em produção → `observability-and-instrumentation`
- Migrações e remoção de sistemas antigos → `deprecation-and-migration`
- Decisões de arquitetura documentadas → `documentation-and-adrs`
- Preparação de lançamento → `shipping-and-launch`
- Requisitos vagos → `interview-me` e `idea-refine`
- Dúvida sobre uma decisão de risco → `doubt-driven-development`
- Pipeline de CI/CD → `ci-cd-and-automation`
- Verificação em browser real → `browser-testing-with-devtools`
- Fluxo de git, commits atómicos, versões → `git-workflow-and-versioning`
- Escolher que skill usar → `using-agent-skills`

### Comandos disponíveis

`/spec`, `/plan`, `/build`, `/test`, `/review`, `/constraints`, `/ship`, `/webperf`, `/code-simplify`.

### Modelo de execução

1. Determinar se alguma skill se aplica (mesmo com pouca probabilidade).
2. Carregar a skill com a ferramenta `skill`.
3. Seguir o fluxo exatamente.
4. Só implementar depois de cumpridos os passos obrigatórios.

Se existir `CONSTRAINTS.md` na raiz, lê-lo e nunca enfraquecer as suas regras para fazer passar uma alteração.
