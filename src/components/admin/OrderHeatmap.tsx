'use client';

import React from 'react';
import { TimePattern, PeakTimes } from '@/lib/analytics-server';

interface OrderHeatmapProps {
  data: TimePattern[];
  peakTimes: PeakTimes;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const DAYS_FR = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

export default function OrderHeatmap({ data, peakTimes }: OrderHeatmapProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-cream p-8 rounded border border-stone-200 text-center text-stone-500">
        Aucune donnée de commande disponible pour générer la carte thermique
      </div>
    );
  }

  // Find max count for scaling
  const maxCount = Math.max(...data.map(p => p.orderCount), 1);

  // Get color intensity based on count
  const getColorIntensity = (count: number): string => {
    if (count === 0) return 'bg-cream';
    const intensity = count / maxCount;
    if (intensity < 0.2) return 'bg-blush/20';
    if (intensity < 0.4) return 'bg-blush/40';
    if (intensity < 0.6) return 'bg-blush/60';
    if (intensity < 0.8) return 'bg-blush/80';
    return 'bg-blush';
  };

  // Get data for specific day/hour
  const getCountForCell = (day: number, hour: number): number => {
    const cell = data.find(p => p.dayOfWeek === day && p.hour === hour);
    return cell?.orderCount || 0;
  };

  return (
    <div className="space-y-4">
      {/* Peak Times Insight */}
      <div className="bg-mist p-4 rounded border border-stone-200">
        <p className="text-sm text-charcoal">
          <span className="font-medium">Pic:</span> {peakTimes.peakDay} à {peakTimes.peakHour}h avec{' '}
          <span className="font-semibold">{peakTimes.peakHourCount}</span> commandes
        </p>
      </div>

      {/* Heatmap */}
      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          <div className="grid grid-cols-[auto_repeat(24,_minmax(2rem,1fr))] gap-1">
            {/* Header row - Hours */}
            <div className=""></div>
            {HOURS.map(hour => (
              <div
                key={`hour-${hour}`}
                className="text-xs text-center text-stone-600 pb-1"
              >
                {hour}
              </div>
            ))}

            {/* Data rows - Days */}
            {DAYS_FR.map((dayLabel, dayIndex) => (
              <React.Fragment key={`day-row-${dayIndex}`}>
                {/* Day label */}
                <div
                  className="text-xs text-stone-600 pr-2 flex items-center justify-end font-medium"
                >
                  {dayLabel}
                </div>

                {/* Hour cells */}
                {HOURS.map(hour => {
                  const count = getCountForCell(dayIndex, hour);
                  const colorClass = getColorIntensity(count);

                  return (
                    <div
                      key={`cell-${dayIndex}-${hour}`}
                      className={`${colorClass} rounded aspect-square flex items-center justify-center border border-stone-200 hover:ring-2 hover:ring-charcoal transition-all cursor-default`}
                      title={`${dayLabel} ${hour}h: ${count} commande${count !== 1 ? 's' : ''}`}
                    >
                      {count > 0 && (
                        <span className="text-[10px] text-charcoal font-medium">
                          {count}
                        </span>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-4 flex items-center gap-2 text-xs text-stone-600">
            <span>Légende:</span>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-cream rounded border border-stone-200"></div>
              <span>0</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-blush/40 rounded border border-stone-200"></div>
              <span>Faible</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-blush/80 rounded border border-stone-200"></div>
              <span>Moyen</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-4 bg-blush rounded border border-stone-200"></div>
              <span>Max ({maxCount})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
