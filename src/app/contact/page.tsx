import { Metadata } from "next";
import { ContactClient } from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contactez l'équipe Nuage pour toute question sur nos produits, vos commandes ou la livraison. Réponse sous 24-48h.",
  alternates: {
    canonical: "/contact",
  },
  openGraph: {
    title: "Contact | Nuage",
    description:
      "Contactez l'équipe Nuage pour toute question sur nos produits, vos commandes ou la livraison. Réponse sous 24-48h.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function ContactPage() {
  return <ContactClient />;
}
