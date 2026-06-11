"use client";

import { InventoryVelocity } from "@/lib/analytics-server";

interface InventoryVelocityProps {
  data: InventoryVelocity[];
}

export default function InventoryVelocityTable({ data }: InventoryVelocityProps) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-stone-500">
        Aucune donnée de vélocité disponible
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-stone-200 rounded-lg">
      <table className="w-full">
        <thead className="bg-stone-50 border-b border-stone-200">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-stone-600 uppercase tracking-wider">
              Produit
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-stone-600 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-stone-600 uppercase tracking-wider">
              Unités Vendues (30j)
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-stone-600 uppercase tracking-wider">
              Vélocité Quotidienne
            </th>
            <th className="px-4 py-3 text-right text-xs font-medium text-stone-600 uppercase tracking-wider">
              Jours Restants
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-stone-200">
          {data.map((item, index) => {
            const isLowStock = item.daysRemaining < 30;
            return (
              <tr
                key={item.productId}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-stone-50"
                } ${isLowStock ? "bg-amber-50" : ""}`}
              >
                <td className="px-4 py-3 text-sm text-stone-900">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-sm text-stone-900 text-right font-medium">
                  {item.stockLevel.toLocaleString("fr-FR")}
                </td>
                <td className="px-4 py-3 text-sm text-stone-600 text-right">
                  {item.unitsSold.toLocaleString("fr-FR")}
                </td>
                <td className="px-4 py-3 text-sm text-stone-600 text-right">
                  {item.dailyVelocity > 0
                    ? item.dailyVelocity.toLocaleString("fr-FR", {
                        minimumFractionDigits: 1,
                        maximumFractionDigits: 1,
                      })
                    : "N/A"}
                </td>
                <td
                  className={`px-4 py-3 text-sm text-right font-medium ${
                    isLowStock ? "text-amber-900" : "text-stone-900"
                  }`}
                >
                  {Math.floor(item.daysRemaining).toLocaleString("fr-FR")}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
