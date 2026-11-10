"use server";

import { getActiveProvider } from "@/lib/providers";

export async function getFeaturedProducts(limit = 8) {
  const provider = await getActiveProvider();
  return provider.getFeaturedProducts(limit);
}

export async function searchProducts(query: string, params?: { category?: string; limit?: number }) {
  const provider = await getActiveProvider();
  return provider.searchProducts(query, params);
}

export async function getProductsByCategory(categorySlug: string, params?: { limit?: number; offset?: number; sort?: string }) {
  const provider = await getActiveProvider();
  return provider.getProductsByCategory(categorySlug, params);
}

export async function getProductBySlug(slug: string) {
  const provider = await getActiveProvider();
  return provider.getProductBySlug(slug);
}

export async function getProductByExternalId(externalId: string) {
  const provider = await getActiveProvider();
  return provider.getProductByExternalId(externalId);
}

export async function resolveProductFromUrl(url: string) {
  const provider = await getActiveProvider();
  return provider.resolveProductFromUrl(url);
}