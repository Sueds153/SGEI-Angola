import { db } from "@/db";
import { orders, orderItems, addresses, shipments, trackingEvents } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { OrderInterventionCenter } from "@/components/admin/OrderInterventionCenter";

export const metadata: Metadata = {
  title: "Central de Rastreio & Intervenção · ImportEasy Admin",
};

export const dynamic = "force-dynamic";

export default async function AdminRastreioPage() {
  const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(100);

  // Busca dados relacionados para cada pedido
  const enrichedOrders = await Promise.all(
    allOrders.map(async (order) => {
      const [items, address, shipment, tracking] = await Promise.all([
        db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
        db.select().from(addresses).where(eq(addresses.orderId, order.id)).limit(1),
        db.select().from(shipments).where(eq(shipments.orderId, order.id)).limit(1),
        db
          .select()
          .from(trackingEvents)
          .where(eq(trackingEvents.orderId, order.id))
          .orderBy(desc(trackingEvents.eventDate)),
      ]);

      return {
        id: order.id,
        reference: order.reference,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        customerWhatsapp: order.customerWhatsapp,
        status: order.status,
        paymentStatus: order.paymentStatus,
        totalCents: order.totalCents,
        createdAt: order.createdAt.toISOString(),
        internalNotes: order.internalNotes,
        items: items.map((i) => ({
          id: i.id,
          productName: i.productName,
          productImage: i.productImage,
          quantity: i.quantity,
          totalPriceCents: i.totalPriceCents,
        })),
        shipment: shipment[0]
          ? {
              internationalTracking: shipment[0].internationalTracking,
              localTracking: shipment[0].localTracking,
              carrier: shipment[0].carrier,
              status: shipment[0].status,
            }
          : null,
        address: address[0]
          ? {
              province: address[0].province,
              municipality: address[0].municipality,
              neighborhood: address[0].neighborhood,
              street: address[0].street,
              reference: address[0].reference,
              recipientName: address[0].recipientName,
            }
          : null,
        tracking: tracking.map((t) => ({
          id: t.id,
          title: t.title,
          description: t.description,
          status: t.status,
          eventDate: t.eventDate.toISOString(),
        })),
      };
    })
  );

  return <OrderInterventionCenter initialOrders={enrichedOrders} />;
}
