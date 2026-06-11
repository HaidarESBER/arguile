"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Container } from "@/components/ui";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error for monitoring
    console.error("Erreur applicative :", error);
  }, [error]);

  return (
    <main className="min-h-[70vh] flex items-center py-16">
      <Container size="md">
        <div className="text-center max-w-lg mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-4xl" aria-hidden="true">⚠️</span>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl text-primary mb-4">
            Une erreur est survenue
          </h1>
          <p className="text-muted text-lg mb-10">
            Quelque chose s&apos;est mal passé de notre côté. Vous pouvez
            réessayer ou revenir à l&apos;accueil.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={reset}
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-background rounded-[--radius-button] hover:bg-accent transition-colors font-medium"
            >
              Réessayer
            </button>
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 border border-primary/30 text-primary rounded-[--radius-button] hover:bg-primary/5 transition-colors font-medium"
            >
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
