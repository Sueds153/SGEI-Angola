import type { NormalizedProduct, ProductSource } from "../types";
import type { ProductProvider } from "./product-provider";

// Dados de demonstração — marcados como DEMO. Servem para catálogo inicial.
const CATEGORIES = [
  { id: 1, name: "Vestuário feminino", slug: "vestuario-feminino", icon: "Shirt" },
  { id: 2, name: "Vestuário masculino", slug: "vestuario-masculino", icon: "Shirt" },
  { id: 3, name: "Crianças", slug: "criancas", icon: "Baby" },
  { id: 4, name: "Calçados", slug: "calcados", icon: "Footprints" },
  { id: 5, name: "Bolsas", slug: "bolsas", icon: "Handbag" },
  { id: 6, name: "Acessórios", slug: "acessorios", icon: "Watch" },
  { id: 7, name: "Beleza", slug: "beleza", icon: "Sparkles" },
  { id: 8, name: "Casa", slug: "casa", icon: "Home" },
  { id: 9, name: "Outros", slug: "outros", icon: "Package" },
];

// Imagens locais (auto-hospedadas para evitar bloqueio ORB)
const demoImages = [
  "/images/demo-01.jpg",
  "/images/demo-02.jpg",
  "/images/demo-03.jpg",
  "/images/demo-04.jpg",
  "/images/demo-05.jpg",
  "/images/demo-06.jpg",
  "/images/demo-07.jpg",
  "/images/demo-08.jpg",
  "/images/demo-09.jpg",
  "/images/demo-10.jpg",
];

