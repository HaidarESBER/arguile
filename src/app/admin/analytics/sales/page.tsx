import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/session';
import {
  getRevenueByCategory,
  getTopSellingProducts,
  getAOVTrends,
  CategoryRevenue,
  TopSellingProduct,
  AOVTrend
} from '@/lib/analytics-server';
import SalesByCategory from '@/components/admin/SalesByCategory';
import TopSellers from '@/components/admin/TopSellers';
import AOVChart from '@/components/admin/AOVChart';
import Link from 'next/link';

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic';

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });
}

export default async function SalesAnalyticsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  // Fetch data from analytics helpers with graceful error handling
  let categoryRevenue: CategoryRevenue[] = [];
  let topSellers: TopSellingProduct[] = [];
  let aovTrends: AOVTrend[] = [];
  let totalRevenue = 0;
  let totalOrders = 0;
  let avgOrderValue = 0;

  try {
    categoryRevenue = await getRevenueByCategory();
    totalRevenue = categoryRevenue.reduce((sum, cat) => sum + cat.revenue, 0);
    totalOrders = categoryRevenue.reduce((sum, cat) => sum + cat.orderCount, 0);
  } catch (error) {
    console.error('Failed to fetch category revenue:', error);
  }

  try {
    topSellers = await getTopSellingProducts(15);
  } catch (error) {
    console.error('Failed to fetch top sellers:', error);
  }

  try {
    aovTrends = await getAOVTrends(30);
    // Calculate average AOV from trends
    if (aovTrends.length > 0) {
      avgOrderValue = aovTrends.reduce((sum, trend) => sum + trend.avgOrderValue, 0) / aovTrends.length;
    }
  } catch (error) {
    console.error('Failed to fetch AOV trends:', error);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-primary">Analyse des Ventes</h1>
        <Link
          href="/admin"
          className="text-sm text-primary-light hover:text-primary transition-colors"
        >
          ← Retour au Tableau de Bord
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-background border border-background-secondary rounded-lg p-6">
          <p className="text-sm text-primary-light mb-2">Revenu Total</p>
          <p className="text-3xl font-bold text-primary">{formatCurrency(totalRevenue)}</p>
          <p className="text-xs text-primary-light mt-1">Toutes catégories confondues</p>
        </div>
        <div className="bg-background border border-background-secondary rounded-lg p-6">
          <p className="text-sm text-primary-light mb-2">Valeur Moyenne</p>
          <p className="text-3xl font-bold text-primary">{formatCurrency(avgOrderValue)}</p>
          <p className="text-xs text-primary-light mt-1">Par commande</p>
        </div>
        <div className="bg-background border border-background-secondary rounded-lg p-6">
          <p className="text-sm text-primary-light mb-2">Total Commandes</p>
          <p className="text-3xl font-bold text-primary">{totalOrders.toLocaleString('fr-FR')}</p>
          <p className="text-xs text-primary-light mt-1">Nombre de commandes</p>
        </div>
      </div>

      {/* Revenue by Category */}
      <section className="space-y-4">
        <div className="border-b border-background-secondary pb-2">
          <h2 className="text-xl font-semibold text-primary">Revenu par Catégorie</h2>
          <p className="text-sm text-primary-light mt-1">
            Répartition des ventes par catégorie de produits
          </p>
        </div>
        <SalesByCategory data={categoryRevenue} />
      </section>

      {/* Top Sellers */}
      <section className="space-y-4">
        <div className="border-b border-background-secondary pb-2">
          <h2 className="text-xl font-semibold text-primary">Meilleures Ventes</h2>
          <p className="text-sm text-primary-light mt-1">
            Top 15 des produits générant le plus de revenus
          </p>
        </div>
        <TopSellers data={topSellers} />
      </section>

      {/* AOV Trends */}
      <section className="space-y-4">
        <div className="border-b border-background-secondary pb-2">
          <h2 className="text-xl font-semibold text-primary">Évolution du Panier Moyen</h2>
          <p className="text-sm text-primary-light mt-1">
            Tendance de la valeur moyenne des commandes
          </p>
        </div>
        <AOVChart data={aovTrends} />
      </section>
    </div>
  );
}
