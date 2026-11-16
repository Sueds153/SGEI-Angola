"use server";

import { getActiveProvider } from "@/lib/providers";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { and, eq, inArray, isNotNull } from "drizzle-orm";
import type { NormalizedProduct } from "@/lib/types";

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

/**
 * Ranks catalog products using product similarity and anonymous co-purchase
 * counts. No individual customer history is read or exposed.
 */
export async function getRecommendedProducts(product: NormalizedProduct, limit = 8) {
  const provider = await getActiveProvider();
  const candidates = await provider.getFeaturedProducts(24);
  const currentId = Number(product.id);
  const coPurchaseCounts = new Map<number, number>();

  if (Number.isInteger(currentId) && currentId > 0) {
    const eligibleStatuses = [
      "PAID",
      "PURCHASE_PENDING",
      "PURCHASED",
      "PREPARING_SHIPMENT",
      "IN_TRANSIT",
      "ARRIVED_IN_ANGOLA",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ] as const;

    const matchingOrders = await db
      .select({ orderId: orderItems.orderId })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(eq(orderItems.productId, currentId), inArray(orders.status, eligibleStatuses)))
      .limit(500);

    const orderIds = [...new Set(matchingOrders.map((row) => row.orderId))];
    if (orderIds.length > 0) {
      const pairedItems = await db
        .select({ productId: orderItems.productId })
        .from(orderItems)
        .where(and(inArray(orderItems.orderId, orderIds), isNotNull(orderItems.productId)));

      for (const row of pairedItems) {
        if (row.productId && row.productId !== currentId) {
          coPurchaseCounts.set(row.productId, (coPurchaseCounts.get(row.productId) || 0) + 1);
        }
      }
    }
  }

  const tokenize = (value: string) =>
    new Set(
      value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 2)
    );
  const productWords = tokenize(product.name);

  return candidates
    .filter((candidate) => candidate.slug !== product.slug && candidate.id !== product.id)
    .map((candidate) => {
      let score = 0;
      if (product.category?.slug && candidate.category?.slug === product.category.slug) score += 5;
      if (candidate.source === product.source) score += 2;

      const candidateWords = tokenize(candidate.name);
      const overlap = [...productWords].filter((word) => candidateWords.has(word)).length;
      const union = new Set([...productWords, ...candidateWords]).size;
      if (union > 0) score += (overlap / union) * 3;

      if (
        product.originalPriceUsd &&
        candidate.originalPriceUsd &&
        product.currency === candidate.currency
      ) {
        const relativeDifference = Math.abs(product.originalPriceUsd - candidate.originalPriceUsd) / product.originalPriceUsd;
        if (relativeDifference <= 0.3) score += 1.5 * (1 - relativeDifference);
      }

      const candidateId = Number(candidate.id);
      if (Number.isInteger(candidateId)) {
        score += Math.log1p(coPurchaseCounts.get(candidateId) || 0) * 4;
      }

      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score || a.candidate.name.localeCompare(b.candidate.name))
    .slice(0, limit)
    .map(({ candidate }) => candidate);
}

export async function getProductByExternalId(externalId: string) {
  const provider = await getActiveProvider();
  return provider.getProductByExternalId(externalId);
}

export async function resolveProductFromUrl(url: string) {
  const provider = await getActiveProvider();
  return provider.resolveProductFromUrl(url);
}
