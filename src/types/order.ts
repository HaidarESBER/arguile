/**
 * Order type definitions for Nuage e-commerce
 */

import { ShippingAddress } from "./checkout";

/**
 * Order status values
 */
export type OrderStatus =
  | "pending_payment"
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

/**
 * Order status labels in French
 */
export const orderStatusLabels: Record<OrderStatus, string> = {
  pending_payment: "En attente de paiement",
  pending: "En attente",
  confirmed: "Confirmée",
  processing: "En préparation",
  shipped: "Expédiée",
  delivered: "Livrée",
  cancelled: "Annulée",
  refunded: "Remboursée",
};

/**
 * Item in an order (snapshot of product at purchase time)
 */
export interface OrderItem {
  productId: string;
  productName: string;
  productImage: string;
  /** Price in cents at time of purchase */
  price: number;
  quantity: number;
}

/**
 * Complete order record
 */
export interface Order {
  id: string;
  /** Human-readable order number (e.g., NU-2026-0001) */
  orderNumber: string;
  items: OrderItem[];
  /** Subtotal in cents (sum of items) */
  subtotal: number;
  /** Shipping cost in cents (0 for free shipping) */
  shipping: number;
  /** Total in cents (subtotal + shipping - discount) */
  total: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  notes?: string;
  /** Applied discount code */
  discountCode?: string;
  /** Discount amount in cents */
  discountAmount?: number;
  /** Tracking number from shipping carrier */
  trackingNumber?: string;
  /** URL to track shipment */
  trackingUrl?: string;
  /** Estimated delivery date */
  estimatedDelivery?: string;
  /** Date when order was shipped */
  shippedAt?: string;
  /** Date when order was delivered */
  deliveredAt?: string;
  /** Stripe Checkout Session ID */
  stripeSessionId?: string;
  /** Stripe Payment Intent ID */
  stripePaymentIntentId?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Data needed to create a new order
 */
export interface CreateOrderData {
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  shippingAddress: ShippingAddress;
  notes?: string;
  /** Applied discount code */
  discountCode?: string;
  /** Discount amount in cents */
  discountAmount?: number;
  /** Optional initial status (defaults to "pending") */
  status?: OrderStatus;
}

/**
 * Generate a unique order number in format NU-YYYY-NNNN
 * @param existingNumbers - Array of existing order numbers to avoid duplicates
 * @returns New unique order number
 */
export function generateOrderNumber(existingNumbers: string[]): string {
  const year = new Date().getFullYear();
  const prefix = `NU-${year}-`;

  // Find highest existing number for this year
  let maxNumber = 0;
  for (const orderNumber of existingNumbers) {
    if (orderNumber.startsWith(prefix)) {
      const numPart = parseInt(orderNumber.slice(prefix.length), 10);
      if (!isNaN(numPart) && numPart > maxNumber) {
        maxNumber = numPart;
      }
    }
  }

  // Generate next number, padded to 4 digits
  const nextNumber = (maxNumber + 1).toString().padStart(4, "0");
  return `${prefix}${nextNumber}`;
}

/**
 * Calculate line total for an order item
 * @param item - Order item
 * @returns Line total in cents
 */
export function calculateLineTotal(item: OrderItem): number {
  return item.price * item.quantity;
}
