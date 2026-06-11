'use client';

import { ShippingDistribution } from '@/lib/analytics-server';

interface ShippingBreakdownProps {
  data: ShippingDistribution[];
}

const TIER_COLORS: Record<string, string> = {
  free: 'bg-green-500',
  standard: 'bg-blue-500',
  express: 'bg-purple-500',
};

const TIER_TEXT_COLORS: Record<string, string> = {
  free: 'text-green-700',
  standard: 'text-blue-700',
  express: 'text-purple-700',
};

export default function ShippingBreakdown({ data }: ShippingBreakdownProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-cream p-8 rounded border border-stone-200 text-center text-stone-500">
        Aucune donnée de livraison disponible
      </div>
    );
  }

  // Calculate totals
  const totalOrders = data.reduce((sum, tier) => sum + tier.orderCount, 0);
  const totalRevenue = data.reduce((sum, tier) => sum + tier.totalRevenue, 0);

  return (
    <div className="space-y-6">
      {/* Shipping Tier Bars */}
      <div className="space-y-3">
        {data.map((tier) => (
          <div key={tier.shippingTier} className="space-y-1">
            {/* Tier Header */}
            <div className="flex items-center justify-between text-sm">
              <span className={`font-medium ${TIER_TEXT_COLORS[tier.shippingTier] || 'text-charcoal'}`}>
                {tier.label}
              </span>
              <span className="text-stone-600">
                {tier.orderCount} commande{tier.orderCount !== 1 ? 's' : ''} ({tier.percentage.toFixed(1)}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-stone-100 rounded-full h-8 overflow-hidden border border-stone-200">
              <div
                className={`${TIER_COLORS[tier.shippingTier] || 'bg-stone-400'} h-full flex items-center justify-end px-3 transition-all duration-500`}
                style={{ width: `${tier.percentage}%` }}
              >
                {tier.percentage > 15 && (
                  <span className="text-xs font-medium text-white">
                    {(tier.totalRevenue / 100).toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </span>
                )}
              </div>
            </div>

            {/* Revenue (shown outside bar if bar is too small) */}
            {tier.percentage <= 15 && (
              <div className="text-xs text-stone-600 text-right">
                Revenu: {(tier.totalRevenue / 100).toLocaleString('fr-FR', {
                  style: 'currency',
                  currency: 'EUR',
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Totals Summary */}
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-stone-200">
        <div className="bg-mist p-4 rounded">
          <div className="text-xs text-stone-600 mb-1">Total Commandes</div>
          <div className="text-2xl font-semibold text-charcoal">
            {totalOrders.toLocaleString('fr-FR')}
          </div>
        </div>
        <div className="bg-mist p-4 rounded">
          <div className="text-xs text-stone-600 mb-1">Revenu Livraison</div>
          <div className="text-2xl font-semibold text-charcoal">
            {(totalRevenue / 100).toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
