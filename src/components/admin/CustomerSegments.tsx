/**
 * CustomerSegments Component
 * Displays segment statistics in a table format
 * Phase 23-01: Customer Segmentation & RFM Analysis
 */

import { CustomerSegmentStats } from '@/lib/customer-analytics';

interface CustomerSegmentsProps {
  stats: CustomerSegmentStats[];
}

/**
 * Format cents to EUR with space thousand separator
 */
function formatCurrency(cents: number): string {
  const euros = cents / 100;
  return euros.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }) + '€';
}

/**
 * Get highlight class for VIP and Champions rows
 */
function getRowHighlight(segment: string): string {
  if (segment === 'VIP') {
    return 'bg-accent/10 font-semibold';
  }
  if (segment === 'Champions') {
    return 'bg-green-500/5 font-medium';
  }
  return '';
}

export default function CustomerSegments({ stats }: CustomerSegmentsProps) {
  if (!stats || stats.length === 0) {
    return (
      <div className="p-8 text-center text-primary/50 border border-border rounded-lg">
        Aucune donnée disponible
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-primary/20">
              <th className="text-left py-2 px-3 text-sm font-semibold text-primary/70">
                Segment
              </th>
              <th className="text-right py-2 px-3 text-sm font-semibold text-primary/70">
                Clients
              </th>
              <th className="text-right py-2 px-3 text-sm font-semibold text-primary/70">
                Revenu Total
              </th>
              <th className="text-right py-2 px-3 text-sm font-semibold text-primary/70">
                Panier Moyen
              </th>
            </tr>
          </thead>
          <tbody>
            {stats.map((stat, idx) => (
              <tr
                key={stat.segment}
                className={`
                  border-b border-primary/10
                  ${getRowHighlight(stat.segment)}
                  ${!getRowHighlight(stat.segment) && (idx % 2 === 0 ? 'bg-mist' : 'bg-cream')}
                `}
              >
                <td className="py-2.5 px-3 text-sm text-primary">
                  {stat.segment}
                </td>
                <td className="py-2.5 px-3 text-sm text-right text-primary">
                  {stat.count.toLocaleString('fr-FR')}
                  <span className="text-primary/50 ml-1">
                    ({stat.percentage.toFixed(1)}%)
                  </span>
                </td>
                <td className="py-2.5 px-3 text-sm text-right font-medium text-primary">
                  {formatCurrency(stat.totalRevenue)}
                </td>
                <td className="py-2.5 px-3 text-sm text-right text-primary">
                  {formatCurrency(stat.avgOrderValue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
