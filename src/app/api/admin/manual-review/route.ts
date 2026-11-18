import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { manualReviewQueue, users } from "@/db/schema";
import { eq, desc, sql, and, or, ilike } from "drizzle-orm";

const updateSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED", "FAILED"]).optional(),
  assignedTo: z.number().nullable().optional(),
  priority: z.number().optional(),
  lastError: z.string().nullable().optional(),
  attempts: z.number().optional(),
});

const filterSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED", "FAILED", "ALL"]).optional(),
  priority: z.string().optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
  offset: z.coerce.number().min(0).optional(),
});

export async function GET(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const filters = filterSchema.parse({
    status: searchParams.get("status"),
    priority: searchParams.get("priority"),
    search: searchParams.get("search"),
    limit: searchParams.get("limit"),
    offset: searchParams.get("offset"),
  });

  const limit = filters.limit || 50;
  const offset = filters.offset || 0;

  const conditions = [];

  if (filters.status && filters.status !== "ALL") {
    conditions.push(eq(manualReviewQueue.status, filters.status));
  }

  if (filters.search) {
    conditions.push(
      or(
        ilike(manualReviewQueue.url, `%${filters.search}%`),
        ilike(manualReviewQueue.reason, `%${filters.search}%`),
        ilike(manualReviewQueue.platform, `%${filters.search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [items, totalResult] = await Promise.all([
    db
      .select({
        id: manualReviewQueue.id,
        url: manualReviewQueue.url,
        platform: manualReviewQueue.platform,
        reason: manualReviewQueue.reason,
        status: manualReviewQueue.status,
        userId: manualReviewQueue.userId,
        assignedTo: manualReviewQueue.assignedTo,
        priority: manualReviewQueue.priority,
        attempts: manualReviewQueue.attempts,
        lastError: manualReviewQueue.lastError,
        resolvedAt: manualReviewQueue.resolvedAt,
        createdAt: manualReviewQueue.createdAt,
        updatedAt: manualReviewQueue.updatedAt,
      })
      .from(manualReviewQueue)
      .where(whereClause)
      .orderBy(desc(manualReviewQueue.priority), desc(manualReviewQueue.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)` })
      .from(manualReviewQueue)
      .where(whereClause),
  ]);

  // Fetch user emails separately for items that have userId or assignedTo
  const userIds = new Set<number>();
  items.forEach((item) => {
    if (item.userId) userIds.add(item.userId);
    if (item.assignedTo) userIds.add(item.assignedTo);
  });

  const userEmails = new Map<number, string | null>();
  if (userIds.size > 0) {
    const userRows = await db
      .select({ id: users.id, email: users.email })
      .from(users)
      .where(sql`${users.id} IN (${Array.from(userIds).join(",")})`);
    userRows.forEach((u) => userEmails.set(u.id, u.email));
  }

  const enrichedItems = items.map((item) => ({
    ...item,
    userEmail: item.userId ? userEmails.get(item.userId) || null : null,
    assigneeEmail: item.assignedTo ? userEmails.get(item.assignedTo) || null : null,
  }));

  return NextResponse.json({
    items: enrichedItems,
    total: Number(totalResult[0]?.count || 0),
    limit,
    offset,
  });
}

export async function PATCH(req: Request) {
  try {
    const session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.format() }, { status: 400 });
  }

  const [existing] = await db.select().from(manualReviewQueue).where(eq(manualReviewQueue.id, id)).limit(1);
  if (!existing) return NextResponse.json({ error: "Item não encontrado" }, { status: 404 });

  const updateData: any = {
    ...parsed.data,
    updatedAt: new Date(),
  };

  if (parsed.data.status === "RESOLVED" && existing.status !== "RESOLVED") {
    updateData.resolvedAt = new Date();
  }

  const [updated] = await db
    .update(manualReviewQueue)
    .set(updateData)
    .where(eq(manualReviewQueue.id, id))
    .returning();

  return NextResponse.json({ ok: true, item: updated });
}

export async function DELETE(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  if (!id) return NextResponse.json({ error: "ID obrigatório" }, { status: 400 });

  await db.delete(manualReviewQueue).where(eq(manualReviewQueue.id, id));

  return NextResponse.json({ ok: true });
}