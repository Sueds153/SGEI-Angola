"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Link as LinkIcon, Loader2, ArrowRight, AlertCircle, CheckCircle2, Tag, Globe } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { isValidHttpUrl } from "@/lib/utils";
import { clientCalculatePrice, formatCents, getPricingConfig } from "@/lib/pricing-client";
import { extractProductIdFromSheinUrl } from "@/lib/utils";

type Variant = "light" | "dark" | "hero" | "hero-dark";

interface ResolvedState {
  status: "idle" | "resolving" | "unsupported" | "needs_confirmation" | "found";
  externalId?: string;
  source?: string;
  currency?: string;
  preview?: {
    title: string;
    estimatedOriginal?: number;
    originalCurrency?: string;
    estimatedKz?: number;
  };
  error?: string;
  message?: string;
}

const SOURCE_LABELS: Record<string, { label: string; color: string; icon: any }> = {
  SHEIN: { label: "Shein", color: "bg-orange-100 text-orange-700", icon: Tag },
  ALIEXPRESS: { label: "AliExpress", color: "bg-red-100 text-red-700", icon: Tag },
  VINTED: { label: "Vinted", color: "bg-purple-100 text-purple-700", icon: Tag },
  MOCK: { label: "Demo", color: "bg-gray-100 text-gray-700", icon: Tag },
  ADMIN: { label: "Catálogo", color: "bg-green-100 text-green-700", icon: Tag },
};

const SUPPORTED_DOMAINS = [
  { domain: "shein.com", label: "Shein" },
  { domain: "aliexpress.com", label: "AliExpress" },
  { domain: "vinted.pt", label: "Vinted Portugal" },
  { domain: "vinted.es", label: "Vinted Espanha" },
  { domain: "vinted.fr", label: "Vinted França" },
  { domain: "vinted.de", label: "Vinted Alemanha" },
  { domain: "vinted.it", label: "Vinted Itália" },
];

