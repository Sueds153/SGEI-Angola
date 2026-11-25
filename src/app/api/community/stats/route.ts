import { NextResponse } from "next/server";
import { db } from "@/db";
import { communityPosts } from "@/db/schema";
import { count, eq, gte, isNotNull, sql, asc } from "drizzle-orm";
import { INITIAL_COMMUNITY_POSTS } from "@/lib/community-data";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const databaseUrl = process.env.DATABASE_URL;
    const usesLocalSqlite =
      process.env.NODE_ENV !== "production" &&
      (!databaseUrl || databaseUrl.startsWith("file:"));

    // Total de posts
    const totalPostsResult = await db
      .select({ count: count() })
      .from(communityPosts);
    const totalPosts = totalPostsResult[0]?.count || 0;

    // Posts aprovados
    const approvedPostsResult = await db
      .select({ count: count() })
      .from(communityPosts)
      .where(eq(communityPosts.status, "APPROVED"));
    const approvedPosts = approvedPostsResult[0]?.count || 0;

    // Posts verificados
    const verifiedPostsResult = await db
      .select({ count: count() })
      .from(communityPosts)
      .where(
        usesLocalSqlite
          ? sql`${communityPosts.verified} = 1`
          : eq(communityPosts.verified, true)
      );
    const verifiedPosts = verifiedPostsResult[0]?.count || 0;

    // Posts pendentes
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

    const postsByPlatform = postsByPlatformResult.reduce(
      (acc, item) => ({ ...acc, [item.platform]: item.count }),
      {}
    );

    // Posts por categoria
    const postsByCategoryResult = await db
      .select({
        category: communityPosts.category,
        count: count(),
      })
      .from(communityPosts)
      .where(isNotNull(communityPosts.category))
      .groupBy(communityPosts.category);

    const postsByCategory = postsByCategoryResult.reduce(
      (acc, item) => ({ ...acc, [item.category || "unknown"]: item.count }),
      {}
    );

    if (totalPosts > 0) {
      return NextResponse.json({
        totalPosts,
        approvedPosts,
        verifiedPosts,
        pendingPosts,
        postsByPlatform,
        postsByCategory,
        lastUpdated: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.warn(
      "[Community Stats] Aviso ao consultar base de dados, a recorrer a métricas consolidadas:",
      error
    );
  }

  // Fallback seguro baseado nos dados consolidados
  const totalPosts = INITIAL_COMMUNITY_POSTS.length;
  const verifiedPosts = INITIAL_COMMUNITY_POSTS.filter((p) => p.verified).length;
  const approvedPosts = totalPosts;
  const pendingPosts = 0;

  const postsByPlatform = INITIAL_COMMUNITY_POSTS.reduce<Record<string, number>>(
    (acc, item) => {
      acc[item.platform] = (acc[item.platform] || 0) + 1;
      return acc;
    },
    {}
  );

  const postsByCategory = INITIAL_COMMUNITY_POSTS.reduce<Record<string, number>>(
    (acc, item) => {
      acc[item.category] = (acc[item.category] || 0) + 1;
      return acc;
    },
    {}
  );

  return NextResponse.json({
    totalPosts,
    approvedPosts,
    verifiedPosts,
    pendingPosts,
    postsByPlatform,
    postsByCategory,
    lastUpdated: new Date().toISOString(),
  });
}
