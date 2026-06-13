import { Container } from "@/components/ui";
import Link from "next/link";
import { UnsubscribeContent } from "./UnsubscribeContent";
import { SUPPORT_EMAIL } from "@/lib/support";
import { getLocale } from "@/lib/i18n/server";

import type { Metadata } from "next";

const STRINGS = {
  fr: {
    metaTitle: "Désabonnement",
    metaDescription: "Gérez votre abonnement à la newsletter Nuage.",
    successTitle: "Désabonnement confirmé",
    successText:
      "Vous avez été désabonné(e) de notre newsletter avec succès. Vous ne recevrez plus d'emails de notre part.",
    backHome: "Retour à l'accueil",
    invalidTitle: "Lien invalide",
    invalidText: "Le lien de désabonnement est invalide ou a expiré.",
    invalidHelpBefore:
      "Vous pouvez vous désabonner manuellement ci-dessous ou nous contacter à",
    formTitle: "Se désabonner",
    formText:
      "Entrez votre adresse email pour vous désabonner de notre newsletter.",
  },
  en: {
    metaTitle: "Unsubscribe",
    metaDescription: "Manage your Nuage newsletter subscription.",
    successTitle: "Unsubscribed successfully",
    successText:
      "You have been successfully unsubscribed from our newsletter. You will no longer receive emails from us.",
    backHome: "Back to home",
    invalidTitle: "Invalid link",
    invalidText: "This unsubscribe link is invalid or has expired.",
    invalidHelpBefore:
      "You can unsubscribe manually below or contact us at",
    formTitle: "Unsubscribe",
    formText: "Enter your email address to unsubscribe from our newsletter.",
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

interface DesabonnementPageProps {
  searchParams: Promise<{ success?: string; error?: string }>;
}

export default async function DesabonnementPage({
  searchParams,
}: DesabonnementPageProps) {
  const locale = await getLocale();
  const t = STRINGS[locale];
  const params = await searchParams;
  const success = params.success === "true";
  const error = params.error === "invalid";

  return (
    <main className="min-h-screen bg-background py-16">
      <Container size="sm">
        <div className="max-w-md mx-auto text-center">
          {success ? (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-primary mb-4">
                {t.successTitle}
              </h1>
              <p className="text-primary/70 mb-8">
                {t.successText}
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors"
              >
                {t.backHome}
              </Link>
            </>
          ) : error ? (
            <>
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h1 className="text-2xl font-semibold text-primary mb-4">
                {t.invalidTitle}
              </h1>
              <p className="text-primary/70 mb-4">
                {t.invalidText}
              </p>
              <p className="text-primary/70 mb-8">
                {t.invalidHelpBefore}{" "}
                <a
                  href={`mailto:${SUPPORT_EMAIL}`}
                  className="text-accent underline"
                >
                  {SUPPORT_EMAIL}
                </a>
                .
              </p>
              <UnsubscribeContent />
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-primary mb-4">
                {t.formTitle}
              </h1>
              <p className="text-primary/70 mb-8">
                {t.formText}
              </p>
              <UnsubscribeContent />
            </>
          )}
        </div>
      </Container>
    </main>
  );
}
