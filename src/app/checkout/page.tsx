import { Container } from "@/components/ui";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { getActiveProvider } from "@/lib/providers";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Checkout",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{
    productSlug?: string;
    variantId?: string;
    qty?: string;
    externalUrl?: string;
    externalId?: string;
    productName?: string;
  }>;
}) {
  const sp = await searchParams;
  let prefill: any = null;

  if (sp.productSlug) {
    const provider = await getActiveProvider();
    const product = await provider.getProductBySlug(sp.productSlug);
    if (product) {
      const variantId = sp.variantId || product.variants[0]?.id;
      const variant = product.variants.find((v) => String(v.id) === String(variantId));
      const qty = Number(sp.qty) || 1;
      prefill = {
        type: "product" as const,
        product,
        variant,
        quantity: qty,
      };
    }
  } else if (sp.externalUrl) {
    prefill = {
      type: "external" as const,
      externalUrl: sp.externalUrl,
      externalId: sp.externalId,
      productName: sp.productName || "Produto SHEIN (link externo)",
    };
  }

  return (
    <Container className="py-6 md:py-10">
      <nav className="text-xs text-ink-500 mb-4">
        <Link href="/" className="hover:text-primary-600">Início</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink-700">Checkout</span>
      </nav>
      <h1 className="text-2xl md:text-3xl font-bold text-ink-900 mb-6">Finalizar pedido</h1>
      <CheckoutFlow prefill={prefill} />
    </Container>
  );
}
