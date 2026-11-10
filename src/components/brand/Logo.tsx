"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Logotipo ImportEasy.
 * Marca: "ImportEasy" — "Sua ponte para o mundo"
 * O símbolo é um monograma estilizado "IE" com seta de entrega
 * Cores: preto ou branco consoante a variante.
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
    sm: { box: 24, word: "text-[13px]", tag: "text-[8px]" },
    md: { box: 32, word: "text-[16px]", tag: "text-[9px]" },
    lg: { box: 48, word: "text-xl", tag: "text-xs" },
  } as const;
  const s = sizeMap[size];

  return (
    <Link href={href} className="group inline-flex items-center gap-2">
      <span
        className={cn(
          "relative inline-grid place-items-center rounded-[10px] transition-transform group-hover:scale-105",
          isLight ? "bg-white text-black" : "bg-black text-white"
        )}
        style={{ width: s.box, height: s.box }}
        aria-hidden
      >
        <svg viewBox="0 0 32 32" className="w-full h-full p-2" fill="none">
          {/* Monograma "IE" estilizado com seta de entrega */}
          <path
            d="M10 10 L14 14 M10 14 L14 10"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M18 10 L22 10 M20 8 L22 10 L20 12"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M16 16 L26 26 M23 26 L26 23 L26 29 L29 26"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <div className="leading-none">
        <span
          className={cn(
            "block font-semibold tracking-tight leading-none",
            s.word,
            isLight ? "text-white" : "text-ink-900"
          )}
        >
          ImportEasy
        </span>
        {showTagline && (
          <span
            className={cn(
              "block font-medium uppercase tracking-[0.14em] leading-none mt-0.5",
              s.tag,
              isLight ? "text-white/60" : "text-ink-500"
            )}
          >
            Sua ponte para o mundo
          </span>
        )}
      </div>
    </Link>
  );
}