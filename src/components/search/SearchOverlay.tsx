"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { formatPrice, categoryLabels, getCategoryLabel, ProductCategory } from "@/types/product";
import { categoryPath } from "@/lib/categories";
import { useLocale } from "@/contexts/LocaleContext";

const STRINGS = {
  fr: {
    searchDialog: "Recherche de produits",
    closeSearch: "Fermer la recherche",
    searchProducts: "Rechercher des produits",
    placeholder: "Chicha, bol, charbon naturel…",
    clearSearch: "Effacer la recherche",
    browse: "Parcourir",
    popularSearches: "Recherches populaires",
    escKey: "Échap",
    toClose: "pour fermer",
    searching: "Recherche…",
    viewAllResults: "Voir tous les résultats",
    noResultsFor: "Aucun résultat pour",
    checkSpelling: "Vérifiez l'orthographe ou essayez un terme plus général.",
    viewAllProducts: "Voir tous les produits",
    popular: ["Chicha débutant", "Charbon naturel", "Bol silicone", "Tuyau cuir"],
  },
  en: {
    searchDialog: "Product search",
    closeSearch: "Close search",
    searchProducts: "Search products",
    placeholder: "Hookah, bowl, natural charcoal…",
    clearSearch: "Clear search",
    browse: "Browse",
    popularSearches: "Popular searches",
    escKey: "Esc",
    toClose: "to close",
    searching: "Searching…",
    viewAllResults: "View all results",
    noResultsFor: "No results for",
    checkSpelling: "Check the spelling or try a more general term.",
    viewAllProducts: "View all products",
    popular: ["Beginner hookah", "Natural charcoal", "Silicone bowl", "Leather hose"],
  },
} as const;

interface SearchOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Trimmed result shape returned by /api/search */
interface SearchResult {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string | null;
  category: string;
}

const BROWSE_CATEGORIES: ProductCategory[] = [
  "chicha",
  "bol",
  "tuyau",
  "charbon",
  "accessoire",
];

