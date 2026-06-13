import { Metadata } from "next";
import { getLocale } from "@/lib/i18n/server";
import ProfilClient from "./ProfilClient";

const STRINGS = {
  fr: {
    title: "Mon Profil",
    description:
      "Gérez vos informations personnelles, votre sécurité et vos préférences.",
  },
  en: {
    title: "My Profile",
    description:
      "Manage your personal information, security and preferences.",
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

export default function ProfilPage() {
  return <ProfilClient />;
}
