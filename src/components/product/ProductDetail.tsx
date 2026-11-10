"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  MessageCircle,
  Heart,
  Share2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Package as PackageIcon,
  Truck,
  Shield,
  Clock,
  Sparkles,
  Tag,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge, Alert as AlertBox } from "@/components/ui";
import type { NormalizedProduct } from "@/lib/types";
import {
  clientCalculatePrice,
  formatCents,
  getPricingConfig,
  type ClientPricingConfig,
  type SupportedCurrency,
} from "@/lib/pricing-client";
import { cn } from "@/lib/utils";

export function ProductDetail({ product }: { product: NormalizedProduct }) {
  const router = useRouter();
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.variants.find((v) => v.color)?.color || null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.variants.find((v) => v.size)?.size || null
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [priceCfg, setPriceCfg] = useState<ClientPricingConfig | null>(null);
  const [adding, setAdding] = useState(false);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    getPricingConfig().then(setPriceCfg);
  }, []);

  const variantsForColor = useMemo(() => {
    if (!selectedColor) return product.variants;
    return product.variants.filter((v) => v.color === selectedColor);
  }, [product.variants, selectedColor]);

  const availableSizes = useMemo(() => {
    return Array.from(new Set(variantsForColor.map((v) => v.size).filter(Boolean))) as string[];
  }, [variantsForColor]);

  const availableColors = useMemo(() => {
    return Array.from(new Set(product.variants.map((v) => v.color).filter(Boolean))) as string[];
  }, [product.variants]);

  const selectedVariant = useMemo(() => {
    return product.variants.find(
      (v) =>
        (!selectedColor || v.color === selectedColor) &&
        (!selectedSize || v.size === selectedSize)
    );
  }, [product.variants, selectedColor, selectedSize]);

  const variantAvailable = selectedVariant?.available !== false;

  // Detecta moeda do produto (usa campo currency do produto ou campo originalCurrency se disponível)
  const productCurrency = useMemo(() => {
    const currency = (product as any).originalCurrency || product.currency || "USD";
    return currency as SupportedCurrency;
  }, [product.currency]);

  const pricing = useMemo(() => {
    if (!priceCfg || product.originalPriceUsd == null) return null;
    return clientCalculatePrice(
      {
        productPrice: product.originalPriceUsd, // Agora contém o preço na moeda original
        productCurrency,
        quantity,
        weightGrams: product.weightGrams,
        variantPriceModifier: selectedVariant?.priceModifierUsd || 0,
      },
      priceCfg
    );
  }, [priceCfg, product.originalPriceUsd, productCurrency, product.weightGrams, quantity, selectedVariant]);

  const canAddToCart = variantAvailable;

  function nextImage() {
    const max = product.images.length;
    setActiveImage((i) => (i + 1) % max);
  }
  function prevImage() {
    const max = product.images.length;
    setActiveImage((i) => (i - 1 + max) % max);
  }

  async function handleCheckout() {
    if (!canAddToCart) return;
    setAdding(true);
    const params = new URLSearchParams();
    params.set("productSlug", product.slug);
    if (selectedVariant) params.set("variantId", selectedVariant.id);
    params.set("qty", String(quantity));
    router.push(`/checkout?${params.toString()}`);
  }

  // Preço na moeda original para referência
  const originalPrice = product.originalPriceUsd
    ? product.originalPriceUsd + (selectedVariant?.priceModifierUsd || 0)
    : null;
  const originalCurrencyLabel = productCurrency === "USD" ? "USD" : productCurrency === "EUR" ? "EUR" : "CNY";
  const originalPriceStr = originalPrice ? `~ ${formatOriginalPrice(originalPrice, productCurrency)}` : null;

  return (
    <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 md:gap-14">
      {/* Galeria */}
      <div>
        <div className="relative aspect-square md:aspect-[4/5] rounded-[24px] overflow-hidden bg-ink-100">
          {product.images && product.images.length > 0 ? (
            <img
              src={product.images[activeImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full grid place-items-center text-ink-400">
              <PackageIcon className="h-20 w-20" />
            </div>
          )}

          {product.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/90 backdrop-blur-sm shadow-sm grid place-items-center hover:bg-white transition"
                aria-label="Imagem anterior"
              >
                <ChevronLeft className="h-5 w-5 text-ink-900" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/90 backdrop-blur-sm shadow-sm grid place-items-center hover:bg-white transition"
                aria-label="Próxima imagem"
              >
                <ChevronRight className="h-5 w-5 text-ink-900" />
              </button>
            </>
          )}
          {product.source === "MOCK" && (
            <span className="absolute top-4 left-4 bg-black/80 text-white text-[10px] font-medium tracking-wide px-2.5 py-1 rounded-full backdrop-blur-sm">
              DEMO
            </span>
          )}
          <button
            onClick={() => setLiked((v) => !v)}
            className="absolute top-4 right-4 h-10 w-10 rounded-full bg-white/90 backdrop-blur-sm grid place-items-center hover:bg-white transition"
            aria-label="Favorito"
          >
            <Heart className={cn("h-5 w-5 transition", liked ? "fill-primary-600 text-primary-600" : "text-ink-700")} />
          </button>
          {!variantAvailable && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] grid place-items-center">
              <div className="text-center">
                <AlertTriangle className="h-8 w-8 text-warning-600 mx-auto" />
                <p className="mt-2 font-medium text-ink-900">Variante indisponível</p>
              </div>
            </div>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="mt-3 grid grid-cols-5 gap-2">
            {product.images.slice(0, 5).map((img, i) => (
              <button
                key={i}
                onClick={() => setActiveImage(i)}
                className={cn(
                  "aspect-square rounded-xl overflow-hidden bg-ink-100 ring-2 transition",
                  activeImage === i ? "ring-ink-900" : "ring-transparent hover:ring-ink-300"
                )}
              >
                <img src={img} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div>
        {product.category && (
          <p className="text-[12px] font-medium uppercase tracking-[0.12em] text-ink-500">
            {product.category.name}
          </p>
        )}
        <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-ink-900 leading-tight tracking-tight">
          {product.name}
        </h1>
        {product.rating && (
          <div className="mt-2 flex items-center gap-2 text-sm text-ink-500">
            <span className="font-medium text-amber-500">★ {product.rating.toFixed(1)}</span>
            <span className="text-ink-400">·</span>
            <span>{product.reviewCount} avaliações</span>
          </div>
        )}

        {/* Preço */}
        <div className="mt-6 flex items-baseline gap-3 flex-wrap">
          {pricing ? (
            <>
              <div className="text-[32px] md:text-[40px] font-semibold text-ink-900 tracking-tight leading-none">
                {formatCents(pricing.totalCents)}
              </div>
              {originalPriceStr && (
                <span className="text-sm text-ink-500">{originalPriceStr}</span>
              )}
            </>
          ) : product.originalPriceUsd != null ? (
            <div className="text-sm text-ink-500">A calcular preço…</div>
          ) : (
            <div className="text-lg font-semibold text-ink-900">Preço sob consulta</div>
          )}
        </div>
        {pricing && (
          <p className="mt-1 text-xs text-ink-500">
            Preço final em Kz · inclui taxas, logística e entrega
          </p>
        )}

        {/* Separador de preço c/ breakdown */}
        {pricing && (
          <details className="mt-4 group">
            <summary className="list-none inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-700 cursor-pointer select-none hover:text-ink-900 transition">
              Ver detalhe do preço
              <ChevronRight className="h-3.5 w-3.5 transition group-open:rotate-90" />
            </summary>
            <div className="mt-3 rounded-2xl bg-ink-50 p-4 text-sm space-y-1.5">
              <PriceRow label="Produto" value={formatCents(pricing.subtotalCents)} />
              <PriceRow label="Taxa de serviço" value={formatCents(pricing.serviceFeeCents)} />
              <PriceRow label="Logística internacional" value={formatCents(pricing.logisticsFeeCents)} />
              <PriceRow label="Entrega em Angola" value={formatCents(pricing.deliveryFeeCents)} />
              <div className="pt-2 mt-2 border-t border-ink-200 flex justify-between font-semibold text-ink-900">
                <span>Total</span>
                <span>{formatCents(pricing.totalCents)}</span>
              </div>
            </div>
          </details>
        )}

        {/* Variantes */}
        <div className="mt-8 space-y-6">
          {availableColors.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-medium text-ink-900">
                  Cor {selectedColor && <span className="text-ink-500">· {selectedColor}</span>}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setSelectedColor(c);
                      setSelectedSize(null);
                    }}
                    className={cn(
                      "px-4 py-2.5 rounded-full text-sm font-medium ring-1 transition",
                      selectedColor === c
                        ? "bg-ink-900 text-white ring-ink-900"
                        : "bg-white text-ink-800 ring-ink-200 hover:ring-ink-400"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}
          {availableSizes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[13px] font-medium text-ink-900">Tamanho</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((s) => {
                  const hasStock = variantsForColor.some(
                    (v) => v.size === s && v.available !== false
                  );
                  return (
                    <button
                      key={s}
                      disabled={!hasStock}
                      onClick={() => setSelectedSize(s)}
                      className={cn(
                        "min-w-[56px] px-4 py-2.5 rounded-full text-sm font-medium ring-1 transition",
                        selectedSize === s
                          ? "bg-ink-900 text-white ring-ink-900"
                          : hasStock
                          ? "bg-white text-ink-800 ring-ink-200 hover:ring-ink-400"
                          : "bg-ink-50 text-ink-400 ring-ink-200 line-through cursor-not-allowed"
                      )}
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantidade */}
          <div>
            <div className="text-[13px] font-medium text-ink-900 mb-3">Quantidade</div>
            <div className="inline-flex items-center rounded-full ring-1 ring-ink-200 bg-white overflow-hidden">
              <button
                className="h-11 w-11 grid place-items-center text-ink-700 hover:bg-ink-50 transition"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Diminuir"
              >
                −
              </button>
              <span className="w-12 text-center font-semibold text-ink-900 tabular-nums">{quantity}</span>
              <button
                className="h-11 w-11 grid place-items-center text-ink-700 hover:bg-ink-50 transition"
                onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                aria-label="Aumentar"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <Button
            size="lg"
            fullWidth
            variant="primary"
            onClick={handleCheckout}
            disabled={!canAddToCart || !pricing || adding}
            loading={adding}
          >
            <ShoppingBag className="h-5 w-5" />
            Fazer pedido
          </Button>
          <a
            href={`https://wa.me/244923000000?text=${encodeURIComponent(
              `Olá, tenho uma dúvida sobre o produto: ${product.name}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button size="lg" variant="secondary" fullWidth>
              <MessageCircle className="h-5 w-5" />
              Tirar dúvidas
            </Button>
          </a>
        </div>

        {/* Info servicos */}
        <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
          <InfoLine icon={<Truck className="h-4 w-4" />} text="Entrega em 15–25 dias" />
          <InfoLine icon={<Shield className="h-4 w-4" />} text="Pagamento seguro em Kz" />
          <InfoLine icon={<Clock className="h-4 w-4" />} text="Câmbio atualizado" />
          <InfoLine icon={<Sparkles className="h-4 w-4" />} text="Acompanhamento online" />
        </div>

        {product.description && (
          <div className="mt-10 pt-8 border-t border-ink-200">
            <h3 className="text-lg font-semibold text-ink-900">Sobre o produto</h3>
            <p className="mt-3 text-[15px] text-ink-700 leading-relaxed">{product.description}</p>
          </div>
        )}

        {product.sourceUrl && (
          <div className="mt-6">
            <a
              href={product.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[13px] text-ink-500 hover:text-ink-900 inline-flex items-center gap-1.5 transition"
            >
              <Globe className="h-3.5 w-3.5" />
              Ver produto original na {getSourceDisplayName(product.source)}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function getSourceDisplayName(source: string): string {
  const names: Record<string, string> = {
    SHEIN: "Shein",
    ALIEXPRESS: "AliExpress",
    VINTED: "Vinted",
    MOCK: "Demo",
    ADMIN: "Catálogo",
  };
  return names[source] || source;
}

function formatOriginalPrice(amount: number, currency: SupportedCurrency): string {
  const symbols: Record<SupportedCurrency, string> = {
    USD: "$",
    EUR: "€",
    CNY: "¥",
    AOA: "Kz",
  };
  const symbol = symbols[currency] || "$";
  return `${symbol}${amount.toFixed(2)} ${currency}`;
}

function PriceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-ink-700">
      <span className="text-ink-500">{label}</span>
      <span className="font-medium text-ink-900">{value}</span>
    </div>
  );
}

function InfoLine({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 text-ink-600">
      <span className="text-ink-900">{icon}</span>
      <span className="text-[13px]">{text}</span>
    </div>
  );
}
