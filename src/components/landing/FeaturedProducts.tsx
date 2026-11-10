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
            Selecionamos os melhores achados de cada plataforma para você começar já.
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
function getMockProducts(platform: string) {
  const mockData: Record<string, any[]> = {
    VINTED: [
      { id: "v1", name: "iPhone 13 Pro 128GB - Grafite", slug: "iphone-13-pro", source: "VINTED", sourceUrl: "https://vinted.pt/items/123", defaultImage: "https://images.unsplash.com/photo-1632661674596-df8be070a5c5?w=400", priceAOA: 650000, originalPrice: 550, currency: "EUR", discount: 15, weightGrams: 200 },
      { id: "v2", name: "iPhone 12 64GB - Azul", slug: "iphone-12-blue", source: "VINTED", sourceUrl: "https://vinted.pt/items/124", defaultImage: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400", priceAOA: 420000, originalPrice: 350, currency: "EUR", discount: 10, weightGrams: 200 },
      { id: "v3", name: "MacBook Air M1 256GB - Espaço Cinza", slug: "macbook-air-m1", source: "VINTED", sourceUrl: "https://vinted.pt/items/125", defaultImage: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400", priceAOA: 850000, originalPrice: 720, currency: "EUR", discount: 12, weightGrams: 1200 },
      { id: "v4", name: "AirPods Pro 2ª Geração", slug: "airpods-pro-2", source: "VINTED", sourceUrl: "https://vinted.pt/items/126", defaultImage: "https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=400", priceAOA: 180000, originalPrice: 150, currency: "EUR", discount: 8, weightGrams: 50 },
    ],
    SHEIN: [
      { id: "s1", name: "Vestido Floral Midi", slug: "vestido-floral-midi", source: "SHEIN", sourceUrl: "https://shein.com/p/1", defaultImage: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400", priceAOA: 18500, originalPrice: 15.99, currency: "USD", discount: 20, weightGrams: 300 },
      { id: "s2", name: "Conjunto Moletom Oversized", slug: "conjunto-moletom", source: "SHEIN", sourceUrl: "https://shein.com/p/2", defaultImage: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400", priceAOA: 25900, originalPrice: 22.50, currency: "USD", discount: 15, weightGrams: 500 },
      { id: "s3", name: "Ténis Casual Branco", slug: "tenis-casual-branco", source: "SHEIN", sourceUrl: "https://shein.com/p/3", defaultImage: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400", priceAOA: 32000, originalPrice: 27.99, currency: "USD", discount: 25, weightGrams: 800 },
      { id: "s4", name: "Bolsa Transversal Pequena", slug: "bolsa-transversal", source: "SHEIN", sourceUrl: "https://shein.com/p/4", defaultImage: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=400", priceAOA: 14900, originalPrice: 12.99, currency: "USD", discount: 30, weightGrams: 400 },
    ],
    ALIEXPRESS: [
      { id: "a1", name: "Smartwatch Series 8 Clone", slug: "smartwatch-series-8", source: "ALIEXPRESS", sourceUrl: "https://aliexpress.com/item/1", defaultImage: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", priceAOA: 18500, originalPrice: 15.99, currency: "USD", discount: 40, weightGrams: 50 },
      { id: "a2", name: "Carregador Rápido 65W GaN", slug: "carregador-65w-gan", source: "ALIEXPRESS", sourceUrl: "https://aliexpress.com/item/2", defaultImage: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=400", priceAOA: 12900, originalPrice: 11.50, currency: "USD", discount: 35, weightGrams: 200 },
      { id: "a3", name: "Fones Bluetooth 5.3 ANC", slug: "fones-bluetooth-anc", source: "ALIEXPRESS", sourceUrl: "https://aliexpress.com/item/3", defaultImage: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", priceAOA: 22900, originalPrice: 19.99, currency: "USD", discount: 28, weightGrams: 100 },
      { id: "a4", name: "Lâmpada Smart WiFi RGB", slug: "lampada-smart-rgb", source: "ALIEXPRESS", sourceUrl: "https://aliexpress.com/item/4", defaultImage: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400", priceAOA: 8900, originalPrice: 7.99, currency: "USD", discount: 20, weightGrams: 150 },
    ],
  };
  return mockData[platform] || [];
}