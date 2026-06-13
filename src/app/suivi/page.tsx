import { Metadata } from "next";
import SuiviClient from "./SuiviClient";
import { getLocale } from "@/lib/i18n/server";

const STRINGS = {
  fr: {
    title: "Suivre ma commande",
    description:
      "Suivez votre commande Nuage en entrant votre numéro de commande et votre adresse email.",
  },
  en: {
    title: "Track my order",
    description:
      "Track your Nuage order by entering your order number and email address.",
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

export default function SuiviPage() {
  return <SuiviClient />;
}
