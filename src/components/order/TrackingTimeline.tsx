"use client";

import {
  CheckCircle2,
  Clock,
  CreditCard,
  Package,
  Truck,
  Plane,
  MapPin,
  Home,
  ShoppingBag,
  Loader2,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { Card } from "@/components/ui";
import type { OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/types";

interface TrackingEvent {
  id: number;
  orderId: number;
  status: OrderStatus;
  title: string;
  description: string | null;
  eventDate: Date | string;
  isPublic: boolean | null;
}

const STATUS_ICONS: Record<string, any> = {
  PENDING_PAYMENT: Clock,
  PAYMENT_REVIEW: CreditCard,
  PAID: CheckCircle2,
  PURCHASE_PENDING: ShoppingBag,
  PURCHASED: ShoppingBag,
  PREPARING_SHIPMENT: Package,
  IN_TRANSIT: Plane,
  ARRIVED_IN_ANGOLA: MapPin,
  OUT_FOR_DELIVERY: Truck,
  DELIVERED: Home,
  CANCELLED: XCircle,
  REFUNDED: RotateCcw,
};

export function TrackingTimeline({ events }: { events: TrackingEvent[] }) {
  const publicEvents = events
    .filter((e) => e.isPublic !== false)
    .sort(
      (a, b) =>
        new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime()
    );

  const lastStatus =
    publicEvents.length > 0
      ? publicEvents[publicEvents.length - 1].status
      : "PENDING_PAYMENT";
  const isTerminal =
    lastStatus === "DELIVERED" ||
    lastStatus === "CANCELLED" ||
    lastStatus === "REFUNDED";

  return (
    <Card className="p-6 md:p-8 rounded-3xl">
      <h3 className="font-semibold text-ink-900 text-lg mb-6">Acompanhamento</h3>
      {publicEvents.length === 0 ? (
        <p className="text-sm text-ink-500">Ainda não há atualizações.</p>
      ) : (
        <ol className="relative">
          {publicEvents.map((ev, idx) => {
            const Icon = STATUS_ICONS[ev.status] || CheckCircle2;
            const isLast = idx === publicEvents.length - 1;
            const isCurrent = isLast && !isTerminal;
            return (
              <li key={ev.id} className="relative pl-12 pb-7 last:pb-0">
                {!isLast && (
                  <div className="absolute left-[17px] top-9 bottom-0 w-px bg-ink-200" />
                )}
                <div
                  className={cn(
                    "absolute left-0 top-0 h-9 w-9 rounded-full grid place-items-center transition",
                    isCurrent
                      ? "bg-ink-900 text-white ring-4 ring-ink-900/10"
                      : "bg-ink-900 text-white"
                  )}
                >
                  {isCurrent ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="font-semibold text-ink-900 text-[15px]">{ev.title}</p>
                  {ev.description && (
                    <p className="text-sm text-ink-600 mt-0.5 leading-relaxed">
                      {ev.description}
                    </p>
                  )}
                  <p className="text-xs text-ink-400 mt-1">
                    {formatDateTime(ev.eventDate)}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </Card>
  );
}
