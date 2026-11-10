import { db } from "@/db";
import { products, categories } from "@/db/schema";
import { eq, isNull } from "drizzle-orm";
import { Card, Badge } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import type { Metadata } from "next";
import { Plus } from "lucide-react";
import { formatUsd } from "@/lib/types";

export const metadata: Metadata = { title: "Produtos" };
export const dynamic = "force-dynamic";

export default async function AdminProdutosPage() {
  const adminProducts = await db
    .select({ p: products, c: categories })
    .from(products)
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .limit(100);
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-ink-900">Produtos</h1>
          <p className="mt-1 text-sm text-ink-500">{adminProducts.length} produtos no catálogo do admin</p>
        </div>
        <Button variant="primary" size="md" disabled>
          <Plus className="h-4 w-4" /> Novo produto (breve)
        </Button>
      </div>
      <Card className="rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full admin-table text-sm">
            <thead className="bg-ink-50 text-ink-500 text-xs uppercase tracking-wide">
              <tr>
                <th className="text-left px-5 py-3 font-medium">Produto</th>
                <th className="text-left px-5 py-3 font-medium">Categoria</th>
                <th className="text-left px-5 py-3 font-medium">Preço USD</th>
                <th className="text-left px-5 py-3 font-medium">Origem</th>
                <th className="text-left px-5 py-3 font-medium">Estado</th>
                <th className="text-left px-5 py-3 font-medium">SKU</th>
              </tr>
            </thead>
            <tbody>
              {adminProducts.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-16 text-center text-ink-500">
                    Ainda não existem produtos criados manualmente. Os produtos DEMO servem de catálogo inicial.
                  </td>
                </tr>
              )}
              {adminProducts.map(({ p, c }) => (
                <tr key={p.id} className="border-t border-ink-100 hover:bg-ink-50/60">
                  <td data-label="Produto" className="px-5 py-3 font-medium flex items-center gap-3">
                    {p.defaultImage && (
                      <img src={p.defaultImage} className="h-10 w-10 rounded-lg object-cover bg-ink-100" alt="" />
                    )}
                    <span className="line-clamp-1 max-w-xs">{p.name}</span>
                  </td>
                  <td data-label="Categoria" className="px-5 py-3 text-ink-600">{c?.name || "—"}</td>
                  <td data-label="Preço" className="px-5 py-3 font-medium tabular-nums">
                    {p.originalPrice ? formatUsd(Number(p.originalPrice)) : "—"}
                  </td>
                  <td data-label="Origem" className="px-5 py-3">
                    <Badge color={p.source === "ADMIN" ? "success" : "default"}>{p.source}</Badge>
                  </td>
                  <td data-label="Estado" className="px-5 py-3">
                    <Badge color={p.status === "ACTIVE" ? "success" : "warning"}>{p.status}</Badge>
                  </td>
                  <td data-label="SKU" className="px-5 py-3 text-ink-500">{p.sku || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
