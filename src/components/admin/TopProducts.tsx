/**
 * TopProducts Component
 * Displays most viewed and most added to cart products
 * Used in admin product analytics dashboard
 */

import { TopEvent } from "@/lib/analytics-server";

interface TopProductsProps {
  viewedProducts: TopEvent[];
  cartProducts: TopEvent[];
}

export default function TopProducts({
  viewedProducts,
  cartProducts,
}: TopProductsProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8">
      {/* Most Viewed Products */}
      <div>
        <h4 className="text-sm md:text-md font-heading font-semibold text-primary mb-3">
          Produits Les Plus Vus
        </h4>
        {viewedProducts.length === 0 ? (
          <p className="text-primary/70 text-sm">Aucune donnée disponible</p>
        ) : (
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-primary/20">
                  <th className="text-left py-2 px-3 text-sm font-semibold text-primary/70">
                    #
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-primary/70">
                    Produit
                  </th>
                  <th className="text-right py-2 px-3 text-sm font-semibold text-primary/70">
                    Vues Totales
                  </th>
                  <th className="text-right py-2 px-3 text-sm font-semibold text-primary/70">
                    Visiteurs Uniques
                  </th>
                </tr>
              </thead>
              <tbody>
                {viewedProducts.map((product, idx) => (
                  <tr
                    key={product.key}
                    className={`
                      border-b border-primary/10
                      ${idx < 3 ? "bg-accent/5" : idx % 2 === 0 ? "bg-mist" : "bg-cream"}
                    `}
                  >
                    <td className="py-2.5 px-3 text-sm">
                      <span
                        className={`
                          font-semibold
                          ${idx < 3 ? "text-accent" : "text-primary/60"}
                        `}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-sm text-primary">
                      {product.label || product.key}
                    </td>
                    <td className="py-2.5 px-3 text-sm text-right font-medium text-primary">
                      {product.count.toLocaleString("fr-FR")}
                    </td>
                    <td className="py-2.5 px-3 text-sm text-right">
                      <span className="font-semibold text-accent">
                        {product.uniqueCount?.toLocaleString("fr-FR") || "-"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Most Added to Cart */}
      <div>
        <h4 className="text-sm md:text-md font-heading font-semibold text-primary mb-3">
          Produits Les Plus Ajoutés au Panier
        </h4>
        {cartProducts.length === 0 ? (
          <p className="text-primary/70 text-sm">Aucune donnée disponible</p>
        ) : (
          <div className="overflow-x-auto -mx-2 px-2">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-primary/20">
                  <th className="text-left py-2 px-3 text-sm font-semibold text-primary/70">
                    #
                  </th>
                  <th className="text-left py-2 px-3 text-sm font-semibold text-primary/70">
                    Produit
                  </th>
                  <th className="text-right py-2 px-3 text-sm font-semibold text-primary/70">
                    Ajouts
                  </th>
                </tr>
              </thead>
              <tbody>
                {cartProducts.map((product, idx) => (
                  <tr
                    key={product.key}
                    className={`
                      border-b border-primary/10
                      ${idx < 3 ? "bg-accent/5" : idx % 2 === 0 ? "bg-mist" : "bg-cream"}
                    `}
                  >
                    <td className="py-2.5 px-3 text-sm">
                      <span
                        className={`
                          font-semibold
                          ${idx < 3 ? "text-accent" : "text-primary/60"}
                        `}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-sm text-primary">
                      {product.label || product.key}
                    </td>
                    <td className="py-2.5 px-3 text-sm text-right font-medium text-primary">
                      {product.count.toLocaleString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