export function UrlResolverForm({ variant = "light" }: { variant?: Variant }) {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [state, setState] = useState<ResolvedState>({ status: "idle" });

  const isDark = variant === "dark" || variant === "hero-dark";
  const isHero = variant === "hero" || variant === "hero-dark";

  async function onResolve(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) return;
    if (!isValidHttpUrl(trimmed)) {
      setState({ status: "unsupported", error: "Isso não parece ser um link válido." });
      return;
    }
    setState({ status: "resolving" });
    try {
      const res = await fetch("/api/products/resolve-url", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ url: trimmed }),
      });
      const data = await res.json();

      if (data.status === "found" && data.product) {
        const cfg = await getPricingConfig();
        const price = data.product.originalPriceUsd
          ? clientCalculatePrice(
              {
                productPrice: data.product.originalPriceUsd,
                productCurrency: (data.currency as "USD" | "EUR" | "CNY" | "AOA") || "USD",
                weightGrams: data.product.weightGrams,
              },
              cfg
            )
          : null;
        
        setState({
          status: "found",
          externalId: data.externalId,
          source: data.source,
          currency: data.currency,
          preview: {
            title: data.product.name,
            estimatedOriginal: data.product.originalPriceUsd,
            originalCurrency: data.currency,
            estimatedKz: price?.totalCents,
          },
        });
      } else if (data.status === "needs_confirmation") {
        setState({
          status: "needs_confirmation",
          externalId: data.externalId || extractProductIdFromSheinUrl(trimmed) || undefined,
          error: data.message,
        });
      } else {
        setState({
          status: "unsupported",
          error: "Este link não é reconhecido. Suportamos SHEIN, AliExpress e Vinted.",
        });
      }
    } catch {
      setState({ status: "unsupported", error: "Não conseguimos processar este link." });
    }
  }

  function goToProduct() {
    if (state.status === "found" && state.externalId) {
      router.push(`/produto/externo/${state.externalId}?url=${encodeURIComponent(url)}`);
    }
  }

  function createOrderFromUrl() {
    router.push(`/checkout?externalUrl=${encodeURIComponent(url)}&externalId=${state.externalId || ""}`);
  }

  // Badge de origem
  function SourceBadge({ source }: { source: string }) {
    const info = SOURCE_LABELS[source] || { label: source, color: "bg-gray-100 text-gray-700", icon: Globe };
    const Icon = info.icon;
    return (
      <span className={`${info.color} text-[9px] font-medium tracking-wide px-2 py-0.5 rounded-full flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {info.label}
      </span>
    );
  }

  // Formata moeda original
  function formatOriginal(amount: number | undefined, currency: string | undefined) {
    if (!amount) return null;
    const symbols: Record<string, string> = { USD: "$", EUR: "€", CNY: "¥" };
    const symbol = symbols[currency || "USD"] || "$";
    return `${symbol}${amount.toFixed(2)} ${currency || "USD"}`;
  }

  // Hero usa estilo pill grande
  if (isHero) {
    return (
      <form onSubmit={onResolve} className="w-full">
        <div className={cn(
          "rounded-full p-1.5 pl-4 md:pl-5 flex items-center gap-2 transition",
          isDark ? "bg-white/10 ring-1 ring-white/20" : "bg-ink-100 ring-1 ring-ink-200/60"
        )}>
          <LinkIcon className={cn("h-5 w-5 flex-shrink-0 hidden sm:block", isDark ? "text-white/70" : "text-ink-400")} />
          <input
            type="url"
            inputMode="url"
            placeholder="Link da Shein, AliExpress ou Vinted…"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (state.status !== "idle") setState({ status: "idle" });
            }}
            className={cn(
              "flex-1 bg-transparent outline-none text-[15px] md:text-[17px] py-3 min-w-0",
              isDark ? "text-white placeholder:text-white/50" : "text-ink-900 placeholder:text-ink-400"
            )}
          />
          <button
            type="submit"
            disabled={state.status === "resolving"}
            className={cn(
              "rounded-full h-10 md:h-11 px-4 md:px-6 text-[13px] md:text-[14px] font-medium inline-flex items-center gap-1.5 transition disabled:opacity-60 flex-shrink-0",
              isDark
                ? "bg-white text-black hover:bg-ink-100"
                : "bg-ink-900 text-white hover:bg-black"
            )}
          >
            {state.status === "resolving" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span className="hidden sm:inline">Calcular</span>
                <span className="sm:hidden">Ir</span>
                <ArrowRight className="h-4 w-4 hidden sm:inline" />
              </>
            )}
          </button>
        </div>

        {state.status === "unsupported" && (
          <div className="mt-3 rounded-full bg-danger-50 text-danger-700 px-4 py-2.5 text-sm inline-flex items-center gap-2 ring-1 ring-danger-500/20">
            <AlertCircle className="h-4 w-4" />
            {state.error}
          </div>
        )}
        {state.status === "needs_confirmation" && (
          <div className="mt-3 rounded-2xl bg-white/95 text-ink-900 px-5 py-4 text-sm text-left shadow-lg ring-1 ring-black/5">
            <div className="flex gap-2 items-start">
              <AlertCircle className="h-5 w-5 text-warning-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Produto precisa de confirmação.</p>
                <p className="mt-0.5 text-ink-600">
                  {state.error || "Este produto ainda não está no catálogo. Podes continuar com o pedido e a nossa equipa confirma o preço final antes do pagamento."}
                </p>
                <div className="mt-3">
                  <Button size="sm" variant="primary" onClick={createOrderFromUrl} type="button">
                    Continuar com pedido
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
        {state.status === "found" && state.preview && (
          <div className="mt-3 rounded-2xl bg-white/95 text-ink-900 px-5 py-4 text-sm text-left shadow-lg ring-1 ring-black/5">
            <div className="flex gap-2 items-start">
              <CheckCircle2 className="h-5 w-5 text-success-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold">Produto reconhecido</p>
                  {state.source && <SourceBadge source={state.source} />}
                </div>
                <p className="mt-0.5 text-ink-700 line-clamp-1">{state.preview.title}</p>
                {state.preview.estimatedKz ? (
                  <p className="mt-1.5">
                    Preço estimado: <strong>{formatCents(state.preview.estimatedKz)}</strong>
                    {state.preview.estimatedOriginal && state.preview.originalCurrency && (
                      <span className="text-ink-500 ml-1">~ {formatOriginal(state.preview.estimatedOriginal, state.preview.originalCurrency)}</span>
                    )}
                  </p>
                ) : (
                  <p className="mt-1.5 text-ink-600">Preço sob consulta.</p>
                )}
                <div className="mt-3">
                  <Button size="sm" variant="primary" onClick={goToProduct} type="button">
                    Ver produto
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    );
  }

  // Default estilo light/card
  return (
    <form onSubmit={onResolve} className="w-full max-w-xl">
      {/* Sites suportados */}
      <div className="mb-2 flex flex-wrap gap-1.5 text-[11px] text-ink-500">
        <span className="text-ink-400">Suportado:</span>
        {SUPPORTED_DOMAINS.map((d, i) => (
          <span key={i} className="bg-ink-100 px-2 py-0.5 rounded-full">{d.label}</span>
        ))}
      </div>

      <div className={cn(
        "rounded-2xl p-1.5 flex gap-2 items-stretch",
        isDark ? "bg-white/10 ring-1 ring-white/20" : "bg-white ring-1 ring-ink-200 shadow-sm"
      )}>
        <div className="pl-3 flex items-center">
          <LinkIcon className={cn("h-5 w-5", isDark ? "text-white/70" : "text-ink-400")} />
        </div>
        <input
          type="url"
          inputMode="url"
          placeholder="Já tens o link? Cola aqui (Shein, AliExpress, Vinted)…"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            if (state.status !== "idle") setState({ status: "idle" });
          }}
          className={cn(
            "flex-1 bg-transparent outline-none px-2 py-3 text-[15px] min-w-0",
            isDark ? "text-white placeholder:text-white/60" : "text-ink-900 placeholder:text-ink-400"
          )}
        />
        <Button
          type="submit"
          variant={isDark ? "secondary" : "primary"}
          size="md"
          disabled={state.status === "resolving"}
          className="rounded-xl h-12"
        >
          {state.status === "resolving" ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Calcular <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>

      {state.status === "unsupported" && (
        <div className="mt-3 rounded-xl bg-danger-50 text-danger-700 px-4 py-3 text-sm flex gap-2 ring-1 ring-danger-500/20">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{state.error}</span>
        </div>
      )}
      {state.status === "needs_confirmation" && (
        <div className="mt-3 rounded-xl bg-warning-50 text-warning-800 px-4 py-3 text-sm ring-1 ring-warning-500/20">
          <div className="flex gap-2 items-start">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Precisamos confirmar o produto.</p>
              <p className="mt-1 text-ink-700">
                {state.error || "Este produto ainda não está no catálogo. Podes continuar com o pedido e a nossa equipa irá validar o preço antes de cobrar."}
              </p>
              <div className="mt-3">
                <Button size="sm" variant="primary" onClick={createOrderFromUrl} type="button">
                  Continuar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
      {state.status === "found" && state.preview && (
        <div className="mt-3 rounded-xl bg-success-50 text-success-800 px-4 py-3 text-sm ring-1 ring-success-500/20">
          <div className="flex gap-2 items-start">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold">Produto reconhecido</p>
                {state.source && <SourceBadge source={state.source} />}
              </div>
              <p className="mt-0.5 text-ink-700 line-clamp-2">{state.preview.title}</p>
              {state.preview.estimatedKz ? (
                <p className="mt-1.5 text-ink-800">
                  Preço estimado: <strong>{formatCents(state.preview.estimatedKz)}</strong>
                  {state.preview.estimatedOriginal && state.preview.originalCurrency && (
                    <span className="text-ink-500 ml-1">~ {formatOriginal(state.preview.estimatedOriginal, state.preview.originalCurrency)}</span>
                  )}
                </p>
              ) : (
                <p className="mt-1.5 text-ink-700">Preço sob consulta.</p>
              )}
              <div className="mt-3">
                <Button size="sm" variant="primary" onClick={goToProduct} type="button">
                  Ver produto
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
