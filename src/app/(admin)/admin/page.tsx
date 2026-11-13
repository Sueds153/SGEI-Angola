import { db } from "@/db";
import { orders, payments, users, auditLogs } from "@/db/schema";
import { desc, eq, sql, gte } from "drizzle-orm";
import { Card, Badge } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { Metadata } from "next";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ORDER_STATUS_LABELS, formatDateTime, formatKz } from "@/lib/types";
import {
  TrendingUp,
  ShoppingBag,
  CreditCard,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Package,
  Sliders,
  FileText,
  Banknote,
  Search,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Painel de Controlo · ImportEasy Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    redirect("/admin/login");
  }

  // 1. Início do dia de hoje para métricas diárias
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  // 2. Consulta paralela de alto desempenho
  const [
    allOrders,
    todayOrdersList,
    pendingProofs,
    recentAudits,
    customerCountRes,
  ] = await Promise.all([
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(10),
    db.select().from(orders).where(gte(orders.createdAt, startOfToday)),
    db
      .select({
        order: orders,
        payment: payments,
      })
      .from(orders)
      .leftJoin(payments, eq(payments.orderId, orders.id))
      .where(eq(orders.status, "PAYMENT_REVIEW"))
      .orderBy(desc(orders.updatedAt))
      .limit(10),
    db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(6),
    db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.role, "customer")),
  ]);

  // Contadores agregados
  const totalOrdersCount = (await db.select({ count: sql<number>`count(*)` }).from(orders))[0]?.count || 0;
  
  // Receita de pedidos pagos
  const paidOrdersSum = await db
    .select({ total: sql<number>`coalesce(sum(${orders.totalCents}), 0)` })
    .from(orders)
    .where(eq(orders.paymentStatus, "PAID"));
  const totalRevenueKz = Number(paidOrdersSum[0]?.total || 0);

  const pendingProofsCount = pendingProofs.length;
  const customersCount = Number(customerCountRes[0]?.count || 0);
  const todayOrdersCount = todayOrdersList.length;

  return (
    <div className="space-y-8 pb-12">
      {/* Cabeçalho do Dashboard */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-ink-200/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-ink-900">
              Painel de Controlo
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" /> Segurança Ativa
            </span>
          </div>
          <p className="mt-1 text-sm text-ink-500">
            Visão executiva em tempo real de pedidos, pagamentos e operações da ImportEasy.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/rastreio">
            <Button variant="secondary" size="sm">
              Rastreio & Intervenção
            </Button>
          </Link>
          <Link href="/admin/cambio">
            <Button variant="primary" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
              <Banknote className="w-3.5 h-3.5 mr-1" /> Câmbio Informal (Rua)
            </Button>
          </Link>
        </div>
      </div>

      {/* Alerta de Ação Urgente: Comprovativos Pendentes de Aprovação */}
      {pendingProofsCount > 0 && (
        <div className="rounded-2xl bg-amber-500/10 border-2 border-amber-500/30 p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white grid place-items-center shrink-0 shadow-sm animate-pulse">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-amber-950 flex items-center gap-2">
                  <span>{pendingProofsCount} Comprovativo(s) a Aguardar Aprovação</span>
                  <span className="px-2 py-0.5 text-xs bg-amber-200 text-amber-900 font-bold rounded-full">
                    Ação Necessária
                  </span>
                </h2>
                <p className="text-xs sm:text-sm text-amber-900/80 mt-0.5">
                  Os clientes submeteram comprovativos via Express ou Referência. Verifique e aprove no sistema para avançar com a compra das encomendas.
                </p>
              </div>
            </div>
            <Link href="/admin/pagamentos">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shrink-0">
                Aprovar Comprovativos Agora →
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Cartões de Indicadores-Chave (KPIs) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI: Receita Faturada */}
        <Card className="p-5 rounded-2xl bg-white border border-ink-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              Receita Confirmada
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-ink-900 tracking-tight">
              {formatKz(totalRevenueKz)}
            </p>
            <p className="text-xs text-ink-500 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Total liquidado e pago
            </p>
          </div>
        </Card>

        {/* KPI: Pedidos Hoje / Total */}
        <Card className="p-5 rounded-2xl bg-white border border-ink-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              Pedidos (Hoje / Total)
            </span>
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 grid place-items-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-ink-900">{todayOrdersCount}</span>
              <span className="text-xs font-semibold text-ink-500">hoje</span>
              <span className="text-xs text-ink-400">/ {totalOrdersCount} no total</span>
            </div>
            <p className="text-xs text-ink-500 mt-1">
              Volume contínuo de importações
            </p>
          </div>
        </Card>

        {/* KPI: Comprovativos em Análise */}
        <Card className="p-5 rounded-2xl bg-white border border-ink-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              Revisão de Pagamentos
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 grid place-items-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-amber-700">
              {pendingProofsCount}
            </p>
            <p className="text-xs text-ink-500 mt-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-500" /> Aguardam confirmação de talão
            </p>
          </div>
        </Card>

        {/* KPI: Clientes Registados */}
        <Card className="p-5 rounded-2xl bg-white border border-ink-100 shadow-sm hover:shadow-md transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
              Clientes Registados
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 grid place-items-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-bold text-ink-900">
              {customersCount}
            </p>
            <p className="text-xs text-ink-500 mt-1">
              Base de clientes em Angola
            </p>
          </div>
        </Card>
      </div>

      {/* Grid Principal: Pedidos Recentes + Atividade de Segurança */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna 1 & 2: Últimos Pedidos */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl overflow-hidden border border-ink-200/80 shadow-sm">
            <div className="p-5 border-b border-ink-100 flex items-center justify-between bg-ink-50/50">
              <div>
                <h3 className="font-bold text-ink-900 text-base flex items-center gap-2">
                  <Package className="w-4 h-4 text-brand-600" /> Últimos Pedidos Recebidos
                </h3>
                <p className="text-xs text-ink-500 mt-0.5">
                  Atualizações de pedidos e encomendas em tempo real
                </p>
              </div>
              <Link
                href="/admin/pedidos"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
              >
                Ver todos <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-ink-50/80 text-ink-500 text-xs uppercase tracking-wide border-b border-ink-100">
                  <tr>
                    <th className="text-left px-5 py-3 font-semibold">Ref</th>
                    <th className="text-left px-5 py-3 font-semibold">Cliente</th>
                    <th className="text-left px-5 py-3 font-semibold">Valor</th>
                    <th className="text-left px-5 py-3 font-semibold">Estado</th>
                    <th className="text-right px-5 py-3 font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {allOrders.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-ink-500">
                        Nenhum pedido registado até ao momento.
                      </td>
                    </tr>
                  ) : (
                    allOrders.map((o) => {
                      const sm = ORDER_STATUS_LABELS[o.status as keyof typeof ORDER_STATUS_LABELS];
                      return (
                        <tr key={o.id} className="hover:bg-ink-50/60 transition">
                          <td className="px-5 py-3.5 font-bold text-ink-900">
                            <Link href={`/admin/pedidos/${o.id}`} className="hover:text-brand-600">
                              #{o.reference}
                            </Link>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="font-medium text-ink-900">{o.customerName}</div>
                            <div className="text-xs text-ink-500">{o.customerPhone}</div>
                          </td>
                          <td className="px-5 py-3.5 font-semibold tabular-nums text-ink-900">
                            {formatKz(o.totalCents)}
                          </td>
                          <td className="px-5 py-3.5">
                            <Badge color={sm?.color as any}>{sm?.label || o.status}</Badge>
                          </td>
                          <td className="px-5 py-3.5 text-right">
                            <Link
                              href={`/admin/pedidos/${o.id}`}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-2.5 py-1 rounded-lg transition"
                            >
                              Gerir
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Coluna 3: Ações Rápidas & Trilha de Auditoria Bancária */}
        <div className="space-y-6">
          {/* Ações Rápidas do Administrador */}
          <Card className="p-5 rounded-2xl border border-ink-200/80 shadow-sm">
            <h3 className="font-bold text-ink-900 text-sm uppercase tracking-wider text-ink-500 mb-3">
              Gestão Operacional Rápida
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              <Link
                href="/admin/cambio"
                className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/30 hover:border-emerald-500 hover:bg-emerald-50/60 transition flex flex-col items-center text-center group"
              >
                <Banknote className="w-5 h-5 text-emerald-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-ink-800">Câmbio Informal</span>
                <span className="text-[10px] text-emerald-700 font-semibold">Taxa da rua</span>
              </Link>

              <Link
                href="/admin/rastreio"
                className="p-3 rounded-xl border border-brand-200 bg-brand-50/30 hover:border-brand-500 hover:bg-brand-50/60 transition flex flex-col items-center text-center group"
              >
                <Search className="w-5 h-5 text-brand-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-ink-800">Super Rastreio</span>
                <span className="text-[10px] text-brand-700 font-semibold">Intervenção rápida</span>
              </Link>

              <Link
                href="/admin/pagamentos"
                className="p-3 rounded-xl border border-ink-200 hover:border-brand-500 hover:bg-brand-50/40 transition flex flex-col items-center text-center group"
              >
                <CreditCard className="w-5 h-5 text-brand-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-ink-800">Pagamentos</span>
                <span className="text-[10px] text-ink-400">Verificar talões</span>
              </Link>

              <Link
                href="/admin/logistica"
                className="p-3 rounded-xl border border-ink-200 hover:border-brand-500 hover:bg-brand-50/40 transition flex flex-col items-center text-center group"
              >
                <Package className="w-5 h-5 text-brand-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-ink-800">Logística</span>
                <span className="text-[10px] text-ink-400">Trackings SHEIN</span>
              </Link>
              <Link
                href="/admin/comunidade"
                className="p-3 rounded-xl border border-ink-200 hover:border-brand-500 hover:bg-brand-50/40 transition flex flex-col items-center text-center group"
              >
                <Users className="w-5 h-5 text-brand-600 mb-1.5 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-bold text-ink-800">Comunidade</span>
                <span className="text-[10px] text-ink-400">Moderar feed</span>
              </Link>
            </div>
          </Card>

          {/* Trilha de Auditoria Bancária (Audit Logs Recentes) */}
          <Card className="p-5 rounded-2xl border border-ink-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-ink-900 text-sm flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Segurança & Auditoria
              </h3>
              <Link href="/admin/logs" className="text-xs font-semibold text-brand-600 hover:underline">
                Ver todos
              </Link>
            </div>

            <div className="space-y-3">
              {recentAudits.length === 0 ? (
                <p className="text-xs text-ink-500 py-3 text-center">Nenhum evento registado.</p>
              ) : (
                recentAudits.map((log) => (
                  <div key={log.id} className="text-xs border-b border-ink-100 last:border-0 pb-2.5 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink-900">{log.action}</span>
                      <span className="text-[10px] text-ink-400">
                        {formatDateTime(log.createdAt)}
                      </span>
                    </div>
                    <div className="text-ink-600 mt-0.5 flex items-center gap-2">
                      <span>{log.actorEmail || "Sistema"}</span>
                      {log.ip && (
                        <span className="text-[10px] font-mono text-ink-400">
                          IP: {log.ip}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
