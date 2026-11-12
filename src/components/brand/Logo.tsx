"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * Logotipo ImportEasy.
 * Marca: "ImportEasy" — "Sua ponte para o mundo"
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
    sm: { box: 28, word: "text-[13px]", tag: "text-[8px]" },
    md: { box: 36, word: "text-[16px]", tag: "text-[9px]" },
    lg: { box: 52, word: "text-xl", tag: "text-xs" },
  } as const;
  const s = sizeMap[size];

  return (
    <Link href={href} className="group inline-flex items-center gap-2.5">
      <span
        className={cn(
          "relative inline-flex items-center justify-center overflow-hidden rounded-xl transition-transform group-hover:scale-105",
          isLight ? "ring-1 ring-white/20" : "ring-1 ring-black/10"
        )}
        style={{ width: s.box, height: s.box }}
      >
        <Image
          src="/logo.png"
          alt="ImportEasy"
          fill
          sizes={`${s.box}px`}
          className="object-contain"
          priority={size === "md" || size === "lg"}
        />
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
              isLight ? "text-white/70" : "text-ink-500"
            )}
          >
            Sua ponte para o mundo
          </span>
        )}
      </div>
    </Link>
  );
}