"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/ui";
import { CartButton } from "@/components/cart";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { useComparison } from "@/contexts/ComparisonContext";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { getCategoryLabel } from "@/types/product";
import { useLocale } from "@/contexts/LocaleContext";
import { createClient } from "@/lib/supabase/client";
import { Settings } from "lucide-react";

const STRINGS = {
  fr: {
    freeShipping: "Livraison offerte dès 50 €",
    fastShipping: "Expédition sous 24h",
    returns: "Retours sous 14 jours",
    openSearch: "Ouvrir la recherche",
    searchPlaceholder: "Rechercher...",
    products: "Produits",
    compareCount: (n: number) => `Comparer (${n})`,
    search: "Rechercher",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    navMenu: "Menu de navigation",
    menu: "Menu",
    allProducts: "Tous les Produits",
    compare: "Comparer",
    cart: "Panier",
  },
  en: {
    freeShipping: "Free shipping from €50",
    fastShipping: "Ships within 24h",
    returns: "14-day returns",
    openSearch: "Open search",
    searchPlaceholder: "Search...",
    products: "Products",
    compareCount: (n: number) => `Compare (${n})`,
    search: "Search",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    navMenu: "Navigation menu",
    menu: "Menu",
    allProducts: "All Products",
    compare: "Compare",
    cart: "Cart",
  },
} as const;

/**
 * Site header with brand name and navigation
 *
 * Features:
 * - Brand logo/name linking to home
 * - CartButton with item count
 * - Sticky positioning
 * - Mobile hamburger menu with overlay navigation
 */
