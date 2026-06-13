import { CountryRegion } from "@/data/countries";

/**
 * Locale for user-facing shipping strings.
 */
type ShippingLocale = "fr" | "en";

/**
 * Shipping method types
 */
export type ShippingMethod = "standard" | "express";

/**
 * Shipping rate structure
 */
export interface ShippingRate {
  cost: number; // in cents
  currency: string;
  estimatedDays: string;
  carrier: string;
}

/**
 * Shipping rates by region and method.
 * Single source of truth: used by the checkout UI for display and by
 * /api/checkout to recompute the cost server-side (never trust the client).
 */
const SHIPPING_RATES: Record<
  CountryRegion,
  Record<ShippingMethod, ShippingRate>
> = {
  france: {
    standard: {
      cost: 590, // €5.90
      currency: "EUR",
      estimatedDays: "2-3 jours ouvrés",
      carrier: "Colissimo Suivi",
    },
    express: {
      cost: 990, // €9.90
      currency: "EUR",
      estimatedDays: "24h",
      carrier: "Chronopost",
    },
  },
  "eu-schengen": {
    standard: {
      cost: 890, // €8.90
      currency: "EUR",
      estimatedDays: "3-5 jours ouvrés",
      carrier: "Colissimo International",
    },
    express: {
      cost: 1590, // €15.90
      currency: "EUR",
      estimatedDays: "2-3 jours ouvrés",
      carrier: "Chronopost International",
    },
  },
  "eu-non-schengen": {
    standard: {
      cost: 1190, // €11.90
      currency: "EUR",
      estimatedDays: "5-7 jours ouvrés",
      carrier: "Colissimo International",
    },
    express: {
      cost: 1590, // €15.90
      currency: "EUR",
      estimatedDays: "3-4 jours ouvrés",
      carrier: "Chronopost International",
    },
  },
  "non-eu": {
    standard: {
      cost: 1490, // €14.90
      currency: "EUR",
      estimatedDays: "7-10 jours ouvrés",
      carrier: "Colissimo International",
    },
    express: {
      cost: 1990, // €19.90
      currency: "EUR",
      estimatedDays: "4-6 jours ouvrés",
      carrier: "Chronopost International",
    },
  },
};

/**
 * English translations for the delivery-time estimates above, keyed by the
 * French source string. Keep in sync with the `estimatedDays` values in
 * SHIPPING_RATES. The French values stay the single source of truth.
 */
const ESTIMATED_DAYS_EN: Record<string, string> = {
  "2-3 jours ouvrés": "2-3 business days",
  "24h": "24h",
  "3-5 jours ouvrés": "3-5 business days",
  "5-7 jours ouvrés": "5-7 business days",
  "3-4 jours ouvrés": "3-4 business days",
  "7-10 jours ouvrés": "7-10 business days",
  "4-6 jours ouvrés": "4-6 business days",
};

/**
 * Localize a delivery-time estimate. Falls back to the French source string
 * when no English translation is registered.
 */
function localizeEstimatedDays(
  estimatedDays: string,
  locale: ShippingLocale
): string {
  if (locale === "en") {
    return ESTIMATED_DAYS_EN[estimatedDays] ?? estimatedDays;
  }
  return estimatedDays;
}

/**
 * Free standard shipping threshold for France, in cents.
 * Advertised on product pages and the announcement bar — keep all three in
 * sync (this constant is the single source of truth).
 */
export const FREE_SHIPPING_THRESHOLD = 5000; // €50

/**
 * Calculate shipping cost based on country region and method.
 * When the order subtotal (cents) is provided and reaches the threshold,
 * standard shipping to France is free.
 * @param locale - Locale for the user-facing delivery-time estimate (defaults to "fr")
 */
export function calculateShippingCost(
  region: CountryRegion,
  method: ShippingMethod = "standard",
  subtotalCents?: number,
  locale: ShippingLocale = "fr"
): ShippingRate {
  const rate = SHIPPING_RATES[region][method];
  const localizedRate: ShippingRate = {
    ...rate,
    estimatedDays: localizeEstimatedDays(rate.estimatedDays, locale),
  };
  if (
    region === "france" &&
    method === "standard" &&
    subtotalCents !== undefined &&
    subtotalCents >= FREE_SHIPPING_THRESHOLD
  ) {
    return { ...localizedRate, cost: 0 };
  }
  return localizedRate;
}

/**
 * Format price in cents to euros
 */
export function formatShippingPrice(cents: number): string {
  return `€${(cents / 100).toFixed(2)}`;
}

/**
 * Check if customs warning should be shown
 * (for non-EU countries with cart total > €200)
 */
export function shouldShowCustomsWarning(
  region: CountryRegion,
  cartTotalCents: number
): boolean {
  return region === "non-eu" && cartTotalCents > 20000; // €200
}

/**
 * Get customs warning message
 * @param locale - Locale for the user-facing message (defaults to "fr")
 */
export function getCustomsWarningMessage(locale: ShippingLocale = "fr"): string {
  const MESSAGES = {
    fr: "Attention : Des frais de douane peuvent s'appliquer pour les envois hors UE de plus de €200.",
    en: "Warning: Customs fees may apply to shipments outside the EU over €200.",
  } as const;
  return MESSAGES[locale];
}
