/**
 * Product type definitions for Nuage e-commerce
 */

export type ProductCategory =
  | "chicha"
  | "bol"
  | "tuyau"
  | "charbon"
  | "accessoire";

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  shortDescription: string;
  /** Price in cents (e.g., 4999 = 49.99 EUR) */
  price: number;
  /** Original price in cents for sale display */
  compareAtPrice?: number;
  images: string[];
  category: ProductCategory;
  inStock: boolean;
  /** Stock level: 0 = out of stock, 1-5 = urgent, 6-10 = limited, 11+ = in stock */
  stockLevel?: number;
  featured: boolean;
  /** Optional product specifications */
  specs?: ProductSpec[];
}

/**
 * Category display names in French (kept as-is for the French-only admin).
 * Customer-facing components should use getCategoryLabel(category, locale).
 */
export const categoryLabels: Record<ProductCategory, string> = {
  chicha: "Chichas",
  bol: "Bols",
  tuyau: "Tuyaux",
  charbon: "Charbon",
  accessoire: "Accessoires",
};

const categoryLabelsEn: Record<ProductCategory, string> = {
  chicha: "Hookahs",
  bol: "Bowls",
  tuyau: "Hoses",
  charbon: "Charcoal",
  accessoire: "Accessories",
};

/**
 * Localized category display name.
 */
export function getCategoryLabel(
  category: ProductCategory,
  locale: "fr" | "en"
): string {
  return locale === "en" ? categoryLabelsEn[category] : categoryLabels[category];
}

/**
 * Format price in cents to EUR string
 * @param cents - Price in cents
 * @returns Formatted price string (e.g., "49,99 EUR")
 */
export function formatPrice(cents: number): string {
  const euros = cents / 100;
  return euros.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}
