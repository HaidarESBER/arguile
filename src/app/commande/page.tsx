import { Metadata } from "next";
import { CheckoutClient } from "./CheckoutClient";
import { getLocale } from "@/lib/i18n/server";

const STRINGS = {
  fr: {
    title: "Finaliser ma commande | Nuage",
    description:
      "Renseignez vos informations de livraison et procédez au paiement sécurisé.",
  },
  en: {
    title: "Complete my order | Nuage",
    description:
      "Enter your shipping details and proceed to secure payment.",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = STRINGS[locale];

  return {
    title: t.title,
    description: t.description,
    robots: { index: false, follow: false },
  };
}

/**
 * Checkout page (/commande)
 *
 * Server component exporting metadata; the interactive checkout flow
 * (email, adresse, livraison, code promo, paiement) lives in CheckoutClient.
 */
export default function CheckoutPage() {
  return <CheckoutClient />;
}
