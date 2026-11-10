import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { Card, Badge, Input, Select } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { Metadata } from "next";
import { ORDER_STATUS_LABELS, formatDateTime, formatKz } from "@/lib/types";
import { Search } from "lucide-react";

export const metadata: Metadata = { title: "Pedidos" };

export const dynamic = "force-dynamic";

const STATUS_FILTERS: Array<{ value: string; label: string }> = [
  { value: "ALL", label: "Todos" },
  { value: "PENDING_PAYMENT", label: "Aguarda pagamento" },
  { value: "PAYMENT_REVIEW", label: "Em revisão" },
  { value: "PAID", label: "Pago" },
  { value: "PURCHASED", label: "Comprado" },
  { value: "IN_TRANSIT", label: "Em trânsito" },
  { value: "ARRIVED_IN_ANGOLA", label: "Chegou a Angola" },
  { value: "OUT_FOR_DELIVERY", label: "Saiu para entrega" },
  { value: "DELIVERED", label: "Entregue" },
];

export default async function AdminPedidosPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const statusFilter = sp.status || "ALL";
  const q = (sp.q || "").trim();

  let list = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(100);
  if (statusFilter !== "ALL") {
    list = list.filter((o) => o.status === statusFilter);
  }
  if (q) {
    const lower = q.toLowerCase();
    list = list.filter(
      (o) =>
        o.reference.toLowerCase().includes(lower) ||
        o.customerName.toLowerCase().includes(lower) ||
        o.customerPhone.includes(lower)
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900">Pedidos</h1>
          <p className="mt-1 text-sm text-ink-500">{list.length} pedidos</p>
        </div>
      </div>

      <Card className="p-4 rounded-2xl mb-5">
        <form className="grid md:grid-cols-[1fr_auto_auto] gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Procurar por referência, nome ou telefone…"
              className="input pl-9"
            />
          </div>

          <Select
            name="status"
            defaultValue={statusFilter}
            options={STATUS_FILTERS.map((f) => ({ value: f.value, label: f.label }))}
            className="md:w-60"
          />
          <Button type="submit" variant="primary">Filtrar</Button>
        </form>
      </Card>

      <Card className="rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full admin-table text-sm">
            <thead className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Ref</th>
                <th className="text-left px-5 py-3 font-medium">Cliente</th>
                <th className="text-left px-5 py-3 font-medium">Contacto</th>
                <th className="text-left px-5 py-3 font-medium">Valor</th>
                <th className="text-left px-5 py-3 font-medium">Pagamento</th>
                <th className="text-left px-5 py-3 font-medium">Estado</th>
                <th className="text-left px-5 py-3 font-medium">Data</th>
                <th className="text-right px-5 py-3 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center text-ink-500">
                    Nenhum pedido encontrado.
                  </td>
                </tr>
              )}
              {list.map((o) => {
                const sm = ORDER_STATUS_LABELS[o.status as keyof typeof ORDER_STATUS_LABELS];
                return (
                  <tr key={o.id} className="border-t border-ink-100 hover:bg-ink-50/60">
                    <td data-label="Ref" className="px-5 py-3.5 font-medium">
                      <Link href={`/admin/pedidos/${o.id}`} className="hover:text-primary-600">
                        #{o.reference}
                      </Link>
                    </td>
                    <td data-label="Cliente" className="px-5 py-3.5">{o.customerName}</td>
                    <td data-label="Contacto" className="px-5 py-3.5 text-ink-500">
                      {o.customerPhone}
                    </td>
                    <td data-label="Valor" className="px-5 py-3.5 font-medium tabular-nums">
                      {formatKz(o.totalCents)}
                    </td>
                    <td data-label="Pagamento" className="px-5 py-3.5">
                      <Badge color={o.paymentStatus === "PAID" ? "success" : "warning"}>
                        {o.paymentStatus}
                      </Badge>
                    </td>
                    <td data-label="Estado" className="px-5 py-3.5">
                      <Badge color={sm.color as any}>{sm.label}</Badge>
                    </td>
                    <td data-label="Data" className="px-5 py-3.5 text-ink-500 text-xs">
                      {formatDateTime(o.createdAt)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <Link
                        href={`/admin/pedidos/${o.id}`}
                        className="text-sm font-medium text-ink-900 hover:text-primary-600"
                      >
                        Abrir →
                      </Link>
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
