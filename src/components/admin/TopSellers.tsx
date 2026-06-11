"use client";

import { TopSellingProduct } from '@/lib/analytics-server';
import { categoryLabels } from '@/types/product';

interface TopSellersProps {
  data: TopSellingProduct[];
}

export default function TopSellers({ data }: TopSellersProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-background border border-background-secondary rounded-lg p-8 text-center">
        <p className="text-primary-light">Aucune donnée disponible</p>
      </div>
    );
  }

  return (
    <div className="bg-background border border-background-secondary rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b border-background-secondary bg-muted">
            <th className="text-left px-6 py-4 text-sm font-medium text-primary">Rang</th>
            <th className="text-left px-6 py-4 text-sm font-medium text-primary">Produit</th>
            <th className="text-left px-6 py-4 text-sm font-medium text-primary">Catégorie</th>
            <th className="text-right px-6 py-4 text-sm font-medium text-primary">Revenu</th>
            <th className="text-right px-6 py-4 text-sm font-medium text-primary">Unités Vendues</th>
            <th className="text-right px-6 py-4 text-sm font-medium text-primary">Prix Moyen</th>
          </tr>
        </thead>
        <tbody>
          {data.map((product, index) => {
            const rank = index + 1;
            const isTopThree = rank <= 3;

            return (
              <tr
                key={product.productId}
                className={`border-b border-background-secondary ${
                  index % 2 === 0 ? 'bg-mist' : 'bg-cream'
                } ${isTopThree ? 'border-l-4 border-l-accent' : ''}`}
              >
                <td className={`px-6 py-4 ${isTopThree ? 'font-bold text-accent' : 'text-primary'}`}>
                  #{rank}
                </td>
                <td className={`px-6 py-4 ${isTopThree ? 'font-semibold text-primary' : 'text-primary'}`}>
                  {product.name}
                </td>
                <td className="px-6 py-4 text-primary-light">
                  {categoryLabels[product.category as keyof typeof categoryLabels] || product.category}
                </td>
                <td className="px-6 py-4 text-right text-primary font-medium">
                  {(product.revenue / 100).toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: 'EUR',
                  })}
                </td>
                <td className="px-6 py-4 text-right text-primary">
                  {product.unitsSold.toLocaleString('fr-FR')}
                </td>
                <td className="px-6 py-4 text-right text-primary">
                  {(product.avgPrice / 100).toLocaleString('fr-FR', {
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
