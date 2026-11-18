import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getScraperTasks, runScraperBatch } from "@/lib/scraping/daily-scraper";

/**
 * Execução manual do scraper a partir do backoffice.
 * Usa exatamente a mesma implementação do cron, apenas com trigger "manual".
 */
export async function POST() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const result = await runScraperBatch({ trigger: "manual" });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[ScraperAPI] Erro:", error);
    return NextResponse.json({ ok: false, error: error?.message ?? "Erro" }, { status: 500 });
  }
}

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  return NextResponse.json({
    message: "Scraper automático de produtos",
    schedule: "02:00 e 14:00 UTC (Vercel Cron)",
    tasks: getScraperTasks(),
    usage: {
      POST: "Executa um lote agora (respeita o orçamento de 45s)",
      status: "GET /api/admin/scraper/status",
    },
  });
}
