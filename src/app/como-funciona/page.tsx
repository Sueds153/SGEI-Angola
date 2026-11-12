import { Container } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, WordReveal } from "@/components/motion";
import { Num, Asterisk, Stamp, Squiggle } from "@/components/brand/Mark";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Como funciona",
  description: "Descubra como é fácil importar da Shein, AliExpress e Vinted através da ImportEasy.",
};

const steps = [
  {
    n: "01",
    kicker: "Encontra",
    title: "Escolha o produto.",
    body: "Navegue no site ou app da Shein, AliExpress ou Vinted. Quando encontrar o artigo pretendido, basta copiar o link da página.",
  },
  {
    n: "02",
    kicker: "Simula",
    title: "Cole no simulador.",
    body: "Cole o link no nosso simulador de importação ou selecione um dos produtos em destaque no nosso catálogo de sugestões.",
  },
  {
    n: "03",
    kicker: "Preço & Pagamento",
    title: "Pague em Kwanzas.",
    body: "Calculamos o preço final transparente em Kz (produto, câmbio, transporte e alfândega). Pague via Multicaixa Express (929 423 278) ou Referência (Entidade: 10116).",
  },
  {
    n: "04",
    kicker: "Recebe",
    title: "Nós tratamos de tudo.",
    body: "Compramos ao fornecedor internacional, tratamos do envio aéreo, desalfandegamento e entregamos na sua morada em Luanda ou províncias.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <>
      <section className="pt-14 md:pt-24 pb-10 md:pb-20">
        <Container>
          <Reveal>
            <div className="flex items-center gap-3 mb-8">
              <Stamp className="border-ink-900 text-ink-900">How-to</Stamp>
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-500">
                4 passos
              </span>
            </div>
          </Reveal>

          <WordReveal
            as="h1"
            text="Como funciona."
            className="apple-headline text-ink-900"
            stagger={45}
          />

          <Reveal delay={500}>
            <p className="apple-subhead mt-6 text-ink-600 max-w-xl">
              Tu escolhes. Nós tratamos do resto. Sem cartão internacional, sem stress com alfândega.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="pb-24 md:pb-32">
        <Container>
          <div className="space-y-0 md:space-y-0">
            {steps.map((s, i) => (
              <Reveal key={i} amount={40} blur>
                <div className="grid md:grid-cols-12 gap-6 md:gap-10 py-12 md:py-16 border-t border-ink-200 first:border-t-0">
                  <div className="md:col-span-3">
                    <Num n={s.n} className="text-ink-900/10" />
                  </div>
                  <div className="md:col-span-7">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-primary-600">
                        {s.kicker}
                      </span>
                      {i < steps.length - 1 && <span className="h-px flex-1 bg-ink-200" />}
                    </div>
                    <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-ink-900 leading-[1.05]">
                      {s.title}
                    </h2>
                    <p className="mt-5 text-[17px] text-ink-600 leading-relaxed max-w-2xl">{s.body}</p>
                  </div>
                  <div className="md:col-span-2 flex md:justify-end items-start">
                    <Asterisk className="text-ink-200" size={32} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section className="pb-24 md:pb-32">
        <Container>
          <Reveal blur amount={20}>
            <div className="relative rounded-[32px] md:rounded-[48px] bg-black text-white p-10 md:p-20 overflow-hidden">
              <div className="absolute top-10 right-10 text-white/30"><Asterisk size={48} /></div>
              <div className="absolute bottom-10 left-10 text-white/30 rotate-[-8deg]">
                <Stamp className="border-white/40 text-white/70 text-[9px]">ImportEasy · AO</Stamp>
              </div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">
                Pronto para começar?
              </p>
              <h2 className="text-4xl md:text-6xl font-semibold tracking-[-0.03em] mt-6 leading-[1.02] max-w-3xl">
                Cole um link.
                <br />
                <span className="italic font-serif font-light">Nós fazemos o resto.</span>
              </h2>
              <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <Link href="/">
                  <Button variant="primary" size="lg" className="bg-white text-black hover:bg-ink-100">
                    Ir para o início <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/produtos">
                  <Button variant="ghost" className="text-white hover:bg-white/10" size="lg">
                    Ver produtos em destaque
                  </Button>
                </Link>
              </div>
              <div className="mt-10">
                <Squiggle className="text-white/30 w-32 h-8" />
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
