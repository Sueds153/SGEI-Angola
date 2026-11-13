import { db } from "@/db";
import { categories } from "@/db/schema";
import { desc } from "drizzle-orm";
import type { Metadata } from "next";
import { CategoryManager } from "@/components/admin/CategoryManager";

export const metadata: Metadata = { title: "Categorias · Admin ImportEasy" };
export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const all = await db.select().from(categories).orderBy(desc(categories.createdAt));
  
  return <CategoryManager initialCategories={all} />;
}
