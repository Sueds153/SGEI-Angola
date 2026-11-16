import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";

export async function POST(req: Request) {
  // Autenticação Bancária Dupla: Token Cron Seguro OU Sessão Admin Autenticada
  const authHeader = req.headers.get("authorization");
  const expectedToken = process.env.SCRAPER_CRON_TOKEN;
  const isCronAuthorized = expectedToken && authHeader === `Bearer ${expectedToken}`;

  if (!isCronAuthorized) {
    try {
      await requireAdmin();
    } catch {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }
  }
  
  const body = await req.json().catch(() => ({}));
  const testMode = body.test === true;
  
  try {
    // @ts-ignore
    const { runDailyScraper } = await import("../../../../../../functions/scraper/index.js");
    const result = await runDailyScraper({ test: testMode });
    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[ScraperAPI] Erro:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

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
