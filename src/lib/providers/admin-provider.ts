import { db } from "@/db";
import { products, productVariants, productImages, categories } from "@/db/schema";
import { eq, ilike, and, asc } from "drizzle-orm";
import type { NormalizedProduct, NormalizedVariant, ProductSource } from "../types";
import { mockProductProvider } from "./mock-provider";

interface ProductProviderLike {
  id: ProductSource;
  searchProducts(query: string, params?: { category?: string; limit?: number }): Promise<NormalizedProduct[]>;
  getProductBySlug(slug: string): Promise<NormalizedProduct | null>;
  getProductByExternalId(externalId: string): Promise<NormalizedProduct | null>;
  resolveProductFromUrl(url: string): Promise<{ status: "found" | "needs_confirmation" | "unsupported"; externalId?: string; product?: NormalizedProduct | null }>;
  getProductsByCategory(categorySlug: string, params?: { limit?: number; offset?: number; sort?: string }): Promise<{ products: NormalizedProduct[]; total: number }>;
  getFeaturedProducts(limit?: number): Promise<NormalizedProduct[]>;
}
type _ProductProvider = ProductProviderLike;

async function dbProductToNormalized(
  p: typeof products.$inferSelect & {
    category?: typeof categories.$inferSelect | null;
    variants?: (typeof productVariants.$inferSelect)[];
    images?: (typeof productImages.$inferSelect)[];
  }
): Promise<NormalizedProduct> {
  const variantsFromDb =
    p.variants ??
    (await db.select().from(productVariants).where(eq(productVariants.productId, p.id)));
  const imagesFromDb =
    p.images ??
    (await db.select().from(productImages).where(eq(productImages.productId, p.id)).orderBy(asc(productImages.position)));

  const variantList: NormalizedVariant[] = variantsFromDb.map((v) => ({
    id: String(v.id),
    externalId: v.externalVariantId,
    color: v.color,
    size: v.size,
    otherOptions: v.otherOptions as Record<string, string> | null,
    sku: v.sku,
    priceModifierUsd: Number(v.priceModifier ?? 0),
    stockQuantity: v.stockQuantity,
    available: v.available ?? true,
    imageUrl: v.imageUrl,
  }));

  const images = imagesFromDb.map((i) => i.url);
  if (images.length === 0 && p.defaultImage) images.push(p.defaultImage);

  return {
    id: String(p.id),
    externalId: p.externalProductId,
    source: (p.source as ProductSource) || "ADMIN",
    sourceUrl: p.sourceUrl,
    name: p.name,
    slug: p.slug,
    description: p.description,
    category: p.category
      ? { id: p.category.id, name: p.category.name, slug: p.category.slug }
      : null,
    images,
    defaultImage: p.defaultImage,
    originalPriceUsd: p.originalPrice ? Number(p.originalPrice) : null,
    currency: p.currency || "USD",
    availability: p.availability || "IN_STOCK",
    status: (p.status as any) || "ACTIVE",
    sku: p.sku,
    rating: p.rating ? Number(p.rating) : null,
    reviewCount: p.reviewCount || 0,
    weightGrams: p.weightGrams,
    variants: variantList,
  };
}

