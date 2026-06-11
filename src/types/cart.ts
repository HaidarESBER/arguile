/**
 * Cart type definitions for Nuage e-commerce
 */

import { Product } from "./product";

/**
 * Represents an item in the shopping cart
 */
export interface CartItem {
  product: Product;
  quantity: number;
}

/**
 * Shopping cart data structure
 */
export interface Cart {
  items: CartItem[];
}

/**
 * Calculate subtotal from cart items (in cents)
 * @param items - Array of cart items
 * @returns Total price in cents
 */
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
}

/**
 * Calculate total number of items in cart
 * @param items - Array of cart items
 * @returns Total quantity count
 */
export function calculateTotalItems(items: CartItem[]): number {
  return items.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Format cart total for display
 * Uses French locale and EUR currency
 * @param cents - Total in cents
 * @returns Formatted price string (e.g., "149,97 EUR")
 */
export function formatCartTotal(cents: number): string {
  const euros = cents / 100;
  return euros.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}
