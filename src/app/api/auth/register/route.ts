import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { users, customerProfiles } from "@/db/schema";
import { eq, or } from "drizzle-orm";
import { hashPassword, createSession } from "@/lib/auth";

const schema = z.object({
  name: z.string().min(2).max(200),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(9).max(30),
  password: z.string().min(4).max(200),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  const { name, email, phone, password } = parsed.data;

  const existing = await db
    .select()
    .from(users)
    .where(or(eq(users.phone, phone), email ? eq(users.email, email) : undefined))
    .limit(1);
  if (existing.length > 0) {
    return NextResponse.json(
      { error: "Já existe um utilizador com este telefone ou email." },
      { status: 400 }
    );
  }
  const passwordHash = await hashPassword(password);
  const [user] = await db
    .insert(users)
    .values({
      email: email || null,
      phone,
      passwordHash,
      role: "customer",
    })
    .returning();
  await db.insert(customerProfiles).values({ userId: user.id, name });
  await createSession({
    userId: user.id,
    role: "customer",
    email: email || undefined,
    name,
  });
  return NextResponse.json({ ok: true });
}
