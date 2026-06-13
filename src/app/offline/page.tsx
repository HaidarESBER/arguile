import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n/server";

const STRINGS = {
  fr: {
    metaTitle: "Hors ligne | Nuage",
    metaDescription: "Vous êtes actuellement hors ligne",
    title: "Vous êtes hors ligne",
    message: "Reconnectez-vous à Internet pour continuer votre shopping",
    suggestions: "Suggestions:",
    tipWifi: "Vérifiez votre connexion Wi-Fi",
    tipData: "Activez vos données mobiles",
    tipRetry: "Réessayez dans quelques instants",
    backHome: "Retour à l'accueil",
    autoReload: "Cette page se rechargera automatiquement une fois la connexion rétablie",
  },
  en: {
    metaTitle: "Offline | Nuage",
    metaDescription: "You are currently offline",
    title: "You are offline",
    message: "Reconnect to the Internet to keep shopping",
    suggestions: "Suggestions:",
    tipWifi: "Check your Wi-Fi connection",
    tipData: "Turn on your mobile data",
    tipRetry: "Try again in a few moments",
    backHome: "Back to home",
    autoReload: "This page will reload automatically once the connection is restored",
  },
} as const;

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = STRINGS[locale];
  return {
    title: t.metaTitle,
    description: t.metaDescription,
  };
}

export default async function OfflinePage() {
  const locale = await getLocale();
  const t = STRINGS[locale];

  return (
    <div className="min-h-screen bg-background-primary flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {/* Cloud Logo Animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative w-32 h-32">
            <svg
              className="w-full h-full text-muted/30"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M19.35 10.04A7.49 7.49 0 0 0 12 4C9.11 4 6.6 5.64 5.35 8.04A5.994 5.994 0 0 0 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
            </svg>
            {/* Disconnected indicator */}
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-muted rounded-full border-4 border-background-primary" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-heading text-4xl md:text-5xl text-primary mb-4">
          {t.title}
        </h1>

        {/* Message */}
        <p className="text-muted text-lg mb-8">
          {t.message}
        </p>

        {/* Connection Tips */}
        <div className="bg-background-secondary rounded-2xl p-6 mb-8 text-left">
          <h2 className="font-heading text-xl text-primary mb-4">
            {t.suggestions}
          </h2>
          <ul className="space-y-2 text-muted">
            <li className="flex items-start">
              <span className="text-accent-blush mr-2">•</span>
              {t.tipWifi}
            </li>
            <li className="flex items-start">
              <span className="text-accent-blush mr-2">•</span>
              {t.tipData}
            </li>
            <li className="flex items-start">
              <span className="text-accent-blush mr-2">•</span>
              {t.tipRetry}
            </li>
          </ul>
        </div>

        {/* Back Button */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- offline fallback must trigger a full reload to retry the network */}
        <a
          href="/"
          className="inline-block px-8 py-3 bg-accent-blush text-white rounded-full hover:bg-accent-blush/90 transition-all hover:scale-105 font-medium"
        >
          {t.backHome}
        </a>

        {/* Retry message */}
        <p className="mt-6 text-sm text-muted/70">
          {t.autoReload}
        </p>
      </div>

      {/* Auto-reload script when back online */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('online', function() {
              window.location.reload();
            });
          `,
        }}
      />
    </div>
  );
}
