"use client";

/**
 * Conjunto de símbolos/marcas autorais em SVG que substituem os ícones de "template SAAS".
 * Traço mais ousado, imperfeito e com personalidade — estilo editorial / estúdio.
 */

export function BadgeDot({ color = "#ff3b2f" }: { color?: string }) {
  return (
    <span className="inline-block relative" aria-hidden>
      <span
        className="inline-block h-2 w-2 rounded-full"
        style={{ background: color, boxShadow: `0 0 0 4px ${color}22` }}
      />
    </span>
  );
}

/** Selo circular estilo "app icon" / emblem — usado no hero */
export function Seal({
  children,
  className = "",
  tone = "dark",
}: {
  children?: React.ReactNode;
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <span
      className={
        "relative inline-flex items-center justify-center " +
        (tone === "dark" ? "text-ink-900 " : "text-white ") +
        className
      }
    >
      <svg
        viewBox="0 0 64 64"
        className="h-10 w-10 absolute"
        fill="none"
        stroke={tone === "dark" ? "#1d1d1f" : "#ffffff"}
        strokeWidth="1.2"
      >
        <circle cx="32" cy="32" r="30" strokeDasharray="2 4" />
      </svg>
      <span className="text-[10px] font-mono uppercase tracking-widest">
        {children || "AO"}
      </span>
    </span>
  );
}

/** Asterisco expressivo (tipo editorial Apple/Espinhas) */
export function Asterisk({ className = "", size = 28 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    >
      <path d="M12 2v20M2 12h20M4.5 4.5l15 15M19.5 4.5l-15 15" />
    </svg>
  );
}

/** Manuscrito "→" flexível */
export function Squiggle({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      <path d="M2 12c12-14 32 16 70 0" />
      <path d="M88 8l10 4-10 4" />
    </svg>
  );
}

/** Número grande em display (para feature cards numerados) */
export function Num({ n, className = "" }: { n: string; className?: string }) {
  return (
    <span
      className={
        "font-mono text-[56px] leading-none font-light tracking-tight " + className
      }
    >
      {n}
    </span>
  );
}

/** Glitch dot */
export function Dot({ color = "#1d1d1f", size = 10, className = "" }: { color?: string; size?: number; className?: string }) {
  return (
    <span
      className={"inline-block rounded-full " + className}
      style={{ width: size, height: size, background: color }}
      aria-hidden
    />
  );
}

/** Um "selo de carimbo" pequeno em forma de retângulo distorcido */
export function Stamp({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={
        "inline-block rotate-[-4deg] border border-current px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest " +
        className
      }
    >
      {children}
    </span>
  );
}

/** Barra inclinada decorativa */
export function Slash({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 10 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M8 2 2 22" />
    </svg>
  );
}

/** Três dots usados como elemento decorativo (ex: "..." ) */
export function Dots({ className = "" }: { className?: string }) {
  return (
    <span className={"inline-flex gap-[3px] items-center " + className} aria-hidden>
      <Dot size={4} />
      <Dot size={4} />
      <Dot size={4} />
    </span>
  );
}

/** Checkmark mais ousado, não Lucide padrão */
export function Mark({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12.5l5 5L20 6" />
    </svg>
  );
}

/** Corazão? seta? — Um risco curto */
export function Strike({ className = "", length = 20 }: { className?: string; length?: number }) {
  return (
    <svg
      width={length}
      height="6"
      viewBox="0 0 20 6"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden
    >
      <path d="M1 3h18" />
    </svg>
  );
}
