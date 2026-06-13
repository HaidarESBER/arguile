import { Metadata } from "next";
import { getLocale } from "@/lib/i18n/server";
import { AccountClient } from "./AccountClient";

const STRINGS = {
  fr: {
    title: "Mon Compte",
    description: "Gérez votre compte et consultez vos commandes",
  },
  en: {
    title: "My Account",
    description: "Manage your account and view your orders",
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

export default function AccountPage() {
  return <AccountClient />;
}
