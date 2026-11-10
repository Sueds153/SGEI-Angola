import { db } from "@/db";
import {
  orders,
  orderItems,
  addresses,
  payments,
  shipments,
  trackingEvents,
} from "@/db/schema";
import type { OrderStatus, PaymentMethod } from "./types";
import { eq, and, desc } from "drizzle-orm";
import { generateOrderReference, slugify } from "./utils";
import { calculatePrice, loadPricingConfig } from "./pricing";
import type { OrderCreateInput } from "./types";
import { findOrCreateCustomerByPhone } from "./auth";

export interface CreatedOrder {
  id: number;
  reference: string;
  status: OrderStatus;
  totalCents: number;
}

/**
 * Cria um pedido completo com item, morada, pagamento e evento inicial de tracking.
 */
export async function createOrderFromInput(input: OrderCreateInput): Promise<CreatedOrder> {
  // Carrega pricing config
  const cfg = await loadPricingConfig();

  // Calcula totais para os itens
  const preparedItems = [];
  let itemsSubtotalCents = 0;

  for (const item of input.items) {
    // Preço unitário (em cêntimos).
    let unitCents = item.unitPriceCents;
    if (!unitCents && item.originalPriceUsd) {
      const p = calculatePrice(
        {
          productPrice: item.originalPriceUsd,
          productCurrency: (item as any).originalCurrency || "USD",
          quantity: 1,
        },
        cfg
      );
      unitCents = Math.round(p.subtotalCents);
    }
    const totalItemCents = unitCents * item.quantity;
    itemsSubtotalCents += totalItemCents;
    preparedItems.push({
      ...item,
      unitPriceCents: unitCents,
      totalPriceCents: totalItemCents,
    });
  }

  // Custos fixos
  let serviceFeeCents = Math.round(itemsSubtotalCents * cfg.serviceFeePct);
  if (serviceFeeCents < cfg.serviceFeeMinCents) serviceFeeCents = cfg.serviceFeeMinCents;
  const logisticsFeeCents = cfg.logisticsBaseCents;
  let deliveryFeeCents = cfg.localDeliveryCents;
  if (
    input.address.province &&
    cfg.deliveryByProvince &&
    cfg.deliveryByProvince[input.address.province] != null
  ) {
    deliveryFeeCents = cfg.deliveryByProvince[input.address.province];
  }
  const rawTotal = itemsSubtotalCents + serviceFeeCents + logisticsFeeCents + deliveryFeeCents;
  const totalCents = Math.round(rawTotal / cfg.roundToNearestCents) * cfg.roundToNearestCents;

  // Encontra/cria cliente
  const customerUser = await findOrCreateCustomerByPhone(
    input.customerPhone,
    input.customerName,
    input.customerWhatsapp,
    input.customerEmail
  );

  // Gerar referência única
  let reference = generateOrderReference();
  while (true) {
    const existing = await db
      .select({ id: orders.id })
      .from(orders)
      .where(eq(orders.reference, reference))
      .limit(1);
    if (existing.length === 0) break;
    reference = generateOrderReference();
  }

  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 48); // 48h

  // Inserir ordem
  const [order] = await db
    .insert(orders)
    .values({
      reference,
      customerId: customerUser.id,
      customerName: input.customerName,
      customerEmail: input.customerEmail || null,
      customerPhone: input.customerPhone,
      customerWhatsapp: input.customerWhatsapp || null,
      status: "PENDING_PAYMENT",
      paymentStatus: "WAITING",
      paymentMethod: input.paymentMethod,
      subtotalCents: itemsSubtotalCents,
      serviceFeeCents,
      logisticsFeeCents,
      deliveryFeeCents,
      totalCents,
      currency: "AOA",
      exchangeRateUsed: cfg.exchangeRateUsdToAoa.toString(),
      marginStatus: "SAFE",
      estimatedCostCents: Math.round(totalCents * cfg.estimatedCostPct),
      notes: input.notes || null,
      paymentExpiresAt: expiresAt,
    })
    .returning();

  // Inserir itens
  for (const it of preparedItems) {
    await db.insert(orderItems).values({
      orderId: order.id,
      productId: it.productId || null,
      productVariantId: it.variantId || null,
      productName: it.productName,
      productImage: it.productImage || null,
      sourceUrl: it.sourceUrl || null,
      sku: it.sku || null,
      variantColor: it.variantColor || null,
      variantSize: it.variantSize || null,
      variantLabel: it.variantLabel || null,
      quantity: it.quantity,
      unitPriceCents: it.unitPriceCents,
      totalPriceCents: it.totalPriceCents,
      originalPriceUsd: it.originalPriceUsd ? it.originalPriceUsd.toString() : null,
      originalCurrency: (it as any).originalCurrency || "USD",
      priceSnapshot: it.priceSnapshot as any,
    });
  }

  // Inserir morada
  await db.insert(addresses).values({
    orderId: order.id,
    province: input.address.province,
    municipality: input.address.municipality,
    neighborhood: input.address.neighborhood || null,
    street: input.address.street || null,
    reference: input.address.reference || null,
    instructions: input.address.instructions || null,
    phone: input.customerPhone,
    recipientName: input.customerName,
  });

  // Inserir pagamento
  await db.insert(payments).values({
    orderId: order.id,
    amountCents: totalCents,
    method: input.paymentMethod,
    status: "WAITING",
    reference: `PG-${reference}`,
    expiresAt,
  });

  // Inserir shipment vazio
  await db.insert(shipments).values({
    orderId: order.id,
    status: "PENDING",
  });

  // Evento de tracking inicial
  await db.insert(trackingEvents).values({
    orderId: order.id,
    status: "PENDING_PAYMENT",
    title: "Pedido recebido",
    description: "Recebemos o teu pedido. Assim que o pagamento for confirmado, daremos início à compra.",
    eventDate: new Date(),
  });

  return {
    id: order.id,
    reference: order.reference,
    status: order.status as OrderStatus,
    totalCents: order.totalCents,
  };
}

export async function getOrderByReference(reference: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.reference, reference))
    .limit(1);
  if (!order) return null;
  const [items, address, payment, shipment, tracking] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
    db.select().from(addresses).where(eq(addresses.orderId, order.id)).limit(1),
    db.select().from(payments).where(eq(payments.orderId, order.id)).limit(1),
    db.select().from(shipments).where(eq(shipments.orderId, order.id)).limit(1),
    db
      .select()
      .from(trackingEvents)
      .where(eq(trackingEvents.orderId, order.id))
      .orderBy(desc(trackingEvents.eventDate)),
  ]);
  return {
    order,
    items,
    address: address[0] || null,
    payment: payment[0] || null,
    shipment: shipment[0] || null,
    trackingEvents: tracking,
  };
}

export async function getOrdersForCustomer(customerId: number) {
  return db
    .select()
    .from(orders)
    .where(eq(orders.customerId, customerId))
    .orderBy(desc(orders.createdAt));
}
