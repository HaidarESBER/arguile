"use client";

import { useEffect } from "react";

/**
 * Global error boundary - replaces the root layout when it crashes.
 * Must render its own <html> and <body>, and cannot rely on globals.css.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erreur globale :", error);
  }, [error]);

  return (
    <html lang="fr">
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
            Une erreur critique est survenue
          </h1>
          <p
            style={{
              color: "#a89985",
              fontSize: "1.05rem",
              lineHeight: 1.6,
              marginBottom: "2rem",
            }}
          >
            Le site a rencontré un problème inattendu. Veuillez réessayer dans
            quelques instants.
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
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
