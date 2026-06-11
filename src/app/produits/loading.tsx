import { Container } from "@/components/ui";

/**
 * Skeleton loading state for the products listing page.
 * Matches the dark taupe theme and the product grid layout.
 */
export default function ProduitsLoading() {
  return (
    <main className="py-12 lg:py-16" aria-busy="true" aria-label="Chargement des produits">
      <Container size="lg">
        {/* Header skeleton */}
        <div className="mb-10 space-y-3">
          <div className="h-9 w-64 bg-background-secondary rounded-lg animate-pulse" />
          <div className="h-5 w-96 max-w-full bg-background-secondary/70 rounded-lg animate-pulse" />
        </div>

        {/* Filters skeleton */}
        <div className="flex gap-3 mb-8 overflow-hidden">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="h-10 w-28 flex-shrink-0 bg-background-secondary rounded-full animate-pulse"
            />
          ))}
        </div>

        {/* Product grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-background-card rounded-[--radius-card] overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-background-secondary" />
              <div className="p-4 space-y-3">
                <div className="h-5 w-3/4 bg-background-secondary rounded" />
                <div className="h-4 w-1/2 bg-background-secondary/70 rounded" />
                <div className="h-6 w-1/3 bg-background-secondary rounded" />
              </div>
            </div>
          ))}
        </div>

        <p className="sr-only">Chargement des produits en cours…</p>
      </Container>
    </main>
  );
}
