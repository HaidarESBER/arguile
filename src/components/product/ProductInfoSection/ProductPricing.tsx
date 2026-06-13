"use client";

import { memo } from "react";
import { formatPrice } from "@/types/product";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";
import { Truck } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

const STRINGS = {
  fr: {
    vatIncluded: "TVA incluse",
    freeShipping: "Livraison gratuite",
    freeShippingFrom: (amount: string) =>
      `Livraison gratuite dès ${amount} de plus`,
  },
  en: {
    vatIncluded: "VAT included",
    freeShipping: "Free shipping",
    freeShippingFrom: (amount: string) =>
      `Free shipping if you add ${amount} more`,
  },
} as const;

interface ProductPricingProps {
  price: number;
  compareAtPrice?: number;
}

/**
 * Product pricing display with discount calculation
 * Enhanced for desktop with larger fonts and shipping badge
 * Memoized to prevent unnecessary re-renders
 */
export const ProductPricing = memo(function ProductPricing({ price, compareAtPrice }: ProductPricingProps) {
  const { locale } = useLocale();
  const t = STRINGS[locale];
  const hasDiscount = compareAtPrice && compareAtPrice > price;
  const freeShippingThreshold = FREE_SHIPPING_THRESHOLD;

  return (
    <div className="mb-4">
      <div className="flex items-baseline gap-2.5 mb-1.5">
        <span className="text-2xl md:text-3xl font-bold text-primary">
          {formatPrice(price)}
        </span>
        {hasDiscount && (
          <span className="text-base text-muted line-through">
            {formatPrice(compareAtPrice)}
          </span>
        )}
      </div>
      <p className="text-xs text-muted mb-2">{t.vatIncluded}</p>

      {/* Free shipping badge */}
      {price >= freeShippingThreshold ? (
        <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-medium">
          <Truck className="w-3.5 h-3.5" />
          <span>{t.freeShipping}</span>
        </div>
      ) : (
        <div className="inline-flex items-center gap-1.5 bg-background-secondary px-2.5 py-1 rounded-full text-xs text-muted">
          <Truck className="w-3.5 h-3.5" />
          <span>
            {t.freeShippingFrom(formatPrice(freeShippingThreshold - price))}
          </span>
        </div>
      )}
    </div>
  );
});
