import { NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { products, productImages } from "@/db/schema";
import { eq, desc, count, sql, gte } from "drizzle-orm";

const sql_client = neon(process.env.DATABASE_URL!);
const db = drizzle(sql_client);

export async function GET() {
  try {
    // Estatísticas gerais
    const totalProducts = await db.select({ count: count() }).from(products);
    
    // Por plataforma
    const byPlatform = await db.select({
      platform: products.source,
      count: count()
    }).from(products).groupBy(products.source);
    
    // Produtos adicionados nas últimas 24h
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentProducts = await db.select({ count: count() })
      .from(products)
      .where(gte(products.createdAt, yesterday));
    
    // Produtos com/sem imagens
    const withImages = await db.select({ count: count() })
      .from(products)
      .where(sql`${products.defaultImage} IS NOT NULL`);
    
    // Últimos 10 produtos adicionados
    const latestProducts = await db.select({
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
    
    // Status do scraper (se houver logs)
    const scraperStatus = {
      lastRun: null, // TODO: adicionar tabela de logs de scraper
      nextScheduled: "03:00 UTC diário",
      enabled: true,
    };
    
    return NextResponse.json({
      success: true,
      stats: {
        total: totalProducts[0]?.count || 0,
        last24h: recentProducts[0]?.count || 0,
        withImages: withImages[0]?.count || 0,
        byPlatform: byPlatform.reduce((acc, p) => ({ ...acc, [p.platform]: p.count }), {}),
      },
      latestProducts,
      scraperStatus,
    });
  } catch (error: any) {
    console.error("[ScraperStatus] Erro:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}