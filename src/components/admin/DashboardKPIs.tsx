import { MetricsSummary } from '@/lib/analytics-server';

interface DashboardKPIsProps {
  metricsSummary: MetricsSummary;
}

export default function DashboardKPIs({ metricsSummary }: DashboardKPIsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 md:gap-6">
      <StatCard
        title="Visites Uniques"
        value={metricsSummary.totalSessions.toLocaleString('fr-FR')}
        description="Visites uniques"
      />
      <StatCard
        title="Utilisateurs"
        value={metricsSummary.totalUsers.toLocaleString('fr-FR')}
        description="Utilisateurs connectés"
      />
      <StatCard
        title="Chiffre d'Affaires"
        value={formatCurrency(metricsSummary.totalRevenue / 100)}
        description="Chiffre d'affaires"
        highlight={true}
      />
      <StatCard
        title="Commandes"
        value={metricsSummary.totalPurchases.toLocaleString('fr-FR')}
        description="Commandes payées"
      />
      <StatCard
        title="Panier Moyen"
        value={formatCurrency(metricsSummary.avgRevenuePerUser / 100)}
        description="Panier moyen"
      />
      <StatCard
        title="Conversion"
        value={`${metricsSummary.conversionRate.toFixed(2)}%`}
        description="Taux de conversion"
        highlight={metricsSummary.conversionRate > 2}
      />
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
  highlight = false,
}: {
  title: string;
  value: string;
  description: string;
  highlight?: boolean;
}) {
  return (
    <div className="bg-secondary rounded-lg p-6 border border-primary/10">
      <h3 className="text-sm font-medium text-primary/70">{title}</h3>
      <p
        className={`mt-2 text-3xl font-heading font-semibold ${
          highlight ? "text-accent" : "text-primary"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-sm text-primary/60">{description}</p>
    </div>
  );
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}
