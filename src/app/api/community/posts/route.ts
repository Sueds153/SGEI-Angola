import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { communityPosts, users, customerProfiles } from "@/db/schema";
import { eq, desc, and, like, or, count } from "drizzle-orm";
import { INITIAL_COMMUNITY_POSTS, CommunityPost } from "@/lib/community-data";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const platform = (searchParams.get("platform") || "").toUpperCase();
  const category = searchParams.get("category") || "";
  const status = (searchParams.get("status") || "").toUpperCase();
  const search = (searchParams.get("search") || "").trim().toLowerCase();
  const limit = Math.max(1, Math.min(50, parseInt(searchParams.get("limit") || "20", 10)));
  const offset = Math.max(0, parseInt(searchParams.get("offset") || "0", 10));

  // 1. Tentar consultar a base de dados primeiro
  try {
    const conditions = [];

    if (platform) {
      conditions.push(eq(communityPosts.platform, platform));
    }

    if (category) {
      conditions.push(eq(communityPosts.category, category));
    }

    if (status) {
      conditions.push(
        eq(
          communityPosts.status,
          status as "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "HIDDEN"
        )
      );
    }

    if (search) {
      conditions.push(
        or(
          like(communityPosts.content, `%${search}%`),
          like(communityPosts.productInfo || "", `%${search}%`),
          like(communityPosts.location || "", `%${search}%`),
          like(customerProfiles.name, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const dbPosts = await db
      .select()
      .from(communityPosts)
      .leftJoin(users, eq(communityPosts.userId, users.id))
      .leftJoin(customerProfiles, eq(communityPosts.userId, customerProfiles.userId))
      .where(whereClause)
      .orderBy(desc(communityPosts.createdAt))
      .limit(limit)
      .offset(offset);

    const totalResult = await db
      .select({ count: count() })
      .from(communityPosts)
      .where(whereClause);

    const total = totalResult[0]?.count || 0;

    if (dbPosts && dbPosts.length > 0) {
      const processedPosts = dbPosts.map((post) => {
        const postData = post.community_posts;
        const userData = post.customer_profiles;

        return {
          id: postData.id,
          user: userData?.name || "Cliente ImportEasy",
          avatar: postData.productInfo || "",
          location: postData.location || "Luanda",
          product: postData.productInfo || "Artigo importado",
          platform: postData.platform,
          message: postData.content,
          likes: 0,
          timeAgo: "recente",
          verified: postData.verified || false,
          status: postData.status === "APPROVED" ? "ENTREGUE" : "PENDENTE",
          ref: postData.orderReference,
          isOwn: false,
        };
      });

      return NextResponse.json({
        posts: processedPosts,
        total,
        hasMore: offset + processedPosts.length < total,
        currentPage: Math.floor(offset / limit) + 1,
        totalPages: Math.ceil(total / limit),
      });
    }
  } catch (error) {
    // Se a tabela ainda não existir no Postgres ou a ligação falhar,
    // o fallback gracioso abaixo assume sem quebrar a experiência do utilizador.
    console.warn("[Community Posts] Aviso na consulta da base de dados, a ativar partilhas consolidadas:", error);
  }

  // 2. Fallback resiliente com partilhas verificadas da comunidade
  let filtered = [...INITIAL_COMMUNITY_POSTS];

  if (platform) {
    filtered = filtered.filter((p) => p.platform.toUpperCase() === platform);
  }

  if (category) {
    filtered = filtered.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (status) {
    filtered = filtered.filter((p) => p.status.toUpperCase() === status);
  }

  if (search) {
    filtered = filtered.filter(
      (p) =>
        p.user.toLowerCase().includes(search) ||
        p.product.toLowerCase().includes(search) ||
        p.location.toLowerCase().includes(search) ||
        p.message.toLowerCase().includes(search) ||
        p.ref.toLowerCase().includes(search)
    );
  }

  const paginated = filtered.slice(offset, offset + limit);

  return NextResponse.json({
    posts: paginated,
    total: filtered.length,
    hasMore: offset + paginated.length < filtered.length,
    currentPage: Math.floor(offset / limit) + 1,
    totalPages: Math.ceil(filtered.length / limit) || 1,
  });
}
