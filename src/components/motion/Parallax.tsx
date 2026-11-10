"use client";

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";
import type { JSX } from "react";
import { cn } from "@/lib/utils";

/**
 * Parallax translate-y suave. Desativado em mobile para evitar jank.
 */
export function Parallax({
  children,
  speed = 0.2,
  className,
  style,
  as: Tag = "div",
  maxOffset = 120,
}: {
  children: ReactNode;
  speed?: number;
  className?: string;
  style?: CSSProperties;
  as?: keyof JSX.IntrinsicElements;
  maxOffset?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    // Desativa parallax em ecrãs pequenos ou reduced motion
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    if (reduced || mobile) return;

    let raf = 0;
    function update() {
      const el = ref.current;
      if (!el) {
        raf = 0;
        return;
      }
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const center = rect.top + rect.height / 2;
      const distFromCenter = center - vh / 2;
      let o = -distFromCenter * speed;
      o = Math.max(-maxOffset, Math.min(maxOffset, o));
      setOffset(o);
      raf = 0;
    }
    function onScroll() {
      if (raf) return;
      raf = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [speed, maxOffset]);

  const Component: any = Tag;
  return (
    <Component
      ref={ref as any}
      className={cn("will-change-transform", className)}
      style={{
        ...style,
        transform: offset !== 0 ? `translate3d(0, ${offset}px, 0)` : undefined,
      }}
    >
      {children}
    </Component>
  );
}

/**
 * Sticky reveal: coluna esquerda sticky em desktop, empilhado em mobile.
 */
export function StickySection({
  left,
  right,
}: {
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <section className="relative">
      <div className="grid md:grid-cols-2 gap-0 md:gap-16">
        <div className="hidden md:block">
          <div className="sticky top-28 h-[calc(100vh-120px)] flex items-center">
            {left}
          </div>
        </div>
        {/* Mobile: bloco empilhado no topo do sticky */}
        <div className="block md:hidden mb-10">{left}</div>
        <div className="py-4 md:py-24 space-y-20 md:space-y-32">{right}</div>
      </div>
    </section>
  );
}
