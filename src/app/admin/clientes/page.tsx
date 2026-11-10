import { db } from "@/db";
import { users, orders, customerProfiles } from "@/db/schema";
import { eq, count, sql } from "drizzle-orm";
import { Card, Badge } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Clientes" };
export const dynamic = "force-dynamic";

export default async function AdminClientesPage() {
  const customers = await db
    .select({
      id: users.id,
      name: customerProfiles.name,
      phone: users.phone,
      email: users.email,
      created: users.createdAt,
    })
    .from(users)
    .leftJoin(customerProfiles, eq(customerProfiles.userId, users.id))
    .where(eq(users.role, "customer"));

  // Count orders por cliente
  const orderCounts = await db.execute(sql`
    SELECT customer_id, COUNT(*)::int AS total FROM orders WHERE customer_id IS NOT NULL GROUP BY customer_id
  `);
  const countMap = new Map<number, number>();
  for (const r of orderCounts.rows as any[]) {
    countMap.set(r.customer_id, r.total);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-ink-900">Clientes</h1>
        <p className="mt-1 text-sm text-ink-500">{customers.length} clientes registados.</p>
      </div>

      <Card className="rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full admin-table text-sm">
            <thead className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Nome</th>
                <th className="text-left px-5 py-3 font-medium">Telefone</th>
                <th className="text-left px-5 py-3 font-medium">Email</th>
                <th className="text-left px-5 py-3 font-medium">Pedidos</th>
                <th className="text-left px-5 py-3 font-medium">Desde</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-ink-500">
                    Ainda não há clientes registados.
                  </td>
                </tr>
              )}
              {customers.map((c) => (
                <tr key={c.id} className="border-t border-ink-100 hover:bg-ink-50/60">
                  <td data-label="Nome" className="px-5 py-3 font-medium">{c.name || "—"}</td>
                  <td data-label="Telefone" className="px-5 py-3">{c.phone || "—"}</td>
                  <td data-label="Email" className="px-5 py-3 text-ink-500">{c.email || "—"}</td>
                  <td data-label="Pedidos" className="px-5 py-3">
                    <Badge color="info">{countMap.get(c.id) || 0}</Badge>
                  </td>
                  <td data-label="Desde" className="px-5 py-3 text-ink-500 text-xs">
                    {c.created ? new Date(c.created).toLocaleDateString("pt-PT") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
