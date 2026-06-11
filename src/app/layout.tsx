import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { ComparisonProvider } from "@/contexts/ComparisonContext";
import { Header, Footer } from "@/components/layout";
import { FloatingCartButton } from "@/components/mobile/FloatingCartButton";
import { InstallPrompt } from "@/components/mobile/InstallPrompt";
import { ExitIntentModal } from "@/components/marketing/ExitIntentModal";
import { SupportChat } from "@/components/chat/SupportChat";
import { WebVitalsReporter } from "@/components/analytics/WebVitalsReporter";
import { AnalyticsScripts } from "@/components/analytics/AnalyticsScripts";
import { HealthWarning } from "@/components/legal/HealthWarning";
import { CookieConsent } from "@/components/legal/CookieConsent";
import { AgeVerification } from "@/components/legal/AgeVerification";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { generateOrganizationSchema, SITE_URL } from "@/lib/seo";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#2b251f",
};

export const metadata: Metadata = {
  title: {
    default: "Nuage | L'art de la détente",
    template: "%s | Nuage",
  },
  description:
    "Boutique en ligne d'accessoires chicha haut de gamme. Chichas, bols, tuyaux, charbon et accessoires de qualité pour les connaisseurs.",
  keywords: ["chicha", "hookah", "narguilé", "accessoires", "premium", "France"],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Nuage | L'art de la détente",
    description:
      "Boutique en ligne d'accessoires chicha haut de gamme. Chichas, bols, tuyaux, charbon et accessoires de qualité pour les connaisseurs.",
    type: "website",
    locale: "fr_FR",
    siteName: "Nuage",
    images: [
      {
        url: "/logo.png",
        alt: "Nuage — L'art de la détente",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Nuage | L'art de la détente",
    description:
      "Boutique en ligne d'accessoires chicha haut de gamme. Chichas, bols, tuyaux, charbon et accessoires de qualité pour les connaisseurs.",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = generateOrganizationSchema();

  return (
    <html lang="fr">
      <head>
        {/* Material Icons */}
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet" />

        {/* Organization Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`${fontVariables} font-sans antialiased`}>
        <WebVitalsReporter />
        <AnalyticsScripts />
        <ServiceWorkerRegister />

        {/* Legal Components - MANDATORY for compliance */}
        <AgeVerification />
        <CookieConsent />

        <CartProvider>
          <WishlistProvider>
            <ComparisonProvider>
              {/* Health warning sticky banner */}
              <HealthWarning />

              <Header />
              <div className="flex flex-col min-h-screen">
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
              <FloatingCartButton />
              <InstallPrompt />
              <ExitIntentModal />
              <SupportChat />
            </ComparisonProvider>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}
