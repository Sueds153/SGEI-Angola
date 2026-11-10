import { Container, Card } from "@/components/ui";
import { OrderLookupForm } from "@/components/order/OrderLookupForm";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Meus pedidos",
  description: "Consulta os teus pedidos na SGEI.",
};

export default function MeusPedidosPage() {
  return (
    <Container className="py-8 md:py-12 max-w-3xl">
      <nav className="text-xs text-ink-500 mb-4">
        <Link href="/" className="hover:text-primary-600">Início</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink-700">Meus pedidos</span>
      </nav>
      <h1 className="text-3xl md:text-4xl font-bold text-ink-900">Meus pedidos</h1>
      <p className="mt-2 text-ink-600">
        Consulta o estado do teu pedido usando a referência ou o teu número de telefone.
      </p>

      <Card className="mt-6 p-5 md:p-7">
        <OrderLookupForm />
      </Card>
    </Container>
  );
}
