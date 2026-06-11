import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/session';
import {
  getRFMSegments,
  getCustomerSegmentStats,
  getTopCustomers,
  getCohorts,
  getCustomerLTV,
  getBehavioralMetrics,
  CustomerRFM,
  CustomerSegmentStats,
  Cohort,
  CustomerLTV,
  BehavioralMetrics,
} from '@/lib/customer-analytics';
import RFMDistribution from '@/components/admin/RFMDistribution';
import CustomerSegments from '@/components/admin/CustomerSegments';
import TopCustomers from '@/components/admin/TopCustomers';
import CohortRetention from '@/components/admin/CohortRetention';
import LTVMetrics from '@/components/admin/LTVMetrics';
import CustomerBehavior from '@/components/admin/CustomerBehavior';
import Link from 'next/link';

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic';

export default async function CustomerIntelligencePage() {
  try {
    await requireAdmin();
  } catch {
    redirect('/');
  }

  // Fetch data with graceful error handling
  let segments: CustomerRFM[] = [];
  let stats: CustomerSegmentStats[] = [];
  let topCustomers: CustomerRFM[] = [];
  let cohorts: Cohort[] = [];
  let ltvData: CustomerLTV[] = [];
  let behaviorMetrics: BehavioralMetrics | null = null;

  try {
    segments = await getRFMSegments();
  } catch (error) {
    console.error('Failed to fetch RFM segments:', error);
  }

  try {
    stats = await getCustomerSegmentStats();
  } catch (error) {
    console.error('Failed to fetch segment stats:', error);
  }

  try {
    topCustomers = await getTopCustomers(20);
  } catch (error) {
    console.error('Failed to fetch top customers:', error);
  }

  try {
    cohorts = await getCohorts();
  } catch (error) {
    console.error('Failed to fetch cohorts:', error);
  }

  try {
    ltvData = await getCustomerLTV();
  } catch (error) {
    console.error('Failed to fetch LTV data:', error);
  }

  try {
    behaviorMetrics = await getBehavioralMetrics();
  } catch (error) {
    console.error('Failed to fetch behavioral metrics:', error);
  }

  // Calculate KPIs from stats
  const totalCustomers = segments.length;
  const vipCount = stats.find((s) => s.segment === 'VIP')?.count || 0;
  const championsCount = stats.find((s) => s.segment === 'Champions')?.count || 0;
  const loyalCount = stats.find((s) => s.segment === 'Fidèles')?.count || 0;
  const activeCount = vipCount + championsCount + loyalCount;
  const atRiskCount = stats.find((s) => s.segment === 'À Risque')?.count || 0;
  const inactiveCount = stats.find((s) => s.segment === 'Inactifs')?.count || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Customer Intelligence</h1>
        <Link
          href="/admin"
          className="text-sm text-primary-light hover:text-primary transition-colors"
        >
          ← Retour au Tableau de Bord
        </Link>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Customers */}
        <div className="bg-background border border-background-secondary rounded-lg p-6">
          <p className="text-sm text-primary-light mb-2">Total Clients</p>
          <p className="text-3xl font-bold text-primary">
            {totalCustomers.toLocaleString('fr-FR')}
          </p>
          <p className="text-xs text-primary-light mt-1">Avec historique d&apos;achat</p>
        </div>

        {/* VIP Count */}
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-6">
          <p className="text-sm text-primary-light mb-2">VIP</p>
          <p className="text-3xl font-bold text-accent">{vipCount.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-primary-light mt-1">Meilleurs clients</p>
        </div>

        {/* Active Customers */}
        <div className="bg-background border border-background-secondary rounded-lg p-6">
          <p className="text-sm text-primary-light mb-2">Actifs</p>
          <p className="text-3xl font-bold text-primary">
            {activeCount.toLocaleString('fr-FR')}
          </p>
          <p className="text-xs text-primary-light mt-1">VIP + Champions + Fidèles</p>
        </div>

        {/* At Risk */}
        <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-6">
          <p className="text-sm text-primary-light mb-2">À Risque</p>
          <p className="text-3xl font-bold text-orange-500">
            {atRiskCount.toLocaleString('fr-FR')}
          </p>
          <p className="text-xs text-primary-light mt-1">Besoin d&apos;attention</p>
        </div>

        {/* Churned */}
        <div className="bg-background border border-background-secondary rounded-lg p-6">
          <p className="text-sm text-primary-light mb-2">Inactifs</p>
          <p className="text-3xl font-bold text-primary">
            {inactiveCount.toLocaleString('fr-FR')}
          </p>
          <p className="text-xs text-primary-light mt-1">Clients perdus</p>
        </div>
      </div>

      {/* RFM Distribution */}
      <section className="space-y-4">
        <div className="border-b border-background-secondary pb-2">
          <h2 className="text-xl font-semibold text-primary">Distribution RFM</h2>
          <p className="text-sm text-primary-light mt-1">
            Répartition des clients par segment de valeur
          </p>
        </div>
        <RFMDistribution stats={stats} />
      </section>

      {/* Customer Segments Table */}
      <section className="space-y-4">
        <div className="border-b border-background-secondary pb-2">
          <h2 className="text-xl font-semibold text-primary">Segments Clients</h2>
          <p className="text-sm text-primary-light mt-1">
            Statistiques détaillées par segment
          </p>
        </div>
        <CustomerSegments stats={stats} />
      </section>

      {/* Lifetime Value Metrics */}
      <section className="space-y-4">
        <div className="border-b border-background-secondary pb-2">
          <h2 className="text-xl font-semibold text-primary">Valeur Vie Client (LTV)</h2>
          <p className="text-sm text-primary-light mt-1">
            Analyse de la valeur client actuelle et projetée
          </p>
        </div>
        <LTVMetrics ltvData={ltvData} />
      </section>

      {/* Cohort Retention */}
      <section className="space-y-4">
        <div className="border-b border-background-secondary pb-2">
          <h2 className="text-xl font-semibold text-primary">Rétention par Cohorte</h2>
          <p className="text-sm text-primary-light mt-1">
            Taux de rétention mensuel par cohorte d&apos;acquisition
          </p>
        </div>
        <CohortRetention cohorts={cohorts} />
      </section>

      {/* Customer Behavior */}
      <section className="space-y-4">
        <div className="border-b border-background-secondary pb-2">
          <h2 className="text-xl font-semibold text-primary">Comportement Client</h2>
          <p className="text-sm text-primary-light mt-1">
            Conversion du parcours client
          </p>
        </div>
        {behaviorMetrics ? (
          <CustomerBehavior metrics={behaviorMetrics} />
        ) : (
          <div className="text-center py-12 text-primary-light">
            Erreur lors du chargement des métriques comportementales
          </div>
        )}
      </section>

      {/* Top Customers */}
      <section className="space-y-4">
        <div className="border-b border-background-secondary pb-2">
          <h2 className="text-xl font-semibold text-primary">Top 20 Clients</h2>
          <p className="text-sm text-primary-light mt-1">
            Clients classés par revenu total généré
          </p>
        </div>
        <TopCustomers customers={topCustomers} />
      </section>
    </div>
  );
}
