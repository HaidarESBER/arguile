import { Container } from "@/components/ui";
import Link from "next/link";
import { UnsubscribeContent } from "./UnsubscribeContent";
import { SUPPORT_EMAIL } from "@/lib/support";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Désabonnement",
  description: "Gérez votre abonnement à la newsletter Nuage.",
  robots: { index: false, follow: false },
};

interface DesabonnementPageProps {
  searchParams: Promise<{ success?: string; error?: string }>;
}

export default async function DesabonnementPage({
  searchParams,
}: DesabonnementPageProps) {
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
                Désabonnement confirmé
              </h1>
              <p className="text-primary/70 mb-8">
                Vous avez été désabonné(e) de notre newsletter avec succès.
                Vous ne recevrez plus d&apos;emails de notre part.
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors"
              >
                Retour à l&apos;accueil
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
                Lien invalide
              </h1>
              <p className="text-primary/70 mb-4">
                Le lien de désabonnement est invalide ou a expiré.
              </p>
              <p className="text-primary/70 mb-8">
                Vous pouvez vous désabonner manuellement ci-dessous ou
                nous contacter à{" "}
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
                Se désabonner
              </h1>
              <p className="text-primary/70 mb-8">
                Entrez votre adresse email pour vous désabonner de notre
                newsletter.
              </p>
              <UnsubscribeContent />
            </>
          )}
        </div>
      </Container>
    </main>
  );
}
