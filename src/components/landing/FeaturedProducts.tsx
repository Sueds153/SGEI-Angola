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
  // Produtos MOCK são tratados como SHEIN para fins de filtro (consistente com API)
  const vintedProducts = products.filter(p => p && p.source === "VINTED").slice(0, 4);
  const sheinProducts = products.filter(p => p && (p.source === "SHEIN" || p.source === "MOCK")).slice(0, 4);
  const aliexpressProducts = products.filter(p => p && p.source === "ALIEXPRESS").slice(0, 4);

  const sections = [
    {
      id: "vinted-iphones",
      title: "iPhones Seminovos da Europa — Vinted",
      subtitle: "iPhones originais testados com saúde de bateria 85%+ e rede desbloqueada para Angola",
      icon: Smartphone,
      iconColor: "text-brand-600",
      bgColor: "bg-brand-50",
      borderColor: "border-brand-200",
      products: vintedProducts.length > 0 ? vintedProducts : getMockProducts("VINTED"),
      cta: "Ver iPhones Vinted",
      href: "/produtos?platform=VINTED",
    },
    {
      id: "shein-fashion",
      title: "Moda Feminina em Destaque — SHEIN",
      subtitle: "Vestidos, conjuntos e tendências mais pedidas em Luanda com preços em Kwanzas",
      icon: Shirt,
      iconColor: "text-pink-600",
      bgColor: "bg-pink-50",
      borderColor: "border-pink-200",
      products: sheinProducts.length > 0 ? sheinProducts : getMockProducts("SHEIN"),
      cta: "Ver moda feminina SHEIN",
      href: "/produtos?platform=SHEIN",
    },
    {
      id: "aliexpress-gadgets",
      title: "Gadgets & Tecnologia Choice — AliExpress",
      subtitle: "Fornecedores verificados e entrega gratuita direta até ao Aeroporto 4 de Fevereiro",
      icon: Zap,
      iconColor: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      products: aliexpressProducts.length > 0 ? aliexpressProducts : getMockProducts("ALIEXPRESS"),
      cta: "Ver gadgets com frete grátis",
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
// IMPORTANTE: os slugs devem corresponder aos slugs reais em src/lib/providers/mock-provider.ts
// (ou ao catálogo admin na DB) para que /produto/[slug] não devolva 404
function getMockProducts(platform: string) {
  const mockData: Record<string, any[]> = {
    VINTED: [
      {
        id: "vinted-iphone-15-pro-max-256gb",
        name: "Apple iPhone 15 Pro Max 256GB Titânio Natural",
        slug: "vinted-iphone-15-pro-max-256gb",
        source: "VINTED",
        sourceUrl: "https://www.vinted.pt/items/1500000001",
        defaultImage: "/images/prod-17.jpg",
        originalPriceUsd: 780.0,
        originalCurrency: "EUR",
        currency: "EUR",
        weightGrams: 221,
        batteryHealth: "94%",
        badge: "🔋 Bateria 94% • Desbloqueado",
      },
      {
        id: "vinted-iphone-14-pro-128gb",
        name: "Apple iPhone 14 Pro 128GB Roxo Profundo",
        slug: "vinted-iphone-14-pro-128gb",
        source: "VINTED",
        sourceUrl: "https://www.vinted.pt/items/1400000002",
        defaultImage: "/images/prod-08.jpg",
        originalPriceUsd: 540.0,
        originalCurrency: "EUR",
        currency: "EUR",
        weightGrams: 206,
        batteryHealth: "89%",
        badge: "🔋 Bateria 89% • Desbloqueado",
      },
      {
        id: "vinted-iphone-13-128gb-midnight",
        name: "Apple iPhone 13 128GB Meia-Noite",
        slug: "vinted-iphone-13-128gb-midnight",
        source: "VINTED",
        sourceUrl: "https://www.vinted.pt/items/1300000003",
        defaultImage: "/images/prod-16.jpg",
        originalPriceUsd: 390.0,
        originalCurrency: "EUR",
        currency: "EUR",
        weightGrams: 174,
        batteryHealth: "88%",
        badge: "🔋 Bateria 88% • Desbloqueado",
      },
      {
        id: "vinted-iphone-12-pro-128gb",
        name: "Apple iPhone 12 Pro 128GB Azul Pacífico",
        slug: "vinted-iphone-12-pro-128gb",
        source: "VINTED",
        sourceUrl: "https://www.vinted.pt/items/1200000004",
        defaultImage: "/images/prod-17.jpg",
        originalPriceUsd: 295.0,
        originalCurrency: "EUR",
        currency: "EUR",
        weightGrams: 189,
        batteryHealth: "86%",
        badge: "🔋 Bateria 86% • Desbloqueado",
      },
    ],
    SHEIN: [
      {
        id: "demo-vestido-midi-floral",
        name: "Vestido Midi Fluido Floral com Alças Ajustáveis",
        slug: "demo-vestido-midi-floral",
        source: "SHEIN",
        sourceUrl: "https://shein.com/p/1",
        defaultImage: "/images/demo-01.jpg",
        originalPriceUsd: 18.9,
        originalCurrency: "USD",
        currency: "USD",
        weightGrams: 320,
        badge: "✨ Tendência Luanda • Viscose",
      },
      {
        id: "demo-vestido-longo-festa-cetim",
        name: "Vestido Longo de Festa Cetim com Fenda Lateral",
        slug: "demo-vestido-longo-festa-cetim",
        source: "SHEIN",
        sourceUrl: "https://shein.com/p/2",
        defaultImage: "/images/prod-24.jpg",
        originalPriceUsd: 29.5,
        originalCurrency: "USD",
        currency: "USD",
        weightGrams: 380,
        badge: "✨ Gala & Casamentos • Cetim",
      },
      {
        id: "demo-conjunto-feminino-blazer",
        name: "Conjunto Feminino Elegante Blazer + Calças Alfaiataria",
        slug: "demo-conjunto-feminino-blazer",
        source: "SHEIN",
        sourceUrl: "https://shein.com/p/3",
        defaultImage: "/images/demo-08.jpg",
        originalPriceUsd: 38.0,
        originalCurrency: "USD",
        currency: "USD",
        weightGrams: 620,
        badge: "✨ Alfaiataria Chic • 2 Peças",
      },
      {
        id: "demo-vestido-evase-estampado",
        name: "Vestido Evasê Estampado Decote em V com Cinto",
        slug: "demo-vestido-evase-estampado",
        source: "SHEIN",
        sourceUrl: "https://shein.com/p/4",
        defaultImage: "/images/prod-20.jpg",
        originalPriceUsd: 16.5,
        originalCurrency: "USD",
        currency: "USD",
        weightGrams: 290,
        badge: "✨ Dia a Dia Fresco",
      },
    ],
    ALIEXPRESS: [
      {
        id: "aliexpress-smartwatch-amoled-gps",
        name: "Smartwatch AMOLED Ultra GPS Monitor Cardíaco IP68",
        slug: "aliexpress-smartwatch-amoled-gps",
        source: "ALIEXPRESS",
        sourceUrl: "https://pt.aliexpress.com/item/1005001111222233.html",
        defaultImage: "/images/prod-14.jpg",
        originalPriceUsd: 39.9,
        originalCurrency: "USD",
        currency: "USD",
        weightGrams: 55,
        badge: "⭐ Choice • Entrega Grátis",
        verifiedSupplier: true,
        freeShipping: true,
      },
      {
        id: "aliexpress-fone-bluetooth-anc",
        name: "Auscultadores Bluetooth 5.3 ANC Cancelamento Ruído Ativo",
        slug: "aliexpress-fone-bluetooth-anc",
        source: "ALIEXPRESS",
        sourceUrl: "https://pt.aliexpress.com/item/1005009876543210.html",
        defaultImage: "/images/prod-09.jpg",
        originalPriceUsd: 28.9,
        originalCurrency: "USD",
        currency: "USD",
        weightGrams: 65,
        badge: "⭐ Choice • Entrega Grátis",
        verifiedSupplier: true,
        freeShipping: true,
      },
      {
        id: "aliexpress-power-bank-20000mah",
        name: "Power Bank 20.000mAh 65W Carregamento Ultra-Rápido",
        slug: "aliexpress-power-bank-20000mah",
        source: "ALIEXPRESS",
        sourceUrl: "https://pt.aliexpress.com/item/1005001234567890.html",
        defaultImage: "/images/prod-03.jpg",
        originalPriceUsd: 32.5,
        originalCurrency: "USD",
        currency: "USD",
        weightGrams: 420,
        badge: "⭐ Choice • Entrega Grátis",
        verifiedSupplier: true,
        freeShipping: true,
      },
      {
        id: "aliexpress-projetor-portatil-4k",
        name: "Mini Projetor Portátil 4K WiFi Dual HDMI Cinema em Casa",
        slug: "aliexpress-projetor-portatil-4k",
        source: "ALIEXPRESS",
        sourceUrl: "https://pt.aliexpress.com/item/1005007788990011.html",
        defaultImage: "/images/prod-04.jpg",
        originalPriceUsd: 68.0,
        originalCurrency: "USD",
        currency: "USD",
        weightGrams: 850,
        badge: "⭐ Choice • Entrega Grátis",
        verifiedSupplier: true,
        freeShipping: true,
      },
    ],
  };
  return mockData[platform] || [];
}