import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { getLocale } from "@/lib/i18n/server";

const STRINGS = {
  fr: {
    metaTitle: "Page introuvable",
    metaDescription: "La page que vous recherchez n'existe pas ou a été déplacée.",
    title: "Page introuvable",
    body: "Désolé, la page que vous recherchez n'existe pas ou a été déplacée. Le nuage s'est dissipé...",
    backHome: "Retour à l'accueil",
    discoverProducts: "Découvrir nos produits",
  },
  en: {
    metaTitle: "Page not found",
    metaDescription: "The page you are looking for does not exist or has been moved.",
    title: "Page not found",
    body: "Sorry, the page you are looking for does not exist or has been moved. The cloud has drifted away...",
    backHome: "Back to home",
    discoverProducts: "Discover our products",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = STRINGS[locale];
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    robots: { index: false, follow: false },
  };
}

export default async function NotFound() {
  const locale = await getLocale();
  const t = STRINGS[locale];

  return (
    <main className="min-h-[70vh] flex items-center py-16">
      <Container size="md">
        <div className="text-center max-w-lg mx-auto">
          <p className="font-heading text-7xl md:text-8xl text-primary/30 font-bold mb-6">
            404
          </p>
          <h1 className="font-heading text-3xl md:text-4xl text-primary mb-4">
            {t.title}
          </h1>
          <p className="text-muted text-lg mb-10">
            {t.body}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-background rounded-[--radius-button] hover:bg-accent transition-colors font-medium"
            >
              {t.backHome}
            </Link>
            <Link
              href="/produits"
              className="inline-flex items-center justify-center px-6 py-3 border border-primary/30 text-primary rounded-[--radius-button] hover:bg-primary/5 transition-colors font-medium"
            >
              {t.discoverProducts}
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
