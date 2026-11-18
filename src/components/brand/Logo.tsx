"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logotipo ImportEasy.
 * Marca: "ImportEasy" — "Sua ponte para o mundo"
 *
 * O ficheiro /logo.png é quadrado, com fundo transparente e sem margens mortas.
 * O ícone nunca é cortado: usa object-contain e o fundo branco só aparece no
 * tema escuro (footer e admin), onde o azul-escuro do globo perderia contraste.
 */
export function Logo({
  variant = "dark",
  size = "md",
  showTagline = false,
  href = "/",
}: {
  variant?: "dark" | "light";
  size?: "sm" | "md" | "lg";
  showTagline?: boolean;
  href?: string;
}) {
  const isLight = variant === "light";
  const sizeMap = {
    sm: { box: 36, word: "text-[15px]", tag: "text-[8px]", gap: "gap-2" },
    md: { box: 44, word: "text-[19px]", tag: "text-[9px]", gap: "gap-2.5" },
    lg: { box: 60, word: "text-[24px]", tag: "text-[10px]", gap: "gap-3" },
  } as const;
  const s = sizeMap[size];

  return (
    <Link href={href} className={cn("group inline-flex items-center", s.gap)}>
      <span
        className={cn(
          "relative inline-flex shrink-0 items-center justify-center transition-transform group-hover:scale-105",
          isLight ? "rounded-xl bg-white p-1 shadow-sm ring-1 ring-white/10" : "rounded-lg"
        )}
        style={{ width: s.box, height: s.box }}
      >
        <Image
          src="/logo.png"
          alt=""
          width={512}
          height={512}
          sizes={`${s.box}px`}
          className="h-full w-full object-contain"
          priority={size === "md" || size === "lg"}
        />
      </span>
      <span className="leading-none">
        <span
          className={cn(
            "block font-semibold tracking-tight leading-none",
            s.word,
            isLight ? "text-white" : "text-ink-900"
          )}
        >
          Import
          <span className={isLight ? "text-brand-400" : "text-brand-600"}>Easy</span>
        </span>
        {showTagline && (
          <span
            className={cn(
              "block font-medium uppercase tracking-[0.14em] leading-none mt-1",
              s.tag,
              isLight ? "text-white/70" : "text-ink-500"
            )}
          >
            Sua ponte para o mundo
          </span>
        )}
      </span>
    </Link>
  );
}
