import { db } from "@/db";
import { shipments, orders } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { Card, Badge } from "@/components/ui";
import type { Metadata } from "next";
import { formatDateTime, ORDER_STATUS_LABELS } from "@/lib/types";
import Link from "next/link";
import { Truck, ExternalLink, Package, MapPin } from "lucide-react";

export const metadata: Metadata = { title: "Logística · Admin ImportEasy" };
export const dynamic = "force-dynamic";

export default async function LogisticaPage() {
  const all = await db
    .select({ ship: shipments, ord: orders })
    .from(shipments)
    .leftJoin(orders, eq(shipments.orderId, orders.id))
    .orderBy(desc(shipments.createdAt));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900">Logística & Envios</h1>
          <p className="mt-1 text-sm text-ink-500">
            Controlo de expedição internacional (China/Espanha), alfândega em Luanda e distribuição local.
          </p>
        </div>
      </div>

      <Card className="rounded-2xl overflow-hidden border border-ink-100 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full admin-table text-sm">
            <thead className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Pedido</th>
                <th className="text-left px-5 py-3 font-semibold">Cliente</th>
                <th className="text-left px-5 py-3 font-semibold">Tracking Internacional</th>
                <th className="text-left px-5 py-3 font-semibold">Tracking Local</th>
                <th className="text-left px-5 py-3 font-semibold">Transportadora</th>
                <th className="text-left px-5 py-3 font-semibold">Estado do Envio</th>
                <th className="text-right px-5 py-3 font-semibold">Ação</th>
              </tr>
            </thead>
            <tbody>
              {all.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-ink-500">
                    <Truck className="w-8 h-8 mx-auto text-ink-300 mb-2" />
                    Ainda não existem envios em processamento logístico.
                  </td>
                </tr>
              )}
              {all.map(({ ship, ord }) => {
                const statusLabel =
                  ord?.status && ORDER_STATUS_LABELS[ord.status as keyof typeof ORDER_STATUS_LABELS]
                    ? ORDER_STATUS_LABELS[ord.status as keyof typeof ORDER_STATUS_LABELS].label
                    : ship.status || "Pendente";

                return (
                  <tr key={ship.id} className="border-t border-ink-100 hover:bg-ink-50/60 transition">
                    <td className="px-5 py-3.5 font-bold text-ink-900">
                      {ord ? (
                        <Link className="hover:text-brand-600" href={`/admin/pedidos/${ord.id}`}>
                          #{ord.reference}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-ink-900">{ord?.customerName || "—"}</div>
                      <div className="text-xs text-ink-500">{ord?.customerPhone || ""}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-ink-700">
                      {ship.internationalTracking ? (
                        <span className="px-2 py-0.5 rounded bg-ink-100 font-semibold">
                          {ship.internationalTracking}
                        </span>
                      ) : (
                        <span className="text-ink-400">Pendente de atribuição</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-ink-700">
                      {ship.localTracking ? (
                        <span className="px-2 py-0.5 rounded bg-brand-50 text-brand-700 font-semibold">
                          {ship.localTracking}
                        </span>
                      ) : (
                        <span className="text-ink-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-ink-700 font-medium">
                      {ship.carrier || "SHEIN Express"}
                    </td>
                    <td className="px-5 py-3.5">
                      <Badge
                        color={
                          ord?.status === "DELIVERED"
                            ? "success"
                            : ord?.status === "IN_TRANSIT" || ord?.status === "ARRIVED_IN_ANGOLA"
                            ? "info"
                            : "warning"
                        }
                      >
                        {statusLabel}
                      </Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {ord && (
                        <Link
                          href={`/admin/pedidos/${ord.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition"
                        >
                          Atualizar <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
