import { Container } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Como funciona",
  description: "Descobre como pedir produtos da SHEIN, AliExpress e Vinted para Angola.",
};

const steps = [
  {
    number: "01",
    title: "Escolhe o artigo",
    body: "Encontra o que procuras na SHEIN, AliExpress ou Vinted e copia o link do artigo.",
  },
  {
    number: "02",
    title: "Envia o link",
    body: "Cola o link no simulador para receberes uma estimativa em kwanzas.",
  },
  {
    number: "03",
    title: "Revê o valor e decide",
    body: "Confirmamos o artigo, a disponibilidade e o valor total. Só avanças se concordares com as condições e o pagamento.",
  },
  {
    number: "04",
    title: "Recebe em Angola",
    body: "Depois da confirmação e do pagamento, tratamos da compra e do envio para a tua morada, conforme a cobertura disponível.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <>
      <section className="py-10 sm:py-14 md:py-20">
        <Container>
          <h1 className="max-w-3xl text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-ink-950">
            Como funciona a importação
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-ink-600">
            Envia-nos o link. Confirmamos o artigo e o valor total antes de pagares.
          </p>
        </Container>
      </section>

      <section className="pb-12 sm:pb-16" aria-label="Etapas da importação">
        <Container>
          <ol className="border-t border-ink-200">
            {steps.map((step) => (
              <li
                key={step.number}
                className="grid grid-cols-[2.5rem_minmax(0,1fr)] sm:grid-cols-[3.5rem_minmax(0,1fr)] gap-x-3 sm:gap-x-6 border-b border-ink-200 py-6 sm:py-8"
              >
                <span className="pt-1 text-sm font-semibold tabular-nums text-brand-700" aria-hidden="true">
                  {step.number}
                </span>
                <div>
                  <h2 className="text-xl sm:text-2xl font-semibold leading-snug text-ink-950">
                    {step.title}
                  </h2>
                  <p className="mt-2 max-w-2xl text-sm sm:text-base leading-relaxed text-ink-600">
                    {step.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="pb-14 sm:pb-20">
        <Container>
          <div className="flex flex-col items-start justify-between gap-4 border-t border-ink-200 pt-7 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold text-ink-950">Já encontraste o artigo?</h2>
              <p className="mt-1 text-sm text-ink-600">Cola o link e consulta a estimativa em kwanzas.</p>
            </div>
            <Link href="/importar">
              <Button size="lg">
                Simular importação <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
