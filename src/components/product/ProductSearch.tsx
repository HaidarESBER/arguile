"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";

interface ProductSearchProps {
  defaultValue?: string;
}

/**
 * ProductSearch component with debounced URL-based state
 *
 * Features:
 * - 300ms debounced search (prevents excessive queries)
 * - URL state management (bookmarkable, SEO-friendly)
 * - Resets pagination to page 1 on new search
 * - Uncontrolled input with defaultValue (Next.js best practice)
 * - Clear button when query exists
 *
 * Pattern from Next.js official documentation
 */
export function ProductSearch({ defaultValue }: ProductSearchProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', '1'); // Reset pagination

    if (term) {
      params.set('q', term);
    } else {
      params.delete('q');
    }

    replace(`${pathname}?${params.toString()}`);
  }, 300); // 300ms debounce - industry standard

  const handleClear = () => {
    const params = new URLSearchParams(searchParams);
    params.delete('q');
    params.set('page', '1');
    replace(`${pathname}?${params.toString()}`);
  };

  const hasQuery = defaultValue && defaultValue.length > 0;

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Icon */}
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <svg
          className="w-5 h-5 text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Search Input */}
      <input
        type="search"
        placeholder="Rechercher des produits..."
        onChange={(e) => handleSearch(e.target.value)}
        defaultValue={defaultValue}
        className="w-full pl-12 pr-12 py-3 bg-background-card border border-primary/20 rounded-[--radius-button] text-primary placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all"
      />

      {/* Clear Button */}
      {hasQuery && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-muted hover:text-primary transition-colors"
          aria-label="Effacer la recherche"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
