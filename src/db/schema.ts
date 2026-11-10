import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  numeric,
  boolean,
  timestamp,
  uniqueIndex,
  index,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==================== ENUMS ====================
export const userRoleEnum = pgEnum("user_role", ["admin", "customer"]);
export const orderStatusEnum = pgEnum("order_status", [
  "PENDING_PAYMENT",
  "PAYMENT_REVIEW",
  "PAID",
  "PURCHASE_PENDING",
  "PURCHASED",
  "PREPARING_SHIPMENT",
  "IN_TRANSIT",
  "ARRIVED_IN_ANGOLA",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "WAITING",
  "SENT",
  "REVIEW",
  "PAID",
  "REJECTED",
  "EXPIRED",
]);
export const paymentMethodEnum = pgEnum("payment_method", [
  "BANK_TRANSFER",
  "REFERENCE",
  "DIGITAL",
  "CASH",
]);
export const productStatusEnum = pgEnum("product_status", [
  "ACTIVE",
  "ARCHIVED",
  "PENDING",
]);
export const productSourceEnum = pgEnum("product_source", [
  "MOCK",
  "ADMIN",
  "SHEIN",
  "ALIEXPRESS",
  "VINTED",
]);
export const marginStatusEnum = pgEnum("margin_status", [
  "SAFE",
  "WARNING",
  "BLOCKED",
]);

// ==================== USERS ====================
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).unique(),
  phone: varchar("phone", { length: 30 }).unique(),
  passwordHash: text("password_hash"),
  role: userRoleEnum("role").notNull().default("customer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ one, many }) => ({
  customerProfile: one(customerProfiles, {
    fields: [users.id],
    references: [customerProfiles.userId],
  }),
  adminProfile: one(adminProfiles, {
    fields: [users.id],
    references: [adminProfiles.userId],
  }),
  orders: many(orders),
  auditLogs: many(auditLogs),
}));

// ==================== CUSTOMER PROFILES ====================
export const customerProfiles = pgTable("customer_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  whatsapp: varchar("whatsapp", { length: 30 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== ADMIN PROFILES ====================
export const adminProfiles = pgTable("admin_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).unique(),
  name: varchar("name", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ==================== CATEGORIES ====================
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  description: text("description"),
  icon: varchar("icon", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

// ==================== PRODUCTS ====================
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  externalProductId: varchar("external_product_id", { length: 255 }),
  sourceUrl: text("source_url"),
  source: productSourceEnum("source").notNull().default("ADMIN"),
  name: varchar("name", { length: 500 }).notNull(),
  slug: varchar("slug", { length: 600 }).notNull().unique(),
  description: text("description"),
  categoryId: integer("category_id").references(() => categories.id),
  originalPrice: numeric("original_price", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD"),
  availability: varchar("availability", { length: 50 }).default("IN_STOCK"),
  status: productStatusEnum("status").notNull().default("ACTIVE"),
  sku: varchar("sku", { length: 100 }),
  defaultImage: text("default_image"),
  weightGrams: integer("weight_grams"),
  rating: numeric("rating", { precision: 3, scale: 2 }),
  reviewCount: integer("review_count").default(0),
  lastPriceCheckAt: timestamp("last_price_check_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  variants: many(productVariants),
  images: many(productImages),
  orderItems: many(orderItems),
}));

// ==================== PRODUCT VARIANTS ====================
export const productVariants = pgTable("product_variants", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  color: varchar("color", { length: 100 }),
  size: varchar("size", { length: 50 }),
  otherOptions: jsonb("other_options").$type<Record<string, string>>(),
  sku: varchar("sku", { length: 100 }),
  externalVariantId: varchar("external_variant_id", { length: 255 }),
  priceModifier: numeric("price_modifier", { precision: 12, scale: 2 }).default("0"),
  stockQuantity: integer("stock_quantity"),
  available: boolean("available").default(true),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  orderItems: many(orderItems),
}));

// ==================== PRODUCT IMAGES ====================
export const productImages = pgTable("product_images", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  url: text("url").notNull(),
  altText: varchar("alt_text", { length: 255 }),
  position: integer("position").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}));

// ==================== PRICING CONFIGURATION ====================
export const pricingConfigs = pgTable("pricing_configs", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ==================== ORDERS ====================
export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    reference: varchar("reference", { length: 30 }).notNull().unique(),
    customerId: integer("customer_id").references(() => users.id),
    customerName: varchar("customer_name", { length: 255 }).notNull(),
    customerEmail: varchar("customer_email", { length: 255 }),
    customerPhone: varchar("customer_phone", { length: 30 }).notNull(),
    customerWhatsapp: varchar("customer_whatsapp", { length: 30 }),
    status: orderStatusEnum("status").notNull().default("PENDING_PAYMENT"),
    paymentStatus: paymentStatusEnum("payment_status").notNull().default("WAITING"),
    paymentMethod: paymentMethodEnum("payment_method"),
    // Totals in AOA (cêntimos)
    subtotalCents: integer("subtotal_cents").notNull(),
    serviceFeeCents: integer("service_fee_cents").notNull(),
    logisticsFeeCents: integer("logistics_fee_cents").notNull(),
    deliveryFeeCents: integer("delivery_fee_cents").notNull(),
    totalCents: integer("total_cents").notNull(),
    currency: varchar("currency", { length: 10 }).notNull().default("AOA"),
    exchangeRateUsed: numeric("exchange_rate_used", { precision: 10, scale: 4 }).notNull(),
    marginStatus: marginStatusEnum("margin_status").default("SAFE"),
    estimatedCostCents: integer("estimated_cost_cents"),
    actualCostCents: integer("actual_cost_cents"),
    notes: text("notes"),
    internalNotes: text("internal_notes"),
    paymentProofUrl: text("payment_proof_url"),
    paymentExpiresAt: timestamp("payment_expires_at"),
    paidAt: timestamp("paid_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    referenceIdx: index("orders_reference_idx").on(table.reference),
    customerIdx: index("orders_customer_idx").on(table.customerId),
    statusIdx: index("orders_status_idx").on(table.status),
    createdAtIdx: index("orders_created_at_idx").on(table.createdAt),
  })
);

