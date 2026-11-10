import { db } from "@/db";
import { orders, orderItems, addresses, payments, shipments, trackingEvents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Card, Badge } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, formatKz, formatDateTime } from "@/lib/types";
import Link from "next/link";
import { ArrowLeft, Package, User, MapPin, CreditCard, Truck } from "lucide-react";
import { OrderStatusChanger } from "@/components/admin/OrderStatusChanger";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderId = Number(id);
  if (isNaN(orderId)) notFound();

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) notFound();

  const [items, address, payment, shipment, tracking] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, orderId)),
    db.select().from(addresses).where(eq(addresses.orderId, orderId)).limit(1),
    db.select().from(payments).where(eq(payments.orderId, orderId)).limit(1),
    db.select().from(shipments).where(eq(shipments.orderId, orderId)).limit(1),
    db
      .select()
      .from(trackingEvents)
      .where(eq(trackingEvents.orderId, orderId))
      .orderBy(trackingEvents.eventDate),
  ]);

  const sm = ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS];
  const profitCents =
    order.actualCostCents != null
      ? order.totalCents - Number(order.actualCostCents)
      : order.totalCents - (order.estimatedCostCents || 0);

  return (
    <div>
      <Link
        href="/admin/pedidos"
        className="inline-flex items-center gap-1 text-sm font-medium text-ink-600 hover:text-ink-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Voltar aos pedidos
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-3xl font-semibold tracking-tight text-ink-900">
              #{order.reference}
            </h1>
            <Badge color={sm.color as any}>{sm.label}</Badge>
          </div>
          <p className="mt-1 text-sm text-ink-500">Criado {formatDateTime(order.createdAt)}</p>
        </div>
        <OrderStatusChanger orderId={order.id} currentStatus={order.status} currentPaymentStatus={order.paymentStatus} />
      </div>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card className="p-6 rounded-2xl">
            <h2 className="font-semibold text-ink-900 text-lg flex items-center gap-2">
              <Package className="h-5 w-5" /> Artigos
            </h2>
            <div className="mt-4 divide-y divide-ink-100">
              {items.map((i) => (
                <div key={i.id} className="py-4 flex gap-4 first:pt-0 last:pb-0">
                  {i.productImage ? (
                    <img src={i.productImage} className="h-16 w-16 rounded-xl object-cover bg-ink-100" alt="" />
                  ) : (
                    <div className="h-16 w-16 rounded-xl bg-ink-100 grid place-items-center text-ink-400">
                      <Package className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink-900">{i.productName}</p>
                    <p className="text-xs text-ink-500 mt-1">
                      Qtd {i.quantity}
                      {i.variantColor && ` · ${i.variantColor}`}
                      {i.variantSize && ` · ${i.variantSize}`}
                      {i.sku && ` · SKU ${i.sku}`}
                    </p>
                    {i.sourceUrl && (
                      <a href={i.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary-600 hover:underline mt-1 inline-block">
                        Ver link SHEIN
                      </a>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatKz(i.totalPriceCents)}</p>
                    {i.originalPriceUsd && (
                      <p className="text-xs text-ink-500">${Number(i.originalPriceUsd).toFixed(2)} USD</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 rounded-2xl">
            <h2 className="font-semibold text-ink-900 text-lg">Timeline</h2>
            <ol className="mt-4 relative pl-6">
              {tracking.map((t) => (
                <li key={t.id} className="pb-5 relative last:pb-0">
                  <div className="absolute -left-0 top-1.5 h-3 w-3 rounded-full bg-ink-900" />
                  <div className="absolute left-[5px] top-5 bottom-0 w-px bg-ink-200 last:hidden" />
                  <p className="font-medium text-ink-900 text-sm">{t.title}</p>
                  {t.description && <p className="text-xs text-ink-600 mt-0.5">{t.description}</p>}
                  <p className="text-[11px] text-ink-400 mt-0.5">{formatDateTime(t.eventDate)}</p>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="p-6 rounded-2xl">
            <h2 className="font-semibold text-ink-900 text-lg flex items-center gap-2">
              <Truck className="h-5 w-5" /> Logística
            </h2>
            {shipment && shipment[0] ? (
              <div className="mt-4 grid md:grid-cols-2 gap-4 text-sm">
                <Field label="Tracking internacional" value={shipment[0].internationalTracking || "—"} />
                <Field label="Tracking local" value={shipment[0].localTracking || "—"} />
                <Field label="Transportadora" value={shipment[0].carrier || "—"} />
                <Field label="Estado" value={shipment[0].status || "—"} />
              </div>
            ) : (
              <p className="mt-3 text-sm text-ink-500">Ainda não há informação de envio.</p>
            )}
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-6 rounded-2xl">
            <h2 className="font-semibold text-ink-900 text-lg flex items-center gap-2">
              <User className="h-5 w-5" /> Cliente
            </h2>
            <div className="mt-3 space-y-0.5 text-sm">
              <p className="font-medium text-ink-900">{order.customerName}</p>
              <p className="text-ink-600">{order.customerPhone}</p>
              {order.customerEmail && <p className="text-ink-600">{order.customerEmail}</p>}
              {order.customerWhatsapp && (
                <p className="text-ink-500 text-xs mt-2">WhatsApp: {order.customerWhatsapp}</p>
              )}
            </div>
          </Card>

          {address[0] && (
            <Card className="p-6 rounded-2xl">
              <h2 className="font-semibold text-ink-900 text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Morada
              </h2>
              <address className="mt-3 not-italic text-sm text-ink-700 space-y-0.5">
                <p>{address[0].street || "—"}</p>
                <p>{address[0].neighborhood}</p>
                <p>
                  {address[0].municipality}, {address[0].province}
                </p>
                {address[0].reference && (
                  <p className="text-ink-500 text-xs mt-2">Ref: {address[0].reference}</p>
                )}
              </address>
            </Card>
          )}

          {payment[0] && (
            <Card className="p-6 rounded-2xl">
              <h2 className="font-semibold text-ink-900 text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Pagamento
              </h2>
              <dl className="mt-3 space-y-2 text-sm">
                <Dl label="Método" value={PAYMENT_METHOD_LABELS[payment[0].method as keyof typeof PAYMENT_METHOD_LABELS]} />
                <Dl label="Valor" value={formatKz(payment[0].amountCents)} />
                <Dl label="Estado" value={payment[0].status} />
                {payment[0].reference && <Dl label="Ref. pagamento" value={payment[0].reference} />}
              </dl>
            </Card>
          )}

          <Card className="p-6 rounded-2xl">
            <h2 className="font-semibold text-ink-900 text-lg">Financeiro</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <Dl label="Receita" value={formatKz(order.totalCents)} />
              <Dl label="Custo estimado" value={formatKz(order.estimatedCostCents || 0)} />
              <Dl
                label="Lucro estimado"
                value={formatKz(profitCents)}
              />
            </dl>
          </Card>

          {order.notes && (
            <Card className="p-6 rounded-2xl">
              <h2 className="font-semibold text-ink-900 text-sm uppercase tracking-wide text-ink-500">Notas do cliente</h2>
              <p className="mt-2 text-sm text-ink-700">{order.notes}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-ink-500 uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-ink-900 mt-0.5">{value}</p>
    </div>
  );
}
function Dl({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-medium text-ink-900 text-right">{value}</dd>
    </div>
  );
}
