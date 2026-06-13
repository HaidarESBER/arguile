"use client";

import { useLocale } from "@/contexts/LocaleContext";

const STRINGS = {
  fr: {
    inStock: "En stock",
    outOfStock: "Rupture de stock",
    almostGone: "Bientôt épuisé",
  },
  en: {
    inStock: "In stock",
    outOfStock: "Out of stock",
    almostGone: "Almost gone",
  },
} as const;

interface StockIndicatorProps {
  inStock: boolean;
  stockLevel?: number;
  size?: "sm" | "md";
  showDot?: boolean;
}

/**
 * StockIndicator component displays inventory urgency
 *
 * Stock levels:
 * - 0: "Rupture de stock" (red, no purchase)
 * - 1-5: "Plus que X en stock !" (red/orange, urgent)
 * - 6-10: "Stock limité" (orange, moderate urgency)
 * - 11+: "En stock" (green, no urgency display)
 *
 * Features:
 * - Color coded: red (#DC2626), orange (#F97316), green (#16A34A)
 * - Pulse animation for urgent stock (1-5 items)
 * - Position: Near price on product detail, subtle on card
 */
export function StockIndicator({
  inStock,
  stockLevel,
  size = "md",
  showDot = true,
}: StockIndicatorProps) {
  const { locale } = useLocale();
  const t = STRINGS[locale];
  // If no stockLevel provided, fallback to simple inStock display
  if (stockLevel === undefined) {
    return (
      <div className="flex items-center gap-2">
        {showDot && (
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              inStock ? "bg-success" : "bg-error"
            }`}
          />
        )}
        <span
          className={`${size === "sm" ? "text-xs" : "text-sm"} font-medium ${
            inStock ? "text-success" : "text-error"
          }`}
        >
          {inStock ? t.inStock : t.outOfStock}
        </span>
      </div>
    );
  }

  // Out of stock
  if (stockLevel === 0 || !inStock) {
    return (
      <div className="flex items-center gap-2">
        {showDot && <span className="w-2.5 h-2.5 rounded-full bg-error" />}
        <span
          className={`${size === "sm" ? "text-xs" : "text-sm"} font-medium text-error`}
        >
          {t.outOfStock}
        </span>
      </div>
    );
  }

  // Genuinely low stock (1-5 items) — stated calmly, no pulse, no "!"
  if (stockLevel <= 5) {
    return (
      <div className="flex items-center gap-2">
        {showDot && <span className="w-2.5 h-2.5 rounded-full bg-[#F97316]" />}
        <span
          className={`${size === "sm" ? "text-xs" : "text-sm"} font-medium text-text-muted`}
        >
          {t.almostGone}
        </span>
      </div>
    );
  }

  // Good stock (11+ items)
  return (
    <div className="flex items-center gap-2">
      {showDot && <span className="w-2.5 h-2.5 rounded-full bg-success" />}
      <span
        className={`${size === "sm" ? "text-xs" : "text-sm"} font-medium text-success`}
      >
        {t.inStock}
      </span>
    </div>
  );
}
