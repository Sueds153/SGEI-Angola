"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui";
import type { OrderStatus, PaymentStatus } from "@/lib/types";
import { ORDER_STATUS_LABELS } from "@/lib/types";
import { Loader2, CheckCircle2 } from "lucide-react";

const ORDER_STATUSES: OrderStatus[] = [
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
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  "WAITING",
  "SENT",
  "REVIEW",
  "PAID",
  "REJECTED",
  "EXPIRED",
];

export function OrderStatusChanger({
  orderId,
  currentStatus,
  currentPaymentStatus,
}: {
  orderId: number;
  currentStatus: string;
  currentPaymentStatus: string;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(currentStatus as OrderStatus);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(
    currentPaymentStatus as PaymentStatus
  );
  const [loading, setLoading] = useState(false);
  const [ok, setOk] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setOk(false);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status, paymentStatus }),
      });
      if (!res.ok) {
        alert("Erro ao atualizar estado.");
        return;
      }
      setOk(true);
      router.refresh();
      setTimeout(() => setOk(false), 2000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-wrap items-end gap-2 rounded-2xl bg-ink-50 p-3 ring-1 ring-ink-200/60"
    >
      <div className="min-w-[180px]">
        <label className="block text-[11px] font-medium uppercase tracking-wide text-ink-500 mb-1">
          Estado do pedido
        </label>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-[13px] font-medium outline-none focus:ring-2 focus:ring-ink-900/10"
        >
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s].label}
            </option>
          ))}
        </select>
      </div>
      <div className="min-w-[160px]">
        <label className="block text-[11px] font-medium uppercase tracking-wide text-ink-500 mb-1">
          Pagamento
        </label>
        <select
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
          className="w-full rounded-lg border border-ink-200 bg-white px-3 py-2 text-[13px] font-medium outline-none focus:ring-2 focus:ring-ink-900/10"
        >
          {PAYMENT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <Button size="sm" type="submit" disabled={loading} variant="primary">
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
        {ok ? "Guardado" : "Guardar"}
      </Button>
    </form>
  );
}
