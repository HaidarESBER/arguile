/**
 * SearchAnalytics Component
 * Displays top search queries and insights
 * Used in admin product analytics dashboard
 */

import { TopEvent } from "@/lib/analytics-server";

interface SearchAnalyticsProps {
  topSearches: TopEvent[];
}

export default function SearchAnalytics({
  topSearches,
}: SearchAnalyticsProps) {
  // Count queries with 0 results for insight
  const zeroResultCount = topSearches.filter(
    (search) => search.label === "0"
  ).length;

  return (
    <div>
      <h4 className="text-md font-heading font-semibold text-primary mb-3">
        Recherches Les Plus Fréquentes
      </h4>

      {topSearches.length === 0 ? (
        <p className="text-primary/70">Aucune donnée disponible</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-primary/20">
                  <th className="text-left py-2 px-3 text-sm font-semibold text-primary/70">
                    #
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-primary/70">
                    Requête
                  </th>
                  <th className="text-right py-2 px-3 text-sm font-semibold text-primary/70">
                    Recherches
                  </th>
                  <th className="text-right py-2 px-3 text-sm font-semibold text-primary/70">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody>
                {topSearches.map((search, idx) => {
                  const hasZeroResults = search.label === "0";

                  return (
                    <tr
                      key={search.key}
                      className={`
                        border-b border-primary/10
                        ${idx % 2 === 0 ? "bg-mist" : "bg-cream"}
                        ${hasZeroResults ? "bg-accent/5" : ""}
                      `}
                    >
                      <td className="py-2.5 px-3 text-sm">
                        <span className="font-semibold text-primary/60">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-sm font-mono text-primary">
                        {search.key}
                      </td>
                      <td className="py-2.5 px-3 text-sm text-right font-medium text-primary">
                        {search.count.toLocaleString("fr-FR")}
                      </td>
                      <td className="py-2.5 px-3 text-sm text-right">
                        {hasZeroResults && (
                          <span className="inline-block text-xs bg-accent text-primary px-2 py-1 rounded">
                            0 résultats
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Summary insight */}
          <div className="mt-4 p-4 bg-accent/10 rounded-md border border-accent/20">
            <p className="text-sm text-primary/80">
              <span className="font-semibold">💡 Astuce:</span> Les recherches
              avec 0 résultats indiquent des opportunités d&apos;ajout de
              produits.
              {zeroResultCount > 0 && (
                <span className="ml-2 text-accent font-medium">
                  ({zeroResultCount} {zeroResultCount === 1 ? "trouvée" : "trouvées"})
                </span>
              )}
            </p>
          </div>
        </>
      )}
    </div>
  );
}
