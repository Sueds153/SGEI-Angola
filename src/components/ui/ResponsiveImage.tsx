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
}

const FALLBACK_BASE =
  "grid place-items-center bg-ink-100 text-ink-400 text-[11px] font-medium text-center leading-tight px-1";

/**
 * Imagens locais (ex.: /uploads/..., /products/...) passam pelo otimizador do Next.
 * Imagens externas (CDN de marketplaces, avatares gerados, ficheiros temporários do
 * cliente) são servidas tal como estão, porque o otimizador rejeitaria estes domínios
 * ou formatos e as imagens apareceriam quebradas.
 */
function shouldOptimize(src: string) {
  return src.startsWith("/") && !src.startsWith("//");
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
}: ResponsiveImageProps) {
  const [failed, setFailed] = useState(false);

  const style: React.CSSProperties = fill
    ? { width: "100%", height: "100%", objectFit }
    : { objectFit };

  if (!src || failed) {
    if (fill) {
      return (
        <div className={`${FALLBACK_BASE} h-full w-full ${className}`}>{fallbackText}</div>
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

  if (shouldOptimize(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        {...(fill
          ? { width: 0, height: 0, sizes: sizes ?? "(max-width: 768px) 100vw, 33vw" }
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
      src={src}
      alt={alt}
      {...(fill ? {} : { width: width ?? 400, height: height ?? 300 })}
      loading={loading}
      decoding="async"
      className={className}
      style={style}
      onError={() => setFailed(true)}
    />
  );
}

export default ResponsiveImage;
