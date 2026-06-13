"use client";

import Link from "next/link";
import { Container } from "@/components/ui";
import { useLocale } from "@/contexts/LocaleContext";
import { LOCALES, type Locale } from "@/lib/i18n/config";

const STRINGS = {
  fr: {
    shop: "Shop",
    categories: "Catégories",
    allProducts: "Tous les produits",
    hookahs: "Chichas",
    bowls: "Bols",
    hoses: "Tuyaux",
    charcoal: "Charbons",
    accessories: "Accessoires",
    orderTracking: "Suivi de commande",
    legal: "Légal",
    legalNotice: "Mentions légales",
    terms: "CGV",
    contact: "Contact",
    contactUs: "Nous contacter",
    language: "Langue",
    rights: "Tous droits réservés.",
  },
  en: {
    shop: "Shop",
    categories: "Categories",
    allProducts: "All products",
    hookahs: "Hookahs",
    bowls: "Bowls",
    hoses: "Hoses",
    charcoal: "Charcoal",
    accessories: "Accessories",
    orderTracking: "Order tracking",
    legal: "Legal",
    legalNotice: "Legal notice",
    terms: "Terms of sale",
    contact: "Contact",
    contactUs: "Contact us",
    language: "Language",
    rights: "All rights reserved.",
  },
} as const;

const LOCALE_LABELS: Record<Locale, string> = {
  fr: "Français",
  en: "English",
};

export function Footer() {
  const currentYear = new Date().getFullYear();
  const { locale, setLocale } = useLocale();
  const t = STRINGS[locale];

  return (
    <footer className="border-t border-white/10 text-white" style={{ backgroundColor: '#85572A' }}>
      <Container size="lg">
        <div className="py-12 md:py-16">
          {/* Video - Centered and larger with lazy loading */}
          <div className="flex justify-center mb-10 md:mb-12">
            <video
              src="/footervid.mp4"
              autoPlay
              loop
              muted
              playsInline
              preload="none"
              className="h-48 md:h-56 lg:h-64 w-auto object-contain"
            />
          </div>

          {/* Links Grid - All visible */}
          <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12 mb-8">
            <div className="flex flex-col gap-3 md:gap-4">
              <h3 className="text-white font-bold text-sm md:text-base uppercase tracking-widest border-b border-white/30 pb-2">{t.shop}</h3>
              <Link href="/produits" className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                → {t.allProducts}
              </Link>
              <Link href="/suivi" className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                → {t.orderTracking}
              </Link>
            </div>

            <div className="flex flex-col gap-3 md:gap-4">
              <h3 className="text-white font-bold text-sm md:text-base uppercase tracking-widest border-b border-white/30 pb-2">{t.categories}</h3>
              <Link href="/produits/chichas" className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                → {t.hookahs}
              </Link>
              <Link href="/produits/bols" className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                → {t.bowls}
              </Link>
              <Link href="/produits/tuyaux" className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                → {t.hoses}
              </Link>
              <Link href="/produits/charbons" className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                → {t.charcoal}
              </Link>
              <Link href="/produits/accessoires" className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                → {t.accessories}
              </Link>
            </div>

            <div className="flex flex-col gap-3 md:gap-4">
              <h3 className="text-white font-bold text-sm md:text-base uppercase tracking-widest border-b border-white/30 pb-2">{t.legal}</h3>
              <Link href="/mentions-legales" className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                → {t.legalNotice}
              </Link>
              <Link href="/cgv" className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                → {t.terms}
              </Link>
            </div>

            <div className="flex flex-col gap-3 md:gap-4">
              <h3 className="text-white font-bold text-sm md:text-base uppercase tracking-widest border-b border-white/30 pb-2">{t.contact}</h3>
              <Link href="/contact" className="text-white/80 hover:text-white hover:translate-x-1 transition-all duration-200 text-sm">
                → {t.contactUs}
              </Link>
            </div>
          </nav>

          {/* Language switcher */}
          <div className="flex items-center justify-center gap-3 pb-8" aria-label={t.language}>
            <span className="material-icons-outlined text-white/70 text-base" aria-hidden="true">language</span>
            {LOCALES.map((code, index) => (
              <span key={code} className="flex items-center gap-3">
                {index > 0 && <span className="text-white/30">|</span>}
                <button
                  type="button"
                  onClick={() => setLocale(code)}
                  disabled={locale === code}
                  className={
                    locale === code
                      ? "text-white font-semibold text-sm underline underline-offset-4 cursor-default"
                      : "text-white/70 hover:text-white text-sm transition-colors"
                  }
                >
                  {LOCALE_LABELS[code]}
                </button>
              </span>
            ))}
          </div>

          {/* Bottom Section - Copyright */}
          <div className="text-center pt-8 border-t border-white/20">
            <p className="text-white/70 text-sm font-light tracking-wide">
              &copy; {currentYear} Nuage. {t.rights}
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
