import { db } from "@/db";
import { orders, payments, auditLogs } from "@/db/schema";
import { Card, Badge } from "@/components/ui";
import Link from "next/link";
import {
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  AlertCircle,
  Wallet,
  ArrowRight,
} from "lucide-react";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  formatDateTime,
  formatKz,
} from "@/lib/types";
import { sql, desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // Métricas
  const [totalOrdersRes, pendingPaymentRes, inTransitRes, deliveredRes, paymentsRes] =
    await Promise.all([
      db.execute(sql`SELECT COUNT(*)::int AS total FROM orders WHERE DATE(created_at) = CURRENT_DATE`),
      db.execute(sql`SELECT COUNT(*)::int AS total FROM orders WHERE status = 'PENDING_PAYMENT'`),
      db.execute(sql`SELECT COUNT(*)::int AS total FROM orders WHERE status IN ('IN_TRANSIT', 'PREPARING_SHIPMENT', 'PURCHASED')`),
      db.execute(sql`SELECT COUNT(*)::int AS total FROM orders WHERE status = 'DELIVERED'`),
      db.execute(
        sql`SELECT
          COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN total_cents ELSE 0 END),0) AS revenue,
          COALESCE(SUM(CASE WHEN payment_status = 'PAID' THEN COALESCE(actual_cost_cents, estimated_cost_cents, total_cents) ELSE 0 END),0) AS cost
        FROM orders`
      ),
    ]);

  const todayOrders = (totalOrdersRes.rows[0] as any)?.total || 0;
  const pendingPayment = (pendingPaymentRes.rows[0] as any)?.total || 0;
  const inTransit = (inTransitRes.rows[0] as any)?.total || 0;
  const delivered = (deliveredRes.rows[0] as any)?.total || 0;
  const revenueCents = Number((paymentsRes.rows[0] as any)?.revenue || 0);
  const costCents = Number((paymentsRes.rows[0] as any)?.cost || 0);
  const profitCents = revenueCents - costCents;
  const marginPct = revenueCents > 0 ? (profitCents / revenueCents) * 100 : 0;

  // Pedidos recentes
  const recentOrders = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(8);

  // Logs recentes
  const recentLogs = await db
    .select()
    .from(auditLogs)
    .orderBy(desc(auditLogs.createdAt))
    .limit(6);

  const metrics = [
    {
      label: "Pedidos hoje",
      value: String(todayOrders),
      icon: ShoppingBag,
      color: "text-ink-900",
    },
    {
      label: "Aguardando pagamento",
      value: String(pendingPayment),
      icon: Clock,
      color: "text-amber-600",
    },
    {
      label: "Em trânsito / a preparar",
      value: String(inTransit),
      icon: Truck,
      color: "text-blue-600",
    },
    {
      label: "Entregues",
      value: String(delivered),
      icon: CheckCircle2,
      color: "text-emerald-600",
    },
  ];

  return (
    <div>
      <div className="flex items-end justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-500">Visão geral da operação.</p>
        </div>
      </div>

      {/* Métricas principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <Card key={m.label} className="p-5 rounded-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-ink-500 uppercase tracking-wide">
                    {m.label}
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-ink-900">
                    {m.value}
                  </p>
                </div>
                <div className={`h-10 w-10 rounded-xl bg-ink-50 grid place-items-center ${m.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Financeiro */}
      <div className="mt-5 grid md:grid-cols-3 gap-4">
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-ink-500 uppercase tracking-wide">
                Receita (pago)
              </p>
              <p className="text-xl font-semibold tracking-tight">{formatKz(revenueCents)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 grid place-items-center">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-ink-500 uppercase tracking-wide">Custo</p>
              <p className="text-xl font-semibold tracking-tight">{formatKz(costCents)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-5 rounded-2xl">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-ink-900 text-white grid place-items-center">
              <TrendingUp className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-ink-500 uppercase tracking-wide">
                Margem estimada
              </p>
              <p className="text-xl font-semibold tracking-tight">
                {formatKz(profitCents)}{" "}
                <span className="text-sm font-normal text-ink-500">
                  ({marginPct.toFixed(1)}%)
                </span>
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pedidos recentes */}
      <div className="mt-8 grid lg:grid-cols-[1.6fr_1fr] gap-5">
        <Card className="rounded-2xl overflow-hidden">
          <div className="p-5 flex items-center justify-between border-b border-ink-100">
            <h2 className="font-semibold text-ink-900 text-lg">Pedidos recentes</h2>
            <Link
              href="/admin/pedidos"
              className="text-sm font-medium text-ink-900 hover:text-primary-600 inline-flex items-center gap-1"
            >
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full admin-table text-sm">
              <thead className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-5 py-3 font-medium">Ref</th>
                  <th className="text-left px-5 py-3 font-medium">Cliente</th>
                  <th className="text-left px-5 py-3 font-medium">Valor</th>
                  <th className="text-left px-5 py-3 font-medium">Estado</th>
                  <th className="text-left px-5 py-3 font-medium">Data</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-ink-500">
                      Ainda não existem pedidos.
                    </td>
                  </tr>
                )}
                {recentOrders.map((o) => {
                  const sm = ORDER_STATUS_LABELS[o.status as keyof typeof ORDER_STATUS_LABELS];
                  return (
                    <tr key={o.id} className="border-t border-ink-100 hover:bg-ink-50/60">
                      <td data-label="Ref" className="px-5 py-3 font-medium">
                        <Link href={`/admin/pedidos/${o.id}`} className="hover:text-primary-600">
                          #{o.reference}
                        </Link>
                      </td>
                      <td data-label="Cliente" className="px-5 py-3">{o.customerName}</td>
                      <td data-label="Valor" className="px-5 py-3 font-medium tabular-nums">
                        {formatKz(o.totalCents)}
                      </td>
                      <td data-label="Estado" className="px-5 py-3">
                        <Badge color={sm.color as any}>{sm.label}</Badge>
                      </td>
                      <td data-label="Data" className="px-5 py-3 text-ink-500 text-xs">
                        {formatDateTime(o.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="rounded-2xl">
          <div className="p-5 border-b border-ink-100">
            <h2 className="font-semibold text-ink-900 text-lg">Atividade recente</h2>
          </div>
          <div className="p-5">
            {recentLogs.length === 0 ? (
              <p className="text-sm text-ink-500 py-6 text-center">Sem atividade.</p>
            ) : (
              <ul className="space-y-4">
                {recentLogs.map((log) => (
                  <li key={log.id} className="flex items-start gap-3 text-sm">
                    <div className="h-8 w-8 rounded-full bg-ink-100 grid place-items-center flex-shrink-0">
                      <AlertCircle className="h-3.5 w-3.5 text-ink-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-ink-900 font-medium">
                        {log.action}
                        {log.entityType && (
                          <span className="text-ink-500 font-normal"> · {log.entityType}</span>
                        )}
                      </p>
                      <p className="text-xs text-ink-500">{formatDateTime(log.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
