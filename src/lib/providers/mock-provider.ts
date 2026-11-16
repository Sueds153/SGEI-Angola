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
    id: "demo-vestido-longo-festa-cetim",
    externalId: "DEMO-002",
    source: "SHEIN" as ProductSource,
    sourceUrl: "https://shein.com/p/2",
    name: "Vestido Longo de Festa Cetim com Fenda Lateral",
    slug: "demo-vestido-longo-festa-cetim",
    description: "Vestido feminino de gala em cetim nobre com fenda lateral elegante e costas semi-abertas. Caimento fluido impecável para festas, casamentos e cerimónias em Angola.",
    category: CATEGORIES[0],
    images: ["/images/prod-24.jpg", "/images/prod-20.jpg"],
    defaultImage: "/images/prod-24.jpg",
    originalPriceUsd: 29.5,
    currency: "USD",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "SH-VST-FESTA-CETIM",
    rating: 4.9,
    reviewCount: 428,
    weightGrams: 380,
    badge: "✨ Gala & Casamentos • Cetim Premium",
    variants: [
      { id: "d2v1", externalId: null, color: "Bordeaux", size: "S", otherOptions: null, sku: "SH-VFC-BRD-S", priceModifierUsd: 0, stockQuantity: 15, available: true, imageUrl: null },
      { id: "d2v2", externalId: null, color: "Bordeaux", size: "M", otherOptions: null, sku: "SH-VFC-BRD-M", priceModifierUsd: 0, stockQuantity: 20, available: true, imageUrl: null },
      { id: "d2v3", externalId: null, color: "Verde Esmeralda", size: "M", otherOptions: null, sku: "SH-VFC-VRD-M", priceModifierUsd: 0, stockQuantity: 12, available: true, imageUrl: null },
    ],
  },
  {
    id: "demo-conjunto-feminino-blazer",
    externalId: "DEMO-003",
    source: "SHEIN" as ProductSource,
    sourceUrl: "https://shein.com/p/3",
    name: "Conjunto Feminino Elegante Blazer + Calças Alfaiataria",
    slug: "demo-conjunto-feminino-blazer",
    description: "Conjunto feminino estruturado de 2 peças composto por blazer com botões dourados e calças de cintura alta. Perfeito para trabalho corporativo, reuniões executivas e eventos sociais em Luanda.",
    category: CATEGORIES[0],
    images: ["/images/demo-08.jpg", "/images/demo-04.jpg"],
    defaultImage: "/images/demo-08.jpg",
    originalPriceUsd: 38.0,
    currency: "USD",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "SH-CNJ-BLAZER-ALF",
    rating: 4.8,
    reviewCount: 310,
    weightGrams: 620,
    badge: "✨ Alfaiataria Chic • 2 Peças",
    variants: [
      { id: "d3v1", externalId: null, color: "Bege Creme", size: "S", otherOptions: null, sku: "SH-CBA-BG-S", priceModifierUsd: 0, stockQuantity: 10, available: true, imageUrl: null },
      { id: "d3v2", externalId: null, color: "Bege Creme", size: "M", otherOptions: null, sku: "SH-CBA-BG-M", priceModifierUsd: 0, stockQuantity: 14, available: true, imageUrl: null },
      { id: "d3v3", externalId: null, color: "Preto", size: "M", otherOptions: null, sku: "SH-CBA-PT-M", priceModifierUsd: 0, stockQuantity: 18, available: true, imageUrl: null },
    ],
  },
  {
    id: "demo-vestido-evase-estampado",
    externalId: "DEMO-004",
    source: "SHEIN" as ProductSource,
    sourceUrl: "https://shein.com/p/4",
    name: "Vestido Evasê Estampado Decote em V com Cinto",
    slug: "demo-vestido-evase-estampado",
    description: "Vestido curto evasê feminino com corte em A, decote em V e cinto a condizer. Super prático, fresco e elegante para o dia a dia e passeios de fim de semana.",
    category: CATEGORIES[0],
    images: ["/images/prod-20.jpg", "/images/demo-05.jpg"],
    defaultImage: "/images/prod-20.jpg",
    originalPriceUsd: 16.5,
    currency: "USD",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "SH-VST-EVASE-EST",
    rating: 4.7,
    reviewCount: 295,
    weightGrams: 290,
    badge: "✨ Dia a Dia Fresco • Acinturado",
    variants: [
      { id: "d4v1", externalId: null, color: "Floral Azul", size: "S", otherOptions: null, sku: "SH-VEE-AZ-S", priceModifierUsd: 0, stockQuantity: 20, available: true, imageUrl: null },
      { id: "d4v2", externalId: null, color: "Floral Azul", size: "M", otherOptions: null, sku: "SH-VEE-AZ-M", priceModifierUsd: 0, stockQuantity: 25, available: true, imageUrl: null },
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

  // ===== ALIEXPRESS DEMO PRODUCTS (Choice & Verificados) =====
  {
    id: "aliexpress-smartwatch-amoled-gps",
    externalId: "1005001111222233",
    source: "ALIEXPRESS" as ProductSource,
    sourceUrl: "https://pt.aliexpress.com/item/1005001111222233.html",
    name: "Smartwatch AMOLED Ultra GPS Monitor Cardíaco IP68",
    slug: "aliexpress-smartwatch-amoled-gps",
    description: "Smartwatch AMOLED Ultra Choice Verificado. GPS integrado, tela AMOLED 1.96\" HD, oxímetro SpO2, chamadas Bluetooth, 100+ modos desporto. Envio direto com entrega gratuita até Luanda.",
    category: CATEGORIES[5],
    images: [
      "/images/prod-14.jpg",
      "/images/prod-01.jpg",
    ],
    defaultImage: "/images/prod-14.jpg",
    originalPriceUsd: 39.9,
    currency: "USD",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "AE-SW-AMOLED-GPS",
    rating: 4.8,
    reviewCount: 3840,
    weightGrams: 55,
    badge: "⭐ Choice • Entrega Grátis",
    verifiedSupplier: true,
    freeShipping: true,
    variants: [
      { id: "ae1v1", externalId: "1005001111222233-BLK", color: "Preto", size: "Único", otherOptions: null, sku: "AE-SW-BLK", priceModifierUsd: 0, stockQuantity: 60, available: true, imageUrl: null },
      { id: "ae1v2", externalId: "1005001111222233-GRY", color: "Cinza Titânio", size: "Único", otherOptions: null, sku: "AE-SW-GRY", priceModifierUsd: 0, stockQuantity: 45, available: true, imageUrl: null },
    ],
  },
  {
    id: "aliexpress-fone-bluetooth-anc",
    externalId: "1005009876543210",
    source: "ALIEXPRESS" as ProductSource,
    sourceUrl: "https://pt.aliexpress.com/item/1005009876543210.html",
    name: "Auscultadores Bluetooth 5.3 ANC Cancelamento Ruído Ativo",
    slug: "aliexpress-fone-bluetooth-anc",
    description: "Fones intra-auriculares com cancelamento ativo de ruído ANC -38dB, 35h bateria, carregamento rápido USB-C, resistência IPX5. Fornecedor Choice com frete grátis.",
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
    sku: "AE-TWS-ANC-53",
    rating: 4.9,
    reviewCount: 5120,
    weightGrams: 65,
    badge: "⭐ Choice • Entrega Grátis",
    verifiedSupplier: true,
    freeShipping: true,
    variants: [
      { id: "ae2v1", externalId: "1005009876543210-BLK", color: "Preto", size: "Único", otherOptions: null, sku: "AE-TWS-BLK", priceModifierUsd: 0, stockQuantity: 100, available: true, imageUrl: null },
      { id: "ae2v2", externalId: "1005009876543210-WHT", color: "Branco", size: "Único", otherOptions: null, sku: "AE-TWS-WHT", priceModifierUsd: 0, stockQuantity: 80, available: true, imageUrl: null },
    ],
  },
  {
    id: "aliexpress-power-bank-20000mah",
    externalId: "1005001234567890",
    source: "ALIEXPRESS" as ProductSource,
    sourceUrl: "https://pt.aliexpress.com/item/1005001234567890.html",
    name: "Power Bank 20.000mAh 65W Carregamento Ultra-Rápido",
    slug: "aliexpress-power-bank-20000mah",
    description: "Bateria externa 20.000mAh 65W Power Delivery. Carrega iPhone, Samsung e computadores portáteis a alta velocidade. Display digital LED de percentagem.",
    category: CATEGORIES[8],
    images: [
      "/images/prod-03.jpg",
      "/images/prod-08.jpg",
    ],
    defaultImage: "/images/prod-03.jpg",
    originalPriceUsd: 32.5,
    currency: "USD",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "AE-PB-20000-65W",
    rating: 4.8,
    reviewCount: 2780,
    weightGrams: 420,
    badge: "⭐ Choice • Entrega Grátis",
    verifiedSupplier: true,
    freeShipping: true,
    variants: [
      { id: "ae3v1", externalId: "1005001234567890-BLK", color: "Preto Fosco", size: "20.000mAh", otherOptions: null, sku: "AE-PB-BLK", priceModifierUsd: 0, stockQuantity: 50, available: true, imageUrl: null },
    ],
  },
  {
    id: "aliexpress-projetor-portatil-4k",
    externalId: "1005007788990011",
    source: "ALIEXPRESS" as ProductSource,
    sourceUrl: "https://pt.aliexpress.com/item/1005007788990011.html",
    name: "Mini Projetor Portátil 4K WiFi Dual HDMI Cinema em Casa",
    slug: "aliexpress-projetor-portatil-4k",
    description: "Mini projetor inteligente com suporte nativo a 4K, Android TV integrado, WiFi 6, rotação 180° e som estéreo Hi-Fi. Fornecedor Choice verificado com frete grátis.",
    category: CATEGORIES[8],
    images: [
      "/images/prod-04.jpg",
    ],
    defaultImage: "/images/prod-04.jpg",
    originalPriceUsd: 68.0,
    currency: "USD",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "AE-PROJ-4K-SMART",
    rating: 4.7,
    reviewCount: 1940,
    weightGrams: 850,
    badge: "⭐ Choice • Entrega Grátis",
    verifiedSupplier: true,
    freeShipping: true,
    variants: [
      { id: "ae4v1", externalId: "1005007788990011-WHT", color: "Branco", size: "4K Smart", otherOptions: null, sku: "AE-PROJ-WHT", priceModifierUsd: 0, stockQuantity: 35, available: true, imageUrl: null },
    ],
  },

  // ===== VINTED DEMO PRODUCTS (iPhones Seminovos da Europa) =====
  {
    id: "vinted-iphone-15-pro-max-256gb",
    externalId: "vinted-ip15pm",
    source: "VINTED" as ProductSource,
    sourceUrl: "https://www.vinted.pt/items/1500000001",
    name: "Apple iPhone 15 Pro Max 256GB Titânio Natural",
    slug: "vinted-iphone-15-pro-max-256gb",
    description: "iPhone 15 Pro Max 256GB Titânio Natural original da Europa. Saúde da bateria 94%, 100% desbloqueado para todas as redes em Angola (Unitel, Africell, Movicel). Sem marcas de uso, cabo USB-C original incluído.",
    category: CATEGORIES[8],
    images: [
      "/images/prod-17.jpg",
      "/images/prod-08.jpg",
    ],
    defaultImage: "/images/prod-17.jpg",
    originalPriceUsd: 780.0,
    currency: "EUR",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "VT-IP15PM-256-NAT",
    rating: 5.0,
    reviewCount: 312,
    weightGrams: 221,
    batteryHealth: "94%",
    badge: "🔋 Bateria 94% • Desbloqueado",
    variants: [
      { id: "vt1v1", externalId: "vinted-ip15pm-1", color: "Titânio Natural", size: "256GB", otherOptions: { condition: "Excelente / Como Novo", battery: "94%", unlock: "Unitel / Africell / Movicel" }, sku: "VT-IP15PM-NAT", priceModifierUsd: 0, stockQuantity: 1, available: true, imageUrl: null },
    ],
  },
  {
    id: "vinted-iphone-14-pro-128gb",
    externalId: "vinted-ip14p",
    source: "VINTED" as ProductSource,
    sourceUrl: "https://www.vinted.pt/items/1400000002",
    name: "Apple iPhone 14 Pro 128GB Roxo Profundo",
    slug: "vinted-iphone-14-pro-128gb",
    description: "iPhone 14 Pro 128GB Roxo Profundo (Deep Purple). Bateria original 89%, Dynamic Island 100% funcional. Desbloqueado para qualquer operadora em Angola. Testado e certificado na Europa.",
    category: CATEGORIES[8],
    images: [
      "/images/prod-08.jpg",
      "/images/prod-17.jpg",
    ],
    defaultImage: "/images/prod-08.jpg",
    originalPriceUsd: 540.0,
    currency: "EUR",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "VT-IP14P-128-PUR",
    rating: 4.9,
    reviewCount: 245,
    weightGrams: 206,
    batteryHealth: "89%",
    badge: "🔋 Bateria 89% • Desbloqueado",
    variants: [
      { id: "vt2v1", externalId: "vinted-ip14p-1", color: "Roxo Profundo", size: "128GB", otherOptions: { condition: "Muito Bom", battery: "89%", unlock: "Unitel / Africell / Movicel" }, sku: "VT-IP14P-PUR", priceModifierUsd: 0, stockQuantity: 1, available: true, imageUrl: null },
    ],
  },
  {
    id: "vinted-iphone-13-128gb-midnight",
    externalId: "vinted-ip13",
    source: "VINTED" as ProductSource,
    sourceUrl: "https://www.vinted.pt/items/1300000003",
    name: "Apple iPhone 13 128GB Meia-Noite",
    slug: "vinted-iphone-13-128gb-midnight",
    description: "iPhone 13 128GB Cor Meia-Noite (Midnight). Saúde da bateria 88%, Face ID impecável, tela OLED sem arranhões. Desbloqueado para Unitel, Africell e Movicel.",
    category: CATEGORIES[8],
    images: [
      "/images/prod-16.jpg",
      "/images/prod-08.jpg",
    ],
    defaultImage: "/images/prod-16.jpg",
    originalPriceUsd: 390.0,
    currency: "EUR",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "VT-IP13-128-MID",
    rating: 4.9,
    reviewCount: 189,
    weightGrams: 174,
    batteryHealth: "88%",
    badge: "🔋 Bateria 88% • Desbloqueado",
    variants: [
      { id: "vt3v1", externalId: "vinted-ip13-1", color: "Meia-Noite", size: "128GB", otherOptions: { condition: "Excelente", battery: "88%", unlock: "Unitel / Africell / Movicel" }, sku: "VT-IP13-MID", priceModifierUsd: 0, stockQuantity: 1, available: true, imageUrl: null },
    ],
  },
  {
    id: "vinted-iphone-12-pro-128gb",
    externalId: "vinted-ip12p",
    source: "VINTED" as ProductSource,
    sourceUrl: "https://www.vinted.pt/items/1200000004",
    name: "Apple iPhone 12 Pro 128GB Azul Pacífico",
    slug: "vinted-iphone-12-pro-128gb",
    description: "iPhone 12 Pro 128GB Azul Pacífico (Pacific Blue). Três câmaras profissionais com 4K Dolby Vision, estrutura em aço inoxidável e bateria a 86%. Pronto para usar em Angola.",
    category: CATEGORIES[8],
    images: [
      "/images/prod-17.jpg",
      "/images/prod-16.jpg",
    ],
    defaultImage: "/images/prod-17.jpg",
    originalPriceUsd: 295.0,
    currency: "EUR",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: "VT-IP12P-128-BLU",
    rating: 4.8,
    reviewCount: 176,
    weightGrams: 189,
    batteryHealth: "86%",
    badge: "🔋 Bateria 86% • Desbloqueado",
    variants: [
      { id: "vt4v1", externalId: "vinted-ip12p-1", color: "Azul Pacífico", size: "128GB", otherOptions: { condition: "Muito Bom", battery: "86%", unlock: "Unitel / Africell / Movicel" }, sku: "VT-IP12P-BLU", priceModifierUsd: 0, stockQuantity: 1, available: true, imageUrl: null },
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

  async getFeaturedProducts(limit = 24) {
    // Retorna uma seleção equilibrada de produtos reais de destaque:
    // iPhones da Vinted + Gadgets Choice do AliExpress + Moda feminina da Shein
    const vinted = DEMO_PRODUCTS.filter((p) => p.source === "VINTED");
    const aliexpress = DEMO_PRODUCTS.filter((p) => p.source === "ALIEXPRESS");
    const shein = DEMO_PRODUCTS.filter((p) => p.source === "SHEIN" || p.source === "MOCK");
    
    const combined = [...vinted, ...shein, ...aliexpress];
    return combined.slice(0, limit);
  },
};
