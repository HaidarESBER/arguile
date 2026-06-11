"use client";

import { useState } from "react";
import Link from "next/link";

/**
 * Manual unsubscribe form client component.
 * Used on the /desabonnement page when no token is present.
 */
export function UnsubscribeContent() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setState("loading");
    setErrorMessage("");

    try {
      const res = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setState("error");
        setErrorMessage(data.error || "Erreur lors du désabonnement");
        return;
      }

      setState("success");
    } catch {
      setState("error");
      setErrorMessage("Erreur de connexion. Réessayez plus tard.");
    }
  };

  if (state === "success") {
    return (
      <div className="text-center">
        <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center">
          <svg
            className="w-6 h-6 text-green-600"
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
        <p className="text-primary/70 mb-6">
          Si cette adresse était inscrite, elle a été désabonnée.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="email"
        placeholder="Votre adresse email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={state === "loading"}
        className="w-full px-4 py-3 border border-primary/20 rounded-lg text-primary placeholder:text-primary/50 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent disabled:opacity-50"
      />

      {state === "error" && (
        <p className="text-sm text-red-500">{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full px-6 py-3 bg-primary text-background rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
      >
        {state === "loading" ? "Traitement..." : "Se désabonner"}
      </button>

      <Link
        href="/"
        className="block text-sm text-primary/60 hover:text-primary transition-colors"
      >
        Retour à l&apos;accueil
      </Link>
    </form>
  );
}
