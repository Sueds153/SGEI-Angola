import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateAdmin, authenticateCustomer, createSession } from "@/lib/auth";

const schema = z.object({
  email: z.string().email().optional().or(z.literal("")),
  emailOrPhone: z.string().optional(),
  password: z.string().min(4),
  role: z.enum(["admin", "customer"]).optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  const { password, role } = parsed.data;
  const identifier = parsed.data.emailOrPhone || parsed.data.email || "";
  try {
    if (role === "admin") {
      const admin = await authenticateAdmin(identifier, password);
      if (!admin) return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
      await createSession({ userId: admin.userId, role: "admin", email: admin.email, name: admin.name });
      return NextResponse.json({ ok: true });
    }
    const customer = await authenticateCustomer(identifier, password);
    if (!customer) return NextResponse.json({ error: "Credenciais inválidas." }, { status: 401 });
    await createSession({
      userId: customer.userId,
      role: customer.role as "customer" | "admin",
      email: customer.email,
      name: customer.name,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Erro no servidor." }, { status: 500 });
  }
}
