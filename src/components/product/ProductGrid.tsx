"use client";

import { Product } from "@/types/product";
import { ProductCard } from "./ProductCard";
import { useSearchParams, usePathname, useRouter } from "next/navigation";

interface ProductGridProps {
  products: Product[];
  /** Total number of products (before pagination) */
  total: number;
  /** Current page number (1-indexed) */
  currentPage: number;
  /** Number of columns on desktop (default: 3) */
  columns?: 2 | 3 | 4;
  /** Product ratings map */
  ratingsMap?: Record<string, { averageRating: number; totalReviews: number }>;
}

const PRODUCTS_PER_PAGE = 24;

/**
 * ProductGrid component arranges ProductCards in a responsive grid with pagination
 *
 * Responsive behavior:
 * - Mobile: 1 column
 * - Tablet (sm): 2 columns
 * - Desktop (lg+): columns prop (2, 3, or 4)
 *
 * @example
 * <ProductGrid products={products} total={100} currentPage={1} columns={3} />
 */
export function ProductGrid({ products, total, currentPage, columns = 3, ratingsMap = {} }: ProductGridProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const columnClasses: Record<2 | 3 | 4, string> = {
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
  };

  const totalPages = Math.ceil(total / PRODUCTS_PER_PAGE);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', String(newPage));
    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-8">
      {/* Results summary */}
      <div className="text-sm text-muted">
        Affichage de {products.length > 0 ? (currentPage - 1) * PRODUCTS_PER_PAGE + 1 : 0}-
        {Math.min(currentPage * PRODUCTS_PER_PAGE, total)} sur {total} produits
      </div>

      {/* Product grid */}
      {products.length > 0 ? (
        <div
          className={`grid grid-cols-1 sm:grid-cols-2 ${columnClasses[columns]} gap-6 lg:gap-8`}
        >
          {products.map((product, index) => (
            <ProductCard
              key={product.id}
              product={product}
              // Priority load first 3 images for above-the-fold content
              priority={index < 3}
              ratingStats={ratingsMap[product.id]}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted">Aucun produit trouvé</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 pt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-sm font-medium text-primary hover:text-accent disabled:text-muted disabled:cursor-not-allowed transition-colors"
          >
            Précédent
          </button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }).map((_, i) => {
              const pageNum = i + 1;
              // Show first, last, current, and adjacent pages
              const showPage =
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1);

              if (!showPage) {
                // Show ellipsis
                if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                  return (
                    <span key={pageNum} className="px-2 text-muted">
                      ...
                    </span>
                  );
                }
                return null;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-3 py-2 text-sm font-medium rounded transition-colors ${
                    pageNum === currentPage
                      ? "bg-accent text-white"
                      : "text-primary hover:bg-background-secondary"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 text-sm font-medium text-primary hover:text-accent disabled:text-muted disabled:cursor-not-allowed transition-colors"
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
