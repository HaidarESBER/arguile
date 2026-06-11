"use client";

import { AOVTrend } from '@/lib/analytics-server';

interface AOVChartProps {
  data: AOVTrend[];
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });
}

export default function AOVChart({ data }: AOVChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-background border border-background-secondary rounded-lg p-8 text-center">
        <p className="text-primary-light">Aucune donnée disponible</p>
      </div>
    );
  }

  // Calculate metrics
  const avgAOV = data.reduce((sum, d) => sum + d.avgOrderValue, 0) / data.length;
  const minAOV = Math.min(...data.map(d => d.avgOrderValue));
  const maxAOV = Math.max(...data.map(d => d.avgOrderValue));

  // Scaling for chart
  const yMin = Math.floor(minAOV * 0.9); // 10% below min for padding
  const yMax = Math.ceil(maxAOV * 1.1); // 10% above max for padding
  const yRange = yMax - yMin;

  return (
    <div className="space-y-6">
      {/* Summary metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-mist border border-background-secondary rounded-lg p-4">
          <p className="text-sm text-primary-light mb-1">Panier Moyen</p>
          <p className="text-2xl font-semibold text-primary">{formatCurrency(avgAOV)}</p>
        </div>
        <div className="bg-mist border border-background-secondary rounded-lg p-4">
          <p className="text-sm text-primary-light mb-1">Minimum</p>
          <p className="text-2xl font-semibold text-primary">{formatCurrency(minAOV)}</p>
        </div>
        <div className="bg-mist border border-background-secondary rounded-lg p-4">
          <p className="text-sm text-primary-light mb-1">Maximum</p>
          <p className="text-2xl font-semibold text-primary">{formatCurrency(maxAOV)}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-cream/30 border border-background-secondary rounded-lg p-6">
        <h4 className="text-sm font-medium text-primary-light mb-4">
          Évolution du Panier Moyen (30 derniers jours)
        </h4>

        <div className="relative" style={{ height: '240px' }}>
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 w-20 flex flex-col justify-between text-right pr-3 text-sm text-primary-light">
            <span>{formatCurrency(yMax)}</span>
            <span>{formatCurrency(yMin + yRange * 0.67)}</span>
            <span>{formatCurrency(yMin + yRange * 0.33)}</span>
            <span>{formatCurrency(yMin)}</span>
          </div>

          {/* SVG chart */}
          <div className="ml-24">
            <svg className="w-full" style={{ height: '240px' }} viewBox="0 0 1000 240" preserveAspectRatio="none">
              {/* Grid lines */}
              <line x1="0" y1="0" x2="1000" y2="0" stroke="currentColor" strokeWidth="1" className="text-border opacity-30" />
              <line x1="0" y1="80" x2="1000" y2="80" stroke="currentColor" strokeWidth="1" className="text-border opacity-20" strokeDasharray="4" />
              <line x1="0" y1="160" x2="1000" y2="160" stroke="currentColor" strokeWidth="1" className="text-border opacity-20" strokeDasharray="4" />
              <line x1="0" y1="240" x2="1000" y2="240" stroke="currentColor" strokeWidth="1" className="text-border opacity-30" />

              {/* Line path */}
              {data.length > 1 && (
                <>
                  {/* Area fill */}
                  <polygon
                    points={[
                      '0,240',
                      ...data.map((d, i) => {
                        const x = (i / (data.length - 1)) * 1000;
                        const normalizedValue = yRange === 0 ? 0.5 : (d.avgOrderValue - yMin) / yRange;
                        const y = 240 - (normalizedValue * 220); // Leave 20px padding
                        return `${x},${y}`;
                      }),
                      '1000,240',
                    ].join(' ')}
                    fill="currentColor"
                    className="text-accent opacity-10"
                  />

                  {/* Line */}
                  <polyline
                    points={data
                      .map((d, i) => {
                        const x = (i / (data.length - 1)) * 1000;
                        const normalizedValue = yRange === 0 ? 0.5 : (d.avgOrderValue - yMin) / yRange;
                        const y = 240 - (normalizedValue * 220);
                        return `${x},${y}`;
                      })
                      .join(' ')}
                    stroke="currentColor"
                    strokeWidth="3"
                    fill="none"
                    className="text-accent"
                  />
                </>
              )}

              {/* Data points */}
              {data.map((d, i) => {
                const x = data.length === 1 ? 500 : (i / (data.length - 1)) * 1000; // Center single point
                const normalizedValue = yRange === 0 ? 0.5 : (d.avgOrderValue - yMin) / yRange; // Handle zero range
                const y = 240 - (normalizedValue * 220);
                return (
                  <circle
                    key={d.date}
                    cx={x}
                    cy={y}
                    r="5"
                    fill="currentColor"
                    className="text-charcoal"
                  >
                    <title>
                      {formatDate(d.date)}: {formatCurrency(d.avgOrderValue)} ({d.orderCount} commandes)
                    </title>
                  </circle>
                );
              })}
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
