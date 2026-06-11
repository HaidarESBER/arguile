"use client";

import { StockIndicator } from "@/components/product/StockIndicator";

interface ProductAvailabilityProps {
  inStock: boolean;
  stockLevel?: number;
}

/**
 * Product availability indicator
 * Shows real stock information only (no fake urgency)
 */
export function ProductAvailability({
  inStock,
  stockLevel,
}: ProductAvailabilityProps) {
  return (
    <div className="mb-6 pb-6 border-b border-border">
      <StockIndicator
        inStock={inStock}
        stockLevel={stockLevel}
        size="sm"
      />
    </div>
  );
}
