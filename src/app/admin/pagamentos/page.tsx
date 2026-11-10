import { db } from "@/db";
import { payments, orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, Badge } from "@/components/ui";
import type { Metadata } from "next";
import { PAYMENT_METHOD_LABELS, formatDateTime, formatKz } from "@/lib/types";
import Link from "next/link";

export const metadata: Metadata = { title: "Pagamentos" };
export const dynamic = "force-dynamic";

export default async function AdminPagamentosPage() {
  const all = await db
    .select({ pay: payments, ord: orders })
    .from(payments)
    .leftJoin(orders, eq(payments.orderId, orders.id))
    .orderBy(payments.createdAt);
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-ink-900">Pagamentos</h1>
        <p className="mt-1 text-sm text-ink-500">
          A confirmar manualmente após envio de comprovativo pelo cliente.
        </p>
      </div>
      <Card className="rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full admin-table text-sm">
            <thead className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Referência</th>
                <th className="text-left px-5 py-3 font-medium">Pedido</th>
                <th className="text-left px-5 py-3 font-medium">Método</th>
                <th className="text-left px-5 py-3 font-medium">Valor</th>
                <th className="text-left px-5 py-3 font-medium">Estado</th>
                <th className="text-left px-5 py-3 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {all.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-ink-500">
                    Sem pagamentos.
                  </td>
                </tr>
              )}
              {all.map(({ pay, ord }) => (
                <tr key={pay.id} className="border-t border-ink-100 hover:bg-ink-50/60">
                  <td data-label="Ref" className="px-5 py-3 font-medium">{pay.reference}</td>
                  <td data-label="Pedido" className="px-5 py-3">
                    {ord ? (
                      <Link className="link" href={`/admin/pedidos/${ord.id}`}>
                        #{ord.reference}
                      </Link>
                    ) : "—"}
                  </td>
                  <td data-label="Método" className="px-5 py-3 text-ink-600">
                    {PAYMENT_METHOD_LABELS[pay.method as keyof typeof PAYMENT_METHOD_LABELS] || pay.method}
                  </td>
                  <td data-label="Valor" className="px-5 py-3 font-medium tabular-nums">
                    {formatKz(pay.amountCents)}
                  </td>
                  <td data-label="Estado" className="px-5 py-3">
                    <Badge color={pay.status === "PAID" ? "success" : pay.status === "WAITING" ? "warning" : "danger"}>
                      {pay.status}
                    </Badge>
                  </td>
                  <td data-label="Data" className="px-5 py-3 text-ink-500 text-xs">
                    {formatDateTime(pay.createdAt)}
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
