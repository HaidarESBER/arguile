"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { ProductCategory, categoryLabels } from "@/types/product";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: ProductCategory[];
  selectedCategories: ProductCategory[];
  onToggleCategory: (category: ProductCategory) => void;
  priceRange: [number, number];
  onSetPriceRange: (range: [number, number]) => void;
  showInStock: boolean;
  showFeatured: boolean;
  showOnSale: boolean;
  onToggleInStock: () => void;
  onToggleFeatured: () => void;
  onToggleSale: () => void;
  onResetFilters: () => void;
  categoryCounts: Record<ProductCategory, number>;
}

export function MobileFilterDrawer({
  isOpen,
  onClose,
  categories,
  selectedCategories,
  onToggleCategory,
  priceRange,
  onSetPriceRange,
  showInStock,
  showFeatured,
  showOnSale,
  onToggleInStock,
  onToggleFeatured,
  onToggleSale,
  onResetFilters,
  categoryCounts,
}: MobileFilterDrawerProps) {
  const [localPriceRange, setLocalPriceRange] = useState<[number, number]>(priceRange);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Update local price range when prop changes
  useEffect(() => {
    setLocalPriceRange(priceRange);
  }, [priceRange]);

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle swipe down to close
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    // If dragged down more than 100px, close the drawer
    if (info.offset.y > 100) {
      onClose();
    }
  };

  const handleApply = () => {
    onSetPriceRange(localPriceRange);
    onClose();
  };

  const handleReset = () => {
    onResetFilters();
    setLocalPriceRange([0, 400]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
            className="fixed bottom-0 left-0 right-0 bg-background-card rounded-t-3xl shadow-2xl z-50 max-h-[90vh] flex flex-col"
          >
            {/* Drag Handle */}
            <div className="w-full flex justify-center pt-3 pb-2">
              <div className="w-12 h-1 bg-white/30 rounded-full" />
            </div>

            {/* Sticky Header */}
            <div className="sticky top-0 bg-background-card border-b border-white/10 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-semibold text-white">Filtres</h2>
              <button
                onClick={onClose}
                className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors text-white"
                aria-label="Fermer les filtres"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 pb-safe">
              {/* Categories */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">
                  Catégories
                </h3>
                <div className="flex flex-col gap-3">
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => onToggleCategory(category)}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all min-h-[44px] ${
                        selectedCategories.includes(category)
                          ? "bg-primary/20 border-primary text-white"
                          : "bg-background-secondary border-white/10 text-text-muted hover:border-white/20"
                      }`}
                    >
                      <span className="text-sm font-medium">
                        {categoryLabels[category]}
                      </span>
                      <span className="text-xs bg-white/10 px-2 py-1 rounded-full">
                        {categoryCounts[category] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">
                  Prix
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-text-muted mb-1 block">Min</label>
                      <input
                        type="number"
                        value={localPriceRange[0]}
                        onChange={(e) => setLocalPriceRange([Number(e.target.value), localPriceRange[1]])}
                        className="w-full bg-background-secondary border border-white/10 rounded-lg px-3 py-3 text-white text-sm focus:border-primary focus:outline-none min-h-[44px]"
                        min={0}
                        max={localPriceRange[1]}
                      />
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-text-muted mb-1 block">Max</label>
                      <input
                        type="number"
                        value={localPriceRange[1]}
                        onChange={(e) => setLocalPriceRange([localPriceRange[0], Number(e.target.value)])}
                        className="w-full bg-background-secondary border border-white/10 rounded-lg px-3 py-3 text-white text-sm focus:border-primary focus:outline-none min-h-[44px]"
                        min={localPriceRange[0]}
                        max={1000}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-muted">
                    <span>{localPriceRange[0]}€</span>
                    <div className="flex-1 h-1 bg-white/10 rounded-full relative">
                      <div
                        className="absolute h-full bg-primary rounded-full"
                        style={{
                          left: `${(localPriceRange[0] / 400) * 100}%`,
                          right: `${100 - (localPriceRange[1] / 400) * 100}%`,
                        }}
                      />
                    </div>
                    <span>{localPriceRange[1]}€</span>
                  </div>
                </div>
              </div>

              {/* Additional Filters */}
              <div>
                <h3 className="text-sm font-semibold text-white uppercase tracking-wide mb-4">
                  Autres filtres
                </h3>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={onToggleInStock}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all min-h-[44px] ${
                      showInStock
                        ? "bg-primary/20 border-primary text-white"
                        : "bg-background-secondary border-white/10 text-text-muted hover:border-white/20"
                    }`}
                  >
                    <span className="text-sm font-medium">En stock uniquement</span>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      showInStock ? "border-primary bg-primary" : "border-white/30"
                    }`}>
                      {showInStock && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={onToggleFeatured}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all min-h-[44px] ${
                      showFeatured
                        ? "bg-primary/20 border-primary text-white"
                        : "bg-background-secondary border-white/10 text-text-muted hover:border-white/20"
                    }`}
                  >
                    <span className="text-sm font-medium">Produits vedettes</span>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      showFeatured ? "border-primary bg-primary" : "border-white/30"
                    }`}>
                      {showFeatured && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>

                  <button
                    onClick={onToggleSale}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all min-h-[44px] ${
                      showOnSale
                        ? "bg-primary/20 border-primary text-white"
                        : "bg-background-secondary border-white/10 text-text-muted hover:border-white/20"
                    }`}
                  >
                    <span className="text-sm font-medium">En promotion</span>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      showOnSale ? "border-primary bg-primary" : "border-white/30"
                    }`}>
                      {showOnSale && (
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-background-card border-t border-white/10 px-6 py-4 pb-safe">
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 bg-background-secondary border border-white/20 text-white rounded-full font-medium transition-all hover:border-white/40 min-h-[44px] text-sm"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={handleApply}
                  className="flex-1 bg-primary text-background-dark rounded-full font-medium transition-all hover:bg-primary-light min-h-[44px] text-sm"
                >
                  Appliquer
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
