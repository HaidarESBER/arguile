import { Space_Grotesk, Cormorant_Garamond } from "next/font/google";

/**
 * Primary font - Space Grotesk
 * Modern, bold sans-serif with luxury appeal.
 * Used for: body text, navigation, UI, product data.
 */
export const primaryFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

/**
 * Display font - Cormorant Garamond
 * Elegant high-contrast serif reserved for large editorial type:
 * the homepage H1, section headings and pulled quotes. The sans/serif
 * contrast is what gives the dark theme its "maison" feel — do not use
 * it below ~20px, it loses its drawing at small sizes.
 */
export const displayFont = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["500", "600"],
  style: ["normal", "italic"],
});

/**
 * Combined font variables for applying to HTML element
 */
export const fontVariables = `${primaryFont.variable} ${displayFont.variable}`;
