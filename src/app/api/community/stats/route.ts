import { NextResponse } from "next/server";
import { db } from "@/db";
import { communityPosts, products, orders } from "@/db/schema";
import { count, eq, gte, isNotNull, sql } from "drizzle-orm";

import { asc } from "drizzle-orm";

export async function GET() {
  try {
    // Total de posts
    const totalPostsResult = await db.select({ count: count() }).from(communityPosts);
    const totalPosts = totalPostsResult[0]?.count || 0;
    
    // Posts aprovados
    const approvedPostsResult = await db
      .select({ count: count() })
      .from(communityPosts)
      .where(eq(communityPosts.status, "APPROVED"));
    const approvedPosts = approvedPostsResult[0]?.count || 0;
    
    // Posts verificados (compra comprovada)
    const verifiedPostsResult = await db
      .select({ count: count() })
      .from(communityPosts)
      .where(eq(communityPosts.verified, true));
    const verifiedPosts = verifiedPostsResult[0]?.count || 0;
    
    // Posts pendentes de revisão
    const pendingPostsResult = await db
      .select({ count: count() })
      .from(communityPosts)
      .where(eq(communityPosts.status, "PENDING_REVIEW"));
    const pendingPosts = pendingPostsResult[0]?.count || 0;
    
    // Posts por plataforma
    const postsByPlatformResult = await db
      .select({
        platform: communityPosts.platform,
        count: count(),
      })
      .from(communityPosts)
      .groupBy(communityPosts.platform);
    
    const postsByPlatform = postsByPlatformResult.reduce((acc, item) => ({ ...acc, [item.platform]: item.count }), {});
    
    // Posts por categoria
    const postsByCategoryResult = await db
      .select({
        category: communityPosts.category,
        count: count(),
      })
      .from(communityPosts)
      .where(isNotNull(communityPosts.category))
      .groupBy(communityPosts.category);
    
    const postsByCategory = postsByCategoryResult.reduce((acc, item) => ({ ...acc, [item.category || 'unknown']: item.count }), {});
    
    // Engajamento por dia (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const engagementByDay = await db
      .select({
        date: sql<string>`DATE(${communityPosts.createdAt})`,
        posts: count(communityPosts.id),
      })
      .from(communityPosts)
      .where(gte(communityPosts.createdAt, thirtyDaysAgo))
      .groupBy(sql`DATE(${communityPosts.createdAt})`)
      .orderBy(asc(sql`DATE(${communityPosts.createdAt})`));
    
    return NextResponse.json({
      totalPosts,
      approvedPosts,
      verifiedPosts,
      pendingPosts,
      postsByPlatform,
      postsByCategory,
      engagementByDay,
      lastUpdated: new Date().toISOString(),
    });
    
  } catch (error) {
    console.error("Erro ao buscar estatísticas:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
