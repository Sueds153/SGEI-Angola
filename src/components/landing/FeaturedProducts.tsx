"use client";

import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { Smartphone, Shirt, Zap } from "lucide-react";
import Link from "next/link";

interface FeaturedProductsProps {
  featuredProducts: any[];
}

export default function FeaturedProducts({ featuredProducts }: FeaturedProductsProps) {
  // Garantir que featuredProducts é um array válido
  const products = Array.isArray(featuredProducts) ? featuredProducts : [];
  
  // Filtrar produtos por plataforma para destaques específicos
  const vintedProducts = products.filter(p => p && p.source === "VINTED").slice(0, 4);
  const sheinProducts = products.filter(p => p && p.source === "SHEIN").slice(0, 4);
  const aliexpressProducts = products.filter(p => p && p.source === "ALIEXPRESS").slice(0, 4);

  const sections = [
    {
      id: "vinted-tech",
      title: "iPhones & Tech — Vinted",
      subtitle: "Apple original, seminovo, com preço que vale a pena",
      icon: Smartphone,
      iconColor: "text-brand-600",
      bgColor: "bg-brand-50",
      borderColor: "border-brand-200",
      products: vintedProducts.length > 0 ? vintedProducts : getMockProducts("VINTED"),
      cta: "Ver todos iPhones",
      href: "/produtos?platform=VINTED&category=tech",
    },
    {
      id: "shein-fashion",
      title: "Moda em Destaque — Shein",
      subtitle: "Tendências globais, preços em Kz",
      icon: Shirt,
      iconColor: "text-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      products: sheinProducts.length > 0 ? sheinProducts : getMockProducts("SHEIN"),
      cta: "Ver moda Shein",
      href: "/produtos?platform=SHEIN",
    },
    {
      id: "aliexpress-gadgets",
      title: "Gadgets & Eletrónicos — AliExpress",
      subtitle: "Tecnologia acessível direto da China",
      icon: Zap,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      products: aliexpressProducts.length > 0 ? aliexpressProducts : getMockProducts("ALIEXPRESS"),
      cta: "Ver gadgets",
      href: "/produtos?platform=ALIEXPRESS",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-ink-50" aria-labelledby="featured-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 id="featured-title" className="text-3xl sm:text-4xl font-bold text-ink-900 mb-4">
            Produtos em <span className="text-brand-600">Destaque</span>
          </h2>
          <p className="text-lg text-ink-600">
            Selecionamos as melhores ancomendas de cada plataforma para você começar já.
          </p>
        </div>

        <div className="space-y-16">
          {sections.map((section) => (
            <FeaturedSection key={section.id} section={section} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturedSection({ section }: { section: any }) {
  const Icon = section.icon;

  return (
    <div id={section.id} className="relative">
      {/* Section Header */}
      <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${section.bgColor} ${section.borderColor} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${section.iconColor}`} />
          </div>
          <div>
            <h3 className="text-2xl sm:text-3xl font-bold text-ink-900">{section.title}</h3>
            <p className="text-ink-600">{section.subtitle}</p>
          </div>
        </div>
        <Link
          href={section.href}
          className="text-brand-600 font-medium hover:text-brand-700 flex items-center gap-1 text-sm"
        >
          {section.cta}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
        </Link>
      </div>

      {/* Products Grid - simple flex instead of HorizontalScroller */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.isArray(section.products) && section.products.length > 0 ? (
          section.products.map((product: any, idx: number) => (
            <div key={product?.id || `mock-${idx}`}>
              <ProductCard product={product} />
            </div>
          ))
        ) : (
          // Fallback: skeletons
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i}>
              <ProductCardSkeleton />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Mock products para quando não há dados reais
// IMPORTANTE: os slugs devem corresponder aos slugs reais em src/lib/providers/mock-provider.ts
// (ou ao catálogo admin na DB) para que /produto/[slug] não devolva 404
function getMockProducts(platform: string) {
  const mockData: Record<string, any[]> = {
    VINTED: [
      { id: "v1", name: "Vestido Zara Novo Com Etiqueta Tamanho M", slug: "vinted-vestido-zara-m", source: "VINTED", sourceUrl: "https://www.vinted.pt/items/987654321", defaultImage: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400", originalPriceUsd: 22.0, originalCurrency: "EUR", weightGrams: 280 },
      { id: "v2", name: "Tênis Nike Air Force 1 '07 Branco Tamanho 41", slug: "vinted-nike-air-force-41", source: "VINTED", sourceUrl: "https://www.vinted.pt/items/876543210", defaultImage: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", originalPriceUsd: 65.0, originalCurrency: "EUR", weightGrams: 950 },
      { id: "v3", name: "Bolsa Michael Kors Jet Set Grande Marrom", slug: "vinted-michael-kors-bolsa", source: "VINTED", sourceUrl: "https://www.vinted.pt/items/765432109", defaultImage: "https://images.unsplash.com/photo-1584030581567-3f7e1d0c4c2c?w=400", originalPriceUsd: 89.0, originalCurrency: "EUR", weightGrams: 720 },
      { id: "v4", name: "Casaco Levi's Trucker Jeans Azul Tamanho L", slug: "vinted-levis-trucker-l", source: "VINTED", sourceUrl: "https://www.vinted.pt/items/654321098", defaultImage: "https://images.unsplash.com/photo-1551537482-f2075a1d41f2?w=400", originalPriceUsd: 48.0, originalCurrency: "EUR", weightGrams: 680 },
    ],
    SHEIN: [
      { id: "s1", name: "Vestido midi fluido estampado floral", slug: "demo-vestido-midi-floral", source: "SHEIN", sourceUrl: "https://shein.com/p/1", defaultImage: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400", originalPriceUsd: 18.9, originalCurrency: "USD", weightGrams: 320 },
      { id: "s2", name: "T-shirt básica algodão gola redonda", slug: "demo-tshirt-basica", source: "SHEIN", sourceUrl: "https://shein.com/p/2", defaultImage: "https://images.unsplash.com/photo-1594223274512-ad4803739b7c?w=400", originalPriceUsd: 7.5, originalCurrency: "USD", weightGrams: 180 },
      { id: "s3", name: "Ténis casual branco com sola chunky", slug: "demo-tenis-chunky-branco", source: "SHEIN", sourceUrl: "https://shein.com/p/3", defaultImage: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400", originalPriceUsd: 32.0, originalCurrency: "USD", weightGrams: 820 },
      { id: "s4", name: "Bolsa tiracolo couro sintético minimalista", slug: "demo-bolsa-tiracolo", source: "SHEIN", sourceUrl: "https://shein.com/p/4", defaultImage: "https://images.unsplash.com/photo-1578681994506-b8f463449011?w=400", originalPriceUsd: 14.5, originalCurrency: "USD", weightGrams: 400 },
    ],
    ALIEXPRESS: [
      { id: "a1", name: "Smartwatch Esportivo Monitor Cardíaco GPS", slug: "aliexpress-smartwatch-gps", source: "ALIEXPRESS", sourceUrl: "https://pt.aliexpress.com/item/1005001111222233.html", defaultImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", originalPriceUsd: 45.5, originalCurrency: "USD", weightGrams: 55 },
      { id: "a2", name: "Fone Bluetooth 5.3 TWS Cancelamento Ruído ANC", slug: "aliexpress-fone-bluetooth-anc", source: "ALIEXPRESS", sourceUrl: "https://pt.aliexpress.com/item/1005009876543210.html", defaultImage: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400", originalPriceUsd: 28.9, originalCurrency: "USD", weightGrams: 65 },
      { id: "a3", name: "Smartphone Android 128GB 6GB RAM Dual SIM 6.5\"", slug: "aliexpress-smartphone-128gb", source: "ALIEXPRESS", sourceUrl: "https://pt.aliexpress.com/item/1005001234567890.html", defaultImage: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400", originalPriceUsd: 156.0, originalCurrency: "USD", weightGrams: 280 },
    ],
  };
  return mockData[platform] || [];
}