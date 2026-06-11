/**
 * Revenue Analytics Page
 * Displays revenue trends, order metrics, and financial breakdowns
 * Path: /admin/analytics/revenue
 */

import { redirect } from 'next/navigation';
import { getDailyMetrics, DailyMetrics } from '@/lib/analytics-server';
import RevenueChart from '@/components/admin/RevenueChart';
import OrderTrends from '@/components/admin/OrderTrends';
import Link from 'next/link';
import { requireAdmin } from '@/lib/session';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Analyse des Revenus - Admin Nuage',
  description: 'Métriques et tendances financières',
};

export default async function RevenueAnalyticsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }
  // Fetch last 30 days of metrics
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  let dailyMetrics: DailyMetrics[] = [];
  let error: string | null = null;

  try {
    dailyMetrics = await getDailyMetrics(startDate, endDate);
  } catch (err) {
    console.error('Failed to fetch daily metrics:', err);
    error = err instanceof Error ? err.message : 'Unknown error';
    dailyMetrics = [];
  }

  return (
    <div className="space-y-8">
      {/* Header with breadcrumb */}
      <div>
        <Link
          href="/admin"
          className="text-accent hover:underline inline-flex items-center gap-2 transition-colors"
        >
          ← Retour au tableau de bord
        </Link>
        <h2 className="mt-4 text-2xl font-heading font-semibold text-primary">
          Analyse des Revenus
        </h2>
        <p className="mt-2 text-primary/70">
          Tendances et métriques financières sur 30 jours
        </p>
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 border border-red-300 bg-red-50 rounded-lg text-red-800">
          <p className="font-medium">Erreur de chargement des données</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!error && dailyMetrics.length === 0 && (
        <div className="p-8 text-center text-primary/50 border border-border rounded-lg">
          <p className="text-lg font-medium mb-2">Aucune donnée disponible</p>
          <p className="text-sm">
            Les métriques seront disponibles après l&apos;agrégation des données analytiques.
          </p>
        </div>
      )}

      {/* Revenue chart */}
      {!error && dailyMetrics.length > 0 && (
        <>
          <section>
            <h3 className="text-lg font-heading font-semibold text-primary mb-4">
              Évolution du Chiffre d&apos;Affaires
            </h3>
            <RevenueChart data={dailyMetrics} />
          </section>

          {/* Order trends */}
          <section>
            <h3 className="text-lg font-heading font-semibold text-primary mb-4">
              Tendances des Commandes
            </h3>
            <OrderTrends data={dailyMetrics} />
          </section>
        </>
      )}
    </div>
  );
}
