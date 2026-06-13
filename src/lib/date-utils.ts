/**
 * Date formatting utilities
 * Provides consistent date formatting across server and client
 */

type DateLocale = "fr" | "en";

const MONTHS: Record<DateLocale, string[]> = {
  fr: [
    "janvier", "février", "mars", "avril", "mai", "juin",
    "juillet", "août", "septembre", "octobre", "novembre", "décembre"
  ],
  en: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ],
};

/** Joiner between date and time (e.g. "à" in French, "at" in English). */
const DATE_TIME_JOINER: Record<DateLocale, string> = {
  fr: "à",
  en: "at",
};

/**
 * Format date consistently
 * Uses an explicit format to ensure consistent server/client rendering.
 * French uses DD/MM/YYYY; English uses MM/DD/YYYY.
 * @param date - Date or ISO string to format
 * @param locale - Locale for the date order (defaults to "fr")
 */
export function formatDate(date: string | Date, locale: DateLocale = "fr"): string {
  const d = typeof date === "string" ? new Date(date) : date;

  // Use explicit format to ensure consistency
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();

  return locale === "en"
    ? `${month}/${day}/${year}`
    : `${day}/${month}/${year}`;
}

/**
 * Format date with full month name
 * @param date - Date or ISO string to format
 * @param locale - Locale for the month name and word order (defaults to "fr")
 */
export function formatDateLong(date: string | Date, locale: DateLocale = "fr"): string {
  const d = typeof date === "string" ? new Date(date) : date;

  const day = d.getDate();
  const month = MONTHS[locale][d.getMonth()];
  const year = d.getFullYear();

  // French: "5 janvier 2026"; English: "January 5, 2026"
  return locale === "en"
    ? `${month} ${day}, ${year}`
    : `${day} ${month} ${year}`;
}

/**
 * Format time consistently
 */
export function formatTime(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;

  const hours = d.getHours().toString().padStart(2, "0");
  const minutes = d.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}

/**
 * Format date and time together
 * @param date - Date or ISO string to format
 * @param locale - Locale for the date format and joiner (defaults to "fr")
 */
export function formatDateTime(date: string | Date, locale: DateLocale = "fr"): string {
  return `${formatDate(date, locale)} ${DATE_TIME_JOINER[locale]} ${formatTime(date)}`;
}
