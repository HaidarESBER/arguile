"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui";
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { SUPPORT_EMAIL } from "@/lib/support";

export function ContactClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setErrorMessage(
          data.error ||
            "Une erreur est survenue. Veuillez réessayer ou nous contacter directement par email."
        );
        setStatus("error");
        return;
      }

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setErrorMessage(
        "Impossible d'envoyer le message. Vérifiez votre connexion et réessayez."
      );
      setStatus("error");
    }
  };

  return (
    <main className="py-16 min-h-screen">
      <Container size="lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-text mb-4">
            Contactez-nous
          </h1>
          <p className="text-lg text-text-muted mb-12">
            Une question ? Une remarque ? N&apos;hésitez pas à nous contacter, notre équipe vous répondra dans les plus brefs délais.
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-heading font-semibold text-text mb-6">
                Envoyez-nous un message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text mb-2">
                    Nom complet
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    maxLength={100}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-primary/20 rounded-[--radius-button] bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="Jean Dupont"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    maxLength={254}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-primary/20 rounded-[--radius-button] bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder="jean.dupont@email.com"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-text mb-2">
                    Sujet
                  </label>
                  <select
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-primary/20 rounded-[--radius-button] bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">Sélectionnez un sujet</option>
                    <option value="commande">Question sur une commande</option>
                    <option value="produit">Question sur un produit</option>
                    <option value="livraison">Problème de livraison</option>
                    <option value="retour">Retour / Remboursement</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-text mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    required
                    rows={6}
                    minLength={10}
                    maxLength={5000}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-2 border border-primary/20 rounded-[--radius-button] bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent resize-none"
                    placeholder="Décrivez votre demande..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full px-6 py-3 bg-primary text-background rounded-[--radius-button] font-semibold hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "sending" ? "Envoi en cours..." : "Envoyer le message"}
                </button>

                {status === "success" && (
                  <div
                    role="status"
                    className="p-4 bg-green-500/10 border border-green-500/30 rounded-[--radius-button] text-green-300"
                  >
                    Message envoyé avec succès ! Nous vous répondrons rapidement.
                  </div>
                )}

                {status === "error" && (
                  <div
                    role="alert"
                    className="p-4 bg-error/10 border border-error/30 rounded-[--radius-button] text-error"
                  >
                    {errorMessage ||
                      "Une erreur est survenue. Veuillez réessayer ou nous contacter directement par email."}
                  </div>
                )}
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-heading font-semibold text-text mb-6">
                Informations de contact
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <EnvelopeIcon className="w-6 h-6 text-accent" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text mb-1">Email</h3>
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="text-text-muted hover:text-primary transition-colors">
                      {SUPPORT_EMAIL}
                    </a>
                    <p className="text-sm text-text-muted/70 mt-1">
                      Réponse sous 24-48h
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <PhoneIcon className="w-6 h-6 text-accent" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text mb-1">Téléphone</h3>
                    <a href="tel:+33123456789" className="text-text-muted hover:text-primary transition-colors">
                      +33 1 23 45 67 89
                    </a>
                    <p className="text-sm text-text-muted/70 mt-1">
                      Lun-Ven : 9h-18h
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <MapPinIcon className="w-6 h-6 text-accent" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text mb-1">Adresse</h3>
                    <p className="text-text-muted">
                      [Adresse à compléter]<br />
                      [Code postal] [Ville]<br />
                      France
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-6 bg-accent/5 rounded-[--radius-button] border border-accent/20">
                <h3 className="font-semibold text-text mb-3">
                  Service client
                </h3>
                <p className="text-sm text-text-muted">
                  Notre équipe est à votre disposition pour répondre à toutes vos questions concernant nos produits, vos commandes ou tout autre sujet.
                </p>
              </div>

              <div className="mt-6 p-6 bg-primary/5 rounded-[--radius-button] border border-primary/10">
                <h3 className="font-semibold text-text mb-3">
                  Questions fréquentes
                </h3>
                <p className="text-sm text-text-muted mb-3">
                  Avant de nous contacter, consultez notre page de suivi de commande si vous avez besoin d&apos;informations sur votre livraison.
                </p>
                <Link
                  href="/suivi"
                  className="text-sm text-accent hover:underline font-medium"
                >
                  Suivre ma commande →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
