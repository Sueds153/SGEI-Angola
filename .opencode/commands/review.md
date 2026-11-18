---
description: Revisão em cinco eixos — correção, legibilidade, arquitetura, segurança, desempenho
---

Invoca a skill `code-review-and-quality`.

Revê as alterações atuais (staged ou commits recentes) nos cinco eixos:

1. **Correção** — cumpre a especificação? Casos-limite tratados? Testes adequados?
2. **Legibilidade** — nomes claros? Lógica direta? Bem organizado?
3. **Arquitetura** — segue os padrões do projeto? Fronteiras limpas? Abstração no nível certo?
4. **Segurança** — entradas validadas? Segredos protegidos? Autorização verificada? (skill `security-and-hardening`)
5. **Desempenho** — sem consultas N+1? Sem operações sem limite? (skill `performance-optimization`)

Classifica cada achado como Crítico, Obrigatório, Opcional ou Detalhe. Apresenta referências `ficheiro:linha` e a correção recomendada.
