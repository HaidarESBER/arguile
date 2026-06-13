"use client";

import { useEffect, useState } from "react";

const STRINGS = {
  fr: {
    title: "Une erreur critique est survenue",
    body: "Le site a rencontré un problème inattendu. Veuillez réessayer dans quelques instants.",
    retry: "Réessayer",
  },
  en: {
    title: "A critical error occurred",
    body: "The site ran into an unexpected problem. Please try again in a few moments.",
    retry: "Try again",
  },
} as const;

/**
 * Global error boundary - replaces the root layout when it crashes.
 * Must render its own <html> and <body>, and cannot rely on globals.css.
 * LocaleContext is unavailable here (the provider lives in the crashed root
 * layout), so the locale is read directly from the "locale" cookie on the
 * client, defaulting to French.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale] = useState<"fr" | "en">(() => {
    if (typeof document === "undefined") return "fr";
    return /(?:^|;\s*)locale=en(?:;|$)/.test(document.cookie) ? "en" : "fr";
  });
  const t = STRINGS[locale];

  useEffect(() => {
    console.error("Erreur globale :", error);
  }, [error]);

  return (
    <html lang={locale}>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#2b251f",
          color: "#e8dfd5",
          fontFamily:
            "'Space Grotesk', ui-sans-serif, system-ui, -apple-system, sans-serif",
          textAlign: "center",
          padding: "2rem",
        }}
      >
        <div style={{ maxWidth: "32rem" }}>
          <p
            style={{
              fontSize: "1rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "#d4af37",
              marginBottom: "1rem",
            }}
          >
            Nuage
          </p>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 700,
              marginBottom: "1rem",
              color: "#e8dfd5",
            }}
          >
            {t.title}
          </h1>
          <p
            style={{
              color: "#a89985",
              fontSize: "1.05rem",
              lineHeight: 1.6,
              marginBottom: "2rem",
            }}
          >
            {t.body}
          </p>
          <button
            onClick={reset}
            style={{
              padding: "0.75rem 2rem",
              borderRadius: "9999px",
              border: "none",
              backgroundColor: "#d4af37",
              color: "#2b251f",
              fontSize: "1rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t.retry}
          </button>
        </div>
      </body>
    </html>
  );
}
