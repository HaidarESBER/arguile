import { Metadata } from "next";
import { getLocale } from "@/lib/i18n/server";
import WishlistClient from "./WishlistClient";

const STRINGS = {
  fr: {
    title: "Mes Favoris",
    description: "Retrouvez tous les produits ajoutés à votre liste de souhaits.",
  },
  en: {
    title: "My Wishlist",
    description: "Find all the products added to your wishlist.",
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

export default function WishlistPage() {
  return <WishlistClient />;
}
