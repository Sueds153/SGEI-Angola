"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag } from "lucide-react";
import type { NormalizedProduct } from "@/lib/types";
import { useState } from "react";
import { Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";
import { clientCalculatePrice, formatCents } from "@/lib/pricing-client";
import { usePricingConfig } from "@/hooks/usePricingConfig";

interface ProductCardProps {
  product: NormalizedProduct;
  compact?: boolean;
}

export function ProductCard({ product, compact }: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const cfg = usePricingConfig();

  // Ensure product has required fields
  const safeProduct = {
    ...product,
    variants: product.variants || [],
    images: product.images || [],
    source: product.source || "MOCK",
    availability: product.availability || "IN_STOCK",
  };
  const price = safeProduct.originalPriceUsd;
  const currency = (safeProduct as any).originalCurrency || safeProduct.currency || "USD";
  const weightGrams = safeProduct.weightGrams;

  const loading = price != null && cfg == null;
  const totalCents = price == null || !cfg
    ? null
    : clientCalculatePrice(
      {
        productPrice: price,
        productCurrency: currency as "USD" | "EUR" | "CNY" | "AOA",
        quantity: 1,
        weightGrams,
      },
      cfg
    ).totalCents;

  const image = safeProduct.defaultImage || safeProduct.images?.[0];
  const colors = Array.from(
    new Set((safeProduct.variants || []).map((v) => v.color).filter(Boolean))
  ) as string[];
  
  // Badge de origem
  const sourceLabels: Record<string, string> = {
    SHEIN: "SHEIN",
    ALIEXPRESS: "AliExpress",
    VINTED: "Vinted",
    MOCK: "SHEIN",
    ADMIN: "Catálogo ImportEasy",
  };
  const sourceLabel = sourceLabels[safeProduct.source] || safeProduct.source;

  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group block transition-transform duration-150 active:scale-[0.99]"
    >
      <div className={cn("relative bg-ink-100 rounded-md overflow-hidden aspect-[3/4] sm:aspect-[4/5]", compact && "aspect-[3/4] sm:aspect-[4/5]")}>
        {image && !imageError ? (
          <Image
            src={image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 23vw"
            unoptimized={!image.startsWith("/")}
            onError={() => setImageError(true)}
            className="object-cover group-hover:scale-[1.02] transition-transform duration-300 ease-out"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-ink-300">
            <ShoppingBag className="h-10 w-10" />
          </div>
        )}

        {/* Badge de origem */}
        <div className="absolute top-2 left-2 z-10">
          <span className="bg-white/95 text-ink-800 text-[10px] font-semibold tracking-wide px-2 py-1 backdrop-blur-sm">
            {sourceLabel}
          </span>
        </div>

        {/* Badge adicional (Bateria iPhone, Fornecedor Verificado, Entrega Grátis) */}
        {(safeProduct.badge || safeProduct.batteryHealth || safeProduct.freeShipping) && (
          <div className="absolute top-1.5 right-1.5 flex gap-1 z-10 max-w-[60%]">
            <span className="bg-ink-950/85 text-white text-[10px] font-medium tracking-tight px-2 py-1 backdrop-blur-sm truncate">
              {safeProduct.badge || (safeProduct.batteryHealth ? `Bateria ${safeProduct.batteryHealth}` : "Entrega Rápida")}
            </span>
          </div>
        )}

        {safeProduct.availability !== "IN_STOCK" && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] grid place-items-center">
            <span className="text-sm font-medium text-ink-900">Sem stock</span>
          </div>
        )}
        <div className="absolute bottom-2 right-2 bg-white/95 px-2 py-1 text-[10px] font-medium text-ink-900">
          Ver artigo
        </div>
      </div>
      <div className="px-0.5 pt-2.5 sm:pt-3">
        {colors.length > 0 && (
          <div className="flex gap-1 mb-1.5">
            {colors.slice(0, 3).map((c, i) => (
              <span
                key={i}
                className="h-3.5 w-3.5 rounded-full ring-1 ring-black/10"
                title={c}
                style={{ background: c === "Branco" ? "#fff" : colorToHex(c) }}
              />
            ))}
            {colors.length > 3 && (
              <span className="text-[11px] text-ink-600 self-center ml-0.5">
                +{colors.length - 3}
              </span>
            )}
          </div>
        )}
        <h3 className="text-[13px] sm:text-[14px] font-medium text-ink-900 leading-snug line-clamp-2 min-h-[2.2em] sm:min-h-[2.5em]">
          {safeProduct.name}
        </h3>
        <div className="mt-1.5 flex items-end justify-between gap-1">
          {loading ? (
            <Skeleton className="h-5 w-20" />
          ) : totalCents ? (
            <div className="text-[14px] sm:text-[15px] font-semibold text-ink-900 tracking-tight">
              {formatCents(totalCents)}
            </div>
          ) : (
            <div className="text-[13px] sm:text-sm font-semibold text-primary-600">Sob consulta</div>
          )}
          {(safeProduct.variants?.length || 0) > 1 && (
            <span className="text-[11px] text-ink-600 whitespace-nowrap">
              {safeProduct.variants.length} opções
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

function colorToHex(name: string): string {
  const map: Record<string, string> = {
    preto: "#000",
    branco: "#ffffff",
    bege: "#e9d9b9",
    cinza: "#9ca3af",
    azul: "#3b82f6",
    "azul escuro": "#1e3a8a",
    "azul claro": "#60a5fa",
    rosa: "#f472b6",
    vermelho: "#dc2626",
    "floral vermelho": "#dc2626",
    verde: "#10b981",
    prateado: "#d1d5db",
    dourado: "#eab308",
    tartaruga: "#78350f",
  };
  return map[name.toLowerCase()] || "#d1d5db";
}

export function ProductCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[3/4] w-full rounded-[20px]" />
      <div className="p-0.5 pt-3 space-y-2">
        <Skeleton className="h-3.5 w-11/12" />
        <Skeleton className="h-3.5 w-2/3" />
        <Skeleton className="h-4 w-20 mt-1" />
      </div>
    </div>
  );
}
