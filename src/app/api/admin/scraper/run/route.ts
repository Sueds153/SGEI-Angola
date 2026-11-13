import { NextResponse } from "next/server";
// This Azure Function is JavaScript maintained outside the Next.js source tree.
// @ts-expect-error The function's ESM entry point does not ship TypeScript declarations.
import { runDailyScraper } from "../../../../../../functions/scraper/index.js";
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