export function SearchOverlay({ isOpen, onClose }: SearchOverlayProps) {
  const { locale } = useLocale();
  const t = STRINGS[locale];
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Search products via the lightweight server endpoint (handles synonyms,
  // accents and typos server-side — no full-catalog download per keystroke)
  useEffect(() => {
    if (!isOpen || query.length === 0) {
      // Clears stale async fetch results when the overlay closes or the query empties; not derivable during render
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }

    let cancelled = false;
    const searchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `/api/search?q=${encodeURIComponent(query)}&limit=6`
        );
        const products: SearchResult[] = await response.json();
        if (!cancelled) setResults(Array.isArray(products) ? products : []);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchProducts, 300);
    return () => {
      cancelled = true;
      clearTimeout(debounce);
    };
  }, [query, isOpen]);

  // Handle ESC key and click outside
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const categoryLabel = (slug: string) =>
    slug in categoryLabels
      ? getCategoryLabel(slug as ProductCategory, locale)
      : slug;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (all breakpoints — focuses attention on the panel) */}
          <motion.div
            key="search-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          <motion.div
            key="search-container"
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label={t.searchDialog}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-0 md:top-24 left-0 md:left-1/2 md:-translate-x-1/2 w-full md:max-w-2xl z-[101] md:px-4"
          >
            <div className="bg-background-dark/95 border-b md:border border-white/10 md:rounded-2xl shadow-[0_8px_40px_rgba(0,0,0,0.8)] overflow-hidden backdrop-blur-xl min-h-screen md:min-h-0">
              {/* Search Input */}
              <div className="p-4 md:p-5">
                <div className="flex items-center gap-3">
                  {/* Mobile back button */}
                  <button
                    onClick={onClose}
                    aria-label={t.closeSearch}
                    className="md:hidden w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors flex-shrink-0"
                  >
                    <span className="material-icons text-white" aria-hidden="true">arrow_back</span>
                  </button>

                  <div className="relative flex-1">
                    <span
                      aria-hidden="true"
                      className="absolute left-4 top-1/2 -translate-y-1/2 material-icons text-primary text-xl md:text-2xl"
                    >
                      search
                    </span>
                    <input
                      autoFocus
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      aria-label={t.searchProducts}
                      className="w-full bg-white/5 border-2 border-white/10 focus:border-primary/60 rounded-xl text-base md:text-lg text-text placeholder-text-muted focus:outline-none py-4 pl-12 md:pl-14 pr-12 transition-all"
                      placeholder={t.placeholder}
                    />
                    {query && (
                      <button
                        onClick={() => setQuery("")}
                        aria-label={t.clearSearch}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                      >
                        <span className="material-icons text-xl text-text-muted" aria-hidden="true">close</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* ====================== IDLE: browse shortcuts ====================== */}
              {query.length === 0 && (
                <div className="px-4 md:px-5 pb-6 md:pb-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
                    {t.browse}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {BROWSE_CATEGORIES.map((cat) => (
                      <Link
                        key={cat}
                        href={categoryPath(cat)}
                        onClick={onClose}
                        className="px-4 py-2.5 rounded-full border border-white/15 text-sm text-text hover:border-primary/60 hover:text-primary transition-colors"
                      >
                        {getCategoryLabel(cat, locale)}
                      </Link>
                    ))}
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
                    {t.popularSearches}
                  </p>
                  <div className="flex flex-col">
                    {t.popular.map((term) => (
                      <button
                        key={term}
                        onClick={() => setQuery(term)}
                        className="flex items-center gap-3 py-2.5 text-left text-sm text-text-muted hover:text-text transition-colors group"
                      >
                        <span
                          aria-hidden="true"
                          className="material-icons text-base text-text-muted/60 group-hover:text-primary transition-colors"
                        >
                          call_made
                        </span>
                        {term}
                      </button>
                    ))}
                  </div>

                  <p className="hidden md:block text-xs text-text-muted/60 mt-5 pt-4 border-t border-white/5">
                    <kbd className="px-1.5 py-0.5 rounded border border-white/15 bg-white/5 text-[11px] font-sans">{t.escKey}</kbd>{" "}
                    {t.toClose}
                  </p>
                </div>
              )}

              {/* ========================= LOADING ========================= */}
              {query.length > 0 && isLoading && results.length === 0 && (
                <div className="flex items-center justify-center gap-2 py-14 text-text-muted text-sm">
                  <motion.span
                    aria-hidden="true"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
                    className="material-icons text-primary text-xl"
                  >
                    autorenew
                  </motion.span>
                  {t.searching}
                </div>
              )}

              {/* ========================= RESULTS ========================= */}
              {results.length > 0 ? (
                <div className="pb-safe border-t border-white/5">
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/produits/${product.slug}`}
                      onClick={onClose}
                      className="flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3.5 hover:bg-white/5 active:bg-white/10 transition-all border-b border-white/5 group"
                    >
                      <div className="relative w-16 h-16 md:w-[72px] md:h-[72px] flex-shrink-0 bg-background-secondary rounded-lg overflow-hidden border border-white/10 group-hover:border-primary/40 transition-colors">
                        {product.image && (
                          <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            sizes="72px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-text font-medium text-sm md:text-base line-clamp-2 group-hover:text-primary transition-colors leading-snug">
                          {product.name}
                        </h4>
                        <p className="text-xs text-text-muted mt-0.5">
                          {categoryLabel(product.category)}
                        </p>
                        <p className="text-sm text-primary font-bold mt-1">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                      <span
                        aria-hidden="true"
                        className="material-icons text-text-muted/50 group-hover:text-primary group-hover:translate-x-0.5 text-xl transition-all"
                      >
                        arrow_forward
                      </span>
                    </Link>
                  ))}

                  <Link
                    href={`/produits?q=${encodeURIComponent(query)}`}
                    onClick={onClose}
                    className="flex items-center justify-center gap-2 py-4 text-sm md:text-base text-primary hover:text-text hover:bg-white/5 active:bg-white/10 transition-all font-semibold group"
                  >
                    {t.viewAllResults}
                    <span
                      aria-hidden="true"
                      className="material-icons text-base group-hover:translate-x-1 transition-transform"
                    >
                      arrow_forward
                    </span>
                  </Link>
                </div>
              ) : query.length > 0 && !isLoading ? (
                /* ======================= NO RESULTS ======================= */
                <div className="text-center py-14 px-4">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
                    <span aria-hidden="true" className="material-icons text-3xl text-text-muted">
                      search_off
                    </span>
                  </div>
                  <p className="text-text-muted text-base mb-2">
                    {t.noResultsFor} <span className="text-text font-medium">&quot;{query}&quot;</span>
                  </p>
                  <p className="text-text-muted/70 text-sm mb-6">
                    {t.checkSpelling}
                  </p>
                  <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {BROWSE_CATEGORIES.slice(0, 3).map((cat) => (
                      <Link
                        key={cat}
                        href={categoryPath(cat)}
                        onClick={onClose}
                        className="px-4 py-2 rounded-full border border-white/15 text-sm text-text-muted hover:border-primary/60 hover:text-primary transition-colors"
                      >
                        {getCategoryLabel(cat, locale)}
                      </Link>
                    ))}
                  </div>
                  <Link
                    href="/produits"
                    onClick={onClose}
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary hover:bg-primary-light text-background-dark rounded-full text-base font-semibold transition-all"
                  >
                    {t.viewAllProducts}
                    <span aria-hidden="true" className="material-icons text-base">arrow_forward</span>
                  </Link>
                </div>
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
