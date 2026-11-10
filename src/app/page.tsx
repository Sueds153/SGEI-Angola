import Link from "next/link";
import {
  Search,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { Marquee } from "@/components/motion";
import { FloatingGarments } from "@/components/visual/FloatingGarments";
import { Container } from "@/components/ui";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { Suspense } from "react";
import { getActiveProvider } from "@/lib/providers";
import { UrlResolverForm } from "@/components/home/UrlResolverForm";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import { Reveal, WordReveal, Parallax, StickySection, HorizontalScroller } from "@/components/motion";
import { Asterisk, Dot, Num, Mark, Slash, Squiggle, Stamp } from "@/components/brand/Mark";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const provider = await getActiveProvider();
  const featured = await provider.getFeaturedProducts(8);

  return (
    <>
      {/* ========================================= HERO ========================================= */}
      <section className="relative bg-white overflow-x-clip pt-12 sm:pt-14 md:pt-24 pb-16 md:pb-32">
        {/* Peças de roupa a flutuar no fundo */}
        <FloatingGarments variant="light" />
        {/* Ruído + blobs abstratos */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.35]">
          <svg className="absolute top-20 right-0 h-[520px] w-[520px] text-black" viewBox="0 0 500 500" fill="none">
            <circle cx="350" cy="140" r="120" fill="currentColor" fillOpacity="0.04" />
            <circle cx="440" cy="260" r="200" fill="currentColor" fillOpacity="0.03" />
            <circle cx="340" cy="380" r="70" fill="#ff3b2f" fillOpacity="0.08" />
          </svg>
          <svg className="absolute bottom-0 left-0 h-[420px] w-[420px] text-black" viewBox="0 0 500 500" fill="none">
            <path d="M-20 300 Q 180 180 260 320 T 520 280" stroke="currentColor" strokeOpacity="0.08" strokeWidth="1.2" fill="none" />
            <path d="M-20 360 Q 200 260 280 400 T 560 380" stroke="currentColor" strokeOpacity="0.06" strokeWidth="1" fill="none" />
          </svg>
        </div>

        <Container className="relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <Reveal delay={50} duration={700} amount={30} blur>
              <span className="inline-flex items-center gap-3 px-4 py-1.5 text-[11px] font-mono uppercase tracking-[0.2em] text-ink-900">
                <span className="inline-flex h-5 items-center">
                  <Stamp className="border-ink-900 text-ink-900">Novo</Stamp>
                </span>
                <Slash className="h-3 w-3 text-ink-300" />
                <span>SHEIN → Angola</span>
              </span>
            </Reveal>

            <WordReveal
              as="h1"
              text="Queres comprar na SHEIN?"
              className="apple-headline mt-8 text-ink-900"
              stagger={50}
            />

            <Reveal delay={650} amount={20} blur>
              <p className="mt-6 md:mt-8 text-3xl md:text-5xl font-semibold tracking-[-0.03em] leading-[1.05] text-ink-900">
                Nós tratamos <span className="italic font-serif font-normal">do resto.</span>
              </p>
            </Reveal>

            <Reveal delay={900} amount={18} blur>
              <p className="apple-subhead mt-6 text-ink-500 max-w-xl mx-auto">
                Encontra o produto, vê o preço em <strong className="text-ink-900 not-italic">Kwanzas</strong>,
                paga localmente e acompanha a entrega até tua casa.
                <br className="hidden md:block" />
                Sem cartão internacional, sem stress.
              </p>
            </Reveal>

            {/* Search */}
            <Reveal delay={1050} duration={800} amount={24} blur>
              <form action="/pesquisa" method="get" className="mt-12 max-w-2xl mx-auto">
                <label className="flex items-center gap-3 bg-ink-100 rounded-full px-5 py-1.5 transition focus-within:bg-white focus-within:ring-2 focus-within:ring-black/5">
                  <Search className="h-5 w-5 text-ink-500 flex-shrink-0" />
                  <input
                    type="search"
                    name="q"
                    placeholder="Procurar vestido, ténis, acessórios…"
                    className="flex-1 bg-transparent text-[16px] md:text-[17px] outline-none py-3 placeholder:text-ink-400"
                  />
                  <button
                    type="submit"
                    className="rounded-full bg-ink-900 text-white px-6 py-2.5 text-sm font-medium hover:bg-black transition inline-flex items-center gap-2"
                  >
                    Pesquisar <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </label>
              </form>
            </Reveal>

            <Reveal delay={1200}>
              <div className="mt-8 flex items-center justify-center gap-6 max-w-sm mx-auto">
                <span className="h-px bg-ink-200 flex-1" />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-400">
                  cola o link
                </span>
                <span className="h-px bg-ink-200 flex-1" />
              </div>
            </Reveal>

            <Reveal delay={1300} blur amount={18}>
              <div className="mt-5 max-w-2xl mx-auto">
                <UrlResolverForm variant="hero" />
              </div>
            </Reveal>

            {/* Trust marks — nada de checkmarks, texto + dots + tipografia */}
            <Reveal delay={1500}>
              <div className="mt-12 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] font-mono uppercase tracking-widest text-ink-500">
                <span>Preço em Kz</span>
                <Dot size={3} className="bg-ink-900" />
                <span>Entrega em Angola</span>
                <Dot size={3} className="bg-ink-900" />
                <span>Sem cartão internacional</span>
              </div>
            </Reveal>
          </div>

          {/* Grelha de imagens com parallax */}
          <div className="mt-14 md:mt-28 grid grid-cols-2 md:grid-cols-12 gap-2 md:gap-4 max-w-6xl mx-auto overflow-x-clip">
            <Parallax
              speed={-0.12}
              className="col-span-2 md:col-span-5 md:row-span-2 aspect-[3/4] md:aspect-[3/5] rounded-[24px] md:rounded-3xl overflow-hidden bg-ink-100"
              as="div"
            >
              <img
                src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&h=1400&fit=crop"
                alt=""
                loading="eager"
                className="w-full h-full object-cover"
              />
            </Parallax>

            <div className="col-span-2 md:col-span-7 grid grid-cols-2 gap-2 md:gap-4">
              <Parallax speed={0.08} className="col-span-1 aspect-[3/4] rounded-[24px] md:rounded-3xl overflow-hidden bg-ink-100" as="div">
                <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&h=800&fit=crop" alt="" loading="eager" className="w-full h-full object-cover" />
              </Parallax>
              <Parallax speed={-0.09} className="col-span-1 aspect-[3/4] rounded-[24px] md:rounded-3xl overflow-hidden bg-ink-100" as="div">
                <img src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop" alt="" loading="eager" className="w-full h-full object-cover" />
              </Parallax>
              <Parallax speed={0.06} className="col-span-1 aspect-[4/5] rounded-[24px] md:rounded-3xl overflow-hidden bg-ink-100" as="div">
                <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=750&fit=crop" alt="" loading="lazy" className="w-full h-full object-cover" />
              </Parallax>
              <Parallax speed={-0.05} className="col-span-1 aspect-[4/5] rounded-[24px] md:rounded-3xl overflow-hidden bg-ink-100" as="div">
                <img src="https://images.unsplash.com/photo-1485462537746-965f33f7f6a7?w=600&h=750&fit=crop" alt="" loading="lazy" className="w-full h-full object-cover" />
              </Parallax>
            </div>
          </div>
        </Container>
      </section>

      {/* ========================================= FRASE IMPACTO ========================================= */}
      <section className="bg-black text-white py-20 md:py-28 relative overflow-hidden">
        <FloatingGarments variant="dark" />
        <Container>
          <div className="max-w-4xl">
            <Reveal blur>
              <div className="flex items-center gap-4">
                <span className="h-px w-14 bg-white/30" />
                <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/60">O processo</span>
              </div>
            </Reveal>
            <WordReveal
              as="h2"
              text="Tu escolhes. Nós tratamos do resto."
              className="text-4xl md:text-7xl font-semibold tracking-[-0.03em] mt-6 leading-[1.02]"
              stagger={55}
            />
          </div>
        </Container>
      </section>

      {/* ========================================= STICKY STEPS ========================================= */}
      <section className="bg-black text-white py-16 md:py-24">
        <Container>
          <StickySection
            left={
              <div className="w-full h-full rounded-3xl overflow-hidden bg-gradient-to-br from-white/5 to-white/0 ring-1 ring-white/10 relative">
                <Parallax speed={0.04} className="absolute inset-0" as="div">
                  <img
                    src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=900&h=1200&fit=crop"
                    alt=""
                    className="w-full h-full object-cover opacity-90 mix-blend-luminosity"
                  />
                </Parallax>
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/70">
                    Figura 01 / Sem stress
                  </span>
                </div>
              </div>
            }
            right={[
              <StepBlock
                key="1"
                n="01"
                kicker="Escolhe"
                title="Encontra o que queres."
                body="Procura no catálogo ou cola o link direto da SHEIN. Mostramos-te variantes, preço e tudo o que precisas para decidir."
              />,
              <StepBlock
                key="2"
                n="02"
                kicker="Preço"
                title="Tudo em Kz, sem surpresas."
                body="Câmbio do dia, taxa de serviço, logística e entrega. Todos os valores visíveis antes de confirmar. Zero custos escondidos."
              />,
              <StepBlock
                key="3"
                n="03"
                kicker="Pagamento"
                title="Paga em Angola."
                body="Transferência, referência ou Express Money. Não precisas de cartão internacional, nem de conta no estrangeiro."
              />,
              <StepBlock
                key="4"
                n="04"
                kicker="Entrega"
                title="Acompanha até à porta."
                body="Recebes atualizações em cada etapa: compra, envio, chegada a Angola, saída para entrega. Até 25 dias úteis."
              />,
            ]}
          />
        </Container>
      </section>

      {/* ========================================= CATEGORIAS ========================================= */}
      <section className="py-20 md:py-28 bg-white">
        <Container>
          <div className="flex items-end justify-between mb-12 gap-4 flex-wrap">
            <Reveal>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Asterisk className="text-primary-600" size={22} />
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-500">
                    Categorias
                  </span>
                </div>
                <h2 className="text-4xl md:text-6xl font-semibold tracking-[-0.03em] text-ink-900 leading-[1.02]">
                  Tudo. <span className="italic font-serif font-normal">Separado</span>
                  <br className="hidden md:block" /> por secções.
                </h2>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200} amount={20}>
            <CategoryGrid variant="default" />
          </Reveal>
        </Container>
      </section>

      {/* ========================================= DESTAQUES SCROLLER ========================================= */}
      <section className="py-20 md:py-28 bg-ink-50">
        <Container>
          <div className="flex items-end justify-between mb-10 gap-4 flex-wrap">
            <Reveal>
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Squiggle className="text-primary-600 w-14 h-6" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-500">Destaques</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-ink-900 leading-[1.02]">
                  Para começar já.
                </h2>
              </div>
            </Reveal>
          </div>

          <Reveal delay={150} blur>
            <HorizontalScroller>
              <Suspense fallback={Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="min-w-[240px] md:min-w-[280px] max-w-[280px]">
                  <ProductCardSkeleton />
                </div>
              ))}>
                {featured.map((p) => (
                  <div key={p.id} className="min-w-[240px] md:min-w-[280px] max-w-[280px]">
                    <ProductCard product={p} />
                  </div>
                ))}
              </Suspense>
            </HorizontalScroller>
          </Reveal>
        </Container>
      </section>

      {/* ========================================= CONFIANÇA ========================================= */}
      <section className="py-20 md:py-28 bg-white">
        <Container>
          <div className="max-w-3xl mb-16">
            <Reveal blur>
              <div className="flex items-center gap-3 mb-4">
                <Stamp className="border-ink-900 text-ink-900">Porquê SGEI</Stamp>
              </div>
            </Reveal>
            <WordReveal
              as="h2"
              text="Compras internacionais, sem stress internacional."
              className="text-4xl md:text-6xl font-semibold tracking-[-0.03em] leading-[1.02]"
              stagger={45}
            />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                n: "01",
                title: "Pagamento local.",
                body: "Em Kwanzas, por transferência, referência ou carteira digital. Para uma empresa angolana com suporte humano.",
              },
              {
                n: "02",
                title: "Entrega em todo o país.",
                body: "Luanda e todas as províncias. Entrega na porta, com morada e ponto de referência.",
              },
              {
                n: "03",
                title: "Sempre a par.",
                body: "Em cada etapa do pedido, há atualização. Sabes exatamente onde está a tua encomenda.",
              },
            ].map((t, i) => (
              <Reveal key={i} delay={i * 120} amount={24} blur>
                <div className="group rounded-3xl border border-ink-200/70 p-8 h-full hover:border-ink-900 hover:bg-white transition-all duration-500">
                  <div className="flex items-start justify-between">
                    <Num n={t.n} className="text-ink-900/10 group-hover:text-primary-600/20 transition-colors" />
                    <Asterisk className="text-ink-300 group-hover:text-primary-600 transition-colors" size={20} />
                  </div>
                  <h3 className="mt-6 text-2xl md:text-3xl font-semibold tracking-tight text-ink-900 leading-[1.1]">
                    {t.title}
                  </h3>
                  <p className="mt-3 text-ink-600 leading-relaxed text-[15px]">{t.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Reveal delay={200}>
              <Link
                href="/catalogo"
                className="rounded-full bg-ink-900 text-white px-8 py-4 text-[15px] font-medium hover:bg-black transition inline-flex items-center gap-2 group"
              >
                Começar a comprar
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </Reveal>
            <Reveal delay={300}>
              <a
                href="https://wa.me/244923000000"
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-white text-ink-900 ring-1 ring-ink-200 px-8 py-4 text-[15px] font-medium hover:bg-ink-50 transition inline-flex items-center gap-2"
              >
                Falar com alguém
              </a>
            </Reveal>
          </div>
        </Container>
      </section>

      {/* ========================================= CTA FINAL ========================================= */}
      <section className="py-20 md:py-28">
        <Container>
          <Reveal blur amount={30}>
            <div className="relative rounded-[32px] md:rounded-[48px] bg-ink-900 text-white p-8 md:p-20 overflow-hidden">
              {/* Textura sutil */}
              <svg
                className="absolute inset-0 w-full h-full opacity-[0.08]"
                viewBox="0 0 800 400"
                fill="none"
                preserveAspectRatio="none"
              >
                <path d="M0 100 Q 200 0 400 100 T 800 80" stroke="white" strokeWidth="1" />
                <path d="M0 200 Q 200 150 400 220 T 800 180" stroke="white" strokeWidth="1" />
                <path d="M0 300 Q 200 320 400 260 T 800 320" stroke="white" strokeWidth="1" />
              </svg>

              <div className="absolute top-8 right-8 text-white/40">
                <Asterisk size={40} />
              </div>
              <div className="absolute bottom-8 left-8 text-white/40 rotate-12">
                <Stamp className="border-white/50 text-white/70 text-[9px]">SGEI · AO</Stamp>
              </div>

              <div className="relative max-w-3xl mx-auto text-center">
                <div className="flex items-center justify-center gap-3 mb-6">
                  <span className="h-px w-10 bg-white/20" />
                  <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-white/60">
                    Já tens o link?
                  </span>
                  <span className="h-px w-10 bg-white/20" />
                </div>
                <h2 className="text-4xl md:text-6xl font-semibold tracking-[-0.03em] leading-[1.05]">
                  Cola aqui.
                  <br />
                  <span className="italic font-serif font-light">Nós tratamos.</span>
                </h2>
                <p className="mt-5 text-white/60 text-lg max-w-xl mx-auto">
                  Calculamos o preço em Kz e podes seguir para pedido em segundos.
                </p>
                <div className="mt-10 max-w-2xl mx-auto">
                  <UrlResolverForm variant="hero-dark" />
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* ========================================= CHEGOU — hero footer ========================================= */}
      <section className="relative bg-black text-white overflow-hidden">
        <FloatingGarments variant="dark" />
        {/* Marquee SHEIN em watermark — MUITO subtil, não confunde */}
        <div className="absolute inset-0 pointer-events-none flex items-center overflow-hidden">
          <div
            className="flex gap-20 whitespace-nowrap marquee-track"
            style={{
              animation: "marquee 60s linear infinite",
              opacity: 0.05,
              fontSize: "clamp(120px, 22vw, 280px)",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              color: "white",
            }}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <span key={i}>SHEIN</span>
            ))}
          </div>
        </div>

        <Container className="relative py-24 md:py-40">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-center">
            <Reveal amount={30} blur>
              <div>
                <Stamp className="border-white/60 text-white/90 mb-8">Entregue</Stamp>
                <h2 className="text-5xl md:text-7xl font-semibold tracking-[-0.04em] leading-[0.95]">
                  Chega
                  <br />
                  <span className="italic font-serif font-light">à tua porta.</span>
                </h2>
                <p className="mt-8 text-white/60 text-lg max-w-lg leading-relaxed">
                  Encomendas de todo o mundo, entregues em Luanda e em todas as províncias
                  de Angola. Tu só escolhes. Nós tratamos do resto.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <Link href="/catalogo">
                    <button className="rounded-full bg-white text-black px-8 py-4 text-[15px] font-medium hover:bg-ink-100 transition inline-flex items-center gap-2">
                      Começar a comprar <ArrowRight className="h-4 w-4" />
                    </button>
                  </Link>
                  <a
                    href="https://wa.me/244923000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[15px] font-medium text-white/80 hover:text-white transition"
                  >
                    <MessageCircle className="h-4 w-4" /> Falar com alguém
                  </a>
                </div>
              </div>
            </Reveal>

            <Reveal delay={200} blur>
              <div className="relative">
                {/* Moldura da foto com estilo editorial */}
                <div className="relative aspect-[4/5] w-full max-w-md md:ml-auto rounded-[32px] overflow-hidden ring-1 ring-white/10 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=900&h=1200&fit=crop"
                    alt="Cliente feliz com a sua encomenda"
                    loading="lazy"
                    className="w-full h-full object-cover grayscale contrast-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between text-white">
                    <div>
                      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/80">
                        Luanda · 2024
                      </p>
                      <p className="text-lg font-medium mt-1">Entrega ao domicílio</p>
                    </div>
                    <div className="h-10 w-10 rounded-full bg-white text-black grid place-items-center">
                      <CheckDouble />
                    </div>
                  </div>
                </div>
                {/* Cartão flutuante */}
                <div className="absolute -bottom-6 -left-4 md:-left-8 bg-white text-ink-900 rounded-2xl shadow-xl p-4 max-w-[240px] hidden sm:block">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-mono text-[10px] uppercase tracking-widest text-ink-500">
                      Pedido SG-14023
                    </span>
                  </div>
                  <p className="text-sm font-medium">Entregue em 18 dias.</p>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>

        {/* Marquee pequeno no fundo com os destinos */}
        <div className="relative border-t border-white/10 py-6 overflow-hidden">
          <Marquee duration={45}>
            {["Luanda", "Benguela", "Huambo", "Lubango", "Cabinda", "Namibe", "Malanje", "Uíge", "Bié", "Cunene"].map((p, i) => (
              <span key={i} className="inline-flex items-center gap-6 font-mono text-[11px] uppercase tracking-[0.2em] text-white/50">
                {p}
                <span className="h-1 w-1 rounded-full bg-white/40" />
              </span>
            ))}
          </Marquee>
        </div>
      </section>
    </>
  );
}

function CheckDouble() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12l5 5L18 6" />
      <path d="M8 12l3 3" />
    </svg>
  );
}

function StepBlock({ n, kicker, title, body }: { n: string; kicker: string; title: string; body: string }) {
  return (
    <Reveal amount={40} blur>
      <div className="md:min-h-[70vh] flex flex-col justify-center py-10 md:py-0">
        <div className="flex items-center gap-4 text-white/50 mb-6">
          <span className="font-mono text-sm">{n}</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em]">{kicker}</span>
        </div>
        <h3 className="text-3xl md:text-5xl font-semibold tracking-[-0.03em] text-white leading-[1.05] max-w-xl">
          {title}
        </h3>
        <p className="mt-5 text-white/60 text-[16px] md:text-lg leading-relaxed max-w-lg">{body}</p>
        <div className="mt-8">
          <span className="inline-block h-px w-24 bg-white/30" />
        </div>
      </div>
    </Reveal>
  );
}
