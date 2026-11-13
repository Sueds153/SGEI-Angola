import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/db";
import { orders, shipments, trackingEvents, addresses, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { OrderStatus } from "@/lib/types";

const schema = z.object({
  action: z.enum([
    "ADD_TRACKING_EVENT",
    "UPDATE_SHIPMENT_TRACKING",
    "UPDATE_CUSTOMER_CONTACT_OR_ADDRESS",
    "SAVE_INTERNAL_NOTES",
  ]),
  // Dados para ADD_TRACKING_EVENT
  eventTitle: z.string().optional(),
  eventDescription: z.string().optional(),
  eventStatus: z.string().optional(),
  eventDate: z.string().optional(),
  isPublic: z.boolean().default(true).optional(),

  // Dados para UPDATE_SHIPMENT_TRACKING
  internationalTracking: z.string().optional(),
  localTracking: z.string().optional(),
  carrier: z.string().optional(),
  shipmentStatus: z.string().optional(),

  // Dados para UPDATE_CUSTOMER_CONTACT_OR_ADDRESS
  customerPhone: z.string().optional(),
  customerWhatsapp: z.string().optional(),
  recipientName: z.string().optional(),
  province: z.string().optional(),
  municipality: z.string().optional(),
  neighborhood: z.string().optional(),
  street: z.string().optional(),
  referencePoint: z.string().optional(),

  // Dados para SAVE_INTERNAL_NOTES
  internalNotes: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  const orderId = Number(id);
  if (isNaN(orderId)) {
    return NextResponse.json({ error: "ID de pedido inválido" }, { status: 400 });
  }

  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) {
    return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dados inválidos", details: parsed.error.format() }, { status: 400 });
  }

  const data = parsed.data;

  try {
    switch (data.action) {
      case "ADD_TRACKING_EVENT": {
        if (!data.eventTitle) {
          return NextResponse.json({ error: "Título do evento é obrigatório" }, { status: 400 });
        }

        const statusToUse = (data.eventStatus as OrderStatus) || order.status;
        const [newEvent] = await db
          .insert(trackingEvents)
          .values({
            orderId,
            status: statusToUse,
            title: data.eventTitle,
            description: data.eventDescription || null,
            eventDate: data.eventDate ? new Date(data.eventDate) : new Date(),
            isPublic: data.isPublic ?? true,
          })
          .returning();

        // Se o status indicado for diferente e fornecido, atualiza também o pedido
        if (data.eventStatus && data.eventStatus !== order.status) {
          await db
            .update(orders)
            .set({ status: data.eventStatus as OrderStatus, updatedAt: new Date() })
            .where(eq(orders.id, orderId));
        }

        // Auditoria
        await db.insert(auditLogs).values({
          actorId: session.userId,
          actorEmail: session.email,
          action: "TRACKING_EVENT_ADDED_BY_ADMIN",
          entityType: "order",
          entityId: String(orderId),
          newValue: newEvent,
        });

        return NextResponse.json({ ok: true, message: "Evento de rastreio publicado com sucesso!" });
      }

      case "UPDATE_SHIPMENT_TRACKING": {
        const [existingShipment] = await db
          .select()
          .from(shipments)
          .where(eq(shipments.orderId, orderId))
          .limit(1);

        const shipmentData = {
          internationalTracking: data.internationalTracking || null,
          localTracking: data.localTracking || null,
          carrier: data.carrier || "SHEIN Express",
          status: data.shipmentStatus || "IN_TRANSIT",
          updatedAt: new Date(),
        };

        if (existingShipment) {
          await db
            .update(shipments)
            .set(shipmentData)
            .where(eq(shipments.orderId, orderId));
        } else {
          await db.insert(shipments).values({
            orderId,
            ...shipmentData,
          });
        }

        // Se adicionou tracking internacional pela primeira vez, adiciona um evento no tracking automático
        if (data.internationalTracking && (!existingShipment || !existingShipment.internationalTracking)) {
          await db.insert(trackingEvents).values({
            orderId,
            status: "IN_TRANSIT",
            title: `Código de Rastreio Emitido: ${data.internationalTracking}`,
            description: `A sua encomenda foi despachada da China/armazém central (${data.carrier || "SHEIN"}). Tracking internacional ativo.`,
            eventDate: new Date(),
            isPublic: true,
          });
        }

        // Auditoria
        await db.insert(auditLogs).values({
          actorId: session.userId,
          actorEmail: session.email,
          action: "SHIPMENT_TRACKING_UPDATED",
          entityType: "shipment",
          entityId: String(orderId),
          newValue: shipmentData,
        });

        return NextResponse.json({ ok: true, message: "Dados de envio e rastreio atualizados com sucesso!" });
      }

      case "UPDATE_CUSTOMER_CONTACT_OR_ADDRESS": {
        // Atualiza contactos no pedido
        if (data.customerPhone || data.customerWhatsapp) {
          const updateData: Record<string, any> = { updatedAt: new Date() };
          if (data.customerPhone) updateData.customerPhone = data.customerPhone;
          if (data.customerWhatsapp) updateData.customerWhatsapp = data.customerWhatsapp;
          await db.update(orders).set(updateData).where(eq(orders.id, orderId));
        }

        // Atualiza morada
        const [existingAddress] = await db
          .select()
          .from(addresses)
          .where(eq(addresses.orderId, orderId))
          .limit(1);

        if (existingAddress) {
          await db
            .update(addresses)
            .set({
              recipientName: data.recipientName || existingAddress.recipientName,
              province: data.province || existingAddress.province,
              municipality: data.municipality || existingAddress.municipality,
              neighborhood: data.neighborhood !== undefined ? data.neighborhood : existingAddress.neighborhood,
              street: data.street !== undefined ? data.street : existingAddress.street,
              reference: data.referencePoint !== undefined ? data.referencePoint : existingAddress.reference,
            })
            .where(eq(addresses.orderId, orderId));
        }

        // Auditoria
        await db.insert(auditLogs).values({
          actorId: session.userId,
          actorEmail: session.email,
          action: "ORDER_CONTACT_ADDRESS_INTERVENTION",
          entityType: "order",
          entityId: String(orderId),
          newValue: data,
        });

        return NextResponse.json({ ok: true, message: "Morada e contactos atualizados com sucesso!" });
      }

      case "SAVE_INTERNAL_NOTES": {
        await db
          .update(orders)
          .set({ internalNotes: data.internalNotes || null, updatedAt: new Date() })
          .where(eq(orders.id, orderId));

        await db.insert(auditLogs).values({
          actorId: session.userId,
          actorEmail: session.email,
          action: "ORDER_INTERNAL_NOTES_UPDATED",
          entityType: "order",
          entityId: String(orderId),
          newValue: { internalNotes: data.internalNotes },
        });

        return NextResponse.json({ ok: true, message: "Notas internas salvas com sucesso!" });
      }
    }
  } catch (err: any) {
    console.error("Erro na intervenção do pedido:", err);
    return NextResponse.json({ error: "Erro interno ao processar intervenção: " + err.message }, { status: 500 });
  }
}
