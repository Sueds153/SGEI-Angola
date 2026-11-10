// Tipos partilhados por toda a aplicação
export type OrderStatus =
  | "PENDING_PAYMENT"
  | "PAYMENT_REVIEW"
  | "PAID"
  | "PURCHASE_PENDING"
  | "PURCHASED"
  | "PREPARING_SHIPMENT"
  | "IN_TRANSIT"
  | "ARRIVED_IN_ANGOLA"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

export type PaymentStatus = "WAITING" | "SENT" | "REVIEW" | "PAID" | "REJECTED" | "EXPIRED";
export type PaymentMethod = "BANK_TRANSFER" | "REFERENCE" | "DIGITAL" | "CASH";
export type ProductSource = "MOCK" | "ADMIN" | "SHEIN" | "ALIEXPRESS" | "VINTED";
export type ProductStatus = "ACTIVE" | "ARCHIVED" | "PENDING";
export type MarginStatus = "SAFE" | "WARNING" | "BLOCKED";
export type UserRole = "admin" | "customer";

export interface NormalizedProduct {
  id: string;
  externalId: string | null;
  source: ProductSource;
  sourceUrl: string | null;
  name: string;
  slug: string;
  description: string | null;
  category: { id: number; name: string; slug: string } | null;
  images: string[];
  defaultImage: string | null;
  originalPriceUsd: number | null;
  currency: string;
  availability: string;
  status: ProductStatus;
  sku: string | null;
  variants: NormalizedVariant[];
  rating: number | null;
  reviewCount: number;
  weightGrams: number | null;
}

export interface NormalizedVariant {
  id: string;
  externalId: string | null;
  color: string | null;
  size: string | null;
  otherOptions: Record<string, string> | null;
  sku: string | null;
  priceModifierUsd: number;
  stockQuantity: number | null;
  available: boolean;
  imageUrl: string | null;
}

export interface PriceBreakdown {
  originalPriceUsd: number;
  exchangeRate: number;
  subtotalCents: number;
  serviceFeeCents: number;
  logisticsFeeCents: number;
  deliveryFeeCents: number;
  totalCents: number;
  currency: "AOA";
  marginStatus: MarginStatus;
  estimatedCostCents: number;
  estimatedMarginCents: number;
  estimatedMarginPct: number;
}

export interface OrderItemInput {
  productId?: number;
  variantId?: number;
  productName: string;
  productImage?: string | null;
  sourceUrl?: string | null;
  sku?: string | null;
  variantColor?: string | null;
  variantSize?: string | null;
  variantLabel?: string | null;
  quantity: number;
  unitPriceCents: number;
  originalPriceUsd?: number | null;
  originalCurrency?: string | null;
  priceSnapshot?: {
    productPriceUsd: number;
    productCurrency?: string;
    exchangeRate: number;
    serviceFeeCents: number;
    logisticsFeeCents: number;
    deliveryFeeCents: number;
  };
}

export interface OrderCreateInput {
  customerName: string;
  customerEmail?: string | null;
  customerPhone: string;
  customerWhatsapp?: string | null;
  items: OrderItemInput[];
  address: {
    province: string;
    municipality: string;
    neighborhood?: string | null;
    street?: string | null;
    reference?: string | null;
    instructions?: string | null;
  };
  paymentMethod: PaymentMethod;
  notes?: string | null;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
}

// Helpers formatação
export function formatKz(cents: number): string {
  const kwanzas = Math.round(cents) / 100;
  return new Intl.NumberFormat("pt-PT", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(kwanzas) + " Kz";
}

export function formatUsd(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: Date | string | null | undefined, withTime = false): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  const opts: Intl.DateTimeFormatOptions = withTime
    ? { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "2-digit", year: "numeric" };
  return d.toLocaleDateString("pt-PT", opts);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  return formatDate(date, true);
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, { label: string; publicLabel: string; color: string }> = {
  PENDING_PAYMENT: { label: "Aguarda pagamento", publicLabel: "Aguardando confirmação de pagamento", color: "warning" },
  PAYMENT_REVIEW: { label: "Pagamento em revisão", publicLabel: "O seu pagamento está a ser verificado", color: "warning" },
  PAID: { label: "Pago", publicLabel: "Pagamento confirmado", color: "success" },
  PURCHASE_PENDING: { label: "Aguarda compra", publicLabel: "O pedido está a ser preparado para compra", color: "info" },
  PURCHASED: { label: "Comprado", publicLabel: "O produto foi comprado", color: "info" },
  PREPARING_SHIPMENT: { label: "A preparar envio", publicLabel: "O envio está a ser preparado", color: "info" },
  IN_TRANSIT: { label: "Em trânsito", publicLabel: "O pedido está a caminho", color: "info" },
  ARRIVED_IN_ANGOLA: { label: "Chegou a Angola", publicLabel: "O pedido chegou a Angola", color: "success" },
  OUT_FOR_DELIVERY: { label: "Saiu para entrega", publicLabel: "Saiu para entrega", color: "success" },
  DELIVERED: { label: "Entregue", publicLabel: "Entregue", color: "success" },
  CANCELLED: { label: "Cancelado", publicLabel: "Pedido cancelado", color: "danger" },
  REFUNDED: { label: "Reembolsado", publicLabel: "Pedido reembolsado", color: "danger" },
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, { label: string; color: string }> = {
  WAITING: { label: "Aguardando", color: "warning" },
  SENT: { label: "Pagamento enviado", color: "info" },
  REVIEW: { label: "Em revisão", color: "warning" },
  PAID: { label: "Pago", color: "success" },
  REJECTED: { label: "Recusado", color: "danger" },
  EXPIRED: { label: "Expirado", color: "danger" },
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  BANK_TRANSFER: "Transferência bancária",
  REFERENCE: "Referência multicaixa",
  DIGITAL: "Pagamento digital (Express/Unitel Money)",
  CASH: "Dinheiro na entrega",
};

// Timeline pública (ordem)
export const PUBLIC_TIMELINE: OrderStatus[] = [
  "PENDING_PAYMENT",
  "PAID",
  "PURCHASED",
  "PREPARING_SHIPMENT",
  "IN_TRANSIT",
  "ARRIVED_IN_ANGOLA",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

export const PROVINCES_OF_ANGOLA = [
  "Bengo",
  "Benguela",
  "Bié",
  "Cabinda",
  "Cuando Cubango",
  "Cuanza Norte",
  "Cuanza Sul",
  "Cunene",
  "Huambo",
  "Huíla",
  "Luanda",
  "Lunda Norte",
  "Lunda Sul",
  "Malanje",
  "Moxico",
  "Namibe",
  "Uíge",
  "Zaire",
];
