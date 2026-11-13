import { db } from "@/db";
import { payments, orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, Badge } from "@/components/ui";
import type { Metadata } from "next";
import { PAYMENT_METHOD_LABELS, formatDateTime, formatKz } from "@/lib/types";
import Link from "next/link";
import { ExternalLink, FileText } from "lucide-react";

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
          Aprovação e verificação de comprovativos de transferência Express e Pagamento por Referência.
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
                <th className="text-left px-5 py-3 font-medium">Comprovativo</th>
                <th className="text-left px-5 py-3 font-medium">Estado</th>
                <th className="text-left px-5 py-3 font-medium">Data</th>
                <th className="text-right px-5 py-3 font-medium">Ação</th>
              </tr>
            </thead>
            <tbody>
              {all.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-ink-500">
                    Sem pagamentos registados.
                  </td>
                </tr>
              )}
              {all.map(({ pay, ord }) => {
                const proof = ord?.paymentProofUrl || pay.proofUrl;
                return (
                  <tr key={pay.id} className="border-t border-ink-100 hover:bg-ink-50/60">
                    <td data-label="Ref" className="px-5 py-3 font-medium">{pay.reference || "—"}</td>
                    <td data-label="Pedido" className="px-5 py-3">
                      {ord ? (
                        <Link className="link font-semibold text-brand-600 hover:text-brand-700" href={`/admin/pedidos/${ord.id}`}>
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
                    <td data-label="Comprovativo" className="px-5 py-3">
                      {proof ? (
                        <a
                          href={proof}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-50 border border-brand-200 text-xs font-semibold text-brand-700 hover:bg-brand-100 transition"
                        >
                          <FileText className="w-3.5 h-3.5" /> Ver Talão
                        </a>
                      ) : (
                        <span className="text-xs text-ink-400">Pendente de envio</span>
                      )}
                    </td>
                    <td data-label="Estado" className="px-5 py-3">
                      <Badge color={pay.status === "PAID" ? "success" : pay.status === "REVIEW" ? "info" : pay.status === "WAITING" ? "warning" : "danger"}>
                        {pay.status === "REVIEW" ? "Em Revisão" : pay.status}
                      </Badge>
                    </td>
                    <td data-label="Data" className="px-5 py-3 text-ink-500 text-xs">
                      {formatDateTime(pay.createdAt)}
                    </td>
                    <td data-label="Ação" className="px-5 py-3 text-right">
                      {ord && (
                        <Link
                          href={`/admin/pedidos/${ord.id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline"
                        >
                          Gerir <ExternalLink className="w-3 h-3" />
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
