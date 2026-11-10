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
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Select, Textarea, Alert, Card } from "@/components/ui";
import type { NormalizedProduct, NormalizedVariant, PaymentMethod } from "@/lib/types";
import {
  clientCalculatePrice,
  formatCents,
  getPricingConfig,
  type ClientPricingConfig,
} from "@/lib/pricing-client";
import { PROVINCES_OF_ANGOLA, PAYMENT_METHOD_LABELS } from "@/lib/types";
import Link from "next/link";
import { useEffect } from "react";

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

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("BANK_TRANSFER");
  const [notes, setNotes] = useState("");
  const [externalPriceUsd, setExternalPriceUsd] = useState("");

  useEffect(() => {
    getPricingConfig().then(setCfg);
  }, []);

  const catalogPricing = useMemo(() => {
    if (!cfg || !prefill || prefill.type !== "product") return null;
    const { product, variant, quantity } = prefill;
    if (product.originalPriceUsd == null) return null;
    return clientCalculatePrice(
      {
        productPriceUsd: product.originalPriceUsd,
        quantity,
        weightGrams: product.weightGrams,
        variantPriceModifierUsd: variant?.priceModifierUsd || 0,
        province,
      },
      cfg
    );
  }, [cfg, prefill, province]);

  const externalPricing = useMemo(() => {
    if (!cfg || !prefill || prefill.type !== "external") return null;
    const usd = parseFloat(externalPriceUsd.replace(",", "."));
    if (!usd || isNaN(usd)) return null;
    return clientCalculatePrice({ productPrice: usd, productCurrency, quantity: 1 }, cfg);
  }, [cfg, prefill, externalPriceUsd, productCurrency]);

  const pricing = prefill?.type === "product" ? catalogPricing : externalPricing;
  const isExternal = prefill?.type === "external";
  const itemName = prefill?.type === "product" ? prefill.product.name : prefill?.productName || "Produto externo";
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
      const payload = {
        customerName: name.trim(),
        customerEmail: email.trim() || "",
        customerPhone: phone.trim(),
        customerWhatsapp: whatsapp.trim() || phone.trim(),
        items: [
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
        ],
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
      setCreatedRef(data.order.reference);
      setStep(4);
    } catch {
      setError("Erro de ligação. Tenta novamente.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 4 && createdRef) return <OrderSuccess reference={createdRef} />;

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
              province={province} setProvince={setProvince}
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
              canSubmit={!!(pricing || isExternal && externalPricing)}
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
          <h3 className="font-semibold text-ink-900 text-lg">Resumo</h3>
          <div className="flex gap-3 py-5 border-b border-ink-100">
            {itemImage ? (
              <img src={itemImage} alt="" className="h-20 w-20 rounded-xl object-cover bg-ink-100" />
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

          {pricing ? (
            <div className="mt-4 space-y-2 text-sm">
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
  const methods: Array<{ id: PaymentMethod; name: string; desc: string }> = [
    { id: "BANK_TRANSFER", name: "Transferência bancária", desc: "Transferência para conta SGEI" },
    { id: "REFERENCE", name: "Referência multicaixa", desc: "Referência para pagamento no ATM" },
    { id: "DIGITAL", name: "Express / Unitel Money", desc: "Pagamento por carteira digital" },
    { id: "CASH", name: "Dinheiro na entrega", desc: "Pagar aquando da entrega (só Luanda)" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold tracking-tight text-ink-900">Pagamento</h2>
      <p className="mt-1 text-sm text-ink-500">
        A confirmação é feita pela nossa equipa após envio do comprovativo.
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
                ? "bg-ink-50 ring-ink-900"
                : "bg-white ring-ink-200 hover:ring-ink-300")
            }
          >
            <input
              type="radio"
              name="payment"
              value={m.id}
              checked={props.paymentMethod === m.id}
              onChange={() => props.setPaymentMethod(m.id)}
              className="mt-1 accent-ink-900"
            />
            <div>
              <p className="font-medium text-ink-900 text-[15px]">{m.name}</p>
              <p className="text-xs text-ink-500 mt-0.5">{m.desc}</p>
            </div>
          </label>
        ))}
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

function OrderSuccess({ reference }: { reference: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Card className="p-8 md:p-14 text-center max-w-2xl mx-auto rounded-3xl">
      <div className="h-20 w-20 rounded-full bg-ink-900 text-white grid place-items-center mx-auto">
        <CheckCircle2 className="h-10 w-10" />
      </div>
      <h2 className="mt-6 text-3xl md:text-4xl font-semibold tracking-tight text-ink-900">
        Pedido criado.
      </h2>
      <p className="mt-3 text-ink-500 apple-lead max-w-md mx-auto">
        O teu pedido foi registado. Irás receber instruções para o pagamento em breve.
      </p>
      <div className="mt-8 inline-flex items-center gap-3 bg-ink-50 rounded-full px-6 py-3">
        <span className="text-[11px] uppercase tracking-widest text-ink-500">Referência</span>
        <code className="text-2xl font-semibold tracking-tight">#{reference}</code>
        <button
          onClick={() => {
            navigator.clipboard.writeText(reference);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          }}
          className="h-8 w-8 grid place-items-center rounded-full hover:bg-white"
          aria-label="Copiar"
        >
          {copied ? <CheckCheck className="h-4 w-4 text-success-600" /> : <Copy className="h-4 w-4" />}
        </button>
      </div>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <Link href={`/pedido/${reference}`}>
          <Button size="lg">Ver pedido</Button>
        </Link>
        <a
          href={`https://wa.me/244923000000?text=${encodeURIComponent(`Olá! Acabei de criar o pedido #${reference}. Qual o próximo passo?`)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button size="lg" variant="secondary">
            <Phone className="h-4 w-4" /> Falar no WhatsApp
          </Button>
        </a>
      </div>
    </Card>
  );
}
