"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCategory, categoryLabels, formatPrice } from "@/types/product";
import type { ProductListItem } from "@/lib/products";
import { useCart } from "@/contexts/CartContext";
import { MobileFilterDrawer } from "@/components/product/MobileFilterDrawer";

interface ProduitsClientEnhancedProps {
  products: ProductListItem[];
  activeCategory: ProductCategory | null;
  searchQuery?: string;
  ratingsMap?: Record<string, { averageRating: number; totalReviews: number }>;
  initialPage?: number;
}

export function ProduitsClientEnhanced({
  products,
  activeCategory,
  searchQuery = '',
  ratingsMap = {},
  initialPage = 1,
}: ProduitsClientEnhancedProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>(activeCategory ? [activeCategory] : []);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 400]);
  const [sortOption, setSortOption] = useState("rating");
  const [showInStock, setShowInStock] = useState(false);
  const [showFeatured, setShowFeatured] = useState(false);
  const [showOnSale, setShowOnSale] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [showAddedToast, setShowAddedToast] = useState(false);
  const [justAddedId, setJustAddedId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const sortRef = useRef<HTMLDivElement>(null);

  const PRODUCTS_PER_PAGE = 12;

  const filteredProducts = useMemo(() => {
    let result = products;

    // Search filter
    if (searchQuery && searchQuery.trim().length > 0) {
      const query = searchQuery.toLowerCase().trim();
      result = result.filter((product) =>
        product.name.toLowerCase().includes(query) ||
        product.shortDescription.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((product) => selectedCategories.includes(product.category));
    }

    // Price filter (convert euros to cents for comparison)
    result = result.filter((product) =>
      product.price >= priceRange[0] * 100 && product.price <= priceRange[1] * 100
    );

    // Stock filter
    if (showInStock) {
      result = result.filter((product) => product.inStock);
    }

    // Featured filter
    if (showFeatured) {
      result = result.filter((product) => product.featured);
    }

    // On sale filter
    if (showOnSale) {
      result = result.filter((product) =>
        product.compareAtPrice && product.compareAtPrice > product.price
      );
    }

    // Sort
    const sorted = [...result];
    switch (sortOption) {
      case "price-asc":
        return sorted.sort((a, b) => a.price - b.price);
      case "price-desc":
        return sorted.sort((a, b) => b.price - a.price);
      case "rating":
        return sorted.sort((a, b) => {
          const ratingA = ratingsMap[a.id]?.averageRating || 0;
          const ratingB = ratingsMap[b.id]?.averageRating || 0;
          return ratingB - ratingA; // Highest rating first
        });
      case "newest":
        return sorted.reverse();
      default:
        return sorted;
    }
  }, [products, selectedCategories, priceRange, sortOption, searchQuery, showInStock, showFeatured, showOnSale, ratingsMap]);

  const categories: ProductCategory[] = ["chicha", "bol", "tuyau", "charbon", "accessoire"];
  const categoryCounts = useMemo(() => {
    const counts: Record<ProductCategory, number> = {
      chicha: 0,
      bol: 0,
      tuyau: 0,
      charbon: 0,
      accessoire: 0,
    };
    products.forEach((product) => {
      counts[product.category]++;
    });
    return counts;
  }, [products]);

  // Toggle category helper
  const toggleCategory = (category: ProductCategory) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  // Reset all filters
  const resetAllFilters = () => {
    setSelectedCategories([]);
    setPriceRange([0, 40000]);
    setShowInStock(false);
    setShowFeatured(false);
    setShowOnSale(false);
  };

  // Sort options
  const sortOptions = [
    { value: "rating", label: "Mieux notés" },
    { value: "newest", label: "Plus récent" },
    { value: "price-asc", label: "Prix croissant" },
    { value: "price-desc", label: "Prix décroissant" },
  ];
  const currentSortLabel = sortOptions.find(opt => opt.value === sortOption)?.label || "Mieux notés";

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Pagination calculations
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const endIndex = startIndex + PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;

    setCurrentPage(newPage);

    // Update URL with new page number
    const params = new URLSearchParams(searchParams.toString());
    if (newPage === 1) {
      params.delete('page');
    } else {
      params.set('page', newPage.toString());
    }

    const newUrl = params.toString() ? `/produits?${params.toString()}` : '/produits';
    router.push(newUrl, { scroll: true });

    // Scroll to top of products
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage > 1) {
      setCurrentPage(1);
    }
    // currentPage intentionally omitted: this effect must only run on filter changes, otherwise navigating to page 2+ would immediately reset back to page 1
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategories, priceRange, sortOption, searchQuery, showInStock, showFeatured, showOnSale]);

  return (
    <main className="flex-grow pb-6 px-3 sm:px-4 lg:px-5 max-w-[1920px] mx-auto w-full text-[0.85rem]">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex mb-3 text-[10px] text-gray-400">
        <ol className="inline-flex items-center space-x-1 md:space-x-2">
          <li className="inline-flex items-center">
            <Link href="/" className="inline-flex items-center hover:text-primary transition-colors">
              Accueil
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <span className="material-icons text-gray-600 text-xs mx-1">chevron_right</span>
              <Link href="/produits" className="hover:text-primary transition-colors">
                Produits
              </Link>
            </div>
          </li>
          {activeCategory && (
            <li>
              <div className="flex items-center">
                <span className="material-icons text-gray-600 text-xs mx-1">chevron_right</span>
                <Link href={`/produits?category=${activeCategory}`} className="text-primary font-medium hover:text-primary-light transition-colors">
                  {categoryLabels[activeCategory]}
                </Link>
              </div>
            </li>
          )}
        </ol>
      </nav>

      {/* Mobile Category Filter Bar - Sticky */}
      <div className="lg:hidden sticky top-[94px] z-40 -mx-3 sm:-mx-4 mb-4 bg-background-dark/95 backdrop-blur-md border-b border-white/10 shadow-lg">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 px-3 sm:px-4 py-3 min-w-max">
            {/* Tous button */}
            <button
              onClick={() => setSelectedCategories([])}
              className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                selectedCategories.length === 0
                  ? "bg-primary text-background-dark"
                  : "bg-surface-dark/50 text-gray-400 border border-white/10 hover:border-primary/30"
              }`}
            >
              Tous
            </button>

            {/* Category buttons */}
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
                  selectedCategories.includes(cat)
                    ? "bg-primary text-background-dark"
                    : "bg-surface-dark/50 text-gray-400 border border-white/10 hover:border-primary/30"
                }`}
              >
                {categoryLabels[cat]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Page Layout: Sidebar + Grid */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-52 flex-shrink-0 space-y-4 hidden lg:block text-[0.85rem]">
          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold text-white mb-3">Catégories</h3>
            <div className="space-y-1.5">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    if (selectedCategories.includes(cat)) {
                      setSelectedCategories(selectedCategories.filter(c => c !== cat));
                    } else {
                      setSelectedCategories([...selectedCategories, cat]);
                    }
                  }}
                  className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-all ${
                    selectedCategories.includes(cat)
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs">{categoryLabels[cat]}</span>
                    <span className="text-[10px] opacity-60">{categoryCounts[cat]}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <hr className="border-white/10" />

          {/* Quick Filters */}
          <div>
            <h3 className="text-xs font-semibold text-white mb-3">Disponibilité</h3>
            <div className="space-y-1.5">
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={showInStock}
                    onChange={(e) => setShowInStock(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-4 h-4 rounded border-2 transition-all ${
                    showInStock
                      ? 'bg-primary border-primary'
                      : 'border-white/30 group-hover:border-primary/50'
                  }`}>
                    {showInStock && (
                      <svg
                        className="w-full h-full text-background-dark p-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-400 group-hover:text-white transition-colors">
                  En stock uniquement
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={showFeatured}
                    onChange={(e) => setShowFeatured(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-4 h-4 rounded border-2 transition-all ${
                    showFeatured
                      ? 'bg-primary border-primary'
                      : 'border-white/30 group-hover:border-primary/50'
                  }`}>
                    {showFeatured && (
                      <svg
                        className="w-full h-full text-background-dark p-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-400 group-hover:text-white transition-colors">
                  Nouveautés
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer group">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={showOnSale}
                    onChange={(e) => setShowOnSale(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className={`w-4 h-4 rounded border-2 transition-all ${
                    showOnSale
                      ? 'bg-primary border-primary'
                      : 'border-white/30 group-hover:border-primary/50'
                  }`}>
                    {showOnSale && (
                      <svg
                        className="w-full h-full text-background-dark p-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-xs text-gray-400 group-hover:text-white transition-colors">
                  En promotion
                </span>
              </label>
            </div>
          </div>

          <hr className="border-white/10" />

          {/* Price Range */}
          <div>
            <h3 className="text-xs font-semibold text-white mb-3">Prix</h3>

            {/* Quick price chips */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              <button
                onClick={() => setPriceRange([0, 5000])}
                className={`px-2 py-1 rounded-full text-[10px] transition-all ${
                  priceRange[0] === 0 && priceRange[1] === 5000
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-surface-dark/50 text-gray-400 border border-white/10 hover:border-primary/30"
                }`}
              >
                Moins de 50€
              </button>
              <button
                onClick={() => setPriceRange([5000, 15000])}
                className={`px-2 py-1 rounded-full text-[10px] transition-all ${
                  priceRange[0] === 5000 && priceRange[1] === 15000
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-surface-dark/50 text-gray-400 border border-white/10 hover:border-primary/30"
                }`}
              >
                50€ - 150€
              </button>
              <button
                onClick={() => setPriceRange([15000, 40000])}
                className={`px-2 py-1 rounded-full text-[10px] transition-all ${
                  priceRange[0] === 15000 && priceRange[1] === 40000
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-surface-dark/50 text-gray-400 border border-white/10 hover:border-primary/30"
                }`}
              >
                Plus de 150€
              </button>
            </div>

            {/* Custom range sliders */}
            <div className="space-y-2">
              <div>
                <div className="flex items-center justify-between text-[10px] mb-1.5">
                  <span className="text-gray-400">Min</span>
                  <span className="text-white font-medium">{formatPrice(priceRange[0])}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40000"
                  step="500"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                  className="w-full h-0.5 bg-surface-dark rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
              <div>
                <div className="flex items-center justify-between text-[10px] mb-1.5">
                  <span className="text-gray-400">Max</span>
                  <span className="text-white font-medium">{formatPrice(priceRange[1])}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="40000"
                  step="500"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-0.5 bg-surface-dark rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>
            </div>
          </div>

          <hr className="border-white/10" />

          {/* Clear Filters */}
          {(selectedCategories.length > 0 || showInStock || showFeatured || showOnSale || priceRange[0] !== 0 || priceRange[1] !== 40000) && (
            <button
              onClick={() => {
                setSelectedCategories([]);
                setPriceRange([0, 40000]);
                setShowInStock(false);
                setShowFeatured(false);
                setShowOnSale(false);
              }}
              className="w-full px-3 py-2 bg-primary/10 border border-primary/30 rounded-lg text-xs text-primary hover:bg-primary/20 transition-all font-medium"
            >
              Réinitialiser tous les filtres
            </button>
          )}
        </aside>

        {/* Product Grid Area */}
        <div className="flex-grow">
          {/* Simple Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-bold text-white">
                {activeCategory ? categoryLabels[activeCategory] : "Produits"}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">
                {totalProducts > 0
                  ? `Affichage de ${startIndex + 1}-${Math.min(endIndex, totalProducts)} sur ${totalProducts} résultats`
                  : '0 résultats'
                }
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFilterOpen(true)}
                className="lg:hidden px-4 py-2.5 bg-surface-dark/50 rounded-lg text-sm text-white border border-white/10 hover:border-primary transition-colors"
              >
                Filtres
              </button>

              {/* Custom Sort Dropdown */}
              <div ref={sortRef} className="relative">
                <button
                  onClick={() => setIsSortOpen(!isSortOpen)}
                  className="px-4 py-2.5 md:py-2 bg-black/60 border border-white/20 rounded-lg text-sm font-medium text-white hover:bg-black/70 hover:border-primary/50 transition-all inline-flex items-center gap-1.5 md:gap-2"
                >
                  <span className="text-primary">{currentSortLabel}</span>
                  <motion.svg
                    animate={{ rotate: isSortOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-3 h-3 md:w-4 md:h-4 text-text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {isSortOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 bg-surface-dark backdrop-blur-md rounded-lg shadow-2xl border border-white/20 overflow-hidden z-50"
                    >
                      {sortOptions.map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortOption(option.value);
                            setIsSortOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-white/10 transition-colors flex items-center justify-between"
                        >
                          <span className={`text-sm ${option.value === sortOption ? 'text-primary font-medium' : 'text-white'}`}>
                            {option.label}
                          </span>
                          {option.value === sortOption && (
                            <svg className="w-4 h-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Products Grid - Clean & Simple */}
          <div className="grid grid-cols-1 min-[360px]:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {paginatedProducts.map((product) => (
              <Link
                key={product.id}
                href={`/produits/${product.slug}`}
                className="group bg-surface-dark/30 rounded-lg overflow-hidden border border-white/5 hover:border-primary/30 transition-all flex flex-col"
              >
                {/* Image */}
                <div className="relative aspect-square bg-gradient-to-b from-surface-dark/50 to-black/30 p-4">
                  {product.featured && (
                    <span className="absolute top-2 left-2 bg-primary text-background-dark text-xs font-bold px-1.5 py-0.5 rounded">
                      Nouveau
                    </span>
                  )}
                  <div className="relative w-full h-full">
                    <Image
                      src={product.images[0]}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                </div>

                {/* Reviews section - Below image - ALWAYS VISIBLE */}
                <div className="px-2.5 pt-2 pb-1.5 border-b border-white/10 bg-background-card/50">
                  <div className="flex items-center justify-center gap-2">
                    {ratingsMap[product.id] && (
                      <div className="flex items-center gap-1">
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-[11px] ${
                                star <= Math.round(ratingsMap[product.id].averageRating)
                                  ? "text-primary"
                                  : "text-gray-600"
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-gray-400">({ratingsMap[product.id].totalReviews})</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info */}
                <div className="p-2.5 flex flex-col gap-1.5 flex-grow">
                  <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                    {product.name}
                  </h3>

                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-base font-bold text-primary">{formatPrice(product.price)}</span>
                    <motion.button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Cart expects a full Product; the list item omits the
                        // long description, so substitute the short one.
                        addItem({ ...product, description: product.shortDescription }, 1);
                        setJustAddedId(product.id);
                        setShowAddedToast(true);
                        setTimeout(() => {
                          setJustAddedId(null);
                          setShowAddedToast(false);
                        }, 2000);
                      }}
                      animate={justAddedId === product.id ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                      aria-label={`Ajouter ${product.name} au panier`}
                      className={`w-10 h-10 md:w-9 md:h-9 rounded-full flex items-center justify-center transition-all ${
                        justAddedId === product.id
                          ? "bg-green-500 text-background-dark"
                          : "bg-primary text-background-dark hover:bg-primary-light"
                      }`}
                    >
                      <span aria-hidden="true" className="material-icons text-base">
                        {justAddedId === product.id ? "check" : "add"}
                      </span>
                    </motion.button>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {/* Previous button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-surface-dark/50 text-white border border-white/10 hover:border-primary/30 disabled:hover:border-white/10"
              >
                <span className="material-icons text-sm">chevron_left</span>
              </button>

              {/* Page numbers */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  const showPage =
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1);

                  // Show ellipsis
                  const showEllipsisBefore = page === currentPage - 2 && currentPage > 3;
                  const showEllipsisAfter = page === currentPage + 2 && currentPage < totalPages - 2;

                  if (showEllipsisBefore || showEllipsisAfter) {
                    return (
                      <span key={`ellipsis-${page}`} className="px-2 text-gray-400">
                        ...
                      </span>
                    );
                  }

                  if (!showPage) return null;

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`min-w-[32px] h-8 px-2 rounded-lg text-xs font-medium transition-all ${
                        page === currentPage
                          ? 'bg-primary text-black'
                          : 'bg-surface-dark/50 text-white border border-white/10 hover:border-primary/30'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              {/* Next button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 rounded-lg text-xs font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-surface-dark/50 text-white border border-white/10 hover:border-primary/30 disabled:hover:border-white/10"
              >
                <span className="material-icons text-sm">chevron_right</span>
              </button>
            </div>
          )}

          {filteredProducts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-32">
              <div className="w-20 h-20 rounded-full bg-background-secondary flex items-center justify-center mb-6">
                <span className="material-icons text-4xl text-gray-400">search_off</span>
              </div>
              <h3 className="text-xl font-light text-primary mb-2">Aucun produit trouvé</h3>
              <p className="text-sm text-gray-400 mb-8">Essayez d&apos;ajuster vos filtres</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <MobileFilterDrawer
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        categories={categories}
        selectedCategories={selectedCategories}
        onToggleCategory={toggleCategory}
        priceRange={priceRange}
        onSetPriceRange={setPriceRange}
        showInStock={showInStock}
        showFeatured={showFeatured}
        showOnSale={showOnSale}
        onToggleInStock={() => setShowInStock(!showInStock)}
        onToggleFeatured={() => setShowFeatured(!showFeatured)}
        onToggleSale={() => setShowOnSale(!showOnSale)}
        onResetFilters={resetAllFilters}
        categoryCounts={categoryCounts}
      />

      {/* Toast notification for added to cart - Desktop only */}
      {showAddedToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="hidden md:flex fixed bottom-4 right-4 glass-card backdrop-blur-md text-white px-4 py-3 rounded-xl shadow-lg z-50 max-w-sm items-center gap-2"
        >
          <span className="material-icons text-primary text-lg">check_circle</span>
          <span>Produit ajouté au panier</span>
        </motion.div>
      )}
    </main>
  );
}
