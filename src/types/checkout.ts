/**
 * Checkout type definitions for Nuage e-commerce
 */

/**
 * Shipping address information
 */
export interface ShippingAddress {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  addressLine2?: string;
  city: string;
  postalCode: string;
  country: string;
}

/**
 * Default shipping address with France as default country
 */
export const defaultShippingAddress: ShippingAddress = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  address: "",
  addressLine2: "",
  city: "",
  postalCode: "",
  country: "France",
};

/**
 * Checkout form data submitted by user
 */
export interface CheckoutFormData {
  shippingAddress: ShippingAddress;
  shippingCost: number; // in cents
  notes?: string;
  discountCode?: string;
  discountAmount?: number; // in cents
}

/**
 * Validation error for a form field
 */
export interface FieldError {
  field: keyof ShippingAddress | "notes";
  message: string;
}

/**
 * Validate email format
 * @param email - Email to validate
 * @returns true if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * European countries with their postal code validation patterns
 */
export const europeanCountries = {
  "France": { code: "FR", pattern: /^[0-9]{5}$/, placeholder: "75001" },
  "Allemagne": { code: "DE", pattern: /^[0-9]{5}$/, placeholder: "10115" },
  "Autriche": { code: "AT", pattern: /^[0-9]{4}$/, placeholder: "1010" },
  "Belgique": { code: "BE", pattern: /^[0-9]{4}$/, placeholder: "1000" },
  "Bulgarie": { code: "BG", pattern: /^[0-9]{4}$/, placeholder: "1000" },
  "Chypre": { code: "CY", pattern: /^[0-9]{4}$/, placeholder: "1010" },
  "Croatie": { code: "HR", pattern: /^[0-9]{5}$/, placeholder: "10000" },
  "Danemark": { code: "DK", pattern: /^[0-9]{4}$/, placeholder: "1050" },
  "Espagne": { code: "ES", pattern: /^[0-9]{5}$/, placeholder: "28001" },
  "Estonie": { code: "EE", pattern: /^[0-9]{5}$/, placeholder: "10111" },
  "Finlande": { code: "FI", pattern: /^[0-9]{5}$/, placeholder: "00100" },
  "Grèce": { code: "GR", pattern: /^[0-9]{5}$/, placeholder: "10557" },
  "Hongrie": { code: "HU", pattern: /^[0-9]{4}$/, placeholder: "1011" },
  "Irlande": { code: "IE", pattern: /^[A-Z0-9]{3}\s?[A-Z0-9]{4}$/i, placeholder: "D01 F5P2" },
  "Italie": { code: "IT", pattern: /^[0-9]{5}$/, placeholder: "00118" },
  "Lettonie": { code: "LV", pattern: /^LV-[0-9]{4}$/i, placeholder: "LV-1010" },
  "Lituanie": { code: "LT", pattern: /^LT-[0-9]{5}$/i, placeholder: "LT-01001" },
  "Luxembourg": { code: "LU", pattern: /^[0-9]{4}$/, placeholder: "1009" },
  "Malte": { code: "MT", pattern: /^[A-Z]{3}\s?[0-9]{4}$/i, placeholder: "VLT 1117" },
  "Pays-Bas": { code: "NL", pattern: /^[0-9]{4}\s?[A-Z]{2}$/i, placeholder: "1012 AB" },
  "Pologne": { code: "PL", pattern: /^[0-9]{2}-[0-9]{3}$/, placeholder: "00-950" },
  "Portugal": { code: "PT", pattern: /^[0-9]{4}-[0-9]{3}$/, placeholder: "1000-001" },
  "République tchèque": { code: "CZ", pattern: /^[0-9]{5}$/, placeholder: "11000" },
  "Roumanie": { code: "RO", pattern: /^[0-9]{6}$/, placeholder: "010011" },
  "Slovaquie": { code: "SK", pattern: /^[0-9]{5}$/, placeholder: "81101" },
  "Slovénie": { code: "SI", pattern: /^[0-9]{4}$/, placeholder: "1000" },
  "Suède": { code: "SE", pattern: /^[0-9]{5}$/, placeholder: "11455" },
} as const;

export type EuropeanCountry = keyof typeof europeanCountries;

/**
 * Validate postal code based on country-specific rules
 * @param postalCode - Postal code to validate
 * @param country - Country name
 * @returns true if valid postal code for the specified country
 */
export function isValidFrenchPostalCode(postalCode: string, country: string = "France"): boolean {
  const countryData = europeanCountries[country as EuropeanCountry];
  if (!countryData) return false;

  const cleaned = postalCode.trim();
  return countryData.pattern.test(cleaned);
}

/**
 * Validate European phone number
 * Accepts international format with country code
 * @param phone - Phone number to validate
 * @returns true if valid phone format
 */
export function isValidPhone(phone: string): boolean {
  // Remove spaces, dashes, and parentheses
  const cleaned = phone.replace(/[\s\-()]/g, "");
  // Accept: +XX followed by 7-15 digits, or 0 followed by 9-14 digits
  const phoneRegex = /^(\+[0-9]{9,15}|0[0-9]{9,14})$/;
  return phoneRegex.test(cleaned);
}
