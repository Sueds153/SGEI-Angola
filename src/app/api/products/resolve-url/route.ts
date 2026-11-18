import { NextResponse } from "next/server";
import { z } from "zod";
import { robustResolveProductUrl } from "@/lib/scraping/robust-resolver";
import { queueForManualReview } from "@/lib/scraping/robust-resolver";

const schema = z.object({
  url: z.string().min(3, "Link inválido"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ status: "unsupported", error: "Por favor insira um link válido." }, { status: 400 });
    }

    const { url } = parsed.data;

    // Resolução robusta com múltiplas camadas de fallback
    const result = await robustResolveProductUrl(url);

    // Se precisa de revisão manual, adiciona à fila
    if (result.requiresManualReview) {
      await queueForManualReview(url, result.reviewReason || "Automated resolution failed");
    }

    if (!result.success) {
      const statusCode = result.status === "unsupported" ? 400 : 
                         result.status === "rate_limited" ? 429 :
                         result.status === "blocked" ? 503 : 500;
      
      return NextResponse.json(
        { 
          status: result.status, 
          error: result.error || "Não foi possível processar o link.",
          errorCode: result.errorCode,
          platform: result.platform,
          requiresManualReview: result.requiresManualReview,
        },
        { status: statusCode }
      );
    }

    // Para status "needs_price", retorna sucesso mas com flag para UI pedir preço manual
    return NextResponse.json({
      ...result,
      success: true,
    });
  } catch (error: any) {
    console.error("[resolve-url] Erro:", error);
    return NextResponse.json(
      { status: "error", error: "Erro temporário ao processar o link. Tente novamente.", errorCode: "INTERNAL_ERROR" },
      { status: 500 }
    );
  }
}
