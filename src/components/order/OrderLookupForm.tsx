"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Package } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui";

export function OrderLookupForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"reference" | "phone">("reference");
  const [reference, setReference] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "reference") {
        const ref = reference.trim().toUpperCase().replace(/^#/, "").replace(/^SG-/, "SG-");
        if (!ref) {
          setError("Indica a referência do pedido.");
          return;
        }
        const normalizedRef = ref.startsWith("SG-") ? ref : `SG-${ref.replace(/^SG/, "")}`;
        const res = await fetch(`/api/orders/lookup?reference=${encodeURIComponent(normalizedRef)}`);
        if (!res.ok) {
          setError("Pedido não encontrado. Verifica a referência.");
          return;
        }
        router.push(`/pedido/${normalizedRef}`);
      } else {
        if (!phone.trim()) {
          setError("Indica o teu número de telefone.");
          return;
        }
        const res = await fetch(`/api/orders/lookup?phone=${encodeURIComponent(phone.trim())}`);
        const data = await res.json();
        if (!res.ok || !data.orders || data.orders.length === 0) {
          setError("Não encontrámos pedidos para este número.");
          return;
        }
        if (data.orders.length === 1) {
          router.push(`/pedido/${data.orders[0].reference}`);
        } else {
          setError(`Encontrámos ${data.orders.length} pedidos. Por favor usa a referência.`);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="flex gap-2 p-1 rounded-lg bg-ink-100 w-fit">
        <button
          type="button"
          onClick={() => setMode("reference")}
          className={
            "px-4 py-2 text-sm font-semibold rounded-md transition " +
            (mode === "reference" ? "bg-white shadow-sm text-ink-900" : "text-ink-600")
          }
        >
          Por referência
        </button>
        <button
          type="button"
          onClick={() => setMode("phone")}
          className={
            "px-4 py-2 text-sm font-semibold rounded-md transition " +
            (mode === "phone" ? "bg-white shadow-sm text-ink-900" : "text-ink-600")
          }
        >
          Por telefone
        </button>
      </div>

      {mode === "reference" ? (
        <div>
          <Input
            label="Referência do pedido"
            placeholder="Ex: SG-28491"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
          />
        </div>
      ) : (
        <div>
          <Input
            label="Telefone usado no pedido"
            placeholder="Ex: 923 456 789"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
      )}

      {error && <p className="text-sm text-danger-600">{error}</p>}

      <Button type="submit" loading={loading} size="lg">
        <Search className="h-4 w-4" /> Consultar pedido
      </Button>

      <p className="text-xs text-ink-500">
        A referência foi enviada quando criaste o pedido. Se não a encontrares, fala com o nosso WhatsApp.
      </p>
    </form>
  );
}
