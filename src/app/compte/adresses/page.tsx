import { Metadata } from "next";
import { getLocale } from "@/lib/i18n/server";
import AdressesClient from "./AdressesClient";

const STRINGS = {
  fr: {
    title: "Mes Adresses",
    description: "Gérez vos adresses de livraison enregistrées.",
  },
  en: {
    title: "My Addresses",
    description: "Manage your saved delivery addresses.",
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

export default function AdressesPage() {
  return <AdressesClient />;
}
