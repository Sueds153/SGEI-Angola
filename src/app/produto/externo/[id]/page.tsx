import { Container, Card, Alert as AlertBox } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Suspense } from "react";
import { ProductDetail } from "@/components/product/ProductDetail";
import { getActiveProvider } from "@/lib/providers";
import { notFound } from "next/navigation";
import { UrlResolverForm } from "@/components/home/UrlResolverForm";

export const dynamic = "force-dynamic";

export default async function ExternalProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ url?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const provider = await getActiveProvider();
  const product = await provider.getProductByExternalId(id);

  if (product) {
    return (
      <Container className="py-6 md:py-10">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900 mb-4">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>
        <Suspense fallback={<div className="h-96 skeleton rounded-3xl" />}>
          <ProductDetail product={product} />
        </Suspense>
      </Container>
    );
  }

  return (
    <Container className="py-10 md:py-16 max-w-2xl">
      <Link href="/" className="inline-flex items-center gap-1 text-sm text-ink-500 hover:text-ink-900 mb-6">
        <ArrowLeft className="h-4 w-4" /> Voltar
      </Link>
      <Card className="p-8 md:p-10 rounded-3xl text-center">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-ink-900">
          Este produto ainda precisa de confirmação.
        </h1>
        <p className="mt-3 text-ink-500">
          Este link não tem ainda correspondência direta no nosso catálogo. A nossa equipa irá verificar o produto e confirmar o preço final antes do pagamento.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 bg-ink-50 px-4 py-2 rounded-full text-sm text-ink-700 max-w-full overflow-hidden">
          <ExternalLink className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{sp?.url || id}</span>
        </div>
        <div className="mt-8">
          <Link
            href={`/checkout?externalUrl=${encodeURIComponent(sp?.url || "")}&externalId=${id}`}
          >
            <Button size="lg" variant="primary">
              Continuar com pedido
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-xs text-ink-500">
          Ou cola um link diferente:
        </p>
        <div className="mt-4">
          <UrlResolverForm />
        </div>
      </Card>
    </Container>
  );
}
