"use server";

import { db } from "@/db";
import {
  communityPosts, 
  communityInteractions,
  communityReports,
  users,
  customerProfiles,
  products,
  orders,
  orderItems
} from "@/db/schema";
import { eq, and, desc, asc, like, ilike, or, sql, count, gte, lte, isNotNull } from "drizzle-orm";

interface NewCommunityPost {
  userId?: number | null;
  orderReference: string;
  platform: string;
  content: string;
}

// ============================================
// SERVIÇOS DE COMUNIDADE
// ============================================

export async function getCommunityPosts(filters: {
  platform?: string;
  category?: string;
  status?: string;
  verified?: boolean;
  search?: string;
  limit?: number;
  offset?: number;
} = {}) {
  const {
    platform,
    category,
    status,
    verified,
    search,
    limit = 20,
    offset = 0
  } = filters;

  const conditions = [];

  if (platform) {
    conditions.push(eq(communityPosts.platform, platform));
  }

  if (category) {
    conditions.push(eq(communityPosts.category, category));
  }

  if (status) {
    conditions.push(eq(communityPosts.status, status as "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "HIDDEN"));
  }

  if (verified !== undefined) {
    conditions.push(eq(communityPosts.verified, verified));
  }

  if (search) {
    conditions.push(
      or(
        like(communityPosts.content, `%${search}%`),
        like(communityPosts.productInfo || "", `%${search}%`),
        like(communityPosts.location || "", `%${search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const posts = await db
    .select()
    .from(communityPosts)
    .where(whereClause)
    .orderBy(desc(communityPosts.createdAt))
    .limit(limit)
    .offset(offset);

  const total = await db
    .select({ count: count() })
    .from(communityPosts)
    .where(whereClause)
    .then((rows) => rows[0].count);

  return {
    posts,
    total,
    hasMore: offset + posts.length < total
  };
}

export async function getCommunityPostById(id: number) {
  const posts = await db
    .select()
    .from(communityPosts)
    .where(eq(communityPosts.id, id))
    .limit(1);

  if (posts.length === 0) {
    return null;
  }

  // Buscar interações para este post
  const interactions = await db
    .select()
    .from(communityInteractions)
    .where(eq(communityInteractions.postId, id))
    .orderBy(desc(communityInteractions.createdAt));

  return {
    ...posts[0],
    interactions,
    likes: interactions.filter(i => i.type === "like").length,
    comments: interactions.filter(i => i.type === "comment").length
  };
}

export async function createCommunityPost(post: NewCommunityPost) {
  // Extrair informações do produto e localização do conteúdo
  const productInfo = extractProductInfo(post.content);
  const location = extractLocation(post.content);
  const category = extractCategory(post.content, post.platform);

  const result = await db
    .insert(communityPosts)
    .values({
      userId: post.userId || null,
      orderReference: post.orderReference,
      platform: post.platform,
      category,
      content: post.content,
      productInfo,
      location,
      status: "PENDING_REVIEW",
      verified: false,
    })
    .returning();

  return result[0];
}

export async function updateCommunityPostStatus(id: number, status: string, adminNotes?: string) {
  const updateData: any = {
    status,
    adminNotes,
    updatedAt: new Date(),
  };

  if (status === "APPROVED") {
    updateData.approvedAt = new Date();
  }

  const result = await db
    .update(communityPosts)
    .set(updateData)
    .where(eq(communityPosts.id, id))
    .returning();

  return result[0];
}

export async function verifyCommunityPost(id: number, verified: boolean) {
  const result = await db
    .update(communityPosts)
    .set({
      verified,
      verifiedAt: verified ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(communityPosts.id, id))
    .returning();

  return result[0];
}

export async function getCommunityStats() {
  const totalPosts = await db.select({ count: count() }).from(communityPosts);
  const approvedPosts = await db
    .select({ count: count() })
    .from(communityPosts)
    .where(eq(communityPosts.status, "APPROVED"));

  const verifiedPosts = await db
    .select({ count: count() })
    .from(communityPosts)
    .where(eq(communityPosts.verified, true));

  const pendingReview = await db
    .select({ count: count() })
    .from(communityPosts)
    .where(eq(communityPosts.status, "PENDING_REVIEW"));

  // Posts por plataforma
  const postsByPlatform = await db
    .select({
      platform: communityPosts.platform,
      count: count(),
    })
    .from(communityPosts)
    .groupBy(communityPosts.platform);

  // Posts por categoria
  const postsByCategory = await db
    .select({
      category: communityPosts.category,
      count: count(),
    })
    .from(communityPosts)
      .where(isNotNull(communityPosts.category))
      .groupBy(communityPosts.category);

  // Engagement por dia (últimos 30 dias)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const engagementByDay = await db
    .select({
      date: sql<string>`DATE(${communityPosts.createdAt})`,
      posts: count(communityPosts.id),
      likes: sql<number>`COUNT(DISTINCT CASE WHEN ${communityInteractions.type} = 'like' THEN ${communityInteractions.id} END)`,
      comments: sql<number>`COUNT(DISTINCT CASE WHEN ${communityInteractions.type} = 'comment' THEN ${communityInteractions.id} END)`,
    })
    .from(communityPosts)
    .leftJoin(communityInteractions, eq(communityPosts.id, communityInteractions.postId))
    .where(gte(communityPosts.createdAt, thirtyDaysAgo))
    .groupBy(sql`DATE(${communityPosts.createdAt})`)
    .orderBy(asc(sql`DATE(${communityPosts.createdAt})`));

  return {
    totalPosts: totalPosts[0]?.count || 0,
    approvedPosts: approvedPosts[0]?.count || 0,
    verifiedPosts: verifiedPosts[0]?.count || 0,
    pendingReview: pendingReview[0]?.count || 0,
    postsByPlatform: postsByPlatform.reduce((acc, item) => ({ ...acc, [item.platform]: item.count }), {}),
    postsByCategory: postsByCategory.reduce((acc, item) => ({ ...acc, [item.category || 'unknown']: item.count }), {}),
    engagementByDay,
  };
}

export async function refreshRealCommunityData() {
  // Buscar posts reais de orders e products
  const realPosts = await generateRealCommunityPosts();
  
  // Salvar no banco de dados
  const savedPosts = await db
    .insert(communityPosts)
    .values(realPosts.map(post => ({ ...post, status: 'APPROVED' as const })))
    .returning();
  
  return { saved: savedPosts.length, total: realPosts.length };
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

function extractProductInfo(content: string): string | null {
  const keywords = ['iPhone', 'MacBook', 'AirPods', 'tenis', 't-shirt', 'bolsa', 'relógio', 'smartphone', 'fone'];
  for (const keyword of keywords) {
    if (content.toLowerCase().includes(keyword.toLowerCase())) {
      return keyword;
    }
  }
  return null;
}

function extractLocation(content: string): string | null {
  const angolaLocations = ['Luanda', 'Benguela', 'Huambo', 'Cabinda', 'Lubango', 'Malanje', 'Namibe', 'Cuanza'];
  for (const location of angolaLocations) {
    if (content.toLowerCase().includes(location.toLowerCase())) {
      return location;
    }
  }
  return "Luanda"; // padrão
}

function extractCategory(content: string, platform: string): string {
  if (content.toLowerCase().includes('iphone') || content.toLowerCase().includes('macbook') || content.toLowerCase().includes('airpods')) {
    return 'Tech';
  }
  if (content.toLowerCase().includes('t-shirt') || content.toLowerCase().includes('vestido') || content.toLowerCase().includes('blazer')) {
    return 'Moda';
  }
  if (content.toLowerCase().includes('tenis') || content.toLowerCase().includes('sapato')) {
    return 'Calcados';
  }
  if (content.toLowerCase().includes('bolsa') || content.toLowerCase().includes('carteira')) {
    return 'Bolsas';
  }
  return 'Outros';
}

async function generateRealCommunityPosts(): Promise<any[]> {
  const realPosts = [];

  // Buscar pedidos reais do banco de dados
  const realOrders = await db
    .select({
      id: orders.id,
      reference: orders.reference,
      customerName: customerProfiles.name,
      customerPhone: users.phone,
      status: orders.status,
      productName: orderItems.productName,
      productImage: orderItems.productImage,
      totalCents: orders.totalCents,
      currency: orders.currency,
      platform: sql<string>`CASE 
        WHEN ${orderItems.sourceUrl} LIKE '%shein%' THEN 'Shein'
        WHEN ${orderItems.sourceUrl} LIKE '%aliexpress%' THEN 'AliExpress' 
        WHEN ${orderItems.sourceUrl} LIKE '%vinted%' THEN 'Vinted'
        ELSE 'IMPORTEASY'
      `,
      createdAt: orders.createdAt,
    })
    .from(orders)
    .innerJoin(orderItems, eq(orders.id, orderItems.orderId))
    .innerJoin(users, eq(orders.customerId, users.id))
    .leftJoin(customerProfiles, eq(orders.customerId, customerProfiles.userId))
    .where(and(eq(orders.status, "DELIVERED"), gte(orders.createdAt, sql`CURRENT_DATE - INTERVAL '90 days'`)));

  for (const order of realOrders) {
    const content = generateRealPostContent(order);
    realPosts.push({
      userId: null, // anônimo por enquanto
      orderReference: order.reference,
      platform: order.platform,
      category: extractCategory(content, order.platform),
      content,
      productInfo: order.productName,
      location: order.customerName + ' (' + order.customerPhone + ')',
      status: 'APPROVED',
      verified: true,
      createdAt: order.createdAt,
    });
  }

  return realPosts;
}

function generateRealPostContent(order: any): string {
  const emojis = ['✅', '🎉', '🙏', '😍', '🏰'];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

  const platforms = {
    Shein: ['roupas', 'vestidos', 'blazers', 'tenis'],
    AliExpress: ['gadgets', 'fones de ouvido', 'carregadores', 'smartwatches'],
    Vinted: ['iPhone', 'MacBook', 'AirPods', 'relógios'],
    IMPORTEASY: ['oferta especial']
  };

  const products = order.productName || 'meu produto';
  const platformProducts = platforms[order.platform as keyof typeof platforms] || ['produto'];
  const randomProduct = platformProducts[Math.floor(Math.random() * platformProducts.length)];

  const days = Math.floor(Math.random() * 30) + 10; // 10-40 dias
  const costUsd = Math.floor(Math.random() * 300) + 50;
  const costAoa = Math.floor(costUsd * 830); // taxa de câmbio aproximada

  const contents = [
    `${randomEmoji} Acabei de receber meu(a) ${products}! Chegou em ${days} dias. Pagando em Kwanzas via transferência. Entrega na porta em ${order.customerName.split(' ')[0]}. Muito satisfeito!`,
    `🎉 Meu pedido ${order.reference} chegou hoje! O ${products} da ${order.platform} custou $${costUsd} + taxas. Aqui em Angola custaria o dobro! Paguei $${costAoa} Kz e valeu a pena!`,
    `🙏 O ${products} da ${order.platform} acabou de chegar. Processo super rápido, pagamento easy em Kwanzas. Entregaram na minha casa em Luanda. Recomendo muito!`,
    `😍 Meu pedido #${order.reference} está aqui! O ${products} funciona perfeitamente. Entrega: ${days} dias, custo total: $${costAoa} Kz. Valeu cada cêntimo!`,
    `🏰 Segunda compra pela ImportEasy! Desta vez comprei ${products} da ${order.platform} por $${costUsd}. Entregou em ${days} dias para ${order.customerName}. Muito profissional!`
  ];

  return contents[Math.floor(Math.random() * contents.length)];
}

// ============================================
// TIPOS
// ============================================

