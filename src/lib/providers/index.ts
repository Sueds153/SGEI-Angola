import type { ProductProvider } from "./product-provider";

// Lazy import para evitar dependências circulares
export async function getActiveProvider(): Promise<ProductProvider> {
  const mod = await import("./unified-provider");
  return mod.unifiedProvider as unknown as ProductProvider;
}

export { mockProductProvider } from "./mock-provider";
export { adminCatalogProvider } from "./admin-provider";
export { aliexpressProvider } from "./aliexpress-provider";
export { vintedProvider } from "./vinted-provider";
export { unifiedProvider } from "./unified-provider";
export type { ProductProvider } from "./product-provider";
