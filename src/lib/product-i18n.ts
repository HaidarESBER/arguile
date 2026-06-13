import type { Locale } from "@/lib/i18n/config";
import { PRODUCT_TRANSLATIONS_EN } from "@/data/product-translations.en";

/**
 * Apply the English copy overlay to a product (or product list item).
 * French is the catalog's native language, so `fr` is a no-op, and products
 * without an overlay entry keep their French content.
 *
 * Server pages should localize products right after fetching them, before
 * passing them to client components.
 */
export function localizeProduct<
  T extends {
    slug: string;
    name: string;
    shortDescription?: string;
    description?: string;
    specs?: { label: string; value: string }[];
  }
>(product: T, locale: Locale): T {
  if (locale !== "en") return product;

  const translation = PRODUCT_TRANSLATIONS_EN[product.slug];
  if (!translation) return product;

  return {
    ...product,
    name: translation.name ?? product.name,
    ...(product.shortDescription !== undefined && {
      shortDescription: translation.shortDescription ?? product.shortDescription,
    }),
    ...(product.description !== undefined && {
      description: translation.description ?? product.description,
    }),
    ...(product.specs !== undefined && {
      specs: translation.specs ?? product.specs,
    }),
  };
}

export function localizeProducts<
  T extends {
    slug: string;
    name: string;
    shortDescription?: string;
    description?: string;
    specs?: { label: string; value: string }[];
  }
>(products: T[], locale: Locale): T[] {
  if (locale !== "en") return products;
  return products.map((product) => localizeProduct(product, locale));
}
