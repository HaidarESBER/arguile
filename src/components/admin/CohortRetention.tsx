/**
 * CohortRetention Component
 * Phase 23-02: Cohort Analysis & Lifetime Value Tracking
 *
 * Purpose: Display cohort retention matrix with heatmap visualization
 */

import { Cohort } from '@/lib/customer-analytics';

interface CohortRetentionProps {
  cohorts: Cohort[];
}

export default function CohortRetention({ cohorts }: CohortRetentionProps) {
  if (!cohorts || cohorts.length === 0) {
    return (
      <div className="text-center py-12 text-primary-light">
        Pas encore de données de cohorte
      </div>
    );
  }

  // Determine max month offset to display (up to 6 months)
  const maxOffset = 6;
  const monthOffsets = Array.from({ length: maxOffset + 1 }, (_, i) => i);

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="text-left p-3 text-sm font-semibold text-primary border-b border-background-secondary">
              Cohorte
            </th>
            <th className="text-center p-3 text-sm font-semibold text-primary border-b border-background-secondary">
              Clients
            </th>
            {monthOffsets.map((offset) => (
              <th
                key={offset}
                className="text-center p-3 text-sm font-semibold text-primary border-b border-background-secondary"
              >
                Mois {offset}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {cohorts.map((cohort) => (
            <tr key={cohort.cohortMonth} className="hover:bg-background-secondary/50 transition-colors">
              <td className="p-3 text-sm font-medium text-primary border-b border-background-secondary/50">
                {cohort.cohortLabel}
              </td>
              <td className="p-3 text-sm text-center text-primary-light border-b border-background-secondary/50">
                {cohort.customerCount.toLocaleString('fr-FR')}
              </td>
              {monthOffsets.map((offset) => {
                const retention = cohort.retention[offset];
                // Calculate color intensity (20% to 100% opacity)
                const opacity = retention !== undefined ? 0.2 + (retention / 100) * 0.8 : 0.2;
                const bgColor = `rgba(var(--color-accent-rgb, 228, 195, 191), ${opacity})`;

                return (
                  <td
                    key={offset}
                    className="p-3 text-sm text-center border-b border-background-secondary/50"
                    style={{ backgroundColor: bgColor }}
                  >
                    {retention !== undefined ? (
                      <span className="font-medium text-primary">
                        {retention}%
                      </span>
                    ) : (
                      <span className="text-primary-light">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 text-xs text-primary-light">
        <span>Rétention:</span>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-4 border border-background-secondary"
            style={{ backgroundColor: 'rgba(var(--color-accent-rgb, 228, 195, 191), 0.2)' }}
          />
          <span>0%</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-4 border border-background-secondary"
            style={{ backgroundColor: 'rgba(var(--color-accent-rgb, 228, 195, 191), 0.6)' }}
          />
          <span>50%</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-4 border border-background-secondary"
            style={{ backgroundColor: 'rgba(var(--color-accent-rgb, 228, 195, 191), 1)' }}
          />
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
