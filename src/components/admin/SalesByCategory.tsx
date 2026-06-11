"use client";

import { CategoryRevenue } from '@/lib/analytics-server';
import { categoryLabels } from '@/types/product';

interface SalesByCategoryProps {
  data: CategoryRevenue[];
}

export default function SalesByCategory({ data }: SalesByCategoryProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-background border border-background-secondary rounded-lg p-8 text-center">
        <p className="text-primary-light">Aucune donnée disponible</p>
      </div>
    );
  }

  // Calculate total revenue for percentages
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);

  return (
    <div className="bg-background border border-background-secondary rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-background-secondary bg-muted">
            <th className="text-left px-6 py-4 text-sm font-medium text-primary">Catégorie</th>
            <th className="text-right px-6 py-4 text-sm font-medium text-primary">Revenu</th>
            <th className="text-right px-6 py-4 text-sm font-medium text-primary">% du Total</th>
            <th className="text-right px-6 py-4 text-sm font-medium text-primary">Commandes</th>
            <th className="text-right px-6 py-4 text-sm font-medium text-primary">Panier Moyen</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const percentage = totalRevenue > 0 ? (item.revenue / totalRevenue) * 100 : 0;
            const isTopCategory = index === 0;

            return (
              <tr
                key={item.category}
                className={`border-b border-background-secondary ${
                  index % 2 === 0 ? 'bg-mist' : 'bg-cream'
                } ${isTopCategory ? 'border-l-4 border-l-accent' : ''}`}
              >
                <td className={`px-6 py-4 ${isTopCategory ? 'font-semibold text-accent' : 'text-primary'}`}>
                  {categoryLabels[item.category as keyof typeof categoryLabels] || item.category}
                </td>
                <td className="px-6 py-4 text-right text-primary font-medium">
                  {(item.revenue / 100).toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </td>
                <td className="px-6 py-4 text-right text-primary-light">
                  {percentage.toFixed(1)}%
                </td>
                <td className="px-6 py-4 text-right text-primary">
                  {item.orderCount.toLocaleString('fr-FR')}
                </td>
                <td className="px-6 py-4 text-right text-primary">
                  {(item.avgOrderValue / 100).toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
