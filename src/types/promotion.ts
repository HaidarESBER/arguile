/**
 * Promotion / Discount Code type definitions for Nuage e-commerce
 */

/**
 * Discount type: percentage off or fixed amount off
 */
export type DiscountType = "percentage" | "fixed_amount";

/**
 * Complete promotion record
 */
export interface Promotion {
  id: string;
  /** Uppercase code (e.g., BIENVENUE10) */
  code: string;
  /** Admin note (e.g., "10% first purchase discount") */
  description: string | null;
  discountType: DiscountType;
  /** For percentage: 10 = 10%. For fixed_amount: 1000 = 10.00 EUR (in cents) */
  discountValue: number;
  /** Minimum cart subtotal in cents. 0 = no minimum */
  minimumOrder: number;
  /** Maximum number of uses. null = unlimited */
  maxUses: number | null;
  /** Current number of uses */
  currentUses: number;
  /** When the promotion becomes active */
  startsAt: string;
  /** When the promotion expires. null = no expiry */
  expiresAt: string | null;
  /** Whether the promotion is active */
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Data needed to create a new promotion
 */
export interface CreatePromotionData {
  code: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  minimumOrder?: number;
  maxUses?: number | null;
  startsAt?: string;
  expiresAt?: string | null;
}

/**
 * Calculate the discount amount in cents for a given subtotal and promotion.
 * The discount is capped at the subtotal (never more than 100% off).
 *
 * @param subtotalCents - Cart subtotal in cents
 * @param promotion - The promotion to apply
 * @returns Discount amount in cents
 */
export function calculateDiscount(
  subtotalCents: number,
  promotion: Promotion
): number {
  let discount: number;

  if (promotion.discountType === "percentage") {
    discount = Math.round((subtotalCents * promotion.discountValue) / 100);
  } else {
    // fixed_amount
    discount = promotion.discountValue;
  }

  // Never discount more than the subtotal
  return Math.min(discount, subtotalCents);
}

/**
 * Format a promotion's discount for display.
 * Returns "-10%" for percentage or "-10,00 EUR" for fixed amount.
 *
 * @param promotion - The promotion to format
 * @returns Formatted discount string
 */
export function formatDiscount(promotion: Promotion): string {
  if (promotion.discountType === "percentage") {
    return `-${promotion.discountValue}%`;
  }

  // Fixed amount: convert cents to euros with French formatting
  const euros = (promotion.discountValue / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `-${euros} \u20AC`;
}
