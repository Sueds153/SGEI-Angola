import { expect, test } from "@playwright/test";
import type { NormalizedProduct } from "../src/lib/types";
import { discoverProducts } from "../src/lib/search/product-discovery";

const now = new Date("2026-11-20T12:00:00.000Z");

function product(
  name: string,
  source: NormalizedProduct["source"],
  options: { category?: string; publishedAt?: string | Date | null } = {}
) {
  return {
    id: name,
    externalId: null,
    source,
    sourceUrl: null,
    name,
    slug: name.toLowerCase().replaceAll(" ", "-"),
    description: null,
    category: options.category
      ? { id: 1, name: options.category, slug: options.category }
      : null,
    images: [],
    defaultImage: null,
    originalPriceUsd: 10,
    currency: "EUR",
    availability: "IN_STOCK",
    status: "ACTIVE",
    sku: null,
    variants: [],
    rating: null,
    reviewCount: 0,
    weightGrams: null,
    publishedAt: options.publishedAt,
  } as NormalizedProduct & { publishedAt?: string | Date | null };
}

test("limita SHEIN a vestuário e AliExpress a electrónica", () => {
  const products = [
    product("Vestido midi floral", "SHEIN"),
    product("Lâmpada de secretária", "SHEIN", { category: "Casa" }),
    product("Chinelos slide unissexo", "SHEIN", { category: "Calçados" }),
    product("Conjunto pincéis maquiagem 12 peças", "SHEIN", { category: "Vestuário feminino" }),
    product("Conjunto lençóis 4 peças", "SHEIN", { category: "Vestuário feminino" }),
    product("Auriculares bluetooth", "ALIEXPRESS"),
    product("Carteira de pele", "ALIEXPRESS"),
  ];

  const shein = discoverProducts(products, { store: "SHEIN", query: "" }, now);
  const aliexpress = discoverProducts(products, { store: "ALIEXPRESS", query: "" }, now);

  expect(shein.products.map((item) => item.name)).toEqual(["Vestido midi floral"]);
  expect(aliexpress.products.map((item) => item.name)).toEqual(["Auriculares bluetooth"]);
});

test("Vinted só mostra iPhones com publicação confirmada nas últimas 72 horas", () => {
  const products = [
    product("iPhone 15 Pro", "VINTED", { publishedAt: new Date(now.getTime() - 72 * 60 * 60 * 1000) }),
    product("iPhone 14", "VINTED"),
    product("Capa para iPhone", "VINTED", { publishedAt: new Date(now.getTime() - 60_000) }),
    product("iPhone 13", "VINTED", { publishedAt: new Date(now.getTime() + 60_000) }),
    product("iPhone 12", "VINTED", { publishedAt: new Date(now.getTime() - 73 * 60 * 60 * 1000) }),
  ];

  const result = discoverProducts(products, { store: "VINTED", query: "iphone" }, now);

  expect(result.products.map((item) => item.name)).toEqual(["iPhone 15 Pro"]);
  expect(result.vintedFreshnessUnavailable).toBe(false);
});

test("avisa quando existem iPhones Vinted mas nenhum tem publicação elegível", () => {
  const result = discoverProducts(
    [product("iPhone 14", "VINTED")],
    { store: "VINTED", query: "iphone" },
    now
  );

  expect(result.products).toEqual([]);
  expect(result.vintedFreshnessUnavailable).toBe(true);
});

test("filtra o termo de pesquisa depois de aplicar a loja", () => {
  const products = [
    product("Vestido midi floral", "SHEIN"),
    product("Calças de ganga", "SHEIN"),
  ];

  const result = discoverProducts(products, { store: "SHEIN", query: "ganga" }, now);

  expect(result.products.map((item) => item.name)).toEqual(["Calças de ganga"]);
});
