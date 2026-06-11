/**
 * CustomerBehavior Component
 * Phase 23-02: Cohort Analysis & Lifetime Value Tracking
 *
 * Purpose: Display customer behavior funnel visualization with conversion metrics
 */

import { BehavioralMetrics } from '@/lib/customer-analytics';

interface CustomerBehaviorProps {
  metrics: BehavioralMetrics;
}

export default function CustomerBehavior({ metrics }: CustomerBehaviorProps) {
  if (!metrics || metrics.totalCustomers === 0) {
    return (
      <div className="text-center py-12 text-primary-light">
        Données insuffisantes
      </div>
    );
  }

  // Calculate percentages for funnel
  const browsersPercentage = metrics.totalCustomers > 0
    ? Math.round((metrics.browsersOnly / metrics.totalCustomers) * 100)
    : 0;
  const wishlistersPercentage = metrics.totalCustomers > 0
    ? Math.round((metrics.wishlisters / metrics.totalCustomers) * 100)
    : 0;
  const purchasersPercentage = metrics.totalCustomers > 0
    ? Math.round((metrics.purchasers / metrics.totalCustomers) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Funnel Visualization */}
      <div className="space-y-3">
        {/* Total Users */}
        <div className="flex items-center gap-4">
          <div className="w-full bg-primary/10 rounded-lg p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-primary">Total Utilisateurs</p>
              <p className="text-xs text-primary-light">Clients authentifiés</p>
            </div>
            <p className="text-2xl font-bold text-primary">
              {metrics.totalCustomers.toLocaleString('fr-FR')}
            </p>
          </div>
        </div>

        {/* Browsers */}
        <div className="flex items-center gap-4">
          <div
            className="bg-blue-500/10 rounded-lg p-4 flex items-center justify-between transition-all"
            style={{ width: `${Math.max(browsersPercentage, 10)}%` }}
          >
            <div className="flex-1">
              <p className="text-sm font-semibold text-blue-700">Navigateurs</p>
              <p className="text-xs text-blue-600">Ont consulté des produits</p>
            </div>
          </div>
          <p className="text-sm font-medium text-primary min-w-[80px] text-right">
            {metrics.browsersOnly.toLocaleString('fr-FR')}
            <span className="text-xs text-primary-light ml-1">
              ({browsersPercentage}%)
            </span>
          </p>
        </div>

        {/* Wishlisters */}
        <div className="flex items-center gap-4">
          <div
            className="bg-purple-500/10 rounded-lg p-4 flex items-center justify-between transition-all"
            style={{ width: `${Math.max(wishlistersPercentage, 10)}%` }}
          >
            <div className="flex-1">
              <p className="text-sm font-semibold text-purple-700">Wishlist</p>
              <p className="text-xs text-purple-600">Ont ajouté aux favoris</p>
            </div>
          </div>
          <p className="text-sm font-medium text-primary min-w-[80px] text-right">
            {metrics.wishlisters.toLocaleString('fr-FR')}
            <span className="text-xs text-primary-light ml-1">
              ({wishlistersPercentage}%)
            </span>
          </p>
        </div>

        {/* Purchasers */}
        <div className="flex items-center gap-4">
          <div
            className="bg-accent/20 rounded-lg p-4 flex items-center justify-between transition-all"
            style={{ width: `${Math.max(purchasersPercentage, 10)}%` }}
          >
            <div className="flex-1">
              <p className="text-sm font-semibold text-accent">Acheteurs</p>
              <p className="text-xs text-accent/80">Ont finalisé un achat</p>
            </div>
          </div>
          <p className="text-sm font-bold text-accent min-w-[80px] text-right">
            {metrics.purchasers.toLocaleString('fr-FR')}
            <span className="text-xs text-primary-light ml-1">
              ({purchasersPercentage}%)
            </span>
          </p>
        </div>
      </div>

      {/* Conversion Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-background-secondary">
        {/* Browse-to-Cart */}
        <div className="bg-background border border-background-secondary rounded-lg p-6">
          <p className="text-sm text-primary-light mb-2">Navigation → Wishlist</p>
          <p
            className={`text-3xl font-bold ${
              metrics.browseToCart > 50 ? 'text-accent' : 'text-primary'
            }`}
          >
            {metrics.browseToCart}%
          </p>
          <p className="text-xs text-primary-light mt-1">Taux de conversion</p>
        </div>

        {/* Wishlist-to-Purchase */}
        <div className="bg-background border border-background-secondary rounded-lg p-6">
          <p className="text-sm text-primary-light mb-2">Wishlist → Achat</p>
          <p
            className={`text-3xl font-bold ${
              metrics.wishlistToPurchase > 50 ? 'text-accent' : 'text-primary'
            }`}
          >
            {metrics.wishlistToPurchase}%
          </p>
          <p className="text-xs text-primary-light mt-1">Taux de conversion</p>
        </div>

        {/* Avg Days to Purchase */}
        <div className="bg-background border border-background-secondary rounded-lg p-6">
          <p className="text-sm text-primary-light mb-2">Délai Moyen d&apos;Achat</p>
          <p className="text-3xl font-bold text-primary">
            {metrics.avgDaysToPurchase.toLocaleString('fr-FR')}
          </p>
          <p className="text-xs text-primary-light mt-1">Jours (1er visite → 1er achat)</p>
        </div>
      </div>
    </div>
  );
}
