/**
 * /api/cron/daily-scraper-pm
 *
 * Segunda passagem diária do scraper (14:00 UTC). O plano Hobby permite dois
 * cron jobs por dia; esta rota retoma o cursor deixado pela execução da manhã,
 * duplicando o volume de produtos recolhidos por dia.
 */

import { NextRequest } from "next/server";
import { handleCronRequest } from "@/lib/scraping/cron-handler";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  return handleCronRequest(request, "daily-scraper-pm");
}

export async function POST(request: NextRequest) {
  return handleCronRequest(request, "daily-scraper-pm");
}
