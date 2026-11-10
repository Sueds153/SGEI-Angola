import { db } from "@/db";
import { shipments, orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card } from "@/components/ui";
import type { Metadata } from "next";
import { formatDateTime } from "@/lib/types";
import Link from "next/link";

export const metadata: Metadata = { title: "Logística" };
export const dynamic = "force-dynamic";

export default async function LogisticaPage() {
  const all = await db
    .select({ ship: shipments, ord: orders })
    .from(shipments)
    .leftJoin(orders, eq(shipments.orderId, orders.id));
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-ink-900">Logística</h1>
        <p className="mt-1 text-sm text-ink-500">Envios e tracking internacional.</p>
      </div>
      <Card className="rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full admin-table text-sm">
            <thead className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Pedido</th>
                <th className="text-left px-5 py-3 font-medium">Tracking int.</th>
                <th className="text-left px-5 py-3 font-medium">Tracking local</th>
                <th className="text-left px-5 py-3 font-medium">Transportadora</th>
                <th className="text-left px-5 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody>
              {all.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-ink-500">Sem envios.</td>
                </tr>
              )}
              {all.map(({ ship, ord }) => (
                <tr key={ship.id} className="border-t border-ink-100 hover:bg-ink-50/60">
                  <td className="px-5 py-3 font-medium">
                    {ord ? (
                      <Link className="link" href={`/admin/pedidos/${ord.id}`}>
                        #{ord.reference}
                      </Link>
                    ) : "—"}
                  </td>
                  <td className="px-5 py-3">{ship.internationalTracking || "—"}</td>
                  <td className="px-5 py-3">{ship.localTracking || "—"}</td>
                  <td className="px-5 py-3 text-ink-600">{ship.carrier || "—"}</td>
                  <td className="px-5 py-3">{ship.status || "PENDING"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
