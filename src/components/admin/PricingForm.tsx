"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui";
import { Alert } from "@/components/ui";
import { Loader2, CheckCircle2 } from "lucide-react";

const FIELDS: Array<{ key: string; label: string; hint?: string; type?: "number" | "text"; prefix?: string; suffix?: string; step?: string }> = [
  { key: "exchangeRateUsdToAoa", label: "Câmbio USD → Kz", hint: "Valor de 1 USD em Kz", type: "number", step: "0.01" },
  { key: "serviceFeePct", label: "Taxa de serviço (%)", hint: "Percentagem sobre o produto", type: "number", step: "0.01" },
  { key: "serviceFeeMinCents", label: "Taxa de serviço mínima (cêntimos)", hint: "Ex: 150000 = 1.500 Kz", type: "number" },
  { key: "logisticsBaseCents", label: "Custo logística base (cêntimos)", hint: "Por pedido", type: "number" },
  { key: "logisticsPerGramCents", label: "Logística por grama (cêntimos)", type: "number", step: "0.01" },
  { key: "localDeliveryCents", label: "Entrega local base (cêntimos)", type: "number" },
  { key: "minimumMarginPct", label: "Margem mínima (0 a 1)", hint: "Ex: 0.15 = 15%", type: "number", step: "0.01" },
  { key: "warningMarginPct", label: "Margem de aviso", type: "number", step: "0.01" },
  { key: "roundToNearestCents", label: "Arredondamento (cêntimos)", hint: "Ex: 50000 = 500 Kz", type: "number" },
  { key: "estimatedCostPct", label: "Custo estimado (% do total)", hint: "Para cálculo de margem", type: "number", step: "0.01" },
];

export function PricingForm({ initial }: { initial: Record<string, string> }) {
  const router = useRouter();
  const [values, setValues] = useState<Record<string, string>>(initial);
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setOk(false);
    try {
      const res = await fetch("/api/admin/pricing", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ values }),
      });
      if (!res.ok) throw new Error("Erro");
      setOk(true);
      startTransition(() => router.refresh());
      setTimeout(() => setOk(false), 2000);
    } catch {
      setError("Erro ao guardar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        {FIELDS.map((f) => (
          <div key={f.key} className={f.key === "exchangeRateUsdToAoa" ? "md:col-span-2" : ""}>
            <Input
              label={f.label}
              type={f.type || "text"}
              step={f.step}
              value={values[f.key] || ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              hint={f.hint}
            />
          </div>
        ))}
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <div className="flex items-center gap-3">
        <Button type="submit" size="lg" loading={loading} disabled={loading}>
          {ok ? <CheckCircle2 className="h-4 w-4" /> : null}
          {ok ? "Guardado" : loading ? "A guardar…" : "Guardar alterações"}
        </Button>
        <p className="text-xs text-ink-500">
          Os pedidos já criados não serão afetados.
        </p>
      </div>
    </form>
  );
}
