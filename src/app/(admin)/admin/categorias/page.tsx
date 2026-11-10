import { db } from "@/db";
import { categories } from "@/db/schema";
import { Card, Badge } from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Categorias" };
export const dynamic = "force-dynamic";

export default async function CategoriasPage() {
  const all = await db.select().from(categories);
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-ink-900">Categorias</h1>
        <p className="mt-1 text-sm text-ink-500">{all.length} categorias.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {all.map((c) => (
          <Card key={c.id} className="p-5 rounded-2xl">
            <p className="font-medium text-ink-900">{c.name}</p>
            <p className="text-xs text-ink-500 mt-1">/{c.slug}</p>
            {c.description && <p className="mt-2 text-sm text-ink-600">{c.description}</p>}
          </Card>
        ))}
      </div>
    </div>
  );
}
