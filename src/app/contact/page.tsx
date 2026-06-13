import { Metadata } from "next";
import { getLocale } from "@/lib/i18n/server";
import { ContactClient } from "./ContactClient";

const STRINGS = {
  fr: {
    metaTitle: "Contact",
    metaDescription:
      "Contactez l'équipe Nuage pour toute question sur nos produits, vos commandes ou la livraison. Réponse sous 24-48h.",
    ogLocale: "fr_FR",
  },
  en: {
    metaTitle: "Contact",
    metaDescription:
      "Contact the Nuage team with any questions about our products, your orders or shipping. Reply within 24-48h.",
    ogLocale: "en_US",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = STRINGS[locale];
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: "/contact",
    },
    openGraph: {
      title: `${t.metaTitle} | Nuage`,
      description: t.metaDescription,
      type: "website",
      locale: t.ogLocale,
    },
  };
}

export default function ContactPage() {
  return <ContactClient />;
}
