import Link from "next/link";
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/session';
import { getAllOrders } from "@/lib/orders";
import { formatPrice } from "@/types/product";
import { OrderStatusBadge } from "@/components/admin";
import { formatDate } from "@/lib/date-utils";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  const orders = await getAllOrders();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-heading font-semibold text-primary">
          Commandes
        </h2>
      </div>

      {/* Orders Table */}
      <div className="bg-secondary rounded-lg border border-primary/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary/5 border-b border-primary/10">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Numéro
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Client
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Date
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Total
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-primary/5">
                  <td className="px-4 py-3">
                    <span className="font-mono text-sm text-primary">
                      {order.orderNumber}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-primary">
                        {order.shippingAddress.firstName}{" "}
                        {order.shippingAddress.lastName}
                      </p>
                      <p className="text-sm text-primary/60">
                        {order.shippingAddress.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-primary/70">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-primary">
                    {formatPrice(order.total)}
                  </td>
                  <td className="px-4 py-3">
                    <OrderStatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/commandes/${order.id}`}
                      className="px-3 py-1 text-sm border border-primary/30 text-primary rounded hover:bg-primary hover:text-background transition-colors"
                    >
                      Voir
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {orders.length === 0 && (
          <div className="p-8 text-center text-primary/60">
            Aucune commande pour le moment.
          </div>
        )}
      </div>
    </div>
  );
}
