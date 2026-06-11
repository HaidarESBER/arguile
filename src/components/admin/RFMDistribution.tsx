/**
 * RFMDistribution Component
 * Displays customer count distribution across RFM segments
 * Phase 23-01: Customer Segmentation & RFM Analysis
 */

import { CustomerSegmentStats } from '@/lib/customer-analytics';

interface RFMDistributionProps {
  stats: CustomerSegmentStats[];
}

/**
 * Get color class for segment badge/bar
 */
function getSegmentColor(segment: string): string {
  switch (segment) {
    case 'VIP':
      return 'bg-accent'; // Blush
    case 'Champions':
      return 'bg-green-500';
    case 'Fidèles':
      return 'bg-blue-500';
    case 'À Risque':
      return 'bg-orange-500';
    case 'Inactifs':
      return 'bg-stone-400';
    default:
      return 'bg-mist';
  }
}

export default function RFMDistribution({ stats }: RFMDistributionProps) {
  if (!stats || stats.length === 0) {
    return (
      <div className="p-8 text-center text-primary/50 border border-border rounded-lg">
        Aucun client trouvé
      </div>
    );
  }

  const totalCustomers = stats.reduce((sum, s) => sum + s.count, 0);

  return (
    <div className="space-y-4">
      {/* Total customers header */}
      <div className="text-center mb-6">
        <p className="text-sm text-primary/70">Total Clients</p>
        <p className="text-3xl font-heading font-bold text-primary">
          {totalCustomers.toLocaleString('fr-FR')}
        </p>
      </div>

      {/* Horizontal bar chart */}
      <div className="space-y-3">
        {stats.map((stat) => {
          const widthPercent = totalCustomers > 0 ? (stat.count / totalCustomers) * 100 : 0;

          return (
            <div key={stat.segment} className="space-y-1">
              {/* Segment label and count */}
              <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-primary">{stat.segment}</span>
                <span className="text-primary/70">
                  {stat.count} ({stat.percentage.toFixed(1)}%)
                </span>
              </div>

              {/* Bar */}
              <div className="w-full bg-mist rounded-full h-8 overflow-hidden">
                <div
                  className={`h-full ${getSegmentColor(stat.segment)} transition-all flex items-center justify-end px-3`}
                  style={{ width: `${widthPercent}%` }}
                >
                  {widthPercent > 15 && (
                    <span className="text-white text-xs font-semibold">
                      {stat.percentage.toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Caption */}
      <p className="mt-4 text-sm text-center text-primary/70">
        Distribution des clients par segment RFM
      </p>
    </div>
  );
}
