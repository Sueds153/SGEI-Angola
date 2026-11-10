import { Container, Card } from "@/components/ui";
import { AccountForms } from "@/components/account/AccountForms";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "A minha conta",
};

export default function ContaPage() {
  return (
    <Container className="py-8 md:py-12 max-w-md">
      <nav className="text-xs text-ink-500 mb-4">
        <Link href="/" className="hover:text-primary-600">Início</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink-700">Conta</span>
      </nav>
      <h1 className="text-3xl font-bold text-ink-900">A minha conta</h1>
      <p className="mt-2 text-ink-600 text-sm">
        Inicia sessão para veres os teus pedidos.
      </p>
      <Card className="mt-6 p-6">
        <AccountForms />
      </Card>
    </Container>
  );
}
