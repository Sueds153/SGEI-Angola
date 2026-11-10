import { db } from "@/db";
import { pricingConfigs } from "@/db/schema";
import { Card } from "@/components/ui";
import { PricingForm } from "@/components/admin/PricingForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Preços & Câmbio" };

export const dynamic = "force-dynamic";

export default async function AdminPricingPage() {
  const rows = await db.select().from(pricingConfigs);
  const cfg: Record<string, string> = {};
  for (const r of rows) cfg[r.key] = r.value;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-ink-900">Preços & Câmbio</h1>
        <p className="mt-1 text-sm text-ink-500">
          Configura como o preço final em Kz é calculado. Todos os preços são congelados no momento da criação do pedido.
        </p>
      </div>
      <Card className="p-6 md:p-8 rounded-3xl max-w-2xl">
        <PricingForm initial={cfg} />
      </Card>
    </div>
  );
}
