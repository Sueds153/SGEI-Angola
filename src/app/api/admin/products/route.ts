import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { products, auditLogs } from "@/db/schema";
import { requireAdmin } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  originalPrice: z.string().or(z.number()),
  currency: z.string().default("USD"),
  categoryId: z.number().optional().nullable(),
  sourceUrl: z.string().optional().nullable(),
  defaultImage: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
});

export async function POST(req: Request) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }

  const data = parsed.data;
  const [created] = await db
    .insert(products)
    .values({
      name: data.name,
      slug: data.slug,
      originalPrice: String(data.originalPrice),
      currency: data.currency,
      categoryId: data.categoryId || null,
      sourceUrl: data.sourceUrl || null,
      defaultImage: data.defaultImage || null,
      sku: data.sku || null,
      source: "ADMIN",
      status: "ACTIVE",
    })
    .returning();

  try {
    await db.insert(auditLogs).values({
      actorId: session.userId,
      actorEmail: session.email,
      action: "PRODUCT_CREATED",
      entityType: "product",
      entityId: String(created.id),
      newValue: created,
    });
  } catch (err) {
    console.error("Falha ao salvar log de produto:", err);
  }

  return NextResponse.json({ ok: true, product: created });
}
