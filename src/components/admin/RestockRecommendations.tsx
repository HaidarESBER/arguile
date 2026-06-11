"use client";

import { RestockRecommendation } from "@/lib/analytics-server";

interface RestockRecommendationsProps {
  data: RestockRecommendation[];
}

export default function RestockRecommendations({
  data,
}: RestockRecommendationsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-stone-500">
        Aucune recommandation de réapprovisionnement
      </div>
    );
  }

  // Format date in French
  const formatDate = (isoDate: string) => {
    const date = new Date(isoDate);
    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="overflow-x-auto border border-stone-200 rounded-lg">
      <table className="w-full">
        <thead className="bg-stone-50 border-b border-stone-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">
              Produit
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-stone-600 uppercase tracking-wider">
              Stock Actuel
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-stone-600 uppercase tracking-wider">
              Vélocité/Jour
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-stone-600 uppercase tracking-wider">
              Jours Restants
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-stone-600 uppercase tracking-wider">
              Quantité Recommandée
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">
              Rupture Estimée
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-stone-200">
          {data.map((rec, index) => {
            const isUrgent = rec.daysRemaining < 14;
            return (
              <tr
                key={rec.productId}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-stone-50"
                } ${isUrgent ? "bg-red-50" : ""}`}
              >
                <td className="px-4 py-3 text-sm text-stone-900">
                  {rec.name}
                </td>
                <td className="px-4 py-3 text-sm text-stone-900 text-right">
                  {rec.currentStock.toLocaleString("fr-FR")}
                </td>
                <td className="px-4 py-3 text-sm text-stone-600 text-right">
                  {rec.dailyVelocity.toLocaleString("fr-FR", {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })}
                </td>
                <td
                  className={`px-4 py-3 text-sm text-right font-medium ${
                    isUrgent ? "text-red-900" : "text-stone-900"
                  }`}
                >
                  {Math.floor(rec.daysRemaining).toLocaleString("fr-FR")}
                </td>
                <td className="px-4 py-3 text-sm text-stone-900 text-right font-semibold">
                  +{rec.recommendedRestock.toLocaleString("fr-FR")}
                </td>
                <td className="px-4 py-3 text-sm text-stone-600">
                  <div className="flex flex-col">
                    <span>{formatDate(rec.estimatedStockoutDate)}</span>
                    {isUrgent && (
                      <span className="text-xs text-red-700 mt-1">
                        Commander avant cette date
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
