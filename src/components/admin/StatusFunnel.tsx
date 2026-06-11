'use client';

import { StatusFunnelStep } from '@/lib/analytics-server';

interface StatusFunnelProps {
  data: StatusFunnelStep[];
}

export default function StatusFunnel({ data }: StatusFunnelProps) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-cream p-8 rounded border border-stone-200 text-center text-stone-500">
        Aucune donnée de statut disponible
      </div>
    );
  }

  // Separate cancelled from main funnel
  const mainFunnel = data.filter(step => step.status !== 'cancelled');
  const cancelledStep = data.find(step => step.status === 'cancelled');

  // Find delivered step for highlighting
  const deliveredStep = data.find(step => step.status === 'delivered');

  // Calculate funnel widths (decreasing)
  const maxCount = Math.max(...data.map(s => s.orderCount), 1);

  const getStepColor = (status: string) => {
    if (status === 'delivered') return 'bg-green-500 text-white';
    if (status === 'cancelled') return 'bg-red-500 text-white';
    return 'bg-blush text-charcoal';
  };

  const getDropOffColor = (dropOffRate?: number) => {
    if (!dropOffRate) return 'text-stone-500';
    if (dropOffRate > 20) return 'text-red-600 font-semibold';
    return 'text-stone-600';
  };

  // Calculate conversion metrics
  const totalOrders = data.reduce((sum, step) => sum + step.orderCount, 0);
  const pendingPayment = data.find(s => s.status === 'pending_payment')?.orderCount || 0;
  const pending = data.find(s => s.status === 'pending')?.orderCount || 0;
  const delivered = deliveredStep?.orderCount || 0;
  const cancelled = cancelledStep?.orderCount || 0;

  const paymentCompletionRate = pendingPayment > 0 ? (pending / pendingPayment) * 100 : 0;
  const fulfillmentRate = totalOrders > 0 ? (delivered / totalOrders) * 100 : 0;
  const cancellationRate = totalOrders > 0 ? (cancelled / totalOrders) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Main Funnel Steps */}
      <div className="space-y-2">
        {mainFunnel.map((step) => {
          const widthPercentage = (step.orderCount / maxCount) * 100;

          return (
            <div key={step.status} className="space-y-1">
              {/* Step Bar */}
              <div
                className={`${getStepColor(step.status)} rounded p-4 transition-all duration-500 border-2 ${
                  step.status === 'delivered' ? 'border-green-600' : 'border-transparent'
                }`}
                style={{ width: `${Math.max(widthPercentage, 20)}%` }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{step.label}</span>
                  <div className="text-right">
                    <div className="font-semibold">{step.orderCount}</div>
                    <div className="text-xs opacity-90">{step.percentage.toFixed(1)}%</div>
                  </div>
                </div>
              </div>

              {/* Drop-off Rate */}
              {step.dropOffRate !== undefined && (
                <div className={`text-xs ${getDropOffColor(step.dropOffRate)} pl-4`}>
                  {step.dropOffRate > 0 ? (
                    <>
                      ↓ {step.dropOffRate.toFixed(1)}% d&apos;abandon
                      {step.dropOffRate > 20 && ' ⚠️'}
                    </>
                  ) : (
                    <span className="text-stone-400">—</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Cancelled Orders (Separate) */}
      {cancelledStep && cancelledStep.orderCount > 0 && (
        <div className="pt-4 border-t border-stone-200">
          <div className="bg-red-500 text-white rounded p-4 border-2 border-red-600">
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm">{cancelledStep.label}</span>
              <div className="text-right">
                <div className="font-semibold">{cancelledStep.orderCount}</div>
                <div className="text-xs opacity-90">{cancelledStep.percentage.toFixed(1)}%</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversion Metrics Summary */}
      <div className="bg-cream p-6 rounded border border-stone-200">
        <h3 className="font-medium text-charcoal mb-4">Métriques de Conversion</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-stone-600 mb-1">Taux de Paiement</div>
            <div className="text-2xl font-semibold text-charcoal">
              {paymentCompletionRate.toFixed(1)}%
            </div>
            <div className="text-xs text-stone-500 mt-1">
              {pending} / {pendingPayment} paiements complétés
            </div>
          </div>
          <div>
            <div className="text-xs text-stone-600 mb-1">Taux de Livraison</div>
            <div className="text-2xl font-semibold text-green-600">
              {fulfillmentRate.toFixed(1)}%
            </div>
            <div className="text-xs text-stone-500 mt-1">
              {delivered} / {totalOrders} commandes livrées
            </div>
          </div>
          <div>
            <div className="text-xs text-stone-600 mb-1">Taux d&apos;Annulation</div>
            <div className="text-2xl font-semibold text-red-600">
              {cancellationRate.toFixed(1)}%
            </div>
            <div className="text-xs text-stone-500 mt-1">
              {cancelled} commandes annulées
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
