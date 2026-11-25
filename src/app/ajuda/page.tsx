import { Container } from "@/components/ui";
import { Button } from "@/components/ui/Button";
import { MessageCircle } from "lucide-react";
import type { Metadata } from "next";
import { FaqList } from "@/components/help/FaqList";

export const metadata: Metadata = {
  title: "Ajuda / FAQ",
  description: "Respostas às perguntas mais frequentes sobre pedidos, pagamentos e entregas.",
};

export default function AjudaPage() {
  return (
    <>
      <section className="py-10 sm:py-14 md:py-20">
        <Container>
          <h1 className="max-w-3xl text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-ink-950">
            Perguntas frequentes
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg leading-relaxed text-ink-600">
            Encontra respostas sobre pedidos, pagamentos e entregas. Se precisares, a equipa atende-te no WhatsApp durante o horário de Luanda.
          </p>
        </Container>
      </section>

      <section className="pb-12 sm:pb-16" aria-label="Perguntas e respostas">
        <Container>
          <FaqList />
        </Container>
      </section>

      <section className="pb-14 sm:pb-20">
        <Container>
          <div className="flex flex-col items-start justify-between gap-4 border-t border-ink-200 pt-7 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-semibold text-ink-950">Ainda precisas de ajuda?</h2>
              <p className="mt-1 text-sm text-ink-600">Fala com a equipa de apoio em português.</p>
            </div>
            <a
              href="https://wa.me/244922058136?text=Ol%C3%A1%20ImportEasy!%20Gostaria%20de%20tirar%20uma%20d%C3%BAvida."
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="lg">
                <MessageCircle className="h-4 w-4" /> Falar no WhatsApp
              </Button>
            </a>
          </div>
        </Container>
      </section>
    </>
  );
}