export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogo, setShowLogo] = useState(true);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const { comparisonItems } = useComparison();
  const prefersReducedMotion = useReducedMotion();
  const menuRef = useRef<HTMLDivElement>(null);
  const { locale } = useLocale();
  const t = STRINGS[locale];

  useEffect(() => {
    // Mount flag so the portal only renders client-side; deferred to effect to avoid SSR hydration mismatch
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Check if user is admin - must match middleware logic
  useEffect(() => {
    const checkAdminStatus = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Check profiles.is_admin - same as middleware
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", user.id)
          .single();

        setIsAdmin(profile?.is_admin === true);
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, []);

  // Close menu on navigation
  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Close mobile menu on Escape
  useEffect(() => {
    if (!isMenuOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  // Focus trap for the mobile menu (same pattern as BottomSheet)
  useEffect(() => {
    if (!isMenuOpen || !menuRef.current) return;

    const menu = menuRef.current;
    const focusableElements = menu.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable?.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable?.focus();
        }
      }
    };

    menu.addEventListener("keydown", handleTab as EventListener);
    firstFocusable?.focus();

    return () => {
      menu.removeEventListener("keydown", handleTab as EventListener);
    };
  }, [isMenuOpen]);

  // Homepage has transparent header - video shows through
  const isHomepage = pathname === "/";

  return (
    <>
      {/* Announcement bar — threshold must match FREE_SHIPPING_THRESHOLD in lib/shipping.ts */}
      <div className="bg-primary text-background-dark py-1.5 text-center text-xs font-semibold tracking-wide z-50 sticky top-0 whitespace-nowrap overflow-hidden">
        {t.freeShipping}
        <span className="hidden sm:inline">
          <span aria-hidden="true" className="mx-1.5 opacity-50">·</span> {t.fastShipping} <span aria-hidden="true" className="mx-1.5 opacity-50">·</span> {t.returns}
        </span>
      </div>

      {/* Main Header */}
      <header className="sticky top-[30px] z-40 glass-header transition-all duration-300 border-b border-white/5">
        <Container size="lg">
          <div className="flex items-center justify-between h-14 md:h-16 gap-2 md:gap-3">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0 group -ml-2 md:ml-0">
            <div className="relative h-10 md:h-12 w-32 md:w-36 flex items-center justify-center" style={{ perspective: '1000px' }}>
              {/* Branch only after mount: useReducedMotion() is false during
                  SSR but true on reduced-motion clients, and branching on it
                  directly caused a hydration mismatch (= dev error badge). */}
              {mounted && prefersReducedMotion ? (
                // Static logo for users who prefer reduced motion
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src="/logo.png"
                  alt="Nuage Logo"
                  className="h-10 md:h-12 w-auto object-contain absolute"
                />
              ) : (
                <AnimatePresence mode="wait">
                  {showLogo ? (
                    <motion.img
                      key="logo"
                      src="/logo.png"
                      alt="Nuage Logo"
                      className="h-10 md:h-12 w-auto object-contain absolute"
                      initial={{ rotateY: -90, opacity: 0, scale: 0.5, y: -10 }}
                      animate={{ rotateY: 0, opacity: 1, scale: 1, y: 0 }}
                      exit={{ rotateY: 90, opacity: 0, scale: 0.5, y: 10 }}
                      transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                      onAnimationComplete={() => {
                        // Flip to the brand name once per mount, then stop
                        setTimeout(() => setShowLogo(false), 1500);
                      }}
                      style={{ transformStyle: 'preserve-3d' }}
                    />
                  ) : (
                    <motion.span
                      key="text"
                      className="font-heading text-sm md:text-base text-white absolute whitespace-nowrap"
                      initial={{ rotateY: -90, opacity: 0, scale: 0.5, y: -10 }}
                      animate={{ rotateY: 0, opacity: 1, scale: 1, y: 0 }}
                      exit={{ rotateY: 90, opacity: 0, scale: 0.5, y: 10 }}
                      transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                      style={{ transformStyle: 'preserve-3d' }}
                    >
                      Nuage
                    </motion.span>
                  )}
                </AnimatePresence>
              )}
            </div>
          </Link>

          {/* Desktop Search & Navigation */}
          <div className="hidden md:flex items-center gap-4 flex-grow justify-end">
            {/* Search trigger — looks like an input but only opens the
                SearchOverlay, whose own field receives focus. A real input
                here would compete with the overlay's autofocused input. */}
            <button
              type="button"
              onClick={() => setIsSearchOpen(true)}
              aria-label={t.openSearch}
              className="relative max-w-sm w-full h-10 bg-surface-dark/50 border border-white/10 hover:border-primary/50 rounded-full text-sm text-gray-400 text-left pl-10 pr-4 transition-colors cursor-text"
            >
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 material-icons text-gray-400 text-base"
                aria-hidden="true"
              >
                search
              </span>
              {t.searchPlaceholder}
            </button>

            <nav className="flex items-center gap-4 h-10">
            <Link
              href="/produits"
              className="text-xs font-medium text-white/90 hover:text-primary transition-colors"
            >
              {t.products}
            </Link>
            <Link
              href="/blog"
              className="text-xs font-medium text-white/90 hover:text-primary transition-colors"
            >
              Blog
            </Link>

            {/* Favorites flow hidden: guest-only shop, add-to-cart is the
                single product action (see ProductCard / ProductDetailClient) */}

            {/* Comparison button */}
            {comparisonItems.length > 0 && (
              <Link
                href="/comparaison"
                className="text-sm font-medium text-white/90 hover:text-primary transition-colors flex items-center gap-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
                </svg>
                {t.compareCount(comparisonItems.length)}
              </Link>
            )}

            {/* Account entry point hidden: guest checkout only. The /compte
                route stays reachable by URL — it is the admin login. */}

            {/* Admin button - only visible to admins */}
            {isAdmin && (
              <Link
                href="/admin"
                className="text-white/90 hover:text-primary transition-colors flex items-center gap-1"
                aria-label="Admin Panel"
                title="Admin Panel"
              >
                <Settings className="w-5 h-5" />
              </Link>
            )}

            <CartButton isHomepage={isHomepage} />
            </nav>
          </div>

          {/* Mobile Navigation Controls */}
          <div className="flex md:hidden items-center gap-3">
            {/* Search button — same p-2 box and 24px icon as CartButton and
                the hamburger so all three icons sit on one optical line */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="p-2 inline-flex items-center justify-center text-white/90 hover:text-primary transition-colors"
              aria-label={t.search}
            >
              <span className="material-icons text-2xl leading-none" aria-hidden="true">search</span>
            </button>

            <CartButton isHomepage={isHomepage} />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-white/90 hover:text-primary transition-colors"
              aria-label={isMenuOpen ? t.closeMenu : t.openMenu}
              aria-expanded={isMenuOpen}
            >
              {/* Hamburger Icon */}
              <div className="w-6 h-5 flex flex-col justify-between">
                <span
                  className={`block h-0.5 w-6 bg-current transform transition-transform duration-200 ${
                    isMenuOpen ? "rotate-45 translate-y-2" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-6 bg-current transition-opacity duration-200 ${
                    isMenuOpen ? "opacity-0" : ""
                  }`}
                />
                <span
                  className={`block h-0.5 w-6 bg-current transform transition-transform duration-200 ${
                    isMenuOpen ? "-rotate-45 -translate-y-2" : ""
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </Container>

      {/* Mobile Menu Overlay - Rendered via Portal */}
      {mounted && isMenuOpen && createPortal(
        <motion.div
          ref={menuRef}
          role="dialog"
          aria-modal="true"
          aria-label={t.navMenu}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999999,
          }}
        >
          {/* Backdrop */}
          <div
            onClick={handleNavClick}
            aria-hidden="true"
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Sliding Menu Panel */}
          <motion.nav
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="absolute top-0 right-0 bottom-0 w-[280px] bg-background-dark/98 backdrop-blur-xl border-l border-white/10 overflow-y-auto shadow-2xl"
            style={{
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {/* Menu Header */}
            <div className="sticky top-0 bg-background-dark/95 backdrop-blur-xl border-b border-white/10 p-4 flex items-center justify-between z-10">
              <span className="font-heading text-lg text-white font-bold">{t.menu}</span>
              <button
                onClick={handleNavClick}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label={t.closeMenu}
              >
                <span className="material-icons text-xl" aria-hidden="true">close</span>
              </button>
            </div>

            {/* Menu Content */}
            <div className="p-4 flex flex-col gap-1 pb-safe">
                {/* Products */}
                <Link
                  href="/produits"
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    pathname === "/produits"
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "text-white hover:bg-white/5"
                  }`}
                >
                  <span className="material-icons text-lg" aria-hidden="true">inventory_2</span>
                  <span className="text-sm font-medium">{t.allProducts}</span>
                </Link>

                {/* Categories Submenu */}
                <div className="ml-3 pl-3 border-l border-white/10 mt-1 mb-2 flex flex-col gap-0.5">
                  <Link
                    href="/produits/chichas"
                    onClick={handleNavClick}
                    className="px-3 py-1.5 text-xs text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-white/5"
                  >
                    {getCategoryLabel("chicha", locale)}
                  </Link>
                  <Link
                    href="/produits/bols"
                    onClick={handleNavClick}
                    className="px-3 py-1.5 text-xs text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-white/5"
                  >
                    {getCategoryLabel("bol", locale)}
                  </Link>
                  <Link
                    href="/produits/tuyaux"
                    onClick={handleNavClick}
                    className="px-3 py-1.5 text-xs text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-white/5"
                  >
                    {getCategoryLabel("tuyau", locale)}
                  </Link>
                  <Link
                    href="/produits/charbons"
                    onClick={handleNavClick}
                    className="px-3 py-1.5 text-xs text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-white/5"
                  >
                    {getCategoryLabel("charbon", locale)}
                  </Link>
                  <Link
                    href="/produits/accessoires"
                    onClick={handleNavClick}
                    className="px-3 py-1.5 text-xs text-text-muted hover:text-primary transition-colors rounded-lg hover:bg-white/5"
                  >
                    {getCategoryLabel("accessoire", locale)}
                  </Link>
                </div>

                {/* Blog */}
                <Link
                  href="/blog"
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    pathname.startsWith("/blog")
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "text-white hover:bg-white/5"
                  }`}
                >
                  <span className="material-icons text-lg" aria-hidden="true">article</span>
                  <span className="text-sm font-medium">Blog</span>
                </Link>

                {/* Favorites & account entries hidden: guest-only shop
                    (the /compte URL remains the admin login) */}

                {/* Comparison */}
                {comparisonItems.length > 0 && (
                  <Link
                    href="/comparaison"
                    onClick={handleNavClick}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      pathname === "/comparaison"
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "text-white hover:bg-white/5"
                    }`}
                  >
                    <span className="material-icons text-lg" aria-hidden="true">compare</span>
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-sm font-medium">{t.compare}</span>
                      <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                        {comparisonItems.length}
                      </span>
                    </div>
                  </Link>
                )}

                {/* Admin link */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    onClick={handleNavClick}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                      pathname.startsWith("/admin")
                        ? "bg-primary/20 text-primary border border-primary/30"
                        : "text-white hover:bg-white/5"
                    }`}
                  >
                    <Settings className="w-5 h-5" />
                    <span className="text-sm font-medium">Admin Panel</span>
                  </Link>
                )}

                {/* Divider */}
                <div className="h-px bg-white/10 my-2"></div>

                {/* Cart */}
                <Link
                  href="/panier"
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    pathname === "/panier"
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "text-white hover:bg-white/5"
                  }`}
                >
                  <span className="material-icons text-lg" aria-hidden="true">shopping_cart</span>
                  <span className="text-sm font-medium">{t.cart}</span>
                </Link>
              </div>
            </motion.nav>
          </motion.div>,
        document.body
      )}

      </header>

      {/* Search Overlay */}
      <SearchOverlay isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}
