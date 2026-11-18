"use client";

import Image from "next/image";
import { useState } from "react";

interface ResponsiveImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
  objectFit?: "cover" | "contain" | "fill" | "none" | "scale-down";
  fallbackText?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
}

const FALLBACK_BASE =
  "grid place-items-center bg-ink-100 text-ink-400 text-[11px] font-medium text-center leading-tight px-1";

/**
 * Imagens locais (ex.: /uploads/..., /products/...) passam pelo otimizador do Next.
 * Imagens externas (CDN de marketplaces Vinted, Shein, AliExpress) são servidas
 * diretamente via <img> com referrerPolicy="no-referrer" para contornar proteções
 * anti-hotlink dos CDNs dos fornecedores e evitar erros 400 do otimizador.
 */
function shouldOptimize(src: string) {
  return src.startsWith("/") && !src.startsWith("//");
}

function normalizeImageUrl(url: string): string {
  if (!url) return "";
  let clean = url.trim();
  // Corrigir links protocol-relative (//images1.vinted.net/... -> https://images1.vinted.net/...)
  if (clean.startsWith("//")) {
    clean = `https:${clean}`;
  }
  // Decodificar entidades HTML comuns
  clean = clean.replace(/&amp;/g, "&");
  return clean;
}

export function ResponsiveImage({
  src,
  alt,
  className = "",
  width,
  height,
  sizes,
  priority = false,
  fill = false,
  objectFit = "cover",
  fallbackText = "Imagem indisponível",
  referrerPolicy = "no-referrer",
}: ResponsiveImageProps) {
  const [failed, setFailed] = useState(false);

  const cleanSrc = normalizeImageUrl(src);

  const style: React.CSSProperties = fill
    ? {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        objectFit,
      }
    : { objectFit };

  if (!cleanSrc || failed) {
    if (fill) {
      return (
        <div className={`${FALLBACK_BASE} absolute inset-0 h-full w-full ${className}`}>
          {fallbackText}
        </div>
      );
    }
    return (
      <div
        className={`${FALLBACK_BASE} ${className}`}
        style={{ width: width ?? 400, height: height ?? 300 }}
      >
        {fallbackText}
      </div>
    );
  }

  const loading = priority ? "eager" : "lazy";

  if (shouldOptimize(cleanSrc)) {
    return (
      <Image
        src={cleanSrc}
        alt={alt}
        {...(fill
          ? { fill: true, sizes: sizes ?? "(max-width: 768px) 100vw, 33vw" }
          : { width: width ?? 400, height: height ?? 300, sizes })}
        priority={priority}
        className={className}
        style={style}
        onError={() => setFailed(true)}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={cleanSrc}
      alt={alt}
      {...(fill ? {} : { width: width ?? 400, height: height ?? 300 })}
      loading={loading}
      decoding="async"
      referrerPolicy={referrerPolicy}
      crossOrigin="anonymous"
      className={className}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}

export default ResponsiveImage;
