/**
 * /api/cron/daily-scraper
 *
 * Recolha automática de produtos reais (Vinted / AliExpress / SHEIN).
 * Agendada em `vercel.json` — corre uma vez por dia às 02:00 UTC.
 *
 * A função tem um orçamento de ~45s (limite de 60s do plano Hobby) e guarda o
 * cursor em `scraper_runs`, pelo que a execução seguinte continua o trabalho.
 *
 * Segurança: exige `Authorization: Bearer $CRON_SECRET` (a Vercel envia este
 * cabeçalho automaticamente quando CRON_SECRET está definido no projeto).
 */

import { NextRequest } from "next/server";
import { handleCronRequest } from "@/lib/scraping/cron-handler";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  return handleCronRequest(request, "daily-scraper");
}

export async function POST(request: NextRequest) {
  return handleCronRequest(request, "daily-scraper");
}
