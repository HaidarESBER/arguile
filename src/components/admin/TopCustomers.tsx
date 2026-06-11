/**
 * TopCustomers Component
 * Displays top 20 customers ranked by total revenue
 * Phase 23-01: Customer Segmentation & RFM Analysis
 */

import { CustomerRFM } from '@/lib/customer-analytics';

interface TopCustomersProps {
  customers: CustomerRFM[];
}

/**
 * Format cents to EUR with space thousand separator
 */
function formatCurrency(cents: number): string {
  const euros = cents / 100;
  return euros.toLocaleString('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }) + '€';
}

/**
 * Format date to French locale
 */
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Get badge color for segment
 */
function getSegmentBadgeColor(segment: string): string {
  switch (segment) {
    case 'VIP':
      return 'bg-accent text-white';
    case 'Champions':
      return 'bg-green-500 text-white';
    case 'Fidèles':
      return 'bg-blue-500 text-white';
    case 'À Risque':
      return 'bg-orange-500 text-white';
    case 'Inactifs':
      return 'bg-stone-400 text-white';
    default:
      return 'bg-mist text-primary';
  }
}

export default function TopCustomers({ customers }: TopCustomersProps) {
  if (!customers || customers.length === 0) {
    return (
      <div className="p-8 text-center text-primary/50 border border-border rounded-lg">
        Aucun client trouvé
      </div>
    );
  }

  return (
    <div>
      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-primary/20">
              <th className="text-left py-2 px-3 text-sm font-semibold text-primary/70">
                Rang
              </th>
              <th className="text-left py-2 px-3 text-sm font-semibold text-primary/70">
                Client
              </th>
              <th className="text-center py-2 px-3 text-sm font-semibold text-primary/70">
                Segment
              </th>
              <th className="text-right py-2 px-3 text-sm font-semibold text-primary/70">
                Commandes
              </th>
              <th className="text-right py-2 px-3 text-sm font-semibold text-primary/70">
                Revenu Total
              </th>
              <th className="text-right py-2 px-3 text-sm font-semibold text-primary/70">
                Panier Moyen
              </th>
              <th className="text-right py-2 px-3 text-sm font-semibold text-primary/70">
                Dernière Commande
              </th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer, idx) => {
              const isTopThree = idx < 3;
              const fullName = `${customer.firstName} ${customer.lastName}`.trim();
              const displayName = fullName || customer.email;

              return (
                <tr
                  key={customer.email}
                  className={`
                    border-b border-primary/10
                    ${isTopThree ? 'bg-accent/5' : idx % 2 === 0 ? 'bg-mist' : 'bg-cream'}
                  `}
                >
                  {/* Rank */}
                  <td className="py-2.5 px-3 text-sm">
                    <span
                      className={`
                        font-semibold
                        ${isTopThree ? 'text-accent' : 'text-primary/60'}
                      `}
                    >
                      {idx + 1}
                    </span>
                  </td>

                  {/* Customer name and email */}
                  <td className="py-2.5 px-3 text-sm">
                    <div className="flex flex-col">
                      <span className="text-primary font-medium">{displayName}</span>
                      {fullName && (
                        <span className="text-xs text-primary/50">{customer.email}</span>
                      )}
                    </div>
                  </td>

                  {/* Segment badge */}
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`
                        inline-block px-2 py-1 rounded text-xs font-semibold
                        ${getSegmentBadgeColor(customer.segment)}
                      `}
                    >
                      {customer.segment}
                    </span>
                  </td>

                  {/* Order count */}
                  <td className="py-2.5 px-3 text-sm text-right text-primary">
                    {customer.frequency}
                  </td>

                  {/* Total revenue */}
                  <td className="py-2.5 px-3 text-sm text-right font-medium text-primary">
                    {formatCurrency(customer.monetary)}
                  </td>

                  {/* Avg order value */}
                  <td className="py-2.5 px-3 text-sm text-right text-primary">
                    {formatCurrency(customer.avgOrderValue)}
                  </td>

                  {/* Last order date */}
                  <td className="py-2.5 px-3 text-sm text-right text-primary/70">
                    {formatDate(customer.lastOrderDate)}
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
