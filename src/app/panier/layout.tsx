import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n/server";

/**
 * The cart page is a client component (it reads cart state), so it cannot
 * export metadata itself. This server layout supplies the title and, more
 * importantly, noindex — a cart is transactional and must not be indexed
 * (matches commande / suivi / compte).
 */
const STRINGS = {
  fr: {
    title: "Mon panier",
    description: "Votre panier Nuage.",
  },
  en: {
    title: "My cart",
    description: "Your Nuage cart.",
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

export default function PanierLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
