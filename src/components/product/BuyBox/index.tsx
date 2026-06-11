"use client";

import { Product } from "@/types/product";
import { ProductPricing } from "../ProductInfoSection/ProductPricing";
import { ProductAvailability } from "../ProductInfoSection/ProductAvailability";
import { AddToCartButton } from "../AddToCartButton";
import { WishlistButton } from "../WishlistButton";
import { NotifyMeForm } from "../BackInStockNotify/NotifyMeForm";

interface BuyBoxProps {
  product: Product;
}

/**
 * Unified buy box component for product detail page
 * Consolidates pricing, availability, purchase actions, and trust signals
 *
 * Features:
 * - Responsive pricing display
 * - Real stock availability (no fake urgency)
 * - Quantity selector with validation
 * - Add to cart with success feedback
 * - Wishlist integration
 * - Back-in-stock notifications for out-of-stock products
 * - Trust badges
 * - Sticky positioning on desktop (lg:sticky lg:top-6)
 */
export function BuyBox({ product }: BuyBoxProps) {
  return (
    <div className="bg-background border border-border/40 rounded-xl shadow-lg overflow-hidden">
      {/* Premium gradient header */}
      <div className="bg-gradient-to-br from-background to-background-secondary/40 p-5 lg:p-6">
        {/* Pricing */}
        <ProductPricing
          price={product.price}
          compareAtPrice={product.compareAtPrice}
        />

        {/* Stock Availability - No gap */}
        <ProductAvailability
          inStock={product.inStock}
          stockLevel={product.stockLevel}
        />

        {/* Actions - Conditional based on stock, No extra padding */}
        {product.inStock ? (
          <div className="space-y-2.5 mt-4">
            <AddToCartButton product={product} />
            <WishlistButton
              productId={product.id}
              productName={product.name}
              size="md"
              showLabel={true}
              className="w-full justify-center text-primary hover:text-accent transition-all border border-border/50 hover:border-accent/50 rounded-lg py-2.5 hover:bg-background-secondary/50 font-medium text-sm"
            />
          </div>
        ) : (
          <div className="mt-4">
            <NotifyMeForm
              productId={product.id}
              productName={product.name}
            />
          </div>
        )}
      </div>
    </div>
  );
}
