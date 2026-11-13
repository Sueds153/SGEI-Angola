import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import type { Metadata } from "next";
import { ProductListManager } from "@/components/admin/ProductListManager";

export const metadata: Metadata = { title: "Produtos · Admin ImportEasy" };
export const dynamic = "force-dynamic";

export default async function AdminProdutosPage() {
  const [adminProducts, allCategories] = await Promise.all([
    db
      .select({ p: products, c: categories })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .orderBy(desc(products.createdAt))
      .limit(100),
    db.select({ id: categories.id, name: categories.name }).from(categories),
  ]);

  const formattedProducts = adminProducts.map(({ p, c }) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    originalPrice: p.originalPrice,
    source: p.source,
    status: p.status,
    sku: p.sku,
    defaultImage: p.defaultImage,
    categoryName: c?.name || null,
  }));

  return <ProductListManager initialProducts={formattedProducts} categories={allCategories} />;
}