const DEMO_PRODUCTS: NormalizedProduct[] = [
  {
    id: "demo-1",
    externalId: "DEMO-001",
    source: "MOCK" as ProductSource,
    sourceUrl: null,
    name: "Vestido midi fluido estampado floral",
    slug: "demo-vestido-midi-floral",
    description: "Vestido leve com padrão floral, ideal para o dia-a-dia. Tecido confortável e respirável.",
    category: CATEGORIES[0],
    images: [demoImages[0], demoImages[1], demoImages[2]],
    defaultImage: demoImages[0],
    originalPriceUsd: 18.9,
    currency: "USD",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "DEMO-001",
    rating: 4.6,
    reviewCount: 234,
    weightGrams: 320,
    variants: [
      { id: "d1v1", externalId: null, color: "Floral vermelho", size: "S", otherOptions: null, sku: "D1-S", priceModifierUsd: 0, stockQuantity: 10, available: true, imageUrl: null },
      { id: "d1v2", externalId: null, color: "Floral vermelho", size: "M", otherOptions: null, sku: "D1-M", priceModifierUsd: 0, stockQuantity: 8, available: true, imageUrl: null },
      { id: "d1v3", externalId: null, color: "Floral vermelho", size: "L", otherOptions: null, sku: "D1-L", priceModifierUsd: 0, stockQuantity: 5, available: true, imageUrl: null },
    ],
  },
  {
    id: "demo-2",
    externalId: "DEMO-002",
    source: "MOCK",
    sourceUrl: null,
    name: "T-shirt básica algodão gola redonda",
    slug: "demo-tshirt-basica",
    description: "T-shirt clássica em algodão macio. Corte regular.",
    category: CATEGORIES[1],
    images: [demoImages[3], demoImages[4]],
    defaultImage: demoImages[3],
    originalPriceUsd: 7.5,
    currency: "USD",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "DEMO-002",
    rating: 4.4,
    reviewCount: 512,
    weightGrams: 180,
    variants: [
      { id: "d2v1", externalId: null, color: "Preto", size: "S", otherOptions: null, sku: "D2-PT-S", priceModifierUsd: 0, stockQuantity: 20, available: true, imageUrl: null },
      { id: "d2v2", externalId: null, color: "Preto", size: "M", otherOptions: null, sku: "D2-PT-M", priceModifierUsd: 0, stockQuantity: 25, available: true, imageUrl: null },
      { id: "d2v3", externalId: null, color: "Preto", size: "L", otherOptions: null, sku: "D2-PT-L", priceModifierUsd: 0, stockQuantity: 0, available: false, imageUrl: null },
      { id: "d2v4", externalId: null, color: "Branco", size: "M", otherOptions: null, sku: "D2-BR-M", priceModifierUsd: 0, stockQuantity: 12, available: true, imageUrl: null },
    ],
  },
  {
    id: "demo-3",
    externalId: "DEMO-003",
    source: "MOCK",
    sourceUrl: null,
    name: "Ténis casual branco com sola chunky",
    slug: "demo-tenis-chunky-branco",
    description: "Ténis modernos com plataforma. Confortáveis para uso diário.",
    category: CATEGORIES[3],
    images: [demoImages[5], demoImages[6]],
    defaultImage: demoImages[5],
    originalPriceUsd: 32.0,
    currency: "USD",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "DEMO-003",
    rating: 4.7,
    reviewCount: 189,
    weightGrams: 820,
    variants: [
      { id: "d3v1", externalId: null, color: "Branco", size: "37", otherOptions: null, sku: "D3-37", priceModifierUsd: 0, stockQuantity: 6, available: true, imageUrl: null },
      { id: "d3v2", externalId: null, color: "Branco", size: "38", otherOptions: null, sku: "D3-38", priceModifierUsd: 0, stockQuantity: 8, available: true, imageUrl: null },
      { id: "d3v3", externalId: null, color: "Branco", size: "39", otherOptions: null, sku: "D3-39", priceModifierUsd: 0, stockQuantity: 4, available: true, imageUrl: null },
      { id: "d3v4", externalId: null, color: "Branco", size: "40", otherOptions: null, sku: "D3-40", priceModifierUsd: 0, stockQuantity: 2, available: true, imageUrl: null },
    ],
  },
  {
    id: "demo-4",
    externalId: "DEMO-004",
    source: "MOCK",
    sourceUrl: null,
    name: "Bolsa tiracolo couro sintético minimalista",
    slug: "demo-bolsa-tiracolo",
    description: "Bolsa compacta e elegante, perfeita para transportar o essencial.",
    category: CATEGORIES[4],
    images: [demoImages[7]],
    defaultImage: demoImages[7],
    originalPriceUsd: 14.5,
    currency: "USD",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "DEMO-004",
    rating: 4.3,
    reviewCount: 87,
    weightGrams: 400,
    variants: [
      { id: "d4v1", externalId: null, color: "Bege", size: "Único", otherOptions: null, sku: "D4-BG", priceModifierUsd: 0, stockQuantity: 15, available: true, imageUrl: null },
      { id: "d4v2", externalId: null, color: "Preto", size: "Único", otherOptions: null, sku: "D4-PT", priceModifierUsd: 0, stockQuantity: 20, available: true, imageUrl: null },
    ],
  },
  {
    id: "demo-5",
    externalId: "DEMO-005",
    source: "MOCK",
    sourceUrl: null,
    name: "Calças jeans skinny cintura alta",
    slug: "demo-calcas-jeans-skinny",
    description: "Jeans skinny com cintura subida, tecido com elastano para maior conforto.",
    category: CATEGORIES[0],
    images: [demoImages[8], demoImages[9]],
    defaultImage: demoImages[8],
    originalPriceUsd: 22.9,
    currency: "USD",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "DEMO-005",
    rating: 4.5,
    reviewCount: 342,
    weightGrams: 520,
    variants: [
      { id: "d5v1", externalId: null, color: "Azul escuro", size: "36", otherOptions: null, sku: "D5-36", priceModifierUsd: 0, stockQuantity: 7, available: true, imageUrl: null },
      { id: "d5v2", externalId: null, color: "Azul escuro", size: "38", otherOptions: null, sku: "D5-38", priceModifierUsd: 0, stockQuantity: 9, available: true, imageUrl: null },
      { id: "d5v3", externalId: null, color: "Azul escuro", size: "40", otherOptions: null, sku: "D5-40", priceModifierUsd: 0, stockQuantity: 5, available: true, imageUrl: null },
      { id: "d5v4", externalId: null, color: "Azul claro", size: "38", otherOptions: null, sku: "D5-CL-38", priceModifierUsd: 0, stockQuantity: 3, available: true, imageUrl: null },
    ],
  },
  {
    id: "demo-6",
    externalId: "DEMO-006",
    source: "MOCK",
    sourceUrl: null,
    name: "Relógio analógico pulseira em aço",
    slug: "demo-relogio-analogico",
    description: "Relógio clássico unissexo com pulseira em malha de aço inoxidável.",
    category: CATEGORIES[5],
    images: ["/images/prod-01.jpg"],
    defaultImage: "/images/prod-01.jpg",
    originalPriceUsd: 26.0,
    currency: "USD",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "DEMO-006",
    rating: 4.6,
    reviewCount: 145,
    weightGrams: 120,
    variants: [
      { id: "d6v1", externalId: null, color: "Prateado", size: "Único", otherOptions: null, sku: "D6-PT", priceModifierUsd: 0, stockQuantity: 10, available: true, imageUrl: null },
      { id: "d6v2", externalId: null, color: "Dourado", size: "Único", otherOptions: null, sku: "D6-DO", priceModifierUsd: 2, stockQuantity: 6, available: true, imageUrl: null },
    ],
  },
  {
    id: "demo-7",
    externalId: "DEMO-007",
    source: "MOCK",
    sourceUrl: null,
    name: "Conjunto infantil camisola + calças algodão",
    slug: "demo-conjunto-infantil",
    description: "Conjunto confortável para criança em algodão macio. Várias cores.",
    category: CATEGORIES[2],
    images: ["/images/prod-02.jpg"],
    defaultImage: "/images/prod-02.jpg",
    originalPriceUsd: 12.0,
    currency: "USD",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "DEMO-007",
    rating: 4.8,
    reviewCount: 76,
    weightGrams: 240,
    variants: [
      { id: "d7v1", externalId: null, color: "Azul", size: "2 anos", otherOptions: null, sku: "D7-2", priceModifierUsd: 0, stockQuantity: 8, available: true, imageUrl: null },
      { id: "d7v2", externalId: null, color: "Rosa", size: "3 anos", otherOptions: null, sku: "D7-3", priceModifierUsd: 0, stockQuantity: 6, available: true, imageUrl: null },
      { id: "d7v3", externalId: null, color: "Verde", size: "4 anos", otherOptions: null, sku: "D7-4", priceModifierUsd: 0, stockQuantity: 5, available: true, imageUrl: null },
    ],
  },
  {
    id: "demo-8",
    externalId: "DEMO-008",
    source: "MOCK",
    sourceUrl: null,
    name: "Casaco oversize lã sintética gola alta",
    slug: "demo-casaco-oversize",
    description: "Casaco quente e confortável, modelo oversize. Perfeito para dias mais frescos.",
    category: CATEGORIES[1],
    images: ["/images/prod-03.jpg"],
    defaultImage: "/images/prod-03.jpg",
    originalPriceUsd: 42.5,
    currency: "USD",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "DEMO-008",
    rating: 4.5,
    reviewCount: 92,
    weightGrams: 780,
    variants: [
      { id: "d8v1", externalId: null, color: "Bege", size: "M", otherOptions: null, sku: "D8-M", priceModifierUsd: 0, stockQuantity: 4, available: true, imageUrl: null },
      { id: "d8v2", externalId: null, color: "Cinza", size: "L", otherOptions: null, sku: "D8-L", priceModifierUsd: 0, stockQuantity: 3, available: true, imageUrl: null },
    ],
  },
  {
    id: "demo-9",
    externalId: "DEMO-009",
    source: "MOCK",
    sourceUrl: null,
    name: "Conjunto pincéis maquiagem 12 peças",
    slug: "demo-pinceis-maquiagem",
    description: "Kit profissional de 12 pincéis para maquiagem, com bolsa de transporte.",
    category: CATEGORIES[6],
    images: ["/images/prod-04.jpg"],
    defaultImage: "/images/prod-04.jpg",
    originalPriceUsd: 9.9,
    currency: "USD",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "DEMO-009",
    rating: 4.2,
    reviewCount: 203,
    weightGrams: 250,
    variants: [
      { id: "d9v1", externalId: null, color: "Rosa", size: "Único", otherOptions: null, sku: "D9-RS", priceModifierUsd: 0, stockQuantity: 25, available: true, imageUrl: null },
      { id: "d9v2", externalId: null, color: "Preto", size: "Único", otherOptions: null, sku: "D9-PT", priceModifierUsd: 0, stockQuantity: 18, available: true, imageUrl: null },
    ],
  },
  {
    id: "demo-10",
    externalId: "DEMO-010",
    source: "MOCK",
    sourceUrl: null,
    name: "Conjunto lençóis 4 peças algodão percal",
    slug: "demo-lencois-algodao",
    description: "Jogo de lençóis para cama de casal, em algodão percal 200 fios.",
    category: CATEGORIES[7],
    images: ["/images/prod-05.jpg"],
    defaultImage: "/images/prod-05.jpg",
    originalPriceUsd: 35.0,
    currency: "USD",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "DEMO-010",
    rating: 4.6,
    reviewCount: 58,
    weightGrams: 1200,
    variants: [
      { id: "d10v1", externalId: null, color: "Branco", size: "Casal", otherOptions: null, sku: "D10-C", priceModifierUsd: 0, stockQuantity: 6, available: true, imageUrl: null },
      { id: "d10v2", externalId: null, color: "Cinza", size: "Casal", otherOptions: null, sku: "D10-CZ", priceModifierUsd: 0, stockQuantity: 4, available: true, imageUrl: null },
      { id: "d10v3", externalId: null, color: "Bege", size: "Singular", otherOptions: null, sku: "D10-S", priceModifierUsd: -5, stockQuantity: 5, available: true, imageUrl: null },
    ],
  },
  {
    id: "demo-11",
    externalId: "DEMO-011",
    source: "MOCK",
    sourceUrl: null,
    name: "Óculos de sol armação redonda vintage",
    slug: "demo-oculos-sol-vintage",
    description: "Óculos de sol estilo retrô com proteção UV400. Unissexo.",
    category: CATEGORIES[5],
    images: ["/images/prod-06.jpg"],
    defaultImage: "/images/prod-06.jpg",
    originalPriceUsd: 11.5,
    currency: "USD",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "DEMO-011",
    rating: 4.4,
    reviewCount: 312,
    weightGrams: 60,
    variants: [
      { id: "d11v1", externalId: null, color: "Preto", size: "Único", otherOptions: null, sku: "D11-PT", priceModifierUsd: 0, stockQuantity: 30, available: true, imageUrl: null },
      { id: "d11v2", externalId: null, color: "Tartaruga", size: "Único", otherOptions: null, sku: "D11-TT", priceModifierUsd: 0, stockQuantity: 15, available: true, imageUrl: null },
    ],
  },
  {
    id: "demo-12",
    externalId: "DEMO-012",
    source: "MOCK",
    sourceUrl: null,
    name: "Chinelos slide praia unissexo",
    slug: "demo-chinelos-slide",
    description: "Chinelos tipo slide confortáveis para praia e piscina.",
    category: CATEGORIES[3],
    images: ["/images/prod-07.jpg"],
    defaultImage: "/images/prod-07.jpg",
    originalPriceUsd: 8.0,
    currency: "USD",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "DEMO-012",
    rating: 4.1,
    reviewCount: 178,
    weightGrams: 220,
    variants: [
      { id: "d12v1", externalId: null, color: "Preto", size: "39", otherOptions: null, sku: "D12-39", priceModifierUsd: 0, stockQuantity: 10, available: true, imageUrl: null },
      { id: "d12v2", externalId: null, color: "Preto", size: "41", otherOptions: null, sku: "D12-41", priceModifierUsd: 0, stockQuantity: 12, available: true, imageUrl: null },
      { id: "d12v3", externalId: null, color: "Branco", size: "40", otherOptions: null, sku: "D12-40", priceModifierUsd: 0, stockQuantity: 0, available: false, imageUrl: null },
    ],
  },

  // ===== ALIEXPRESS DEMO PRODUCTS =====
  {
    id: "aliexpress-1005001234567890",
    externalId: "1005001234567890",
    source: "ALIEXPRESS" as ProductSource,
    sourceUrl: "https://pt.aliexpress.com/item/1005001234567890.html",
    name: "Smartphone Android 128GB 6GB RAM Dual SIM 6.5\"",
    slug: "aliexpress-smartphone-128gb",
    description: "Smartphone desbloqueado, tela 6.5\" HD+, câmera tripla 48MP, bateria 5000mAh. Versão global com PT-BR.",
    category: CATEGORIES[8],
    images: [
      "/images/prod-08.jpg",
      "/images/prod-17.jpg",
    ],
    defaultImage: "/images/prod-08.jpg",
    originalPriceUsd: 156.0,
    currency: "USD",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "AE-1005001234567890",
    rating: 4.5,
    reviewCount: 1234,
    weightGrams: 280,
    variants: [
      { id: "ae1v1", externalId: "1005001234567890-BLK", color: "Preto", size: "128GB/6GB", otherOptions: null, sku: "AE-S-128-BLK", priceModifierUsd: 0, stockQuantity: 50, available: true, imageUrl: null },
      { id: "ae1v2", externalId: "1005001234567890-BLU", color: "Azul", size: "128GB/6GB", otherOptions: null, sku: "AE-S-128-BLU", priceModifierUsd: 0, stockQuantity: 30, available: true, imageUrl: null },
      { id: "ae1v3", externalId: "1005001234567890-256", color: "Preto", size: "256GB/8GB", otherOptions: null, sku: "AE-S-256-BLK", priceModifierUsd: 30, stockQuantity: 20, available: true, imageUrl: null },
    ],
  },
  {
    id: "aliexpress-1005009876543210",
    externalId: "1005009876543210",
    source: "ALIEXPRESS" as ProductSource,
    sourceUrl: "https://pt.aliexpress.com/item/1005009876543210.html",
    name: "Fone Bluetooth 5.3 TWS Cancelamento Ruído ANC",
    slug: "aliexpress-fone-bluetooth-anc",
    description: "Fones intra-auriculares com cancelamento ativo de ruído 35dB, 30h bateria, carregamento rápido USB-C, IPX5.",
    category: CATEGORIES[5],
    images: [
      "/images/prod-09.jpg",
      "/images/prod-16.jpg",
    ],
    defaultImage: "/images/prod-09.jpg",
    originalPriceUsd: 28.9,
    currency: "USD",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "AE-1005009876543210",
    rating: 4.6,
    reviewCount: 3421,
    weightGrams: 65,
    variants: [
      { id: "ae2v1", externalId: "1005009876543210-BLK", color: "Preto", size: "Único", otherOptions: null, sku: "AE-TWS-BLK", priceModifierUsd: 0, stockQuantity: 100, available: true, imageUrl: null },
      { id: "ae2v2", externalId: "1005009876543210-WHT", color: "Branco", size: "Único", otherOptions: null, sku: "AE-TWS-WHT", priceModifierUsd: 0, stockQuantity: 80, available: true, imageUrl: null },
    ],
  },
  {
    id: "aliexpress-1005001111222233",
    externalId: "1005001111222233",
    source: "ALIEXPRESS" as ProductSource,
    sourceUrl: "https://pt.aliexpress.com/item/1005001111222233.html",
    name: "Relógio Smartwatch Esportivo Monitor Cardíaco GPS",
    slug: "aliexpress-smartwatch-gps",
    description: "Smartwatch com GPS integrado, monitor cardíaco 24h, SpO2, sono, 100+ modos esporte, 14 dias bateria, IP68.",
    category: CATEGORIES[5],
    images: [
      "/images/prod-14.jpg",
      "/images/prod-14.jpg",
    ],
    defaultImage: "/images/prod-14.jpg",
    originalPriceUsd: 45.5,
    currency: "USD",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "AE-1005001111222233",
    rating: 4.4,
    reviewCount: 876,
    weightGrams: 55,
    variants: [
      { id: "ae3v1", externalId: "1005001111222233-BLK", color: "Preto", size: "Único", otherOptions: null, sku: "AE-SW-BLK", priceModifierUsd: 0, stockQuantity: 60, available: true, imageUrl: null },
      { id: "ae3v2", externalId: "1005001111222233-GRY", color: "Cinza Espacial", size: "Único", otherOptions: null, sku: "AE-SW-GRY", priceModifierUsd: 0, stockQuantity: 45, available: true, imageUrl: null },
      { id: "ae3v3", externalId: "1005001111222233-BLU", color: "Azul Meia-noite", size: "Único", otherOptions: null, sku: "AE-SW-BLU", priceModifierUsd: 0, stockQuantity: 30, available: true, imageUrl: null },
    ],
  },

  // ===== VINTED DEMO PRODUCTS (EUR) =====
  {
    id: "vinted-987654321",
    externalId: "987654321",
    source: "VINTED" as ProductSource,
    sourceUrl: "https://www.vinted.pt/items/987654321",
    name: "Vestido Zara Novo Com Etiqueta Tamanho M",
    slug: "vinted-vestido-zara-m",
    description: "Vestido Zara floral, novo com etiqueta, tamanho M. Composição 100% viscose. Nunca usado, guarda-roupa limpo.",
    category: CATEGORIES[0],
    images: [
      "/images/demo-01.jpg",
    ],
    defaultImage: "/images/demo-01.jpg",
    originalPriceUsd: 22.0, // 22 EUR
    currency: "EUR",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "VT-987654321",
    rating: 5.0,
    reviewCount: 127,
    weightGrams: 280,
    variants: [
      { id: "vt1v1", externalId: "987654321", color: "Floral Rosa", size: "M", otherOptions: { condition: "Novo com etiqueta", brand: "Zara", seller: "maria_silva", sellerRating: "127" }, sku: "VT-ZARA-M-FL", priceModifierUsd: 0, stockQuantity: 1, available: true, imageUrl: null },
    ],
  },
  {
    id: "vinted-876543210",
    externalId: "876543210",
    source: "VINTED" as ProductSource,
    sourceUrl: "https://www.vinted.pt/items/876543210",
    name: "Tênis Nike Air Force 1 '07 Branco Tamanho 41",
    slug: "vinted-nike-air-force-41",
    description: "Nike Air Force 1 '07 branco, usado apenas 3x. Estado muito bom, sem marcas visíveis. Acompanha caixa original e extra lacetes.",
    category: CATEGORIES[3],
    images: [
      "/images/prod-10.jpg",
      "/images/prod-15.jpg",
    ],
    defaultImage: "/images/prod-10.jpg",
    originalPriceUsd: 65.0, // 65 EUR
    currency: "EUR",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "VT-876543210",
    rating: 5.0,
    reviewCount: 89,
    weightGrams: 950,
    variants: [
      { id: "vt2v1", externalId: "876543210", color: "Branco", size: "41", otherOptions: { condition: "Muito bom", brand: "Nike", seller: "sneakerhead_pt", sellerRating: "89" }, sku: "VT-NIKE-AF1-41", priceModifierUsd: 0, stockQuantity: 1, available: true, imageUrl: null },
    ],
  },
  {
    id: "vinted-765432109",
    externalId: "765432109",
    source: "VINTED" as ProductSource,
    sourceUrl: "https://www.vinted.pt/items/765432109",
    name: "Bolsa Michael Kors Jet Set Grande Marrom",
    slug: "vinted-michael-kors-bolsa",
    description: "Bolsa Michael Kors Jet Set grande, cor marrom/couro sintético. Estado bom, sinais normais de uso nas alças. Interior limpo. Medidas: 40x30x15cm.",
    category: CATEGORIES[4],
    images: [
      "/images/prod-11.jpg",
    ],
    defaultImage: "/images/prod-11.jpg",
    originalPriceUsd: 89.0, // 89 EUR
    currency: "EUR",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "VT-765432109",
    rating: 4.8,
    reviewCount: 234,
    weightGrams: 720,
    variants: [
      { id: "vt3v1", externalId: "765432109", color: "Marrom", size: "Único", otherOptions: { condition: "Bom", brand: "Michael Kors", seller: "luxury_preloved", sellerRating: "234" }, sku: "VT-MK-JETSET-BR", priceModifierUsd: 0, stockQuantity: 1, available: true, imageUrl: null },
    ],
  },
  {
    id: "vinted-654321098",
    externalId: "654321098",
    source: "VINTED" as ProductSource,
    sourceUrl: "https://www.vinted.pt/items/654321098",
    name: "Casaco Levi's Trucker Jeans Azul Tamanho L",
    slug: "vinted-levis-trucker-l",
    description: "Casaco Levi's Trucker clássico jeans azul, tamanho L. Vintage anos 90, estado muito bom. Botões originais, forro xadrez. Peça única.",
    category: CATEGORIES[1],
    images: [
      "/images/prod-12.jpg",
      "/images/prod-13.jpg",
    ],
    defaultImage: "/images/prod-12.jpg",
    originalPriceUsd: 48.0, // 48 EUR
    currency: "EUR",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "VT-654321098",
    rating: 4.9,
    reviewCount: 156,
    weightGrams: 680,
    variants: [
      { id: "vt4v1", externalId: "654321098", color: "Azul Jeans", size: "L", otherOptions: { condition: "Muito bom", brand: "Levi's", seller: "vintage_denim_lover", sellerRating: "156" }, sku: "VT-LEVIS-TRUCKER-L", priceModifierUsd: 0, stockQuantity: 1, available: true, imageUrl: null },
    ],
  },
];

