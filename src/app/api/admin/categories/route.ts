import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { categories, auditLogs } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "@/lib/auth";

const createSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  slug: z.string().min(2, "Slug deve ter pelo menos 2 caracteres"),
  description: z.string().optional(),
  icon: z.string().optional(),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const all = await db.select().from(categories).orderBy(desc(categories.createdAt));
  return NextResponse.json({ categories: all });
}

export async function POST(req: Request) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.format() }, { status: 400 });
  }

  const { name, description, icon } = parsed.data;
  // Sanitiza slug
  const cleanSlug = parsed.data.slug
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");

  // Verifica se slug já existe
  const existing = await db.select().from(categories).where(eq(categories.slug, cleanSlug)).limit(1);
  if (existing.length > 0) {
    return NextResponse.json({ error: "Já existe uma categoria com este slug." }, { status: 400 });
  }

  const [newCat] = await db
    .insert(categories)
    .values({
      name,
      slug: cleanSlug,
      description: description || null,
      icon: icon || null,
    })
    .returning();

  // Trilha de auditoria
  try {
    await db.insert(auditLogs).values({
      actorId: session.userId,
      actorEmail: session.email,
      action: "CATEGORY_CREATED",
      entityType: "category",
      entityId: String(newCat.id),
      newValue: newCat,
    });
  } catch (logErr) {
    console.error("Falha ao registar log:", logErr);
  }

  return NextResponse.json({ ok: true, category: newCat });
}
