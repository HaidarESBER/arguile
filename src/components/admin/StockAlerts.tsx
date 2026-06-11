"use client";

import { StockAlert } from "@/lib/analytics-server";
import { categoryLabels } from "@/types/product";

interface StockAlertsProps {
  data: StockAlert[];
}

export default function StockAlerts({ data }: StockAlertsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-stone-500">
        Aucune alerte de stock
      </div>
    );
  }

  // Get urgency badge color
  const getUrgencyColor = (urgency: StockAlert["urgency"]) => {
    switch (urgency) {
      case "critical":
        return "bg-red-100 text-red-800 border border-red-300";
      case "urgent":
        return "bg-orange-100 text-orange-800 border border-orange-300";
      case "limited":
        return "bg-yellow-100 text-yellow-800 border border-yellow-300";
    }
  };

  const getUrgencyLabel = (urgency: StockAlert["urgency"]) => {
    switch (urgency) {
      case "critical":
        return "Critique";
      case "urgent":
        return "Urgent";
      case "limited":
        return "Limité";
    }
  };

  return (
    <div className="space-y-4">
      {/* Summary */}
      <p className="text-sm text-stone-600">
        {data.length.toLocaleString("fr-FR")} {data.length === 1 ? "produit nécessite" : "produits nécessitent"} une attention
      </p>

      {/* Table */}
      <div className="overflow-x-auto border border-stone-200 rounded-lg">
        <table className="w-full">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">
                Produit
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-stone-600 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-stone-600 uppercase tracking-wider">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-stone-200">
            {data.map((alert, index) => (
              <tr
                key={alert.productId}
                className={index % 2 === 0 ? "bg-white" : "bg-stone-50"}
              >
                <td className="px-4 py-3 text-sm text-stone-900">
                  {alert.name}
                </td>
                <td className="px-4 py-3 text-sm text-stone-600">
                  {categoryLabels[alert.category as keyof typeof categoryLabels] || alert.category}
                </td>
                <td className="px-4 py-3 text-sm text-stone-900 text-right font-medium">
                  {alert.stockLevel.toLocaleString("fr-FR")}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getUrgencyColor(
                      alert.urgency
                    )}`}
                  >
                    {getUrgencyLabel(alert.urgency)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