export const adminCatalogProvider: _ProductProvider = {
  id: "ADMIN" as const,

  async searchProducts(query, params) {
    const q = query.trim();
    const dbQuery = db
      .select({ p: products, c: categories })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          eq(products.status, "ACTIVE"),
          q ? ilike(products.name, `%${q}%`) : undefined
        )
      )
      .limit(params?.limit || 24);

    const dbRows = await dbQuery;
    const dbProducts: NormalizedProduct[] = [];
    for (const row of dbRows) {
      dbProducts.push(await dbProductToNormalized({ ...row.p, category: row.c }));
    }

    // Complementa com mock se necessário (para catálogo demo)
    const mockResults = await mockProductProvider.searchProducts(q, params);
    const existingSlugs = new Set(dbProducts.map((p) => p.slug));
    const combined = [...dbProducts];
    for (const mp of mockResults) {
      if (!existingSlugs.has(mp.slug)) combined.push(mp);
    }
    return combined.slice(0, params?.limit || 24);
  },

  async getProductBySlug(slug) {
    // Primeiro tenta DB
    const rows = await db
      .select({ p: products, c: categories })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.slug, slug))
      .limit(1);
    if (rows.length > 0) {
      return dbProductToNormalized({ ...rows[0].p, category: rows[0].c });
    }
    // Depois tenta mock
    return mockProductProvider.getProductBySlug(slug);
  },

  async getProductByExternalId(externalId) {
    const rows = await db
      .select({ p: products, c: categories })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.externalProductId, externalId))
      .limit(1);
    if (rows.length > 0) {
      return dbProductToNormalized({ ...rows[0].p, category: rows[0].c });
    }
    return mockProductProvider.getProductByExternalId(externalId);
  },

  async resolveProductFromUrl(url) {
    // Primeiro verifica se o produto já existe no catálogo admin (por sourceUrl)
    const existing = await db
      .select({ p: products, c: categories })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .limit(1);
    // Implementação simples: executa ilike no sourceUrl
    const rows = await db
      .select({ p: products, c: categories })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .limit(50);
    for (const row of rows) {
      if (row.p.sourceUrl && url.includes(row.p.sourceUrl)) {
        return {
          status: "found",
          product: await dbProductToNormalized({ ...row.p, category: row.c }),
        };
      }
    }
    // Delega para o mock
    return mockProductProvider.resolveProductFromUrl(url);
  },

  async getProductsByCategory(categorySlug, params) {
    const limit = params?.limit || 24;
    const offset = params?.offset || 0;

    if (categorySlug === "todos") {
      const dbRows = await db
        .select({ p: products, c: categories })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(eq(products.status, "ACTIVE"))
        .limit(limit)
        .offset(offset);
      const dbProducts = await Promise.all(
        dbRows.map((r) => dbProductToNormalized({ ...r.p, category: r.c }))
      );
      const mockResult = await mockProductProvider.getProductsByCategory("todos", {
        limit,
        offset,
      });
      const existingSlugs = new Set(dbProducts.map((p) => p.slug));
      const combined = [...dbProducts];
      for (const mp of mockResult.products) {
        if (!existingSlugs.has(mp.slug)) combined.push(mp);
      }
      return { products: combined.slice(0, limit), total: combined.length };
    }

    const catRows = await db
      .select()
      .from(categories)
      .where(eq(categories.slug, categorySlug))
      .limit(1);
    let dbProducts: NormalizedProduct[] = [];
    if (catRows.length > 0) {
      const dbRows = await db
        .select({ p: products, c: categories })
        .from(products)
        .leftJoin(categories, eq(products.categoryId, categories.id))
        .where(and(eq(products.categoryId, catRows[0].id), eq(products.status, "ACTIVE")))
        .limit(limit)
        .offset(offset);
      dbProducts = await Promise.all(
        dbRows.map((r) => dbProductToNormalized({ ...r.p, category: r.c }))
      );
    }
    const mockResult = await mockProductProvider.getProductsByCategory(categorySlug, {
      limit,
      offset,
    });
    const existingSlugs = new Set(dbProducts.map((p) => p.slug));
    const combined = [...dbProducts];
    for (const mp of mockResult.products) {
      if (!existingSlugs.has(mp.slug)) combined.push(mp);
    }
    return { products: combined.slice(0, limit), total: combined.length };
  },

  async getFeaturedProducts(limit = 8) {
    const dbRows = await db
      .select({ p: products, c: categories })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.status, "ACTIVE"))
      .limit(limit);
    const dbProducts = await Promise.all(
      dbRows.map((r) => dbProductToNormalized({ ...r.p, category: r.c }))
    );
    if (dbProducts.length >= limit) return dbProducts;
    const mock = await mockProductProvider.getFeaturedProducts(limit);
    const existingSlugs = new Set(dbProducts.map((p) => p.slug));
    const combined = [...dbProducts];
    for (const mp of mock) {
      if (combined.length >= limit) break;
      if (!existingSlugs.has(mp.slug)) combined.push(mp);
    }
    return combined;
  },
};
