import Link from "next/link";
import { redirect } from "next/navigation";
import { getMetricsSummary, getRealtimeEvents, MetricsSummary } from "@/lib/analytics-server";
import { ServerAnalyticsEvent } from "@/types/analytics";
import DashboardKPIs from "@/components/admin/DashboardKPIs";
import RealtimeActivity from "@/components/admin/RealtimeActivity";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // Require admin access - redirects if not admin
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }
  // Fetch analytics data with error handling
  let metricsSummary: MetricsSummary;
  let realtimeEvents: ServerAnalyticsEvent[] = [];

  try {
    metricsSummary = await getMetricsSummary(30); // last 30 days
  } catch (error) {
    console.error("Failed to fetch metrics summary:", error);
    metricsSummary = {
      totalSessions: 0,
      totalUsers: 0,
      totalRevenue: 0,
      totalPurchases: 0,
      avgRevenuePerUser: 0,
      conversionRate: 0,
    };
  }

  try {
    realtimeEvents = await getRealtimeEvents(10); // last 10 events
  } catch (error) {
    console.error("Failed to fetch realtime events:", error);
    realtimeEvents = [];
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Welcome */}
      <div>
        <h2 className="text-xl md:text-2xl font-heading font-semibold text-primary">
          Bienvenue sur Nuage Admin
        </h2>
        <p className="mt-2 text-sm md:text-base text-primary/70">
          Gerez vos produits et votre boutique depuis ce panneau.
        </p>
      </div>

      {/* KPIs */}
      <div>
        <h3 className="text-base md:text-lg font-heading font-semibold text-primary mb-3 md:mb-4">
          Métriques Clés (30 derniers jours)
        </h3>
        <DashboardKPIs metricsSummary={metricsSummary} />
      </div>

      {/* Real-time Activity */}
      <div>
        <h3 className="text-base md:text-lg font-heading font-semibold text-primary mb-3 md:mb-4">
          Activité en Temps Réel
        </h3>
        <RealtimeActivity events={realtimeEvents} />
      </div>

      {/* Quick Actions */}
      <div className="bg-secondary rounded-lg p-4 md:p-6 border border-primary/10">
        <h3 className="text-base md:text-lg font-heading font-semibold text-primary mb-3 md:mb-4">
          Actions Rapides
        </h3>
        <div className="flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4">
          <Link
            href="/admin/produits/nouveau"
            className="inline-flex items-center px-4 py-2 bg-primary text-background rounded-md hover:bg-accent hover:text-primary transition-colors"
          >
            + Ajouter un produit
          </Link>
          <Link
            href="/admin/produits"
            className="inline-flex items-center px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-background transition-colors"
          >
            Voir tous les produits
          </Link>
          <Link
            href="/admin/commandes"
            className="inline-flex items-center px-4 py-2 border border-primary text-primary rounded-md hover:bg-primary hover:text-background transition-colors"
          >
            Voir les commandes
          </Link>
        </div>
      </div>
    </div>
  );
}
