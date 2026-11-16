/**
 * /api/cron/daily-scraper
 *
 * Rota automática do scraper diário.
 * Executa uma vez por dia às 03:00 UTC (configurável via Vercel Cron ou externa).
 *
 * Segurança:
 *  - Verifica CRON_SECRET no header "Authorization: Bearer <token>"
 *  - Apenas GET e POST são aceites
 *
 * Uso externo (ex: cURL de teste):
 *   curl -X GET https://seusite.com/api/cron/daily-scraper \
 *     -H "Authorization: Bearer SEU_CRON_SECRET"
 */

import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutos máx (Vercel Pro)

async function runScraper(testMode: boolean) {
  // Import dinâmico para evitar problemas com edge runtime
  // O scraper usa Node APIs (fs, sharp) que só funcionam no Node runtime
  try {
    const { runDailyScraper } = await import(
      "../../../../../functions/scraper/index.js" as string
    );
    return await runDailyScraper({ test: testMode });
  } catch (err: any) {
    console.error("[CronRoute] Falha ao importar scraper:", err.message);
    // Em ambiente de desenvolvimento sem DB, retorna simulação
    if (process.env.NODE_ENV === "development") {
      return {
        success: true,
        newProducts: 0,
        errors: 0,
        duration: "0s",
        note: "Modo desenvolvimento — sem DB configurado. Scraper não executado.",
      };
    }
    throw err;
  }
}

export async function GET(request: NextRequest) {
  return handleRequest(request);
}

export async function POST(request: NextRequest) {
  return handleRequest(request);
}

async function handleRequest(request: NextRequest) {
  const startedAt = new Date().toISOString();

  // ── Autenticação ─────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET || process.env.SCRAPER_CRON_TOKEN;
  if (cronSecret) {
    const authHeader =
      request.headers.get("authorization") ||
      request.headers.get("x-cron-secret");
    const token = authHeader?.replace(/^Bearer\s+/i, "").trim();

    if (token !== cronSecret) {
      console.warn("[CronRoute] Acesso negado — token inválido");
      return NextResponse.json(
        { error: "Unauthorized", hint: "Authorization: Bearer <CRON_SECRET>" },
        { status: 401 }
      );
    }
  } else {
    // Sem secret configurado — só permite em desenvolvimento
    if (process.env.NODE_ENV !== "development") {
      console.error(
        "[CronRoute] CRON_SECRET não configurado em produção. Bloquear acesso."
      );
      return NextResponse.json(
        {
          error: "Server misconfiguration",
          hint: "Set CRON_SECRET in environment variables",
        },
        { status: 500 }
      );
    }
  }

  // ── Parâmetros ────────────────────────────────────────────────────────────
  const { searchParams } = request.nextUrl;
  const testMode = searchParams.get("test") === "true";

  console.log(
    `[CronRoute] Scraper iniciado por rota — test=${testMode} — ${startedAt}`
  );

  try {
    const result = await runScraper(testMode);

    console.log(`[CronRoute] Scraper concluído:`, result);

    return NextResponse.json({
      ok: true,
      startedAt,
      finishedAt: new Date().toISOString(),
      testMode,
      ...result,
    });
  } catch (error: any) {
    console.error("[CronRoute] Erro fatal:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error.message ?? "Unknown error",
        startedAt,
        finishedAt: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
