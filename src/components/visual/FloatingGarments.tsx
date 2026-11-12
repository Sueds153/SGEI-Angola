"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Peças de roupa/acessórios a flutuar em parallax.
 * Muito subtis: baixa opacidade, blur, tons neutros.
 * Sem interação (pointer-events: none). Em mobile são escondidas ou mostradas poucas peças.
 */

interface Piece {
  src: string;
  alt: string;
  /** posição top em % */
  top: string;
  /** posição left em % */
  left: string;
  width: number;
  rotate: number;
  opacity: number;
  blur: number;
  speed: number; // parallax speed
  mobileHide?: boolean;
  rounded?: string;
}

const LIGHT_PIECES: Piece[] = [
  {
    src: "/images/fg-01.jpg",
    alt: "Ténis branco",
    top: "12%",
    left: "-3%",
    width: 220,
    rotate: -18,
    opacity: 0.11,
    blur: 1.5,
    speed: 0.14,
  },
  {
    src: "/images/fg-02.jpg",
    alt: "Mala",
    top: "6%",
    right: "-2%",
    left: "auto",
    width: 200,
    rotate: 14,
    opacity: 0.10,
    blur: 2,
    speed: -0.10,
  } as any,
  {
    src: "/images/fg-03.jpg",
    alt: "Vestido",
    top: "55%",
    left: "-4%",
    width: 260,
    rotate: 8,
    opacity: 0.07,
    blur: 3,
    speed: 0.08,
    mobileHide: true,
  },
  {
    src: "/images/fg-04.jpg",
    alt: "Óculos de sol",
    top: "40%",
    right: "2%",
    left: "auto",
    width: 180,
    rotate: -12,
    opacity: 0.12,
    blur: 0.5,
    speed: -0.18,
  },
  {
    src: "/images/fg-05.jpg",
    alt: "Casaco",
    top: "78%",
    left: "40%",
    width: 230,
    rotate: -4,
    opacity: 0.07,
    blur: 4,
    speed: 0.06,
    mobileHide: true,
  },
  {
    src: "/images/fg-06.jpg",
    alt: "Relógio",
    top: "8%",
    left: "36%",
    width: 130,
    rotate: 22,
    opacity: 0.08,
    blur: 1,
    speed: 0.20,
    mobileHide: true,
  },
];

const DARK_PIECES: Piece[] = [
  {
    src: "/images/fg-07.jpg",
    alt: "Sapatilhas",
    top: "-5%",
    left: "-3%",
    width: 260,
    rotate: -22,
    opacity: 0.12,
    blur: 2,
    speed: 0.10,
  },
  {
    src: "/images/fg-08.jpg",
    alt: "Mala de mão",
    top: "8%",
    right: "-3%",
    left: "auto",
    width: 200,
    rotate: 18,
    opacity: 0.14,
    blur: 1,
    speed: -0.12,
  } as any,
  {
    src: "/images/fg-09.jpg",
    alt: "Óculos",
    top: "70%",
    right: "-2%",
    left: "auto",
    width: 200,
    rotate: -10,
    opacity: 0.14,
    blur: 1.5,
    speed: -0.08,
    mobileHide: true,
  } as any,
  {
    src: "/images/fg-10.jpg",
    alt: "Vestido fluido",
    top: "60%",
    left: "-4%",
    width: 240,
    rotate: 12,
    opacity: 0.09,
    blur: 3,
    speed: 0.08,
    mobileHide: true,
  },
];

export function FloatingGarments({
  variant = "light",
}: {
  variant?: "light" | "dark";
}) {
  const pieces = variant === "dark" ? DARK_PIECES : LIGHT_PIECES;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [offsets, setOffsets] = useState<number[]>(() => pieces.map(() => 0));

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    let raf = 0;
    function update() {
      const vh = window.innerHeight;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) {
        raf = 0;
        return;
      }
      // Progresso em relação ao centro do container
      const center = rect.top + rect.height / 2;
      const dist = center - vh / 2;
      setOffsets(pieces.map((p) => -dist * p.speed));
      raf = requestAnimationFrame(update);
    }
    raf = requestAnimationFrame(update);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isMobile]);

  const visiblePieces = pieces.filter((p) => !(isMobile && p.mobileHide));

  return (
    <div
      ref={containerRef}
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {visiblePieces.map((p, i) => {
        const offset = offsets[i] || 0;
        return (
          <img
            key={i}
            src={p.src}
            alt=""
            className={cn(
              "absolute select-none object-cover will-change-transform",
              p.rounded || "rounded-[28px]"
            )}
            style={{
              top: p.top,
              left: (p as any).left,
              right: (p as any).right,
              width: isMobile ? p.width * 0.7 : p.width,
              maxWidth: "40vw",
              opacity: p.opacity,
              filter: `blur(${p.blur}px) saturate(0.8)`,
              transform: `translate3d(0, ${offset}px, 0) rotate(${p.rotate}deg)`,
              mixBlendMode: variant === "dark" ? "screen" : "multiply",
            }}
          />
        );
      })}
    </div>
  );
}
