"use client";

import { Product } from "@/types/product";

const RECENTLY_VIEWED_KEY = "nuage_recently_viewed";
const MAX_RECENTLY_VIEWED = 6;

export interface RecentlyViewedItem {
  productId: string;
  slug: string;
  timestamp: number;
}

/**
 * Get recently viewed products from localStorage
 */
export function getRecentlyViewed(): RecentlyViewedItem[] {
  if (typeof window === "undefined") return [];

  try {
    const stored = localStorage.getItem(RECENTLY_VIEWED_KEY);
    if (!stored) return [];

    const items: RecentlyViewedItem[] = JSON.parse(stored);
    return items;
  } catch {
    return [];
  }
}

/**
 * Add product to recently viewed (client-side only)
 */
export function addToRecentlyViewed(product: Product): void {
  if (typeof window === "undefined") return;

  try {
    const items = getRecentlyViewed();

    // Remove if already exists (we'll re-add to front)
    const filtered = items.filter((item) => item.productId !== product.id);

    // Add to front
    const updated = [
      {
        productId: product.id,
        slug: product.slug,
        timestamp: Date.now(),
      },
      ...filtered,
    ].slice(0, MAX_RECENTLY_VIEWED);

    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to update recently viewed:", error);
  }
}

/**
 * Get product IDs for recently viewed items (excluding current product)
 */
export function getRecentlyViewedIds(excludeId?: string): string[] {
  const items = getRecentlyViewed();
  return items
    .filter((item) => item.productId !== excludeId)
    .map((item) => item.productId);
}

/**
 * Check if product should show trending badge (simple static rule for MVP)
 */
export function isTrending(product: Product): boolean {
  // MVP: Show trending badge on featured products
  // In future: Replace with actual view count or sales data
  return product.featured;
}
