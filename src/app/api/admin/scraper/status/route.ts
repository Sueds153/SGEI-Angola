import { NextResponse } from "next/server";
import { db } from "@/db";
import { products, scraperRuns } from "@/db/schema";
import { desc, count, sql, gte } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";
import { getScraperTasks } from "@/lib/scraping/daily-scraper";

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  try {
    const totalProducts = await db.select({ count: count() }).from(products);

    const byPlatform = await db
      .select({ platform: products.source, count: count() })
      .from(products)
      .groupBy(products.source);

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentProducts = await db
      .select({ count: count() })
      .from(products)
      .where(gte(products.createdAt, yesterday));

    const withImages = await db
      .select({ count: count() })
      .from(products)
      .where(sql`${products.defaultImage} IS NOT NULL`);

    const latestProducts = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        source: products.source,
        originalPrice: products.originalPrice,
        currency: products.currency,
        defaultImage: products.defaultImage,
        createdAt: products.createdAt,
      })
      .from(products)
      .orderBy(desc(products.createdAt))
      .limit(10);

    let lastRuns: Array<Record<string, unknown>> = [];
    try {
      lastRuns = await db
        .select()
        .from(scraperRuns)
        .orderBy(desc(scraperRuns.startedAt))
        .limit(10);
    } catch {
      // Tabela ainda não migrada — não bloqueia o painel.
      lastRuns = [];
    }

    return NextResponse.json({
      success: true,
      stats: {
        total: totalProducts[0]?.count ?? 0,
        last24h: recentProducts[0]?.count ?? 0,
        withImages: withImages[0]?.count ?? 0,
        byPlatform: byPlatform.reduce(
          (acc, p) => ({ ...acc, [p.platform]: p.count }),
          {} as Record<string, number>
        ),
      },
      latestProducts,
      lastRuns,
      schedule: "02:00 e 14:00 UTC (automático)",
      tasks: getScraperTasks(),
    });
  } catch (error: any) {
    console.error("[ScraperStatus] Erro:", error);
    return NextResponse.json({ success: false, error: error?.message ?? "Erro" }, { status: 500 });
  }
}
