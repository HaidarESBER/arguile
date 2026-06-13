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
  /** French display name (default locale). */
  name: string;
  /** English display name. */
  nameEn: string;
  region: CountryRegion;
  flag: string; // Emoji flag
}

export const EUROPEAN_COUNTRIES: Country[] = [
  // France
  { code: "FR", name: "France", nameEn: "France", region: "france" as const, flag: "🇫🇷" },

  // EU Schengen
  { code: "DE", name: "Allemagne", nameEn: "Germany", region: "eu-schengen" as const, flag: "🇩🇪" },
  { code: "AT", name: "Autriche", nameEn: "Austria", region: "eu-schengen" as const, flag: "🇦🇹" },
  { code: "BE", name: "Belgique", nameEn: "Belgium", region: "eu-schengen" as const, flag: "🇧🇪" },
  { code: "DK", name: "Danemark", nameEn: "Denmark", region: "eu-schengen" as const, flag: "🇩🇰" },
  { code: "ES", name: "Espagne", nameEn: "Spain", region: "eu-schengen" as const, flag: "🇪🇸" },
  { code: "EE", name: "Estonie", nameEn: "Estonia", region: "eu-schengen" as const, flag: "🇪🇪" },
  { code: "FI", name: "Finlande", nameEn: "Finland", region: "eu-schengen" as const, flag: "🇫🇮" },
  { code: "GR", name: "Grece", nameEn: "Greece", region: "eu-schengen" as const, flag: "🇬🇷" },
  { code: "HU", name: "Hongrie", nameEn: "Hungary", region: "eu-schengen" as const, flag: "🇭🇺" },
  { code: "IT", name: "Italie", nameEn: "Italy", region: "eu-schengen" as const, flag: "🇮🇹" },
  { code: "LV", name: "Lettonie", nameEn: "Latvia", region: "eu-schengen" as const, flag: "🇱🇻" },
  { code: "LT", name: "Lituanie", nameEn: "Lithuania", region: "eu-schengen" as const, flag: "🇱🇹" },
  { code: "LU", name: "Luxembourg", nameEn: "Luxembourg", region: "eu-schengen" as const, flag: "🇱🇺" },
  { code: "MT", name: "Malte", nameEn: "Malta", region: "eu-schengen" as const, flag: "🇲🇹" },
  { code: "NL", name: "Pays-Bas", nameEn: "Netherlands", region: "eu-schengen" as const, flag: "🇳🇱" },
  { code: "PL", name: "Pologne", nameEn: "Poland", region: "eu-schengen" as const, flag: "🇵🇱" },
  { code: "PT", name: "Portugal", nameEn: "Portugal", region: "eu-schengen" as const, flag: "🇵🇹" },
  { code: "CZ", name: "Republique tcheque", nameEn: "Czech Republic", region: "eu-schengen" as const, flag: "🇨🇿" },
  { code: "SK", name: "Slovaquie", nameEn: "Slovakia", region: "eu-schengen" as const, flag: "🇸🇰" },
  { code: "SI", name: "Slovenie", nameEn: "Slovenia", region: "eu-schengen" as const, flag: "🇸🇮" },
  { code: "SE", name: "Suede", nameEn: "Sweden", region: "eu-schengen" as const, flag: "🇸🇪" },

  // EU non-Schengen
  { code: "BG", name: "Bulgarie", nameEn: "Bulgaria", region: "eu-non-schengen" as const, flag: "🇧🇬" },
  { code: "HR", name: "Croatie", nameEn: "Croatia", region: "eu-non-schengen" as const, flag: "🇭🇷" },
  { code: "CY", name: "Chypre", nameEn: "Cyprus", region: "eu-non-schengen" as const, flag: "🇨🇾" },
  { code: "IE", name: "Irlande", nameEn: "Ireland", region: "eu-non-schengen" as const, flag: "🇮🇪" },
  { code: "RO", name: "Roumanie", nameEn: "Romania", region: "eu-non-schengen" as const, flag: "🇷🇴" },

  // Non-EU Europe
  { code: "CH", name: "Suisse", nameEn: "Switzerland", region: "non-eu" as const, flag: "🇨🇭" },
  { code: "GB", name: "Royaume-Uni", nameEn: "United Kingdom", region: "non-eu" as const, flag: "🇬🇧" },
  { code: "NO", name: "Norvege", nameEn: "Norway", region: "non-eu" as const, flag: "🇳🇴" },
  { code: "IS", name: "Islande", nameEn: "Iceland", region: "non-eu" as const, flag: "🇮🇸" },
].sort((a, b) => a.name.localeCompare(b.name, "fr"));

/**
 * Get country by code
 */
export function getCountryByCode(code: string): Country | undefined {
  return EUROPEAN_COUNTRIES.find((c) => c.code === code);
}

/**
 * Get the localized display name for a country.
 * @param country - Country record
 * @param locale - Locale for the display name (defaults to "fr")
 */
export function getCountryName(
  country: Country,
  locale: "fr" | "en" = "fr"
): string {
  return locale === "en" ? country.nameEn : country.name;
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
