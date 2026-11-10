import type { NormalizedProduct, ProductSource } from "../types";

export interface ProductProvider {
  id: ProductSource;
  searchProducts(query: string, params?: { category?: string; limit?: number }): Promise<NormalizedProduct[]>;
  getProductBySlug(slug: string): Promise<NormalizedProduct | null>;
  getProductByExternalId(externalId: string): Promise<NormalizedProduct | null>;
  resolveProductFromUrl(url: string): Promise<{
    status: "found" | "needs_confirmation" | "unsupported";
    externalId?: string;
    product?: NormalizedProduct | null;
  }>;
  getProductsByCategory(
    categorySlug: string,
    params?: { limit?: number; offset?: number; sort?: string }
  ): Promise<{ products: NormalizedProduct[]; total: number }>;
  getFeaturedProducts(limit?: number): Promise<NormalizedProduct[]>;
}

// Nota: o provider ativo é carregado via ./index.ts para evitar dependências circulares.
