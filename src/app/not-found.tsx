import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";

export const metadata: Metadata = {
  title: "Page introuvable",
  description: "La page que vous recherchez n'existe pas ou a été déplacée.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <main className="min-h-[70vh] flex items-center py-16">
      <Container size="md">
        <div className="text-center max-w-lg mx-auto">
          <p className="font-heading text-7xl md:text-8xl text-primary/30 font-bold mb-6">
            404
          </p>
          <h1 className="font-heading text-3xl md:text-4xl text-primary mb-4">
            Page introuvable
          </h1>
          <p className="text-muted text-lg mb-10">
            Désolé, la page que vous recherchez n&apos;existe pas ou a été
            déplacée. Le nuage s&apos;est dissipé...
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-background rounded-[--radius-button] hover:bg-accent transition-colors font-medium"
            >
              Retour à l&apos;accueil
            </Link>
            <Link
              href="/produits"
              className="inline-flex items-center justify-center px-6 py-3 border border-primary/30 text-primary rounded-[--radius-button] hover:bg-primary/5 transition-colors font-medium"
            >
              Découvrir nos produits
            </Link>
          </div>
        </div>
      </Container>
    </main>
  );
}
