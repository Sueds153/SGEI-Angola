import { Container } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Reveal, WordReveal } from "@/components/motion";
import { Num, Stamp, Asterisk } from "@/components/brand/Mark";
import { FaqList } from "@/components/help/FaqList";

export const metadata: Metadata = {
  title: "Ajuda / FAQ",
  description: "Perguntas frequentes sobre como funciona a SGEI.",
};

export default function AjudaPage() {
  return (
    <>
      <section className="pt-14 md:pt-24 pb-10 md:pb-16">
        <Container>
          <Reveal>
            <Stamp className="border-ink-900 text-ink-900 mb-8">FAQ</Stamp>
          </Reveal>
          <WordReveal
            as="h1"
            text="Perguntas? Temos respostas."
            className="apple-headline text-ink-900 max-w-3xl"
            stagger={45}
          />
          <Reveal delay={500}>
            <p className="apple-subhead mt-6 text-ink-600 max-w-xl">
              Se a tua pergunta não estiver aqui, fala connosco no WhatsApp — respondemos em horário local.
            </p>
          </Reveal>
        </Container>
      </section>

      <section className="pb-20 md:pb-28">
        <Container>
          <FaqList />
        </Container>
      </section>

      <section className="pb-24 md:pb-32">
        <Container>
          <Reveal blur amount={24}>
            <div className="relative rounded-[32px] md:rounded-[48px] bg-black text-white p-10 md:p-16 overflow-hidden">
              <div className="absolute top-8 right-8 text-white/30"><Asterisk size={40} /></div>
              <h2 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.05] max-w-2xl">
                Ainda com dúvidas? <span className="italic font-serif font-light">Fala connosco.</span>
              </h2>
              <p className="mt-5 text-white/60 text-lg max-w-lg">
                Atendimento humano em português, em horário de Luanda.
              </p>
              <div className="mt-8">
                <a
                  href="https://wa.me/244923000000"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="bg-white text-black hover:bg-ink-100">
                    <MessageCircle className="h-4 w-4" /> Chamar no WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>
    </>
  );
}
