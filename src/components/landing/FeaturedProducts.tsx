"use client";

import { useState } from "react";
import { ProductCard, ProductCardSkeleton } from "@/components/product/ProductCard";
import { ArrowRight, Flame, Shirt, Smartphone, Zap } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FeaturedProductsProps {
  featuredProducts: any[];
}

export default function FeaturedProducts({ featuredProducts }: FeaturedProductsProps) {
  const [activeTab, setActiveTab] = useState<"ALL" | "SHEIN" | "ALIEXPRESS" | "VINTED">("ALL");

  const rawProducts = Array.isArray(featuredProducts) ? featuredProducts : [];

  const sheinMocks = getMockProducts("SHEIN");
  const aliMocks = getMockProducts("ALIEXPRESS");
  const vintedMocks = getMockProducts("VINTED");

  const allProducts = rawProducts.length > 0 
    ? rawProducts 
    : [...sheinMocks, ...aliMocks, ...vintedMocks];

  const filteredProducts = activeTab === "ALL"
    ? allProducts
    : activeTab === "SHEIN"
    ? allProducts.filter((p) => p && (p.source === "SHEIN" || p.source === "MOCK"))
    : activeTab === "ALIEXPRESS"
    ? allProducts.filter((p) => p && p.source === "ALIEXPRESS")
    : allProducts.filter((p) => p && p.source === "VINTED");

  const displayList = filteredProducts.length > 0
    ? filteredProducts.slice(0, 8)
    : activeTab === "SHEIN"
    ? sheinMocks
    : activeTab === "ALIEXPRESS"
    ? aliMocks
    : activeTab === "VINTED"
    ? vintedMocks
    : allProducts.slice(0, 8);

  const tabs = [
    { id: "ALL", label: "Destaques Principais", icon: Flame },
    { id: "SHEIN", label: "SHEIN Moda", icon: Shirt },
    { id: "ALIEXPRESS", label: "AliExpress Tech", icon: Zap },
    { id: "VINTED", label: "iPhones Vinted", icon: Smartphone },
  ] as const;

  return (
    <section className="py-8 sm:py-14 bg-white" aria-labelledby="featured-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Cabeçalho da Seção */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-5">
          <div>
            <span className="text-xs font-bold text-brand-600 uppercase tracking-wider">
              Catálogo Pronto
            </span>
            <h2 id="featured-title" className="text-2xl sm:text-3xl font-extrabold text-ink-950 tracking-tight">
              Os mais pedidos em Angola
            </h2>
          </div>
          <Link
            href="/produtos"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-600 hover:text-brand-700"
          >
            <span>Ver todo o catálogo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Abas Horizontais com Scroll no Mobile */}
        <div role="group" aria-label="Filtrar produtos por loja" className="flex items-center gap-2 overflow-x-auto pb-2 mb-5 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "min-h-11 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 active:scale-95 cursor-pointer",
                  isActive
                    ? "bg-ink-950 text-white shadow-sm"
                    : "bg-ink-100 text-ink-700 hover:bg-ink-200"
                )}
              >
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          {displayList.length} produtos apresentados
        </p>

        {/* Grelha de Produtos: 2 colunas no Mobile, 4 no Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
          {displayList.map((product: any, idx: number) => (
            <div key={product?.id || `prod-${idx}`} className="h-full">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* CTA Ver Mais */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/produtos"
            className="w-full py-3 px-5 rounded-xl bg-ink-100 text-ink-900 font-bold text-xs inline-flex items-center justify-center gap-1.5 active:bg-ink-200 transition"
          >
            <span>Explorar mais produtos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

// Mock products
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
        badge: "Bateria 94%",
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
        badge: "Bateria 89%",
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
        badge: "Bateria 88%",
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
        badge: "Bateria 86%",
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
        badge: "Mais Vendido",
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
        badge: "Festa & Gala",
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
        badge: "Alfaiataria 2 Peças",
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
        badge: "Linha Casual",
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
        badge: "Choice Seleção",
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
        badge: "⭐ Choice",
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
        badge: "⭐ Choice",
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
        badge: "⭐ Choice",
        verifiedSupplier: true,
        freeShipping: true,
      },
    ],
  };
  return mockData[platform] || [];
}