// Remove o campo incorreto
for (const p of DEMO_PRODUCTS) {
  (p as any).thestatus = undefined;
}

export const mockProductProvider: ProductProvider = {
  id: "MOCK",

  async searchProducts(query, params) {
    const q = query.toLowerCase().trim();
    let results = DEMO_PRODUCTS;
    if (q) {
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q) ||
          p.category?.name.toLowerCase().includes(q)
      );
    }
    if (params?.category) {
      results = results.filter((p) => p.category?.slug === params.category);
    }
    return results.slice(0, params?.limit || 24);
  },

  async getProductBySlug(slug) {
    return DEMO_PRODUCTS.find((p) => p.slug === slug) || null;
  },

  async getProductByExternalId(externalId) {
    return DEMO_PRODUCTS.find((p) => p.externalId === externalId) || null;
  },

  async resolveProductFromUrl(url) {
    // Verifica SHEIN
    const isShein = /shein\./i.test(url);
    // Verifica AliExpress
    const isAliExpress = /aliexpress\./i.test(url);
    // Verifica Vinted
    const isVinted = /vinted\./i.test(url);

    if (!isShein && !isAliExpress && !isVinted) {
      return { status: "unsupported" };
    }

    let match: RegExpMatchArray | null = null;
    let id: string | undefined;

    if (isShein) {
      match = url.match(/p-(\d+)/i) || url.match(/goods[/-]?sn=?(\d+)/i) || url.match(/product[/-](\d+)/i);
      id = match?.[1];
    } else if (isAliExpress) {
      // Padrões AliExpress: /item/1234567890123.html, ?productId=1234567890123
      match = url.match(/\/item\/(\d{12,})/i) || url.match(/[?&]productId[=:](\d{12,})/i) || url.match(/\/p\/(\d{12,})/i);
      id = match?.[1];
    } else if (isVinted) {
      // Padrões Vinted: /items/123456789, /item/123456789
      match = url.match(/\/items\/(\d+)/i) || url.match(/\/item\/(\d+)/i) || url.match(/[?&]item[_-]?id[=:](\d+)/i);
      id = match?.[1];
    }

    if (id) {
      const existing = await this.getProductByExternalId(id);
      if (existing) return { status: "found", externalId: id, product: existing };
    }
    return { status: "needs_confirmation", externalId: id };
  },

  async getProductsByCategory(categorySlug, params) {
    const limit = params?.limit || 24;
    const offset = params?.offset || 0;
    let items = DEMO_PRODUCTS;
    if (categorySlug !== "todos") {
      items = items.filter((p) => p.category?.slug === categorySlug);
    }
    return {
      products: items.slice(offset, offset + limit),
      total: items.length,
    };
  },

  async getFeaturedProducts(limit = 8) {
    return DEMO_PRODUCTS.slice(0, limit);
  },
};
