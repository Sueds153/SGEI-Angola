---
description: Auditoria de desempenho web orientada a dados reais
---

Invoca a skill `performance-optimization` e segue o fluxo de auditoria web.

**Modo profundo** — quando existe um relatório Lighthouse (JSON), resposta do PageSpeed Insights, dados CrUX, trace de DevTools, ou um URL acessível com o servidor `chrome-devtools` MCP configurado.

**Modo rápido** — por omissão, quando não há dados acima: analisa o código à procura de anti-padrões estruturais e marca cada achado como "impacto potencial".

Devolve uma tabela de métricas (nunca inventar valores; usar `não medido` quando aplicável), lista de achados priorizada, pontos positivos e recomendações. Foca Core Web Vitals, peso de JavaScript, imagens e renderização no servidor.
