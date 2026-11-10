"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Scroll horizontal touch-friendly com scroll-snap.
 * Suporta wheel vertical → scroll horizontal no desktop.
 */
export function HorizontalScroller({
  children,
  className = "",
  showArrows = true,
}: {
  children: React.ReactNode;
  className?: string;
  showArrows?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);

  function scroll(dir: -1 | 1) {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.min(el.clientWidth * 0.8, 480), behavior: "smooth" });
  }

  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    // Se o wheel for maioritariamente vertical, converte em horizontal
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }

  return (
    <div className="relative group">
      <div
        ref={ref}
        onWheel={onWheel}
        className={
          "flex gap-3 md:gap-5 overflow-x-auto snap-x snap-mandatory no-scrollbar pb-3 -mx-2 px-2 " +
          className
        }
        style={{
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        {children}
      </div>
      {showArrows && (
        <>
          <button
            onClick={() => scroll(-1)}
            aria-label="Anterior"
            className="hidden md:grid opacity-0 group-hover:opacity-100 transition place-items-center absolute top-1/2 -translate-y-1/2 -left-4 h-10 w-10 rounded-full bg-white/95 backdrop-blur shadow-md ring-1 ring-ink-200 hover:bg-white"
          >
            <ChevronLeft className="h-4 w-4 text-ink-900" />
          </button>
          <button
            onClick={() => scroll(1)}
            aria-label="Próximo"
            className="hidden md:grid opacity-0 group-hover:opacity-100 transition place-items-center absolute top-1/2 -translate-y-1/2 -right-4 h-10 w-10 rounded-full bg-white/95 backdrop-blur shadow-md ring-1 ring-ink-200 hover:bg-white"
          >
            <ChevronRight className="h-4 w-4 text-ink-900" />
          </button>
        </>
      )}
    </div>
  );
}
