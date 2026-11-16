"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  Loader2,
  MapPin,
  Package,
  CreditCard,
  User as UserIcon,
  Copy,
  CheckCheck,
  Phone,
  AlertTriangle,
  ChevronRight,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea, Alert, Card } from "@/components/ui";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import type { NormalizedProduct, NormalizedVariant, PaymentMethod } from "@/lib/types";
import {
  clientCalculatePrice,
  formatCents,
  getPricingConfig,
  type ClientPricingConfig,
  type SupportedCurrency,
} from "@/lib/pricing-client";
import { PROVINCES_OF_ANGOLA, PAYMENT_METHOD_LABELS, formatKz } from "@/lib/types";
import Link from "next/link";
import { useEffect } from "react";
import { PaymentProofUpload } from "@/components/order/PaymentProofUpload";
import { useCart } from "@/context/CartContext";
import { useAdaptiveIntelligence } from "@/context/AdaptiveIntelligenceContext";

type Step = 1 | 2 | 3 | 4;

interface ProductPrefill {
  type: "product";
  product: NormalizedProduct;
  variant?: NormalizedVariant;
  quantity: number;
}
interface ExternalPrefill {
  type: "external";
  externalUrl: string;
  externalId?: string;
  productName: string;
}
type Prefill = ProductPrefill | ExternalPrefill;

