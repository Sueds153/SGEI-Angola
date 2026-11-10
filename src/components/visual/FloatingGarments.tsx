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
    src: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=600&fit=crop&auto=format",
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
    src: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&h=500&fit=crop&auto=format",
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
    src: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=600&fit=crop&auto=format",
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
    src: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400&h=500&fit=crop&auto=format",
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
    src: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=500&h=600&fit=crop&auto=format",
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
    src: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop&auto=format",
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
    src: "https://images.unsplash.com/photo-1551232864-3f0890e580d9?w=500&h=600&fit=crop&auto=format",
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
    src: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=500&fit=crop&auto=format",
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
    src: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=500&h=600&fit=crop&auto=format",
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
    src: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop&auto=format",
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
