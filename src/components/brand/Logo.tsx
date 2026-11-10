"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Logotipo SGEI.
 * Marca: "SGEI" — Compra e entrega SHEIN em Angola.
 * O símbolo é um monograma estilizado "S" com um traço que evoca simultaneamente:
 * - um percurso / caminho / arrow de entrega
 * - o canto de uma embalagem (package)
 * - a vibe "app-icon" minimalista (cantos arredondados)
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
    sm: { box: 24, word: "text-[15px]", tag: "text-[9px]" },
    md: { box: 32, word: "text-[17px]", tag: "text-[10px]" },
    lg: { box: 48, word: "text-2xl", tag: "text-xs" },
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
        <svg viewBox="0 0 32 32" className="w-full h-full p-1.5" fill="none">
          {/* Monograma "S" estilizado como caminho/entrega */}
          <path
            d="M22.5 8.5 C 17.5 4.5, 10 6, 8 11 C 6.7 14.2, 8.8 16.4, 12 17.8 C 15.5 19.3, 21 19.5, 23 24 C 24.2 26.9, 22.4 29, 19 29.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <circle cx="22.2" cy="7.5" r="1.8" fill="currentColor" />
          <path d="M14 26 L 19 29.5 L 24 26" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
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
          SGEI
        </span>
        {showTagline && (
          <span
            className={cn(
              "block font-medium uppercase tracking-[0.14em] leading-none mt-0.5",
              s.tag,
              isLight ? "text-white/60" : "text-ink-500"
            )}
          >
            Shein · Angola
          </span>
        )}
      </div>
    </Link>
  );
}
