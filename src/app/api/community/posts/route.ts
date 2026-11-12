import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { communityPosts, users } from "@/db/schema";
import { eq, desc, and, like, or, count } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const platform = searchParams.get("platform") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    
    // Construir condições de filtro
    const conditions = [];
    
    if (platform) {
      conditions.push(eq(communityPosts.platform, platform));
    }
    
    if (category) {
      conditions.push(eq(communityPosts.category, category));
    }
    
    if (status) {
      conditions.push(eq(communityPosts.status, status));
    }
    
    if (search) {
      conditions.push(
        or(
          like(communityPosts.content, `%${search}%`),
          like(communityPosts.productInfo || "", `%${search}%`),
          like(communityPosts.location || "", `%${search}%`),
          like(users.name, `%${search}%`)
        )
      );
    }
    
    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    
    // Buscar posts
    const posts = await db
      .select()
      .from(communityPosts)
      .leftJoin(users, eq(communityPosts.userId, users.id))
      .where(whereClause)
      .orderBy(desc(communityPosts.createdAt))
      .limit(limit)
      .offset(offset);
    
    // Contar total
    const totalResult = await db
      .select({ count: count() })
      .from(communityPosts)
      .where(whereClause);
    
    const total = totalResult[0]?.count || 0;
    
    // Processar posts para formatar
    const processedPosts = posts.map(post => {
      const postData = post.communityPosts;
      const userData = post.users;
      
      return {
        id: postData.id,
        user: userData?.name || "Utilizador anônimo",
        avatar: userData?.name || "", // Simplified - usar avatar real quando implementado
        location: postData.location || "",
        product: postData.productInfo || "",
        platform: postData.platform,
        message: postData.content,
        likes: 0, // Simplified - contar interações reais
        timeAgo: "",
        verified: postData.verified || false,
        status: postData.status,
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
    
  } catch (error) {
    console.error("Erro ao buscar posts:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}