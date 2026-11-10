import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { eq, ilike, desc } from "drizzle-orm";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference");
  const phone = searchParams.get("phone");

  if (reference) {
    const ref = reference.trim().toUpperCase();
    const normalizedRef = ref.startsWith("SG-") ? ref : `SG-${ref.replace(/^SG/, "")}`;
    const [order] = await db
      .select({ id: orders.id, reference: orders.reference, status: orders.status })
      .from(orders)
      .where(eq(orders.reference, normalizedRef))
      .limit(1);
    if (!order) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ order });
  }

  if (phone) {
    const phoneClean = phone.trim();
    const list = await db
      .select({
        id: orders.id,
        reference: orders.reference,
        status: orders.status,
        customerName: orders.customerName,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .where(eq(orders.customerPhone, phoneClean))
      .orderBy(desc(orders.createdAt))
      .limit(20);
    return NextResponse.json({ orders: list });
  }

  return NextResponse.json({ error: "no params" }, { status: 400 });
}
