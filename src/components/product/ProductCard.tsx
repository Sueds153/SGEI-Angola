"use client";

import Link from "next/link";
import { ShoppingBag, Tag } from "lucide-react";
import type { NormalizedProduct } from "@/lib/types";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";
import { clientCalculatePrice, formatCents, getPricingConfig } from "@/lib/pricing-client";

interface ProductCardProps {
  product: NormalizedProduct;
  compact?: boolean;
}

export function ProductCard({ product, compact }: ProductCardProps) {
  const [totalCents, setTotalCents] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  // Ensure product has required fields
  const safeProduct = {
    ...product,
    variants: product.variants || [],
    images: product.images || [],
    source: product.source || "MOCK",
    availability: product.availability || "IN_STOCK",
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      // Usa originalPriceUsd (que agora contém o preço na moeda original) e currency
      const price = safeProduct.originalPriceUsd;
      const currency = (safeProduct as any).originalCurrency || safeProduct.currency || "USD";
      
      if (price == null) {
        if (alive) {
          setLoading(false);
          setTotalCents(null);
        }
        return;
      }
      try {
        const cfg = await getPricingConfig();
        const res = clientCalculatePrice(
          { 
            productPrice: price, 
            productCurrency: currency as "USD" | "EUR" | "CNY" | "AOA",
            quantity: 1, 
            weightGrams: safeProduct.weightGrams 
          },
          cfg
        );
        if (alive) setTotalCents(res.totalCents);
      } catch {
        if (alive) setTotalCents(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [safeProduct.originalPriceUsd, safeProduct.currency, safeProduct.weightGrams]);

  const image = safeProduct.defaultImage || safeProduct.images?.[0];
  const colors = Array.from(
    new Set((safeProduct.variants || []).map((v) => v.color).filter(Boolean))
  ) as string[];
  
  // Badge de origem
  const sourceLabels: Record<string, { label: string; icon: any; color: string }> = {
    SHEIN: { label: "Shein", icon: Tag, color: "bg-orange-100 text-orange-700" },
    ALIEXPRESS: { label: "AliExpress", icon: Tag, color: "bg-red-100 text-red-700" },
    VINTED: { label: "Vinted", icon: Tag, color: "bg-purple-100 text-purple-700" },
    MOCK: { label: "Demo", icon: Tag, color: "bg-gray-100 text-gray-700" },
    ADMIN: { label: "Catálogo", icon: Tag, color: "bg-green-100 text-green-700" },
  };
  
  const sourceInfo = sourceLabels[safeProduct.source] || { label: safeProduct.source, icon: Tag, color: "bg-gray-100 text-gray-700" };
  const SourceIcon = sourceInfo.icon;

  return (
    <Link
      href={`/produto/${product.slug}`}
      className="group block focus:outline-none"
    >
      <div className={cn("relative bg-ink-100 rounded-[20px] overflow-hidden aspect-[3/4]", compact && "aspect-[3/4]")}>
        {image && !imageError ? (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-ink-300">
            <ShoppingBag className="h-10 w-10" />
          </div>
        )}
        
        {/* Badge de origem */}
        <div className="absolute top-2.5 left-2.5 flex gap-1.5">
          <span className={`${sourceInfo.color} text-[9px] sm:text-[10px] font-medium tracking-wide px-2 py-0.5 rounded-full backdrop-blur-sm flex items-center gap-1`}>
            <SourceIcon className="h-3 w-3" />
            {sourceInfo.label}
          </span>
          {safeProduct.source === "MOCK" && (
            <span className="bg-black/70 text-white text-[9px] sm:text-[10px] font-medium tracking-wide px-2 py-0.5 rounded-full backdrop-blur-sm">
              DEMO
            </span>
          )}
        </div>
        
        {safeProduct.availability !== "IN_STOCK" && (
          <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] grid place-items-center">
            <span className="text-sm font-medium text-ink-900">Sem stock</span>
          </div>
        )}
        <div className="absolute bottom-2.5 right-2.5 h-9 w-9 rounded-full bg-white/95 backdrop-blur grid place-items-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 shadow-sm">
          <ShoppingBag className="h-4 w-4 text-ink-900" />
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
              <span className="text-[10px] sm:text-[11px] text-ink-500 self-center ml-0.5">
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
            <span className="text-[10px] sm:text-[11px] text-ink-400 whitespace-nowrap">
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