export const ordersRelations = relations(orders, ({ one, many }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.id],
  }),
  items: many(orderItems),
  address: one(addresses),
  shipment: one(shipments),
  payment: one(payments),
  trackingEvents: many(trackingEvents),
}));

// ==================== ORDER ITEMS ====================
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: integer("product_id").references(() => products.id),
  productVariantId: integer("product_variant_id").references(() => productVariants.id),
  productName: varchar("product_name", { length: 500 }).notNull(),
  productImage: text("product_image"),
  sourceUrl: text("source_url"),
  sku: varchar("sku", { length: 100 }),
  variantColor: varchar("variant_color", { length: 100 }),
  variantSize: varchar("variant_size", { length: 50 }),
  variantLabel: varchar("variant_label", { length: 200 }),
  quantity: integer("quantity").notNull().default(1),
  unitPriceCents: integer("unit_price_cents").notNull(),
  totalPriceCents: integer("total_price_cents").notNull(),
  originalPriceUsd: numeric("original_price_usd", { precision: 12, scale: 2 }),
  originalCurrency: varchar("original_currency", { length: 10 }).default("USD"),
  priceSnapshot: jsonb("price_snapshot").$type<{
    productPriceUsd: number;
    productCurrency?: string;
    exchangeRate: number;
    serviceFeeCents: number;
    logisticsFeeCents: number;
    deliveryFeeCents: number;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.productVariantId],
    references: [productVariants.id],
  }),
}));

// ==================== ADDRESSES ====================
export const addresses = pgTable("addresses", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .unique()
    .references(() => orders.id, { onDelete: "cascade" }),
  province: varchar("province", { length: 100 }).notNull(),
  municipality: varchar("municipality", { length: 100 }).notNull(),
  neighborhood: varchar("neighborhood", { length: 200 }),
  street: text("street"),
  reference: text("reference_point"),
  instructions: text("instructions"),
  phone: varchar("phone", { length: 30 }),
  recipientName: varchar("recipient_name", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const addressesRelations = relations(addresses, ({ one }) => ({
  order: one(orders, {
    fields: [addresses.orderId],
    references: [orders.id],
  }),
}));

// ==================== SHIPMENTS ====================
export const shipments = pgTable("shipments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .unique()
    .references(() => orders.id, { onDelete: "cascade" }),
  internationalTracking: varchar("international_tracking", { length: 200 }),
  localTracking: varchar("local_tracking", { length: 200 }),
  carrier: varchar("carrier", { length: 100 }),
  status: varchar("status", { length: 50 }),
  estimatedDelivery: timestamp("estimated_delivery"),
  actualPurchaseCostCents: integer("actual_purchase_cost_cents"),
  actualShippingCostCents: integer("actual_shipping_cost_cents"),
  actualDeliveryCostCents: integer("actual_delivery_cost_cents"),
  purchaseProofUrl: text("purchase_proof_url"),
  notes: text("notes"),
  purchasedAt: timestamp("purchased_at"),
  shippedAt: timestamp("shipped_at"),
  arrivedAt: timestamp("arrived_at"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const shipmentsRelations = relations(shipments, ({ one }) => ({
  order: one(orders, {
    fields: [shipments.orderId],
    references: [orders.id],
  }),
}));

// ==================== TRACKING EVENTS ====================
export const trackingEvents = pgTable("tracking_events", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  status: orderStatusEnum("status").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  eventDate: timestamp("event_date").notNull(),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trackingEventsRelations = relations(trackingEvents, ({ one }) => ({
  order: one(orders, {
    fields: [trackingEvents.orderId],
    references: [orders.id],
  }),
}));

// ==================== PAYMENTS ====================
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id")
    .notNull()
    .unique()
    .references(() => orders.id, { onDelete: "cascade" }),
  amountCents: integer("amount_cents").notNull(),
  method: paymentMethodEnum("method").notNull(),
  status: paymentStatusEnum("status").notNull().default("WAITING"),
  reference: varchar("reference", { length: 200 }),
  proofUrl: text("proof_url"),
  verifiedAt: timestamp("verified_at"),
  verifiedBy: integer("verified_by").references(() => users.id),
  rejectionReason: text("rejection_reason"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  order: one(orders, {
    fields: [payments.orderId],
    references: [orders.id],
  }),
}));

// ==================== AUDIT LOGS ====================
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  actorId: integer("actor_id").references(() => users.id),
  actorEmail: varchar("actor_email", { length: 255 }),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 100 }),
  entityId: varchar("entity_id", { length: 100 }),
  oldValue: jsonb("old_value"),
  newValue: jsonb("new_value"),
  ip: varchar("ip", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  actor: one(users, {
    fields: [auditLogs.actorId],
    references: [users.id],
  }),
}));
