import Link from 'next/link';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/session';
import {
  getOrdersByTimePattern,
  getShippingDistribution,
  getOrderStatusFunnel,
} from '@/lib/analytics-server';
import OrderHeatmap from '@/components/admin/OrderHeatmap';
import ShippingBreakdown from '@/components/admin/ShippingBreakdown';
import StatusFunnel from '@/components/admin/StatusFunnel';

export const dynamic = 'force-dynamic';

export default async function OrderAnalyticsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  // Fetch data with error handling
  let timeData = null;
  let shippingData = null;
  let statusData = null;

  try {
    timeData = await getOrdersByTimePattern(30);
  } catch (error) {
    console.error('Error fetching time patterns:', error);
  }

  try {
    shippingData = await getShippingDistribution();
  } catch (error) {
    console.error('Error fetching shipping distribution:', error);
  }

  try {
    statusData = await getOrderStatusFunnel();
  } catch (error) {
    console.error('Error fetching status funnel:', error);
  }

  // Calculate summary metrics
  const totalOrders = statusData?.reduce((sum, step) => sum + step.orderCount, 0) || 0;
  const peakHour = timeData?.peakTimes.peakHour || 0;
  const peakDay = timeData?.peakTimes.peakDay || 'N/A';

  const mostPopularShipping = shippingData && shippingData.length > 0
    ? shippingData[0].label
    : 'N/A';

  const deliveredCount = statusData?.find(s => s.status === 'delivered')?.orderCount || 0;
  const conversionRate = totalOrders > 0 ? (deliveredCount / totalOrders) * 100 : 0;

  const pendingPayment = statusData?.find(s => s.status === 'pending_payment')?.orderCount || 0;
  const pending = statusData?.find(s => s.status === 'pending')?.orderCount || 0;
  const paymentAbandonRate = pendingPayment > 0
    ? ((pendingPayment - pending) / pendingPayment) * 100
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-charcoal">Analyse des Commandes</h1>
        <Link
          href="/admin"
          className="text-sm text-stone-600 hover:text-charcoal transition-colors"
        >
          ← Retour
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded border border-stone-200">
          <div className="text-xs text-stone-600 mb-1">Total Commandes</div>
          <div className="text-2xl font-semibold text-charcoal">
            {totalOrders.toLocaleString('fr-FR')}
          </div>
        </div>
        <div className="bg-white p-4 rounded border border-stone-200">
          <div className="text-xs text-stone-600 mb-1">Heure de Pic</div>
          <div className="text-2xl font-semibold text-charcoal">
            {peakHour}h
          </div>
          <div className="text-xs text-stone-500 mt-1">{peakDay}</div>
        </div>
        <div className="bg-white p-4 rounded border border-stone-200">
          <div className="text-xs text-stone-600 mb-1">Livraison Populaire</div>
          <div className="text-lg font-semibold text-charcoal">
            {mostPopularShipping}
          </div>
        </div>
        <div className="bg-white p-4 rounded border border-stone-200">
          <div className="text-xs text-stone-600 mb-1">Taux de Conversion</div>
          <div className="text-2xl font-semibold text-green-600">
            {conversionRate.toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Order Heatmap */}
      <section className="bg-white p-6 rounded border border-stone-200">
        <h2 className="text-xl font-semibold text-charcoal mb-2">
          Répartition Temporelle des Commandes
        </h2>
        <p className="text-sm text-stone-600 mb-4">
          Volume de commandes par jour de la semaine et heure (30 derniers jours)
        </p>
        {timeData ? (
          <OrderHeatmap data={timeData.patterns} peakTimes={timeData.peakTimes} />
        ) : (
          <div className="bg-cream p-8 rounded border border-stone-200 text-center text-stone-500">
            Erreur lors du chargement des données temporelles
          </div>
        )}
      </section>

      {/* Shipping Distribution */}
      <section className="bg-white p-6 rounded border border-stone-200">
        <h2 className="text-xl font-semibold text-charcoal mb-2">
          Distribution des Livraisons
        </h2>
        <p className="text-sm text-stone-600 mb-4">
          Méthodes de livraison choisies par les clients
        </p>
        {shippingData ? (
          <ShippingBreakdown data={shippingData} />
        ) : (
          <div className="bg-cream p-8 rounded border border-stone-200 text-center text-stone-500">
            Erreur lors du chargement des données de livraison
          </div>
        )}
      </section>

      {/* Status Funnel */}
      <section className="bg-white p-6 rounded border border-stone-200">
        <h2 className="text-xl font-semibold text-charcoal mb-2">
          Entonnoir de Statut des Commandes
        </h2>
        <p className="text-sm text-stone-600 mb-4">
          Progression des commandes dans le cycle de vie
        </p>
        {statusData ? (
          <StatusFunnel data={statusData} />
        ) : (
          <div className="bg-cream p-8 rounded border border-stone-200 text-center text-stone-500">
            Erreur lors du chargement des données de statut
          </div>
        )}
      </section>

      {/* Insights */}
      <section className="bg-white p-6 rounded border border-stone-200">
        <h2 className="text-xl font-semibold text-charcoal mb-4">Insights</h2>
        <div className="bg-cream p-4 rounded border border-stone-200">
          <ul className="list-disc list-inside space-y-2 text-sm text-charcoal">
            <li>
              <strong>Jour le plus actif:</strong> {peakDay} avec{' '}
              {timeData?.peakTimes.peakDayCount || 0} commandes
            </li>
            <li>
              <strong>Heure de pic:</strong> {peakHour}h avec{' '}
              {timeData?.peakTimes.peakHourCount || 0} commandes
            </li>
            <li>
              <strong>Préférence livraison:</strong> {mostPopularShipping}
              {shippingData && shippingData.length > 0 && (
                <> ({shippingData[0].percentage.toFixed(1)}% des commandes)</>
              )}
            </li>
            <li>
              <strong>Taux d&apos;abandon paiement:</strong>{' '}
              <span className={paymentAbandonRate > 20 ? 'text-red-600 font-semibold' : ''}>
                {paymentAbandonRate.toFixed(1)}%
              </span>
              {paymentAbandonRate > 20 && ' ⚠️ Taux élevé'}
            </li>
            <li>
              <strong>Taux de livraison:</strong>{' '}
              <span className="text-green-600 font-semibold">
                {conversionRate.toFixed(1)}%
              </span>{' '}
              des commandes livrées
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
