"use client";

import Image from "next/image";
import { CartItem, calculateSubtotal, formatCartTotal } from "@/types/cart";
import { useCart } from "@/contexts/CartContext";

interface OrderSummaryProps {
  items: CartItem[];
  shippingCost?: number; // in cents
  discount?: { code: string; amount: number; label: string };
}

/** Maximum quantity per line item — must match /api/checkout */
const MAX_QUANTITY = 50;

/**
 * OrderSummary component for checkout page
 *
 * Displays cart items in a compact format with:
 * - Product image, name, line total
 * - Editable quantity (− / +) and item removal, synced to the cart —
 *   totals, shipping and the free-shipping threshold update live
 * - Subtotal, discount line, shipping cost, order total
 */
export function OrderSummary({ items, shippingCost = 0, discount }: OrderSummaryProps) {
  const { updateQuantity, removeItem } = useCart();
  const subtotal = calculateSubtotal(items);
  const discountAmount = discount ? discount.amount : 0;
  const total = Math.max(0, subtotal - discountAmount + shippingCost);

  return (
    <div className="bg-background-card rounded-[--radius-card] p-6">
      <h2 className="font-heading text-xl text-primary mb-4">
        Votre commande
      </h2>

      {/* Items list */}
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <div key={item.product.id} className="flex gap-3">
            {/* Product image */}
            <div className="relative w-16 h-16 flex-shrink-0 rounded-[--radius-button] overflow-hidden bg-background-secondary">
              {item.product.images[0] ? (
                <Image
                  src={item.product.images[0]}
                  alt={item.product.name}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-muted">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                </div>
              )}
            </div>

            {/* Product details + quantity controls */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-primary truncate">
                {item.product.name}
              </h3>
              <div className="flex items-center gap-2 mt-1.5">
                <button
                  type="button"
                  onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                  aria-label={`Réduire la quantité de ${item.product.name}`}
                  className="w-7 h-7 flex items-center justify-center rounded-full border border-white/15 text-text hover:border-primary/60 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="text-sm text-text w-6 text-center tabular-nums">
                  {item.quantity}
                </span>
                <button
                  type="button"
                  onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  disabled={
                    item.quantity >=
                    Math.min(MAX_QUANTITY, item.product.stockLevel ?? MAX_QUANTITY)
                  }
                  aria-label={`Augmenter la quantité de ${item.product.name}`}
                  className="w-7 h-7 flex items-center justify-center rounded-full border border-white/15 text-text hover:border-primary/60 hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>

            {/* Line total + remove */}
            <div className="flex flex-col items-end justify-between">
              <div className="text-sm font-medium text-primary">
                {formatCartTotal(item.product.price * item.quantity)}
              </div>
              <button
                type="button"
                onClick={() => removeItem(item.product.id)}
                aria-label={`Retirer ${item.product.name} de la commande`}
                className="text-xs text-muted hover:text-error transition-colors underline underline-offset-2"
              >
                Retirer
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="space-y-3 border-t border-background-secondary pt-4">
        <div className="flex justify-between text-sm text-muted">
          <span>Sous-total</span>
          <span>{formatCartTotal(subtotal)}</span>
        </div>
        {discount && discount.amount > 0 && (
          <div className="flex justify-between text-sm font-medium text-success">
            <span>Remise ({discount.code})</span>
            <span>-{formatCartTotal(discount.amount)}</span>
          </div>
        )}
        <div className="flex justify-between text-sm text-muted">
          <span>Livraison</span>
          <span>{shippingCost > 0 ? formatCartTotal(shippingCost) : "Calculer"}</span>
        </div>
        <hr className="border-background-secondary" />
        <div className="flex justify-between font-medium text-lg text-primary">
          <span>Total</span>
          <span>{formatCartTotal(total)}</span>
        </div>
      </div>
    </div>
  );
}
