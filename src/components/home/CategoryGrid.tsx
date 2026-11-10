import Link from "next/link";
import { Shirt, Baby, Footprints, Handbag, Watch, Sparkles, Home, Package } from "lucide-react";
import { Reveal } from "@/components/motion";

const CATEGORIES = [
  { name: "Feminino", slug: "vestuario-feminino", icon: Shirt },
  { name: "Masculino", slug: "vestuario-masculino", icon: Shirt },
  { name: "Crianças", slug: "criancas", icon: Baby },
  { name: "Calçados", slug: "calcados", icon: Footprints },
  { name: "Bolsas", slug: "bolsas", icon: Handbag },
  { name: "Acessórios", slug: "acessorios", icon: Watch },
  { name: "Beleza", slug: "beleza", icon: Sparkles },
  { name: "Casa", slug: "casa", icon: Home },
];

export function CategoryGrid({ variant = "default" }: { variant?: "default" | "compact" }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-9 gap-2 sm:gap-3 md:gap-4">
      {CATEGORIES.map((c, idx) => {
        const Icon = c.icon;
        return (
          <Reveal key={c.slug} delay={idx * 40} amount={14} direction="up">
            <Link
              href={`/categoria/${c.slug}`}
              className="group block rounded-2xl bg-white ring-1 ring-ink-200/60 p-3 sm:p-4 md:p-5 text-center hover:ring-ink-900 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="h-10 w-10 sm:h-12 sm:w-12 mx-auto rounded-xl sm:rounded-2xl bg-ink-900 text-white grid place-items-center group-hover:bg-primary-600 transition">
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <p className="mt-2 sm:mt-3 text-[12px] sm:text-[13px] md:text-sm font-medium text-ink-900 leading-tight">
                {c.name}
              </p>
            </Link>
          </Reveal>
        );
      })}
      <Reveal delay={CATEGORIES.length * 40}>
        <Link
          href="/catalogo"
          className="group block rounded-2xl bg-black text-white p-3 sm:p-4 md:p-5 text-center hover:bg-primary-600 transition-colors h-full flex flex-col items-center justify-center"
        >
          <div className="h-10 w-10 sm:h-12 sm:w-12 mx-auto rounded-xl sm:rounded-2xl bg-white/10 grid place-items-center">
            <Package className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <p className="mt-2 sm:mt-3 text-[12px] sm:text-[13px] md:text-sm font-semibold leading-tight">
            Ver tudo
          </p>
        </Link>
      </Reveal>
    </div>
  );
}
