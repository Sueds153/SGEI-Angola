---
description: Preparar o lançamento em produção com checklist e plano de reversão
---

Invoca a skill `shipping-and-launch`.

Produz uma decisão única de lançamento:

## Bloqueadores (corrigir antes de publicar)
- Achado crítico com `ficheiro:linha`.

## Correções recomendadas
- Achado importante com `ficheiro:linha`.

## Riscos aceites
- Risco e mitigação.

## Plano de reversão
- Condições que disparam a reversão.
- Procedimento exato (ex.: `vercel rollback`, reverter commit).
- Objetivo de tempo de recuperação.

## Verificações deste projeto
- Variáveis de ambiente na Vercel (`DATABASE_URL`, `JWT_SECRET`, `CRON_SECRET`).
- Migrações aplicadas na base de dados de produção.
- `npx tsc --noEmit` e `npx next build` limpos.
- Crons registados em `vercel.json`.

A decisão final é GO ou NO-GO. Se existir um achado crítico, o resultado por omissão é NO-GO.
