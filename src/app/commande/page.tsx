import { Metadata } from "next";
import { CheckoutClient } from "./CheckoutClient";

export const metadata: Metadata = {
  title: "Finaliser ma commande | Nuage",
  description:
    "Renseignez vos informations de livraison et procédez au paiement sécurisé.",
  robots: { index: false, follow: false },
};

/**
 * Checkout page (/commande)
 *
 * Server component exporting metadata; the interactive checkout flow
 * (email, adresse, livraison, code promo, paiement) lives in CheckoutClient.
 */
export default function CheckoutPage() {
  return <CheckoutClient />;
}
