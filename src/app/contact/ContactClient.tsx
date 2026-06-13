"use client";

import { useState } from "react";
import Link from "next/link";
import { Container } from "@/components/ui";
import { EnvelopeIcon, PhoneIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { SUPPORT_EMAIL } from "@/lib/support";
import { useLocale } from "@/contexts/LocaleContext";

const STRINGS = {
  fr: {
    title: "Contactez-nous",
    intro:
      "Une question ? Une remarque ? N'hésitez pas à nous contacter, notre équipe vous répondra dans les plus brefs délais.",
    formTitle: "Envoyez-nous un message",
    nameLabel: "Nom complet",
    namePlaceholder: "Jean Dupont",
    emailLabel: "Email",
    emailPlaceholder: "jean.dupont@email.com",
    subjectLabel: "Sujet",
    subjectPlaceholder: "Sélectionnez un sujet",
    subjectOrder: "Question sur une commande",
    subjectProduct: "Question sur un produit",
    subjectShipping: "Problème de livraison",
    subjectReturn: "Retour / Remboursement",
    subjectOther: "Autre",
    messageLabel: "Message",
    messagePlaceholder: "Décrivez votre demande...",
    sending: "Envoi en cours...",
    send: "Envoyer le message",
    successMessage: "Message envoyé avec succès ! Nous vous répondrons rapidement.",
    genericError:
      "Une erreur est survenue. Veuillez réessayer ou nous contacter directement par email.",
    networkError:
      "Impossible d'envoyer le message. Vérifiez votre connexion et réessayez.",
    infoTitle: "Informations de contact",
    emailHeading: "Email",
    responseTime: "Réponse sous 24-48h",
    phoneHeading: "Téléphone",
    phoneHours: "Lun-Ven : 9h-18h",
    addressHeading: "Adresse",
    addressLine1: "[Adresse à compléter]",
    addressLine2: "[Code postal] [Ville]",
    addressLine3: "France",
    supportTitle: "Service client",
    supportText:
      "Notre équipe est à votre disposition pour répondre à toutes vos questions concernant nos produits, vos commandes ou tout autre sujet.",
    faqTitle: "Questions fréquentes",
    faqText:
      "Avant de nous contacter, consultez notre page de suivi de commande si vous avez besoin d'informations sur votre livraison.",
    trackOrder: "Suivre ma commande →",
  },
  en: {
    title: "Contact us",
    intro:
      "A question? A comment? Don't hesitate to reach out — our team will get back to you as soon as possible.",
    formTitle: "Send us a message",
    nameLabel: "Full name",
    namePlaceholder: "John Smith",
    emailLabel: "Email",
    emailPlaceholder: "john.smith@email.com",
    subjectLabel: "Subject",
    subjectPlaceholder: "Select a subject",
    subjectOrder: "Question about an order",
    subjectProduct: "Question about a product",
    subjectShipping: "Shipping issue",
    subjectReturn: "Return / Refund",
    subjectOther: "Other",
    messageLabel: "Message",
    messagePlaceholder: "Describe your request...",
    sending: "Sending...",
    send: "Send message",
    successMessage: "Message sent successfully! We will get back to you shortly.",
    genericError:
      "Something went wrong. Please try again or contact us directly by email.",
    networkError:
      "Unable to send the message. Check your connection and try again.",
    infoTitle: "Contact information",
    emailHeading: "Email",
    responseTime: "Reply within 24-48h",
    phoneHeading: "Phone",
    phoneHours: "Mon-Fri: 9am-6pm",
    addressHeading: "Address",
    addressLine1: "[Address to be completed]",
    addressLine2: "[Postal code] [City]",
    addressLine3: "France",
    supportTitle: "Customer service",
    supportText:
      "Our team is here to answer any questions about our products, your orders or anything else.",
    faqTitle: "Frequently asked questions",
    faqText:
      "Before contacting us, check our order tracking page if you need information about your delivery.",
    trackOrder: "Track my order →",
  },
} as const;

export function ContactClient() {
  const { locale } = useLocale();
  const t = STRINGS[locale];

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
        setErrorMessage(data.error || t.genericError);
        setStatus("error");
        return;
      }

      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setErrorMessage(t.networkError);
      setStatus("error");
    }
  };

  return (
    <main className="py-16 min-h-screen">
      <Container size="lg">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-heading font-bold text-text mb-4">
            {t.title}
          </h1>
          <p className="text-lg text-text-muted mb-12">
            {t.intro}
          </p>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-heading font-semibold text-text mb-6">
                {t.formTitle}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text mb-2">
                    {t.nameLabel}
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    maxLength={100}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-primary/20 rounded-[--radius-button] bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder={t.namePlaceholder}
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
                    {t.emailLabel}
                  </label>
                  <input
                    type="email"
                    id="email"
                    required
                    maxLength={254}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-primary/20 rounded-[--radius-button] bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
                    placeholder={t.emailPlaceholder}
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-text mb-2">
                    {t.subjectLabel}
                  </label>
                  <select
                    id="subject"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full px-4 py-2 border border-primary/20 rounded-[--radius-button] bg-background text-text focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="">{t.subjectPlaceholder}</option>
                    <option value="commande">{t.subjectOrder}</option>
                    <option value="produit">{t.subjectProduct}</option>
                    <option value="livraison">{t.subjectShipping}</option>
                    <option value="retour">{t.subjectReturn}</option>
                    <option value="autre">{t.subjectOther}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-text mb-2">
                    {t.messageLabel}
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
                    placeholder={t.messagePlaceholder}
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="w-full px-6 py-3 bg-primary text-background rounded-[--radius-button] font-semibold hover:bg-primary-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {status === "sending" ? t.sending : t.send}
                </button>

                {status === "success" && (
                  <div
                    role="status"
                    className="p-4 bg-green-500/10 border border-green-500/30 rounded-[--radius-button] text-green-300"
                  >
                    {t.successMessage}
                  </div>
                )}

                {status === "error" && (
                  <div
                    role="alert"
                    className="p-4 bg-error/10 border border-error/30 rounded-[--radius-button] text-error"
                  >
                    {errorMessage || t.genericError}
                  </div>
                )}
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-heading font-semibold text-text mb-6">
                {t.infoTitle}
              </h2>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <EnvelopeIcon className="w-6 h-6 text-accent" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text mb-1">{t.emailHeading}</h3>
                    <a href={`mailto:${SUPPORT_EMAIL}`} className="text-text-muted hover:text-primary transition-colors">
                      {SUPPORT_EMAIL}
                    </a>
                    <p className="text-sm text-text-muted/70 mt-1">
                      {t.responseTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <PhoneIcon className="w-6 h-6 text-accent" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text mb-1">{t.phoneHeading}</h3>
                    <a href="tel:+33123456789" className="text-text-muted hover:text-primary transition-colors">
                      +33 1 23 45 67 89
                    </a>
                    <p className="text-sm text-text-muted/70 mt-1">
                      {t.phoneHours}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                    <MapPinIcon className="w-6 h-6 text-accent" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text mb-1">{t.addressHeading}</h3>
                    <p className="text-text-muted">
                      {t.addressLine1}<br />
                      {t.addressLine2}<br />
                      {t.addressLine3}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 p-6 bg-accent/5 rounded-[--radius-button] border border-accent/20">
                <h3 className="font-semibold text-text mb-3">
                  {t.supportTitle}
                </h3>
                <p className="text-sm text-text-muted">
                  {t.supportText}
                </p>
              </div>

              <div className="mt-6 p-6 bg-primary/5 rounded-[--radius-button] border border-primary/10">
                <h3 className="font-semibold text-text mb-3">
                  {t.faqTitle}
                </h3>
                <p className="text-sm text-text-muted mb-3">
                  {t.faqText}
                </p>
                <Link
                  href="/suivi"
                  className="text-sm text-accent hover:underline font-medium"
                >
                  {t.trackOrder}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
