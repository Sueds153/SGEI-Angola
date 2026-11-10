import { Container, Badge, Alert as AlertBox, Card } from "@/components/ui";
import { getOrderByReference } from "@/lib/orders";
import { ORDER_STATUS_LABELS, PAYMENT_STATUS_LABELS, PAYMENT_METHOD_LABELS, formatDateTime } from "@/lib/types";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { TrackingTimeline } from "@/components/order/TrackingTimeline";
import { Package, Phone, MapPin, CreditCard, MessageCircle, Clock } from "lucide-react";
import { OrderActions } from "@/components/order/OrderActions";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ reference: string }>;
}): Promise<Metadata> {
  const { reference } = await params;
  return {
    title: `Pedido #${reference}`,
    robots: { index: false, follow: false },
  };
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const { reference } = await params;
  const data = await getOrderByReference(reference);
  if (!data) notFound();

  const { order, items, address, payment, shipment, trackingEvents } = data;
  const statusMeta = ORDER_STATUS_LABELS[order.status as keyof typeof ORDER_STATUS_LABELS];
  const paymentMeta = payment
    ? PAYMENT_STATUS_LABELS[payment.status as keyof typeof PAYMENT_STATUS_LABELS]
    : null;

  return (
    <Container className="py-8 md:py-14 max-w-6xl">
      <nav className="text-xs text-ink-500 mb-6">
        <Link href="/" className="hover:text-ink-900">Início</Link>
        <span className="mx-1.5">/</span>
        <Link href="/pedidos" className="hover:text-ink-900">Pedidos</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink-900">#{order.reference}</span>
      </nav>

      <Card className="p-6 md:p-10 rounded-3xl">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-ink-900">
                #{order.reference}
              </h1>
              <Badge color={statusMeta.color as any}>{statusMeta.label}</Badge>
            </div>
            <p className="mt-1.5 text-sm text-ink-500">
              Criado a {formatDateTime(order.createdAt)}
            </p>
          </div>
          <OrderActions reference={order.reference} />
        </div>

        <div className="mt-6">
          <AlertBox
            variant={
              statusMeta.color === "danger"
                ? "danger"
                : statusMeta.color === "success"
                ? "success"
                : "info"
            }
          >
            <p className="font-medium">{statusMeta.publicLabel}</p>
          </AlertBox>
        </div>
      </Card>

      <div className="grid md:grid-cols-[1.4fr_1fr] gap-5 mt-5">
        <div className="space-y-5">
          <TrackingTimeline events={trackingEvents} />

          <Card className="p-6 rounded-3xl">
            <h3 className="font-semibold text-ink-900 text-lg flex items-center gap-2">
              <Package className="h-5 w-5 text-ink-900" /> Artigos
            </h3>
            <div className="mt-4 divide-y divide-ink-100">
              {items.map((i) => (
                <div key={i.id} className="py-4 flex gap-4 items-center first:pt-0 last:pb-0">
                  {i.productImage ? (
                    <img
                      src={i.productImage}
                      className="h-16 w-16 rounded-xl object-cover bg-ink-100"
                      alt=""
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-xl bg-ink-100 grid place-items-center text-ink-400">
                      <Package className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[15px] font-medium text-ink-900 line-clamp-2">
                      {i.productName}
                    </p>
                    <p className="text-xs text-ink-500 mt-0.5">
                      Qtd {i.quantity}
                      {i.variantColor && ` · ${i.variantColor}`}
                      {i.variantSize && ` · ${i.variantSize}`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[15px] font-semibold text-ink-900">
                      {formatKz(i.totalPriceCents)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="p-6 rounded-3xl">
            <h3 className="font-semibold text-ink-900 text-lg">Resumo</h3>
            <dl className="mt-4 space-y-2 text-sm">
              <Row label="Produto" value={formatKz(order.subtotalCents)} />
              <Row label="Taxa de serviço" value={formatKz(order.serviceFeeCents)} />
              <Row label="Logística" value={formatKz(order.logisticsFeeCents)} />
              <Row label="Entrega" value={formatKz(order.deliveryFeeCents)} />
              <div className="pt-3 mt-3 border-t border-ink-100 flex justify-between font-semibold text-ink-900 text-base">
                <span>Total</span>
                <span className="tracking-tight">{formatKz(order.totalCents)}</span>
              </div>
            </dl>
          </Card>

          {payment && (
            <Card className="p-6 rounded-3xl">
              <h3 className="font-semibold text-ink-900 text-lg flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Pagamento
              </h3>
              <dl className="mt-4 space-y-2 text-sm">
                <Row
                  label="Método"
                  value={
                    PAYMENT_METHOD_LABELS[
                      payment.method as keyof typeof PAYMENT_METHOD_LABELS
                    ]
                  }
                />
                <Row
                  label="Estado"
                  value={<Badge color={paymentMeta?.color as any}>{paymentMeta?.label}</Badge>}
                />
                {payment.reference && <Row label="Referência" value={payment.reference} />}
              </dl>
              {payment.status === "WAITING" && (
                <div className="mt-4 rounded-2xl bg-ink-50 px-4 py-3 text-xs text-ink-700 flex gap-2">
                  <Clock className="h-4 w-4 text-ink-500 flex-shrink-0 mt-0.5" />
                  <span>
                    Assim que enviares o comprovativo pelo WhatsApp a nossa equipa confirma.
                  </span>
                </div>
              )}
            </Card>
          )}

          {address && (
            <Card className="p-6 rounded-3xl">
              <h3 className="font-semibold text-ink-900 text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Entrega
              </h3>
              <address className="mt-3 not-italic text-[15px] text-ink-700 space-y-0.5 leading-relaxed">
                <p className="font-medium text-ink-900">{address.recipientName}</p>
                <p>{address.street || "—"}</p>
                <p>{address.neighborhood}</p>
                <p>
                  {address.municipality}, {address.province}
                </p>
                {address.reference && (
                  <p className="text-ink-500 text-xs mt-2">Ref: {address.reference}</p>
                )}
              </address>
            </Card>
          )}

          <Card className="p-6 rounded-3xl">
            <h3 className="font-semibold text-ink-900 text-lg flex items-center gap-2">
              <Phone className="h-5 w-5" /> Contacto
            </h3>
            <div className="mt-3 space-y-0.5 text-[15px] text-ink-700">
              <p className="font-medium text-ink-900">{order.customerName}</p>
              <p className="text-ink-500">{order.customerPhone}</p>
              {order.customerEmail && <p className="text-ink-500">{order.customerEmail}</p>}
            </div>
            <a
              href={`https://wa.me/244923000000?text=${encodeURIComponent(
                `Olá, tenho uma dúvida sobre o pedido #${order.reference}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 text-[14px] font-medium text-ink-900 hover:text-primary-600"
            >
              <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
            </a>
          </Card>
        </div>
      </div>
    </Container>
  );
}

function formatKz(cents: number) {
  const kz = Math.round(cents) / 100;
  return new Intl.NumberFormat("pt-PT", { maximumFractionDigits: 0 }).format(kz) + " Kz";
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3 text-ink-700">
      <dt className="text-ink-500">{label}</dt>
      <dd className="font-medium text-ink-900 text-right">{value}</dd>
    </div>
  );
}