export function CheckoutFlow({ prefill }: { prefill: Prefill | null }) {
  const router = useRouter();
  const { items: cartItems, totalKz: cartTotalKz, clearCart } = useCart();
  const { recordEvent } = useAdaptiveIntelligence();
  const [step, setStep] = useState<Step>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdRef, setCreatedRef] = useState<string | null>(null);
  const [cfg, setCfg] = useState<ClientPricingConfig | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [province, setProvince] = useState("Luanda");
  const [municipality, setMunicipality] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [street, setStreet] = useState("");
  const [referencePoint, setReferencePoint] = useState("");
  const [instructions, setInstructions] = useState("");

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("DIGITAL");
  const [notes, setNotes] = useState("");
  const [externalPriceUsd, setExternalPriceUsd] = useState("");
  const [productCurrency, setProductCurrency] = useState<string>("USD");

  const isCartCheckout = prefill?.type !== "product" && cartItems.length > 0;

  useEffect(() => {
    getPricingConfig().then(setCfg);
  }, []);

  const catalogPricing = useMemo(() => {
    if (!cfg || !prefill || prefill.type !== "product") return null;
    const { product, variant, quantity } = prefill;
    if (product.originalPriceUsd == null) return null;
    return clientCalculatePrice(
      {
        productPrice: product.originalPriceUsd,
        productCurrency: ((product as any).originalCurrency || product.currency || "USD") as SupportedCurrency,
        quantity,
        weightGrams: product.weightGrams,
        variantPriceModifier: variant?.priceModifierUsd || 0,
        province,
      },
      cfg
    );
  }, [cfg, prefill, province]);

  const externalPricing = useMemo(() => {
    if (!cfg || !prefill || prefill.type !== "external" || isCartCheckout) return null;
    const usd = parseFloat(externalPriceUsd.replace(",", "."));
    if (!usd || isNaN(usd)) return null;
    return clientCalculatePrice({ productPrice: usd, productCurrency: productCurrency as any, quantity: 1 }, cfg);
  }, [cfg, prefill, externalPriceUsd, productCurrency, isCartCheckout]);

  const cartPricing = useMemo(() => {
    if (!isCartCheckout) return null;
    const subtotalCents = Math.round(cartTotalKz * 100);
    return {
      subtotalCents,
      serviceFeeCents: 0,
      logisticsFeeCents: 0, // Mala Coletiva - Frete Grátis!
      deliveryFeeCents: 0,
      totalCents: subtotalCents,
    };
  }, [isCartCheckout, cartTotalKz]);

  const pricing = isCartCheckout ? cartPricing : (prefill?.type === "product" ? catalogPricing : externalPricing);
  const isExternal = !isCartCheckout && prefill?.type === "external";
  const itemName = isCartCheckout
    ? `Mala Coletiva (${cartItems.length} artigos)`
    : prefill?.type === "product"
    ? prefill.product.name
    : prefill?.productName || "Produto externo";
  const itemImage = prefill?.type === "product" ? prefill.product.defaultImage || prefill.product.images[0] : null;

  function validateStep1(): string | null {
    if (!name.trim()) return "Indica o teu nome.";
    if (!phone.trim() || phone.replace(/\D/g, "").length < 9) return "Indica um telefone válido.";
    return null;
  }
  function validateStep2(): string | null {
    if (!province) return "Seleciona a província.";
    if (!municipality.trim()) return "Indica o município.";
    return null;
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const orderItems = isCartCheckout
        ? cartItems.map((ci) => ({
            productName: ci.title,
            productImage: ci.image || null,
            sourceUrl: ci.sourceUrl || null,
            variantColor: ci.variantColor || null,
            variantSize: ci.variantSize || null,
            variantLabel: [ci.variantColor, ci.variantSize].filter(Boolean).join(" · ") || null,
            quantity: ci.quantity,
            unitPriceCents: Math.round((ci.priceKz / ci.quantity) * 100),
            originalPriceUsd: ci.priceUsd || null,
            originalCurrency: ci.originalCurrency || "USD",
          }))
        : [
            prefill?.type === "product"
              ? {
                  productId: Number(prefill.product.id) || undefined,
                  variantId: prefill.variant ? Number(prefill.variant.id) : undefined,
                  productName: prefill.product.name,
                  productImage: prefill.product.defaultImage || prefill.product.images[0] || null,
                  sourceUrl: prefill.product.sourceUrl,
                  sku: prefill.variant?.sku || prefill.product.sku,
                  variantColor: prefill.variant?.color || null,
                  variantSize: prefill.variant?.size || null,
                  variantLabel: [prefill.variant?.color, prefill.variant?.size].filter(Boolean).join(" · "),
                  quantity: prefill.quantity,
                  unitPriceCents: catalogPricing ? Math.round(catalogPricing.subtotalCents / prefill.quantity) : 0,
                  originalPriceUsd: prefill.product.originalPriceUsd,
                  priceSnapshot: {
                    productPriceUsd: prefill.product.originalPriceUsd || 0,
                    productCurrency: (prefill.product as any).originalCurrency || prefill.product.currency || "USD",
                    exchangeRate: cfg?.exchangeRateUsdToAoa || 0,
                    serviceFeeCents: catalogPricing?.serviceFeeCents || 0,
                    logisticsFeeCents: catalogPricing?.logisticsFeeCents || 0,
                    deliveryFeeCents: catalogPricing?.deliveryFeeCents || 0,
                  },
                }
              : {
                  productName: (prefill as ExternalPrefill).productName,
                  sourceUrl: (prefill as ExternalPrefill).externalUrl,
                  quantity: 1,
                  unitPriceCents: externalPricing?.subtotalCents || 0,
                  originalPriceUsd: externalPriceUsd ? parseFloat(externalPriceUsd) : null,
                },
          ];

      const payload = {
        customerName: name.trim(),
        customerEmail: email.trim() || "",
        customerPhone: phone.trim(),
        customerWhatsapp: whatsapp.trim() || phone.trim(),
        items: orderItems,
        address: {
          province,
          municipality,
          neighborhood,
          street,
          reference: referencePoint,
          instructions,
        },
        paymentMethod,
        notes,
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Erro ao criar pedido.");
        return;
      }
      if (isCartCheckout) {
        clearCart();
      }
      recordEvent("ORDER_CREATED", { reference: data.order.reference });
      setCreatedRef(data.order.reference);
      setStep(4);
    } catch {
      setError("Erro de ligação. Tenta novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 4 && createdRef) {
    return (
      <OrderSuccess 
        reference={createdRef} 
        totalCents={pricing?.totalCents} 
        paymentMethod={paymentMethod}
      />
    );
  }

  if (!prefill && cartItems.length === 0) {
    return (
      <Card className="p-8 sm:p-12 text-center max-w-xl mx-auto rounded-3xl">
        <div className="w-16 h-16 rounded-full bg-brand-50 text-brand-600 grid place-items-center mx-auto mb-4">
          <Package className="w-8 h-8" />
        </div>
        <h2 className="text-xl sm:text-2xl font-bold text-ink-900">A tua Mala Coletiva está vazia</h2>
        <p className="mt-2 text-sm text-ink-600 leading-relaxed max-w-md mx-auto">
          Ainda não adicionaste nenhum artigo à tua encomenda. Cola o link de uma peça da SHEIN ou explora o nosso catálogo para comprar em Kwanzas.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/importar" className="px-5 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition">
            Colar Link da SHEIN
          </Link>
          <Link href="/produtos" className="px-5 py-3 rounded-xl border border-ink-300 hover:bg-ink-50 text-ink-800 font-bold text-sm transition">
            Ver Catálogo
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-5 md:gap-8 lg:gap-10">
      <div className="space-y-5 order-2 lg:order-1">
        <Stepper step={step} />

        <Card className="p-6 md:p-8 rounded-3xl">
          {step === 1 && (
            <Step1
              name={name} setName={setName}
              email={email} setEmail={setEmail}
              phone={phone} setPhone={setPhone}
              whatsapp={whatsapp} setWhatsapp={setWhatsapp}
              onNext={() => { const e = validateStep1(); if (e) { setError(e); return; } setError(null); setStep(2); }}
            />
          )}
          {step === 2 && (
            <Step2
              province={province} 
              setProvince={(p: string) => {
                setProvince(p);
                recordEvent("PROVINCE_SELECT", { province: p });
              }}
              municipality={municipality} setMunicipality={setMunicipality}
              neighborhood={neighborhood} setNeighborhood={setNeighborhood}
              street={street} setStreet={setStreet}
              referencePoint={referencePoint} setReferencePoint={setReferencePoint}
              instructions={instructions} setInstructions={setInstructions}
              onBack={() => { setError(null); setStep(1); }}
              onNext={() => { const e = validateStep2(); if (e) { setError(e); return; } setError(null); setStep(3); }}
            />
          )}
          {step === 3 && (
            <Step3
              paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
              notes={notes} setNotes={setNotes}
              externalPriceUsd={isExternal ? externalPriceUsd : undefined}
              setExternalPriceUsd={isExternal ? setExternalPriceUsd : undefined}
              productCurrency={productCurrency}
              setProductCurrency={setProductCurrency}
              isExternal={isExternal}
              onBack={() => { setError(null); setStep(2); }}
              onSubmit={handleSubmit}
              submitting={submitting}
              canSubmit={!!(pricing || (isExternal && externalPricing))}
            />
          )}
        </Card>

        {error && (
          <Alert variant="danger">
            {error}
          </Alert>
        )}
      </div>

      {/* Resumo */}
      <aside className="lg:sticky lg:top-24 order-1 lg:order-2 h-fit">
        <Card className="p-4 sm:p-6 rounded-3xl">
          <div className="flex items-center justify-between pb-3 border-b border-ink-100">
            <h3 className="font-semibold text-ink-900 text-lg">Resumo</h3>
            {isCartCheckout && (
              <span className="text-[11px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                MALA COLETIVA
              </span>
            )}
          </div>

          {isCartCheckout ? (
            <div className="divide-y divide-ink-100 max-h-72 overflow-y-auto pr-1 py-2">
              {cartItems.map((it) => (
                <div key={it.id} className="flex gap-3 py-3">
                  {it.image ? (
                    <ResponsiveImage
                      src={it.image}
                      alt={it.title}
                      width={56}
                      height={56}
                      className="rounded-xl object-cover bg-ink-100 shrink-0"
                      fallbackText="Item"
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-xl bg-ink-100 grid place-items-center text-ink-400 shrink-0">
                      <Package className="h-5 w-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-ink-900 line-clamp-1">{it.title}</p>
                    <p className="text-[11px] text-ink-500 mt-0.5">
                      {it.quantity}x · {it.platform}
                      {it.variantColor && ` · ${it.variantColor}`}
                      {it.variantSize && ` · ${it.variantSize}`}
                    </p>
                    <p className="text-xs font-bold text-brand-600 mt-1">{formatKz(it.priceKz)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex gap-3 py-5 border-b border-ink-100">
              {itemImage ? (
                <ResponsiveImage
                  src={itemImage}
                  alt={itemName}
                  width={80}
                  height={80}
                  className="rounded-xl object-cover bg-ink-100"
                  fallbackText="Item"
                />
              ) : (
                <div className="h-20 w-20 rounded-xl bg-ink-100 grid place-items-center text-ink-400">
                  <Package className="h-7 w-7" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-medium text-ink-900 line-clamp-2">{itemName}</p>
                {prefill?.type === "product" && (
                  <p className="text-xs text-ink-500 mt-1">
                    Qtd: {prefill.quantity}
                    {prefill.variant?.color && ` · ${prefill.variant.color}`}
                    {prefill.variant?.size && ` · ${prefill.variant.size}`}
                  </p>
                )}
                {isExternal && <p className="text-xs text-warning-700 mt-1">A confirmar pela equipa</p>}
              </div>
            </div>
          )}

          {pricing ? (
            <div className="mt-4 space-y-2 text-sm">
              {isCartCheckout ? (
                <>
                  <SummaryRow label="Artigos no lote" value={formatKz(cartTotalKz)} />
                  <div className="flex justify-between text-ink-700">
                    <span className="text-emerald-700 font-medium">Frete Internacional & Alfândega</span>
                    <span className="font-extrabold text-emerald-600">0 Kz (Mala Coletiva)</span>
                  </div>
                  <SummaryRow label="Entrega ao domicílio" value="Grátis" />
                  <div className="pt-4 mt-2 border-t border-ink-100 flex justify-between font-semibold text-ink-900 text-lg">
                    <span>Total</span>
                    <span className="tracking-tight text-brand-600 font-extrabold">{formatKz(cartTotalKz)}</span>
                  </div>
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800">
                    ✓ <strong>Benefício Ativo:</strong> As tuas peças viajam no Lote Luanda #48 sem custos alfandegários extras.
                  </div>
                </>
              ) : (
                <>
                  <SummaryRow label="Produto" value={formatCents(pricing.subtotalCents)} />
                  <SummaryRow label="Taxa de serviço" value={formatCents(pricing.serviceFeeCents)} />
                  <SummaryRow label="Logística" value={formatCents(pricing.logisticsFeeCents)} />
                  <SummaryRow label="Entrega" value={formatCents(pricing.deliveryFeeCents)} />
                  <div className="pt-4 mt-2 border-t border-ink-100 flex justify-between font-semibold text-ink-900 text-lg">
                    <span>Total</span>
                    <span className="tracking-tight">{formatCents(pricing.totalCents)}</span>
                  </div>
                  <p className="text-[11px] text-ink-500">
                    Câmbio: 1 USD = {cfg?.exchangeRateUsdToAoa ?? "..."} Kz · 1 EUR = {cfg?.exchangeRateEurToAoa ?? "..."} Kz
                  </p>
                  <p className="text-[11px] text-ink-500 mt-0.5">
                    {isExternal
                      ? "Preço calculado em USD. Para produtos de outros sites, indica a moeda no campo abaixo."
                      : "Preço final inclui taxa, logística e entrega."}
                  </p>
                </>
              )}
            </div>
          ) : isExternal ? (
            <div className="mt-4 text-sm text-ink-600 space-y-2">
              <p>Indica o preço em USD que viste na SHEIN para calcularmos o valor estimado. O valor final será confirmado pela nossa equipa.</p>
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-500">A carregar preço…</p>
          )}
        </Card>
      </aside>
    </div>
  );
}

function Stepper({ step }: { step: Step }) {
  const steps = [
    { n: 1, label: "Dados" },
    { n: 2, label: "Entrega" },
    { n: 3, label: "Pagamento" },
  ];
  return (
    <div className="flex items-center gap-2">
      {steps.map((s, i) => {
        const active = step === s.n;
        const done = step > s.n;
        return (
          <div key={s.n} className="flex items-center flex-1 gap-2">
            <div
              className={
                "h-7 w-7 rounded-full grid place-items-center text-xs font-semibold transition " +
                (done ? "bg-ink-900 text-white" : active ? "bg-ink-900 text-white" : "bg-ink-100 text-ink-400")
              }
            >
              {done ? <CheckCheck className="h-3.5 w-3.5" /> : s.n}
            </div>
            <span className={"text-sm font-medium " + (active || done ? "text-ink-900" : "text-ink-400")}>
              {s.label}
            </span>
            {i < steps.length - 1 && <div className={"flex-1 h-px " + (step > s.n ? "bg-ink-900" : "bg-ink-200")} />}
          </div>
        );
      })}
    </div>
  );
}

function Step1(props: any) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-ink-900">Os teus dados</h2>
      <p className="mt-1 text-sm text-ink-500">Usamos estes dados para contactar-te sobre o pedido.</p>
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <Input label="Nome completo *" value={props.name} onChange={(e: any) => props.setName(e.target.value)} placeholder="Ex: João Silva" />
        <Input label="Email" type="email" value={props.email} onChange={(e: any) => props.setEmail(e.target.value)} placeholder="Opcional" />
        <Input label="Telefone *" value={props.phone} onChange={(e: any) => props.setPhone(e.target.value)} placeholder="923 456 789" />
        <Input label="WhatsApp" value={props.whatsapp} onChange={(e: any) => props.setWhatsapp(e.target.value)} placeholder="Se diferente do telefone" />
      </div>
      <div className="mt-8 flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
        <Button variant="secondary" size="lg" onClick={props.onBack} className="sm:w-auto w-full">Voltar</Button>
        <Button size="lg" onClick={props.onNext} className="sm:w-auto w-full">
          Continuar <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function Step2(props: any) {
  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-ink-900">Endereço de entrega</h2>
      <p className="mt-1 text-sm text-ink-500">Onde devemos entregar o pedido em Angola.</p>
      <div className="mt-6 grid md:grid-cols-2 gap-4">
        <Select
          label="Província *"
          value={props.province}
          onChange={(e: any) => props.setProvince(e.target.value)}
          options={PROVINCES_OF_ANGOLA.map((p) => ({ value: p, label: p }))}
        />
        <Input label="Município *" value={props.municipality} onChange={(e: any) => props.setMunicipality(e.target.value)} placeholder="Ex: Luanda" />
        <Input label="Bairro" value={props.neighborhood} onChange={(e: any) => props.setNeighborhood(e.target.value)} />
        <Input label="Rua / Avenida" value={props.street} onChange={(e: any) => props.setStreet(e.target.value)} />
      </div>
      <div className="mt-4 grid md:grid-cols-2 gap-4">
        <Input label="Ponto de referência" value={props.referencePoint} onChange={(e: any) => props.setReferencePoint(e.target.value)} placeholder="Ex: junto ao mercado" />
        <Textarea label="Instruções para o estafeta" value={props.instructions} onChange={(e: any) => props.setInstructions(e.target.value)} placeholder="Ex: ligar antes de chegar" />
      </div>
      <div className="mt-8 flex flex-col-reverse sm:flex-row justify-between gap-2">
        <Button variant="secondary" size="lg" onClick={props.onBack} className="sm:w-auto w-full">Voltar</Button>
        <Button size="lg" onClick={props.onNext} className="sm:w-auto w-full">
          Continuar <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function Step3(props: any) {
  const methods: Array<{ id: PaymentMethod; name: string; desc: string; badge?: string }> = [
    {
      id: "DIGITAL",
      name: "Multicaixa Express (Envio por Número)",
      desc: "Envio direto no app Express para o número 929 423 278",
      badge: "Mais Rápido",
    },
    {
      id: "REFERENCE",
      name: "Pagamento por Referência (ATM / Express)",
      desc: "Entidade: 10116 · Referência: 929 423 278",
      badge: "Recomendado",
    },
    {
      id: "BANK_TRANSFER",
      name: "Transferência Bancária / IBAN",
      desc: "Transferência bancária com envio de comprovativo via WhatsApp",
    },
    {
      id: "CASH",
      name: "Dinheiro na entrega",
      desc: "Pagar aquando da entrega (apenas Luanda)",
    },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-ink-900">Pagamento</h2>
      <p className="mt-1 text-sm text-ink-500">
        Pague em Kwanzas através do Multicaixa Express ou Referência. Confirmação rápida após envio do comprovativo.
      </p>

      {props.isExternal && (
        <div className="mt-5">
          <Alert variant="warning" title="Preço do produto externo">
            Para podermos calcular o valor estimado, indica o preço e moeda do produto que viste no site.
            O valor final será confirmado antes do pagamento.
          </Alert>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <Select
              label="Moeda"
              value={props.productCurrency}
              onChange={(e: any) => props.setProductCurrency(e.target.value)}
              options={[
                { value: "USD", label: "USD (Dólar)" },
                { value: "EUR", label: "EUR (Euro)" },
                { value: "CNY", label: "CNY (Yuan)" },
              ]}
            />
            <Input
              label={`Preço do produto (${props.productCurrency})`}
              type="text"
              inputMode="decimal"
              value={props.externalPriceUsd}
              onChange={(e: any) => props.setExternalPriceUsd(e.target.value)}
              placeholder={`Ex: ${props.productCurrency === "EUR" ? "18.90" : props.productCurrency === "CNY" ? "128.00" : "18.90"}`}
            />
          </div>
        </div>
      )}

      <div className="mt-5 space-y-2">
        {methods.map((m) => (
          <label
            key={m.id}
            className={
              "flex items-start gap-3 p-4 rounded-2xl cursor-pointer ring-1 transition " +
              (props.paymentMethod === m.id
                ? "bg-brand-50/60 ring-brand-600"
                : "bg-white ring-ink-200 hover:ring-ink-300")
            }
          >
            <input
              type="radio"
              name="payment"
              value={m.id}
              checked={props.paymentMethod === m.id}
              onChange={() => props.setPaymentMethod(m.id)}
              className="mt-1 accent-brand-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-ink-900 text-[15px]">{m.name}</p>
                {m.badge && (
                  <span className="text-[10px] bg-brand-100 text-brand-700 font-bold px-2 py-0.5 rounded-full uppercase">
                    {m.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-ink-500 mt-0.5">{m.desc}</p>
            </div>
          </label>
        ))}
      </div>

      {/* Caixa informativa com dados Express */}
      <div className="mt-4 p-4 rounded-2xl bg-ink-50 border border-ink-200 text-xs text-ink-700 space-y-1.5">
        <div className="font-semibold text-ink-900 flex items-center gap-1.5">
          <CreditCard className="w-4 h-4 text-brand-600" />
          Dados para Pagamento Imediato:
        </div>
        <p>• <strong>Multicaixa Express (Número):</strong> 929 423 278</p>
        <p>• <strong>Pagamento por Referência:</strong> Entidade: 10116 | Referência: 929 423 278</p>
      </div>

      <div className="mt-5">
        <Textarea label="Notas (opcional)" value={props.notes} onChange={(e: any) => props.setNotes(e.target.value)} placeholder="Alguma nota adicional…" />
      </div>

      <div className="mt-5 rounded-2xl bg-ink-50 px-4 py-3 text-[13px] text-ink-700 flex gap-2">
        <AlertTriangle className="h-4 w-4 text-warning-600 flex-shrink-0 mt-0.5" />
        Ao confirmar, o pedido fica registado com referência única. O pagamento só será confirmado pela nossa equipa.
      </div>

      <div className="mt-6 flex flex-col-reverse sm:flex-row justify-between gap-2">
        <Button variant="secondary" size="lg" onClick={props.onBack} disabled={props.submitting} className="sm:w-auto w-full">Voltar</Button>
        <Button size="lg" onClick={props.onSubmit} loading={props.submitting} disabled={!props.canSubmit} className="sm:w-auto w-full">
          {props.submitting ? "A criar…" : "Confirmar pedido"}
        </Button>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-ink-700">
      <span className="text-ink-500">{label}</span>
      <span className="font-medium text-ink-900">{value}</span>
    </div>
  );
}

function OrderSuccess({
  reference,
  totalCents,
  paymentMethod,
}: {
  reference: string;
  totalCents?: number;
  paymentMethod?: string;
}) {
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);
  const [copiedEntity, setCopiedEntity] = useState(false);
  const [copiedReference, setCopiedReference] = useState(false);

  const formattedTotal = totalCents ? formatCents(totalCents) : null;
  const whatsappUrl = `https://wa.me/244922058136?text=${encodeURIComponent(
    `Olá ImportEasy! Gostaria de falar com o apoio ao cliente sobre o pedido #${reference}${
      formattedTotal ? ` no valor de ${formattedTotal}` : ""
    }.`
  )}`;

  return (
    <Card className="p-6 md:p-10 max-w-2xl mx-auto rounded-3xl text-center">
      <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center mx-auto mb-4">
        <CheckCircle2 className="h-9 w-9" />
      </div>
      <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-ink-900">
        Pedido Registado com Sucesso!
      </h2>
      <p className="mt-2 text-ink-600 text-sm md:text-base max-w-md mx-auto">
        O seu pedido foi gerado. Efetue o pagamento abaixo para iniciarmos imediatamente a compra e o envio para Angola.
      </p>

      {/* Referência e Total */}
      <div className="mt-6 p-4 rounded-2xl bg-ink-50 border border-ink-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-left">
        <div>
          <span className="text-xs uppercase tracking-wider text-ink-500 font-semibold block">Código do Pedido</span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xl font-mono font-bold text-ink-900">#{reference}</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(reference);
                setCopiedRef(true);
                setTimeout(() => setCopiedRef(false), 1500);
              }}
              className="p-1 rounded-md hover:bg-ink-200 text-ink-600 transition"
              title="Copiar Código"
            >
              {copiedRef ? <CheckCheck className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {formattedTotal && (
          <div className="sm:text-right">
            <span className="text-xs uppercase tracking-wider text-ink-500 font-semibold block">Total a Pagar</span>
            <span className="text-2xl font-bold text-brand-600">{formattedTotal}</span>
          </div>
        )}
      </div>

      {/* Caixa de Pagamento Angolana */}
      <div className="mt-6 text-left p-6 rounded-2xl border-2 border-brand-200 bg-brand-50/50 space-y-5">
        <div className="flex items-center justify-between border-b border-brand-100 pb-3">
          <div className="flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-brand-600" />
            <span className="font-bold text-ink-900 text-base">Instruções de Pagamento (Angola)</span>
          </div>
          <span className="text-[11px] font-semibold bg-brand-600 text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Oficial
          </span>
        </div>

        {/* Opção 1: App Multicaixa Express */}
        <div className="bg-white p-4 rounded-xl border border-ink-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs grid place-items-center font-bold">1</span>
              App Multicaixa Express (Transferência / Envio)
            </span>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Instantâneo</span>
          </div>
          <p className="text-xs text-ink-500 pl-7">
            Abra o app Express &gt; Enviar Dinheiro / Transferência &gt; Digite o número:
          </p>
          <div className="pl-7 flex items-center justify-between bg-ink-50 p-2.5 rounded-lg border border-ink-100">
            <div>
              <span className="text-xs text-ink-400 block">Número de Telemóvel Express</span>
              <span className="font-mono text-base font-bold text-ink-900">929 423 278</span>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText("929423278");
                setCopiedPhone(true);
                setTimeout(() => setCopiedPhone(false), 1500);
              }}
              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-white border border-ink-300 rounded-lg text-ink-700 hover:bg-ink-100 transition shadow-sm"
            >
              {copiedPhone ? <CheckCheck className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              {copiedPhone ? "Copiado!" : "Copiar"}
            </button>
          </div>
        </div>

        {/* Opção 2: Pagamento por Referência */}
        <div className="bg-white p-4 rounded-xl border border-ink-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-ink-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-brand-600 text-white text-xs grid place-items-center font-bold">2</span>
              Pagamento por Referência (ATM ou App Express)
            </span>
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">Multicaixa</span>
          </div>
          <p className="text-xs text-ink-500 pl-7">
            Escolha Pagamentos &gt; Pagamentos por Referência e insira os dados:
          </p>
          <div className="pl-7 grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="flex items-center justify-between bg-ink-50 p-2.5 rounded-lg border border-ink-100">
              <div>
                <span className="text-xs text-ink-400 block">Entidade</span>
                <span className="font-mono text-base font-bold text-ink-900">10116</span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText("10116");
                  setCopiedEntity(true);
                  setTimeout(() => setCopiedEntity(false), 1500);
                }}
                className="text-xs font-semibold px-2 py-1 bg-white border border-ink-200 rounded hover:bg-ink-100 text-ink-700"
              >
                {copiedEntity ? "✓" : "Copiar"}
              </button>
            </div>
            <div className="flex items-center justify-between bg-ink-50 p-2.5 rounded-lg border border-ink-100">
              <div>
                <span className="text-xs text-ink-400 block">Referência</span>
                <span className="font-mono text-base font-bold text-ink-900">929 423 278</span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText("929423278");
                  setCopiedReference(true);
                  setTimeout(() => setCopiedReference(false), 1500);
                }}
                className="text-xs font-semibold px-2 py-1 bg-white border border-ink-200 rounded hover:bg-ink-100 text-ink-700"
              >
                {copiedReference ? "✓" : "Copiar"}
              </button>
            </div>
          </div>
        </div>

        {/* Garantia */}
        <div className="flex items-start gap-2.5 pt-1 text-xs text-ink-600">
          <Shield className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
          <span><strong>Confirmação antes da compra:</strong> a equipa valida o pagamento e os detalhes do pedido; acompanhe as atualizações pela referência do pedido.</span>
        </div>
      </div>

      {/* Submissão Direta de Comprovativo para o Painel Admin */}
      <div className="mt-6 text-left">
        <PaymentProofUpload
          orderReference={reference}
          paymentStatus="WAITING"
        />
      </div>

      {/* Ações */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={`/pedido/${reference}`} className="flex-1">
          <Button size="lg" className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold">
            Ver Estado & Tracking do Pedido
          </Button>
        </Link>
        <a
          href={`https://wa.me/244922058136?text=${encodeURIComponent(
            `Olá ImportEasy! Criei o pedido #${reference} e gostaria de falar com o apoio ao cliente.`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-semibold text-sm transition"
        >
          <Phone className="h-4 w-4" /> Apoio no WhatsApp (+244 922 058 136)
        </a>
      </div>
    </Card>
  );
}
