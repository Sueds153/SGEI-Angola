import { NextResponse } from "next/server";
import { runDailyScraper } from "@/functions/scraper/index";

export async function POST(req: Request) {
  // Verificar autenticação admin
  const authHeader = req.headers.get("authorization");
  const expectedToken = process.env.SCRAPER_CRON_TOKEN;
  
  if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  const body = await req.json().catch(() => ({}));
  const testMode = body.test === true;
  
  try {
    const result = await runDailyScraper({ test: testMode });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[ScraperAPI] Erro:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Daily Product Scraper",
    usage: {
      POST: {
        test: true,
        description: "Executa scraper em modo teste (poucos produtos)"
      }
    },
    schedule: "Diário às 03:00 UTC via Neon Function Cron",
    endpoints: {
      manual: "POST /api/admin/scraper/run",
      status: "GET /api/admin/scraper/status"
    }
  });
}