import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hors ligne | Nuage",
  description: "Vous êtes actuellement hors ligne",
};

export default function OfflinePage() {
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
          Vous êtes hors ligne
        </h1>

        {/* Message */}
        <p className="text-muted text-lg mb-8">
          Reconnectez-vous à Internet pour continuer votre shopping
        </p>

        {/* Connection Tips */}
        <div className="bg-background-secondary rounded-2xl p-6 mb-8 text-left">
          <h2 className="font-heading text-xl text-primary mb-4">
            Suggestions:
          </h2>
          <ul className="space-y-2 text-muted">
            <li className="flex items-start">
              <span className="text-accent-blush mr-2">•</span>
              Vérifiez votre connexion Wi-Fi
            </li>
            <li className="flex items-start">
              <span className="text-accent-blush mr-2">•</span>
              Activez vos données mobiles
            </li>
            <li className="flex items-start">
              <span className="text-accent-blush mr-2">•</span>
              Réessayez dans quelques instants
            </li>
          </ul>
        </div>

        {/* Back Button */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- offline fallback must trigger a full reload to retry the network */}
        <a
          href="/"
          className="inline-block px-8 py-3 bg-accent-blush text-white rounded-full hover:bg-accent-blush/90 transition-all hover:scale-105 font-medium"
        >
          Retour à l&apos;accueil
        </a>

        {/* Retry message */}
        <p className="mt-6 text-sm text-muted/70">
          Cette page se rechargera automatiquement une fois la connexion rétablie
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
