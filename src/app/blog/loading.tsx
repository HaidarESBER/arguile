/**
 * Skeleton loading state for the blog pages.
 * Matches the dark taupe theme and the editorial layout.
 */
export default function BlogLoading() {
  return (
    <div aria-busy="true" aria-label="Chargement du blog">
      {/* Hero skeleton */}
      <section className="bg-primary py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="h-4 w-24 bg-background/20 rounded animate-pulse" />
          <div className="h-12 w-72 max-w-full bg-background/20 rounded-lg animate-pulse" />
          <div className="h-6 w-96 max-w-full bg-background/10 rounded-lg animate-pulse" />
        </div>
      </section>

      {/* Articles skeleton */}
      <section className="py-12 md:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-background-card rounded-lg border border-background-secondary/50 overflow-hidden animate-pulse"
              >
                <div className="h-1 bg-background-secondary" />
                <div className="p-6 md:p-8 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-3 w-20 bg-background-secondary rounded" />
                    <div className="h-3 w-16 bg-background-secondary/70 rounded" />
                  </div>
                  <div className="h-6 w-5/6 bg-background-secondary rounded" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-background-secondary/70 rounded" />
                    <div className="h-4 w-4/5 bg-background-secondary/70 rounded" />
                  </div>
                  <div className="h-3 w-28 bg-background-secondary/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <p className="sr-only">Chargement des articles en cours…</p>
    </div>
  );
}
