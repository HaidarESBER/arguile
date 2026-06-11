/**
 * LTVMetrics Component
 * Phase 23-02: Cohort Analysis & Lifetime Value Tracking
 *
 * Purpose: Display lifetime value summary cards and top customers table
 */

import { CustomerLTV } from '@/lib/customer-analytics';

interface LTVMetricsProps {
  ltvData: CustomerLTV[];
}

export default function LTVMetrics({ ltvData }: LTVMetricsProps) {
  if (!ltvData || ltvData.length === 0) {
    return (
      <div className="text-center py-12 text-primary-light">
        Pas encore de données LTV
      </div>
    );
  }

  // Calculate summary metrics
  const avgCurrentLTV = Math.round(
    ltvData.reduce((sum, c) => sum + c.currentLTV, 0) / ltvData.length
  );
  const avgProjectedLTV = Math.round(
    ltvData.reduce((sum, c) => sum + c.projectedLTV, 0) / ltvData.length
  );
  const avgPurchaseFrequency = Math.round(
    (ltvData.reduce((sum, c) => sum + c.purchaseFrequency, 0) / ltvData.length) * 100
  ) / 100;

  // Get top 20 customers
  const topCustomers = ltvData.slice(0, 20);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Avg Current LTV */}
        <div className="bg-background border border-background-secondary rounded-lg p-6">
          <p className="text-sm text-primary-light mb-2">LTV Actuel Moyen</p>
          <p className="text-3xl font-bold text-primary">
            {(avgCurrentLTV / 100).toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            })}
          </p>
          <p className="text-xs text-primary-light mt-1">Revenu total généré</p>
        </div>

        {/* Avg Projected LTV */}
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
          <p className="text-sm text-primary-light mb-2">LTV Projeté Moyen</p>
          <p className="text-3xl font-bold text-accent">
            {(avgProjectedLTV / 100).toLocaleString('fr-FR', {
              style: 'currency',
              currency: 'EUR',
            })}
          </p>
          <p className="text-xs text-primary-light mt-1">Avec projection 90j</p>
        </div>

        {/* Avg Purchase Frequency */}
        <div className="bg-background border border-background-secondary rounded-lg p-6">
          <p className="text-sm text-primary-light mb-2">Fréquence d&apos;Achat</p>
          <p className="text-3xl font-bold text-primary">
            {avgPurchaseFrequency.toLocaleString('fr-FR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-primary-light mt-1">Commandes / 90 jours</p>
        </div>
      </div>

      {/* Top Customers Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="text-left p-3 text-sm font-semibold text-primary border-b border-background-secondary">
                #
              </th>
              <th className="text-left p-3 text-sm font-semibold text-primary border-b border-background-secondary">
                Client
              </th>
              <th className="text-center p-3 text-sm font-semibold text-primary border-b border-background-secondary">
                Segment
              </th>
              <th className="text-right p-3 text-sm font-semibold text-primary border-b border-background-secondary">
                LTV Actuel
              </th>
              <th className="text-right p-3 text-sm font-semibold text-primary border-b border-background-secondary">
                LTV Projeté
              </th>
              <th className="text-right p-3 text-sm font-semibold text-primary border-b border-background-secondary">
                Fréquence
              </th>
              <th className="text-right p-3 text-sm font-semibold text-primary border-b border-background-secondary">
                Panier Moyen
              </th>
            </tr>
          </thead>
          <tbody>
            {topCustomers.map((customer, index) => {
              const isTop5 = index < 5;
              const rowClass = isTop5
                ? 'bg-accent/5 hover:bg-accent/10'
                : 'hover:bg-background-secondary/50';

              return (
                <tr key={customer.email} className={`${rowClass} transition-colors`}>
                  <td className="p-3 text-sm text-primary-light border-b border-background-secondary/50">
                    {index + 1}
                  </td>
                  <td className="p-3 text-sm text-primary border-b border-background-secondary/50">
                    <div className="max-w-[200px] truncate" title={customer.email}>
                      {customer.email}
                    </div>
                  </td>
                  <td className="p-3 text-center border-b border-background-secondary/50">
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        customer.segment === 'VIP'
                          ? 'bg-accent/20 text-accent'
                          : customer.segment === 'Champions'
                          ? 'bg-green-500/20 text-green-700'
                          : customer.segment === 'Fidèles'
                          ? 'bg-blue-500/20 text-blue-700'
                          : customer.segment === 'À Risque'
                          ? 'bg-orange-500/20 text-orange-700'
                          : 'bg-gray-500/20 text-gray-700'
                      }`}
                    >
                      {customer.segment}
                    </span>
                  </td>
                  <td className="p-3 text-sm text-right font-medium text-primary border-b border-background-secondary/50">
                    {(customer.currentLTV / 100).toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </td>
                  <td
                    className={`p-3 text-sm text-right font-bold border-b border-background-secondary/50 ${
                      isTop5 ? 'text-accent' : 'text-primary'
                    }`}
                  >
                    {(customer.projectedLTV / 100).toLocaleString('fr-FR', {
                      style: 'currency',
                      currency: 'EUR',
                    })}
                  </td>
                  <td className="p-3 text-sm text-right text-primary border-b border-background-secondary/50">
                    {customer.purchaseFrequency.toLocaleString('fr-FR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </td>
                  <td className="p-3 text-sm text-right text-primary border-b border-background-secondary/50">
                    {(customer.avgOrderValue / 100).toLocaleString('fr-FR', {
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
    </div>
  );
}
