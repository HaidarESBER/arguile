/**
 * OrderTrends component
 * Shows order volume and average order value metrics with summary cards and trend visualization
 */

import { DailyMetrics } from '@/lib/analytics-server';

interface OrderTrendsProps {
  data: DailyMetrics[];
}

/**
 * Format cents to EUR
 */
function formatCurrency(cents: number): string {
  const euros = cents / 100;
  return euros.toLocaleString('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + '€';
}

/**
 * Format date string to "12 fév" format
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc'];
  return `${date.getDate()} ${months[date.getMonth()]}`;
}

/**
 * StatCard component for displaying metrics
 */
function StatCard({
  title,
  value,
  description
}: {
  title: string;
  value: string | number;
  description: string
}) {
  return (
    <div className="border border-border rounded-lg p-6 bg-cream/30">
      <h4 className="text-sm font-medium text-primary/60 mb-2">{title}</h4>
      <div className="text-3xl font-heading font-semibold text-primary mb-1">
        {value}
      </div>
      <p className="text-sm text-primary/50">{description}</p>
    </div>
  );
}

export default function OrderTrends({ data }: OrderTrendsProps) {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-primary/50 border border-border rounded-lg">
        Aucune donnée disponible
      </div>
    );
  }

  // Calculate summary metrics
  const totalOrders = data.reduce((sum, d) => sum + d.purchases, 0);
  const avgPerDay = (totalOrders / data.length).toFixed(1);
  const totalRevenue = data.reduce((sum, d) => sum + d.total_revenue, 0);
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // Calculate max orders for scaling trend chart
  const maxOrders = Math.max(...data.map(d => d.purchases), 1);

  return (
    <div className="space-y-6">
      {/* Summary cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total Commandes"
          value={totalOrders}
          description="30 derniers jours"
        />
        <StatCard
          title="Moyenne Quotidienne"
          value={avgPerDay}
          description="commandes/jour"
        />
        <StatCard
          title="Panier Moyen"
          value={formatCurrency(avgOrderValue)}
          description="par commande"
        />
      </div>

      {/* Trend chart */}
      <div className="border border-border rounded-lg p-6 bg-cream/30">
        <h4 className="text-sm font-medium text-primary/60 mb-4">
          Évolution Quotidienne des Commandes
        </h4>

        <div className="relative" style={{ height: '200px' }}>
          {/* SVG line chart */}
          <svg className="w-full h-full" viewBox="0 0 1000 200" preserveAspectRatio="none">
            {/* Grid lines */}
            <line x1="0" y1="0" x2="1000" y2="0" stroke="currentColor" strokeWidth="1" className="text-border" />
            <line x1="0" y1="100" x2="1000" y2="100" stroke="currentColor" strokeWidth="1" className="text-border opacity-50" strokeDasharray="4" />
            <line x1="0" y1="200" x2="1000" y2="200" stroke="currentColor" strokeWidth="1" className="text-border" />

            {/* Line path */}
            {data.length > 1 && (
              <polyline
                points={data
                  .map((d, i) => {
                    const x = (i / (data.length - 1)) * 1000;
                    const y = 200 - ((d.purchases / maxOrders) * 180);
                    return `${x},${y}`;
                  })
                  .join(' ')}
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-charcoal"
              />
            )}

            {/* Dots */}
            {data.map((d, i) => {
              const x = (i / (data.length - 1)) * 1000;
              const y = 200 - ((d.purchases / maxOrders) * 180);
              return (
                <circle
                  key={d.date}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="currentColor"
                  className="text-blush"
                >
                  <title>{formatDate(d.date)}: {d.purchases} commandes</title>
                </circle>
              );
            })}
          </svg>
        </div>

        {/* Y-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-primary/60">
          <span>{formatDate(data[0].date)}</span>
          <span>{formatDate(data[data.length - 1].date)}</span>
        </div>
      </div>
    </div>
  );
}
