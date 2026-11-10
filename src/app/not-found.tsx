import Link from "next/link";
import { Container } from "@/components/ui";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <Container className="py-20 md:py-32 text-center">
      <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-primary-600">Erro 404</p>
      <h1 className="apple-headline mt-4 text-ink-900">Página não encontrada.</h1>
      <p className="apple-lead mt-4 max-w-md mx-auto">
        Essa página não existe ou foi movida.
      </p>
      <div className="mt-8">
        <Link href="/">
          <Button size="lg" variant="primary">Voltar ao início</Button>
        </Link>
      </div>
    </Container>
  );
}
