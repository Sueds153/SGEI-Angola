import { db } from "@/db";
import {
  users,
  adminProfiles,
  customerProfiles,
  categories,
  pricingConfigs,
  orders,
  orderItems,
  addresses,
  payments,
  shipments,
  trackingEvents,
  auditLogs,
} from "@/db/schema";
import { hashPassword } from "./auth";
import { getDefaultPricingConfig } from "./pricing";
import { eq } from "drizzle-orm";

export async function seedDatabase() {
  // Evita duplicar
  const existingAdmin = await db.select().from(users).where(eq(users.email, "admin@sgei.ao"));
  if (existingAdmin.length > 0) {
    console.log("[seed] Database already seeded.");
    return;
  }

  // Admin user
  const adminPassword = await hashPassword("admin123");
  const [adminUser] = await db
    .insert(users)
    .values({
      email: "admin@sgei.ao",
      passwordHash: adminPassword,
      role: "admin",
      phone: "923456789",
    })
    .returning();
  await db.insert(adminProfiles).values({ userId: adminUser.id, name: "Administrador" });

  // Cliente demo
  const [customerUser] = await db
    .insert(users)
    .values({
      email: "cliente@exemplo.ao",
      passwordHash: await hashPassword("cliente123"),
      role: "customer",
      phone: "921234567",
    })
    .returning();
  await db.insert(customerProfiles).values({
    userId: customerUser.id,
    name: "João Silva",
    whatsapp: "921234567",
  });

  // Categorias
  const catData = [
    { name: "Vestuário feminino", slug: "vestuario-feminino", icon: "Shirt" },
    { name: "Vestuário masculino", slug: "vestuario-masculino", icon: "Shirt" },
    { name: "Crianças", slug: "criancas", icon: "Baby" },
    { name: "Calçados", slug: "calcados", icon: "Footprints" },
    { name: "Bolsas", slug: "bolsas", icon: "Handbag" },
    { name: "Acessórios", slug: "acessorios", icon: "Watch" },
    { name: "Beleza", slug: "beleza", icon: "Sparkles" },
    { name: "Casa", slug: "casa", icon: "Home" },
    { name: "Outros", slug: "outros", icon: "Package" },
  ];
  const insertedCats = [];
  for (const c of catData) {
    const [row] = await db.insert(categories).values(c).returning();
    insertedCats.push(row);
  }

  // Pricing config
  const defaults = getDefaultPricingConfig();
  const configEntries = Object.entries({
    exchangeRateUsdToAoa: String(defaults.exchangeRateUsdToAoa),
    serviceFeePct: String(defaults.serviceFeePct),
    serviceFeeMinCents: String(defaults.serviceFeeMinCents),
    logisticsBaseCents: String(defaults.logisticsBaseCents),
    logisticsPerGramCents: String(defaults.logisticsPerGramCents),
    localDeliveryCents: String(defaults.localDeliveryCents),
    minimumMarginPct: String(defaults.minimumMarginPct),
    warningMarginPct: String(defaults.warningMarginPct),
    roundToNearestCents: String(defaults.roundToNearestCents),
    estimatedCostPct: String(defaults.estimatedCostPct),
    deliveryByProvince: JSON.stringify(defaults.deliveryByProvince || {}),
    platformName: "SGEI - Compra SHEIN para Angola",
    supportPhone: "+244 923 000 000",
    supportWhatsapp: "+244923000000",
    supportEmail: "apoio@sgei.ao",
    paymentExpiryHours: "48",
  });
  for (const [key, value] of configEntries) {
    await db
      .insert(pricingConfigs)
      .values({ key, value })
      .onConflictDoUpdate({ target: pricingConfigs.key, set: { value } });
  }

  // Pedidos de exemplo
  const sampleOrders = [
    {
      reference: "SG-14023",
      customerId: customerUser.id,
      customerName: "João Silva",
      customerEmail: "cliente@exemplo.ao",
      customerPhone: "921234567",
      customerWhatsapp: "921234567",
      status: "DELIVERED" as const,
      paymentStatus: "PAID" as const,
      paymentMethod: "BANK_TRANSFER" as const,
      subtotalCents: 1738800, // 17.388 Kz
      serviceFeeCents: 208700,
      logisticsFeeCents: 250000,
      deliveryFeeCents: 80000,
      totalCents: 2280000,
      exchangeRateUsed: "920.0000",
      marginStatus: "SAFE" as const,
      estimatedCostCents: 1413600,
      actualCostCents: 1380000,
      paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20),
    },
    {
      reference: "SG-14102",
      customerId: customerUser.id,
      customerName: "Maria Fernandes",
      customerEmail: "maria@exemplo.ao",
      customerPhone: "924567890",
      customerWhatsapp: "924567890",
      status: "IN_TRANSIT" as const,
      paymentStatus: "PAID" as const,
      paymentMethod: "REFERENCE" as const,
      subtotalCents: 2944000,
      serviceFeeCents: 353300,
      logisticsFeeCents: 250000,
      deliveryFeeCents: 80000,
      totalCents: 3630000,
      exchangeRateUsed: "920.0000",
      marginStatus: "SAFE" as const,
      estimatedCostCents: 2250600,
      paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9),
    },
    {
      reference: "SG-14187",
      customerId: customerUser.id,
      customerName: "Ana Costa",
      customerEmail: "ana@exemplo.ao",
      customerPhone: "925998877",
      customerWhatsapp: "925998877",
      status: "PENDING_PAYMENT" as const,
      paymentStatus: "WAITING" as const,
      paymentMethod: "BANK_TRANSFER" as const,
      subtotalCents: 1288000,
      serviceFeeCents: 154600,
      logisticsFeeCents: 250000,
      deliveryFeeCents: 100000,
      totalCents: 1800000,
      exchangeRateUsed: "920.0000",
      marginStatus: "WARNING" as const,
      estimatedCostCents: 1404000,
    },
    {
      reference: "SG-14199",
      customerId: customerUser.id,
      customerName: "Pedro Tavares",
      customerEmail: null,
      customerPhone: "926112233",
      customerWhatsapp: "926112233",
      status: "PAID" as const,
      paymentStatus: "REVIEW" as const,
      paymentMethod: "BANK_TRANSFER" as const,
      subtotalCents: 690000,
      serviceFeeCents: 150000,
      logisticsFeeCents: 250000,
      deliveryFeeCents: 80000,
      totalCents: 1170000,
      exchangeRateUsed: "920.0000",
      marginStatus: "SAFE" as const,
      estimatedCostCents: 725400,
    },
    {
      reference: "SG-14205",
      customerId: customerUser.id,
      customerName: "Filipe Mendes",
      customerEmail: null,
      customerPhone: "927334455",
      customerWhatsapp: "927334455",
      status: "ARRIVED_IN_ANGOLA" as const,
      paymentStatus: "PAID" as const,
      paymentMethod: "DIGITAL" as const,
      subtotalCents: 4232000,
      serviceFeeCents: 507800,
      logisticsFeeCents: 250000,
      deliveryFeeCents: 80000,
      totalCents: 5070000,
      exchangeRateUsed: "920.0000",
      marginStatus: "SAFE" as const,
      estimatedCostCents: 3143400,
      actualCostCents: 3050000,
      paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14),
    },
    {
      reference: "SG-14210",
      customerId: customerUser.id,
      customerName: "Carla Neto",
      customerEmail: null,
      customerPhone: "928445566",
      customerWhatsapp: "928445566",
      status: "OUT_FOR_DELIVERY" as const,
      paymentStatus: "PAID" as const,
      paymentMethod: "BANK_TRANSFER" as const,
      subtotalCents: 2116000,
      serviceFeeCents: 253900,
      logisticsFeeCents: 250000,
      deliveryFeeCents: 80000,
      totalCents: 2700000,
      exchangeRateUsed: "920.0000",
      marginStatus: "SAFE" as const,
      estimatedCostCents: 1674000,
      paidAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 11),
    },
  ];

  for (const o of sampleOrders) {
    const [created] = await db.insert(orders).values(o).returning();
    // Item exemplo
    await db.insert(orderItems).values({
      orderId: created.id,
      productName: "Artigo SHEIN (demo)",
      quantity: 1,
      unitPriceCents: o.subtotalCents,
      totalPriceCents: o.subtotalCents,
      originalPriceUsd: "18.90",
      priceSnapshot: {
        productPriceUsd: 18.9,
        exchangeRate: 920,
        serviceFeeCents: o.serviceFeeCents / 100,
        logisticsFeeCents: o.logisticsFeeCents / 100,
        deliveryFeeCents: o.deliveryFeeCents / 100,
      } as any,
    });
    await db.insert(addresses).values({
      orderId: created.id,
      province: "Luanda",
      municipality: "Luanda",
      neighborhood: "Rocha Pinto",
      street: "Rua Principal",
      reference: "Junto ao mercado",
      recipientName: o.customerName,
      phone: o.customerPhone,
    });
    await db.insert(payments).values({
      orderId: created.id,
      amountCents: o.totalCents,
      method: o.paymentMethod,
      status: o.paymentStatus,
      reference: `TRF-${created.reference}`,
      verifiedAt: o.paymentStatus === "PAID" ? o.paidAt : null,
      verifiedBy: o.paymentStatus === "PAID" ? adminUser.id : null,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 48),
    });
    if (o.paymentStatus === "PAID") {
      await db.insert(shipments).values({
        orderId: created.id,
        internationalTracking: "SF-INT-DEMO",
        carrier: "DHL / Local",
        status: o.status,
        actualPurchaseCostCents: Math.round(o.totalCents * 0.55),
        actualShippingCostCents: 250000,
        actualDeliveryCostCents: o.deliveryFeeCents,
        purchasedAt: o.paidAt,
        shippedAt: new Date((o.paidAt?.getTime() || Date.now()) + 1000 * 60 * 60 * 48),
        arrivedAt:
          o.status === "ARRIVED_IN_ANGOLA" || o.status === "OUT_FOR_DELIVERY" || o.status === "DELIVERED"
            ? new Date()
            : null,
        deliveredAt: o.status === "DELIVERED" ? new Date() : null,
      });
      // tracking events
      const now = new Date();
      const events: Array<{ status: any; title: string; desc: string; date: Date }> = [
        { status: "PENDING_PAYMENT", title: "Pedido recebido", desc: "O seu pedido foi registado na plataforma.", date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 20) },
        { status: "PAID", title: "Pagamento confirmado", desc: "Confirmámos o recebimento do pagamento.", date: o.paidAt! },
        { status: "PURCHASED", title: "Compra realizada", desc: "O produto foi comprado ao fornecedor.", date: new Date(o.paidAt!.getTime() + 1000 * 60 * 60 * 48) },
        { status: "PREPARING_SHIPMENT", title: "Envio em preparação", desc: "O pedido está a ser preparado para envio.", date: new Date(o.paidAt!.getTime() + 1000 * 60 * 60 * 72) },
      ];
      const st = o.status as string;
      if (st !== "PAID" && st !== "PURCHASED" && st !== "PURCHASE_PENDING") {
        events.push({ status: "IN_TRANSIT", title: "Em trânsito", desc: "O pedido está a caminho de Angola.", date: new Date(o.paidAt!.getTime() + 1000 * 60 * 60 * 24 * 5) });
      }
      if (o.status === "ARRIVED_IN_ANGOLA" || o.status === "OUT_FOR_DELIVERY" || o.status === "DELIVERED") {
        events.push({ status: "ARRIVED_IN_ANGOLA", title: "Chegou a Angola", desc: "O seu pedido já se encontra em Angola.", date: new Date(now.getTime() - 1000 * 60 * 60 * 48) });
      }
      if (o.status === "OUT_FOR_DELIVERY" || o.status === "DELIVERED") {
        events.push({ status: "OUT_FOR_DELIVERY", title: "Saiu para entrega", desc: "O pedido está com o estafeta e será entregue em breve.", date: new Date(now.getTime() - 1000 * 60 * 60 * 6) });
      }
      if (o.status === "DELIVERED") {
        events.push({ status: "DELIVERED", title: "Entregue", desc: "O pedido foi entregue com sucesso.", date: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 2) });
      }
      for (const ev of events) {
        await db.insert(trackingEvents).values({
          orderId: created.id,
          status: ev.status,
          title: ev.title,
          description: ev.desc,
          eventDate: ev.date,
        });
      }
    }
  }

  // Audit log inicial
  await db.insert(auditLogs).values({
    actorId: adminUser.id,
    actorEmail: "admin@sgei.ao",
    action: "SYSTEM_SEED",
    entityType: "system",
    entityId: "init",
  });

  console.log("[seed] Seed complete.");
  console.log("[seed] Admin login: admin@sgei.ao / admin123");
  console.log("[seed] Customer login: cliente@exemplo.ao / cliente123");
}
