import { NextRequest, NextResponse } from "next/server";
import { runScraperBatch } from "./daily-scraper";

/**
 * Handler partilhado pelas rotas de cron do scraper.
 * A Vercel envia automaticamente `Authorization: Bearer $CRON_SECRET` quando a
 * variável CRON_SECRET existe no projeto.
 */
export async function handleCronRequest(request: NextRequest, label: string) {
  const secret = process.env.CRON_SECRET;
  const header =
    request.headers.get("authorization") ?? request.headers.get("x-cron-secret") ?? "";
  const token = header.replace(/^Bearer\s+/i, "").trim();

  if (secret) {
    if (token !== secret) {
      console.warn(`[Cron:${label}] Token inválido`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (process.env.NODE_ENV !== "development") {
    console.error(`[Cron:${label}] CRON_SECRET não configurado`);
    return NextResponse.json(
      { error: "Server misconfiguration", hint: "Definir CRON_SECRET no ambiente" },
      { status: 500 }
    );
  }

  const startedAt = new Date().toISOString();
  console.log(`[Cron:${label}] Início ${startedAt}`);

  try {
    const result = await runScraperBatch({ trigger: `cron:${label}` });
    console.log(`[Cron:${label}] Concluído`, {
      tasks: result.tasksProcessed,
      created: result.productsCreated,
      updated: result.productsUpdated,
      errors: result.errors,
      durationMs: result.durationMs,
    });

    return NextResponse.json({
      label,
      startedAt,
      finishedAt: new Date().toISOString(),
      ...result,
      ok: result.ok,
    });
  } catch (error: any) {
    console.error(`[Cron:${label}] Erro fatal:`, error);
    return NextResponse.json(
      {
        ok: false,
        label,
        error: error?.message ?? "Erro desconhecido",
        startedAt,
        finishedAt: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
