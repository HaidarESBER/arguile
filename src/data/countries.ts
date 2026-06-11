/**
 * European countries data for shipping calculator
 *
 * Categorized by shipping regions:
 * - france: France (domestic)
 * - eu-schengen: EU Schengen Area
 * - eu-non-schengen: EU but not Schengen
 * - non-eu: European countries outside EU
 */

export type CountryRegion = "france" | "eu-schengen" | "eu-non-schengen" | "non-eu";

export interface Country {
  code: string;
  name: string;
  region: CountryRegion;
  flag: string; // Emoji flag
}

export const EUROPEAN_COUNTRIES: Country[] = [
  // France
  { code: "FR", name: "France", region: "france" as const, flag: "🇫🇷" },

  // EU Schengen
  { code: "DE", name: "Allemagne", region: "eu-schengen" as const, flag: "🇩🇪" },
  { code: "AT", name: "Autriche", region: "eu-schengen" as const, flag: "🇦🇹" },
  { code: "BE", name: "Belgique", region: "eu-schengen" as const, flag: "🇧🇪" },
  { code: "DK", name: "Danemark", region: "eu-schengen" as const, flag: "🇩🇰" },
  { code: "ES", name: "Espagne", region: "eu-schengen" as const, flag: "🇪🇸" },
  { code: "EE", name: "Estonie", region: "eu-schengen" as const, flag: "🇪🇪" },
  { code: "FI", name: "Finlande", region: "eu-schengen" as const, flag: "🇫🇮" },
  { code: "GR", name: "Grece", region: "eu-schengen" as const, flag: "🇬🇷" },
  { code: "HU", name: "Hongrie", region: "eu-schengen" as const, flag: "🇭🇺" },
  { code: "IT", name: "Italie", region: "eu-schengen" as const, flag: "🇮🇹" },
  { code: "LV", name: "Lettonie", region: "eu-schengen" as const, flag: "🇱🇻" },
  { code: "LT", name: "Lituanie", region: "eu-schengen" as const, flag: "🇱🇹" },
  { code: "LU", name: "Luxembourg", region: "eu-schengen" as const, flag: "🇱🇺" },
  { code: "MT", name: "Malte", region: "eu-schengen" as const, flag: "🇲🇹" },
  { code: "NL", name: "Pays-Bas", region: "eu-schengen" as const, flag: "🇳🇱" },
  { code: "PL", name: "Pologne", region: "eu-schengen" as const, flag: "🇵🇱" },
  { code: "PT", name: "Portugal", region: "eu-schengen" as const, flag: "🇵🇹" },
  { code: "CZ", name: "Republique tcheque", region: "eu-schengen" as const, flag: "🇨🇿" },
  { code: "SK", name: "Slovaquie", region: "eu-schengen" as const, flag: "🇸🇰" },
  { code: "SI", name: "Slovenie", region: "eu-schengen" as const, flag: "🇸🇮" },
  { code: "SE", name: "Suede", region: "eu-schengen" as const, flag: "🇸🇪" },

  // EU non-Schengen
  { code: "BG", name: "Bulgarie", region: "eu-non-schengen" as const, flag: "🇧🇬" },
  { code: "HR", name: "Croatie", region: "eu-non-schengen" as const, flag: "🇭🇷" },
  { code: "CY", name: "Chypre", region: "eu-non-schengen" as const, flag: "🇨🇾" },
  { code: "IE", name: "Irlande", region: "eu-non-schengen" as const, flag: "🇮🇪" },
  { code: "RO", name: "Roumanie", region: "eu-non-schengen" as const, flag: "🇷🇴" },

  // Non-EU Europe
  { code: "CH", name: "Suisse", region: "non-eu" as const, flag: "🇨🇭" },
  { code: "GB", name: "Royaume-Uni", region: "non-eu" as const, flag: "🇬🇧" },
  { code: "NO", name: "Norvege", region: "non-eu" as const, flag: "🇳🇴" },
  { code: "IS", name: "Islande", region: "non-eu" as const, flag: "🇮🇸" },
].sort((a, b) => a.name.localeCompare(b.name, "fr"));

/**
 * Get country by code
 */
export function getCountryByCode(code: string): Country | undefined {
  return EUROPEAN_COUNTRIES.find((c) => c.code === code);
}

/**
 * Detect user's country from browser locale
 */
export function detectUserCountry(): string {
  if (typeof navigator === "undefined") return "FR";

  const locale = navigator.language || "fr-FR";
  const countryCode = locale.split("-")[1]?.toUpperCase();

  // Check if detected country is in our supported list
  const country = getCountryByCode(countryCode || "FR");
  return country ? country.code : "FR";
}
