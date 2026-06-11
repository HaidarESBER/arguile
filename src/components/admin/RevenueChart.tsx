/**
 * RevenueChart component
 * Displays daily revenue over time using pure HTML/CSS bar chart
 * No external charting library - keeps it simple and lightweight
 */

import { DailyMetrics } from '@/lib/analytics-server';

interface RevenueChartProps {
  data: DailyMetrics[];
}

/**
 * Format cents to EUR with space thousand separator
 * Example: 123456 -> "1 234€"
 */
function formatCurrency(cents: number): string {
  const euros = cents / 100;
  return euros.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
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

export default function RevenueChart({ data }: RevenueChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-primary/50 border border-border rounded-lg">
        Aucune donnée disponible
      </div>
    );
  }

  // Calculate max revenue for scaling bars
  const maxRevenue = Math.max(...data.map(d => d.total_revenue), 1); // Min 1 to avoid division by zero

  return (
    <div className="revenue-chart">
      {/* Chart container */}
      <div className="flex gap-4">
        {/* Y-axis labels */}
        <div className="flex flex-col justify-between py-2 text-sm text-primary/60 w-20 text-right">
          <div>{formatCurrency(maxRevenue)}</div>
          <div>{formatCurrency(Math.round(maxRevenue / 2))}</div>
          <div>0€</div>
        </div>

        {/* Bars container */}
        <div className="flex-1 border border-border rounded-lg p-4 bg-cream/30 overflow-x-auto">
          <div className="flex items-end gap-1 min-w-max" style={{ height: '300px' }}>
            {data.map((day, index) => {
              const heightPercent = maxRevenue > 0 ? (day.total_revenue / maxRevenue) * 100 : 0;
              const isPositive = day.total_revenue > 0;

              return (
                <div
                  key={day.date}
                  className="flex flex-col items-center gap-2 flex-1 min-w-[20px]"
                  style={{ height: '100%' }}
                >
                  {/* Bar */}
                  <div className="flex-1 flex items-end w-full">
                    <div
                      className={`w-full rounded-t transition-all hover:opacity-80 ${
                        isPositive ? 'bg-blush' : 'bg-mist'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                      title={`${formatDate(day.date)}: ${formatCurrency(day.total_revenue)}`}
                    />
                  </div>

                  {/* Date label (show every 5th to avoid crowding) */}
                  {index % 5 === 0 && (
                    <div className="text-xs text-primary/60 whitespace-nowrap transform -rotate-45 origin-top-left mt-4">
                      {formatDate(day.date)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="mt-4 text-sm text-center text-primary/70">
        Chiffre d&apos;affaires journalier (30 derniers jours)
      </p>
    </div>
  );
}
