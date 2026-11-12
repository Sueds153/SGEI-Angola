import {
  pgTable,
  serial,
  varchar,
  text,
  integer,
  timestamp,
  boolean,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./schema.js";

export const communityPostStatusEnum = pgEnum("community_post_status", [
  "PENDING_REVIEW",
  "APPROVED",
  "REJECTED",
  "HIDDEN",
]);

export const communityPosts = pgTable("community_posts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  orderReference: varchar("order_reference", { length: 30 }).notNull(),
  platform: varchar("platform", { length: 50 }).notNull(), // Shein, AliExpress, Vinted
  category: varchar("category", { length: 100 }), // Tech, Moda, Calçados, Bolsas, etc.
  content: text("content").notNull(),
  productInfo: text("product_info"), // extraído do conteúdo
  location: varchar("location", { length: 200 }), // extraído do conteúdo
  status: communityPostStatusEnum("status").default("PENDING_REVIEW"),
  verified: boolean("verified").default(false), // compra verificada
  verifiedAt: timestamp("verified_at"),
  approvedAt: timestamp("approved_at"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const communityPostsRelations = relations(communityPosts, ({ one }) => ({
  user: one(users, {
    fields: [communityPosts.userId],
    references: [users.id],
  }),
}));

export const communityInteractions = pgTable("community_interactions", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => communityPosts.id, { onDelete: "cascade" }),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  type: varchar("type", { length: 20 }).notNull(), // "like", "share", "comment"
  content: text("content"), // para comentários
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityInteractionsRelations = relations(communityInteractions, ({ one }) => ({
  post: one(communityPosts, {
    fields: [communityInteractions.postId],
    references: [communityPosts.id],
  }),
  user: one(users, {
    fields: [communityInteractions.userId],
    references: [users.id],
  }),
}));

export const communityReports = pgTable("community_reports", {
  id: serial("id").primaryKey(),
  postId: integer("post_id")
    .notNull()
    .references(() => communityPosts.id, { onDelete: "cascade" }),
  reportedBy: integer("reported_by")
    .notNull()
    .references(() => users.id),
  reason: varchar("reason", { length: 100 }).notNull(), // "spam", "inapropriado", "fraude"
  status: varchar("status", { length: 20 }).default("PENDING"), // "PENDING", "REVIEWED", "RESOLVED"
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const communityReportsRelations = relations(communityReports, ({ one }) => ({
  post: one(communityPosts, {
    fields: [communityReports.postId],
    references: [communityPosts.id],
  }),
  reportedBy: one(users, {
    fields: [communityReports.reportedBy],
    references: [users.id],
  }),
}));