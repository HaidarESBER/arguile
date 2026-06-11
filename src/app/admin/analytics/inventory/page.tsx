import Link from "next/link";
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/session';
import {
  getStockAlerts,
  getInventoryVelocity,
  getRestockRecommendations,
} from "@/lib/analytics-server";
import StockAlerts from "@/components/admin/StockAlerts";
import InventoryVelocityTable from "@/components/admin/InventoryVelocity";
import RestockRecommendations from "@/components/admin/RestockRecommendations";

// Force dynamic rendering for real-time data
export const dynamic = "force-dynamic";

export default async function InventoryAnalyticsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  // Fetch all inventory data with error handling per source
  let stockAlerts: Awaited<ReturnType<typeof getStockAlerts>>;
  try {
    stockAlerts = await getStockAlerts();
  } catch (error) {
    console.error("Failed to fetch stock alerts:", error);
    stockAlerts = [];
  }

  let inventoryVelocity: Awaited<ReturnType<typeof getInventoryVelocity>>;
  try {
    inventoryVelocity = await getInventoryVelocity(30);
  } catch (error) {
    console.error("Failed to fetch inventory velocity:", error);
    inventoryVelocity = [];
  }

  let restockRecs: Awaited<ReturnType<typeof getRestockRecommendations>>;
  try {
    restockRecs = await getRestockRecommendations(60);
  } catch (error) {
    console.error("Failed to fetch restock recommendations:", error);
    restockRecs = [];
  }

  // Calculate summary metrics
  const alertCount = stockAlerts.length;
  const urgentCount = stockAlerts.filter((a) => a.urgency === "urgent" || a.urgency === "critical").length;
  const urgentRestockCount = restockRecs.filter((r) => r.daysRemaining < 14).length;
  const totalRestockUnits = restockRecs.reduce((sum, r) => sum + r.recommendedRestock, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-bold text-stone-900">
          Gestion des Stocks
        </h1>
        <Link
          href="/admin"
          className="text-sm text-stone-600 hover:text-stone-900 transition-colors"
        >
          ← Retour
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Alert Card */}
        <div className="bg-white border border-stone-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-stone-600 mb-2">
            Alertes de Stock
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-stone-900">
              {alertCount.toLocaleString("fr-FR")}
            </span>
            {urgentCount > 0 && (
              <span className="text-sm text-orange-600 font-medium">
                ({urgentCount} urgent{urgentCount > 1 ? "s" : ""})
              </span>
            )}
          </div>
        </div>

        {/* Urgent Restock Card */}
        <div className="bg-white border border-stone-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-stone-600 mb-2">
            Réapprovisionnement Urgent
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-stone-900">
              {urgentRestockCount.toLocaleString("fr-FR")}
            </span>
            <span className="text-sm text-stone-600">
              produit{urgentRestockCount > 1 ? "s" : ""}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Moins de 14 jours de stock
          </p>
        </div>

        {/* Total Units Card */}
        <div className="bg-white border border-stone-200 rounded-lg p-6">
          <h3 className="text-sm font-medium text-stone-600 mb-2">
            Unités à Commander
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-stone-900">
              {totalRestockUnits.toLocaleString("fr-FR")}
            </span>
            <span className="text-sm text-stone-600">unités</span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Pour maintenir 60 jours de stock
          </p>
        </div>
      </div>

      {/* Stock Alerts Section */}
      <section className="bg-white border border-stone-200 rounded-lg p-6">
        <h2 className="text-xl font-serif font-bold text-stone-900 mb-2">
          Alertes de Stock
        </h2>
        <p className="text-sm text-stone-600 mb-4">
          Produits avec stock limité ou en rupture
        </p>
        <StockAlerts data={stockAlerts} />
      </section>

      {/* Inventory Velocity Section */}
      <section className="bg-white border border-stone-200 rounded-lg p-6">
        <h2 className="text-xl font-serif font-bold text-stone-900 mb-2">
          Vélocité des Stocks
        </h2>
        <p className="text-sm text-stone-600 mb-4">
          Jours de stock restant basés sur les ventes des 30 derniers jours
        </p>
        <InventoryVelocityTable data={inventoryVelocity} />
      </section>

      {/* Restock Recommendations Section */}
      <section className="bg-white border border-stone-200 rounded-lg p-6">
        <h2 className="text-xl font-serif font-bold text-stone-900 mb-2">
          Recommandations de Réapprovisionnement
        </h2>
        <p className="text-sm text-stone-600 mb-4">
          Quantités suggérées pour maintenir 60 jours de stock
        </p>
        <RestockRecommendations data={restockRecs} />
      </section>
    </div>
  );
}
