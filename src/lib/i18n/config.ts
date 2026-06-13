export const LOCALES = ["fr", "en"] as const;

export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

/**
 * Cookie holding the visitor's language. Set by the middleware on first
 * visit (geo-detection: France → fr, everywhere else → en) and overwritten
 * by the footer language switcher.
 */
export const LOCALE_COOKIE = "locale";

/** Max-age of the locale cookie: one year. */
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}
