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
  fallbackText = "Imagem não disponível",
}: ResponsiveImageProps) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Se a imagem for local (começa com /), usar next/image normalmente
  // Se for externa, verificar se é permitida
  const isLocal = src?.startsWith("/");
  const isExternal = src?.startsWith("http");

  // Para imagens externas, verificar se o domínio é permitido
  const allowedDomains = [
    "importeasy-angola.vercel.app",
    "images.unsplash.com",
    "i.pravatar.cc",
    "api.dicebear.com",
    "via.placeholder.com",
    "res.cloudinary.com",
    "cloudinary.com",
  ];

  const isAllowedExternal = isExternal && allowedDomains.some((d) =>
    src.includes(d)
  );

  if (error || (!isLocal && !isAllowedExternal)) {
    return (
      <div
        className={`flex items-center justify-center bg-ink-100 text-ink-400 text-xs ${className}`}
      >
        <span className="px-2 py-1 text-center">{fallbackText}</span>
      </div>
    );
  }

  // Usar next/image para imagens locais e externas permitidas
  if (fill) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
          priority={priority}
          className={`object-${objectFit} transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          style={{ objectFit }}
          onError={() => setError(true)}
          onLoad={() => setLoaded(true)}
        />
        {!loaded && (
          <div className="absolute inset-0 bg-ink-100 animate-pulse" />
        )}
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width || 400}
        height={height || 300}
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
        priority={priority}
        className={`object-${objectFit} transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ objectFit }}
        onError={() => setError(true)}
        onLoad={() => setLoaded(true)}
      />
      {!loaded && (
        <div className="absolute inset-0 bg-ink-100 animate-pulse" />
      )}
    </div>
  );
}

export default ResponsiveImage;