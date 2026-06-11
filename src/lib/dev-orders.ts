import "server-only";
import { Order, CreateOrderData } from "@/types/order";
import { devFixturesActive } from "@/data/dev-fixtures";

/**
 * DEV-ONLY in-memory order store.
 *
 * Backs the mock checkout used when neither Stripe nor Supabase is
 * configured in development: orders "paid" through the demo flow land here
 * so the confirmation page and order tracking work end-to-end.
 *
 * - Lives in process memory: orders disappear when the dev server restarts.
 * - Stored on globalThis so Turbopack HMR doesn't wipe it on every edit.
 * - Never active in production (see devFixturesActive).
 */

const GLOBAL_KEY = "__nuageDevOrders__";

type DevOrderStore = {
  orders: Map<string, Order>;
  counter: number;
};

function getStore(): DevOrderStore {
  const g = globalThis as typeof globalThis & {
    [GLOBAL_KEY]?: DevOrderStore;
  };
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = { orders: new Map(), counter: 0 };
  }
  return g[GLOBAL_KEY];
}

/** Create and store a mock order, already "paid" (status: confirmed). */
export function createDevOrder(data: CreateOrderData): Order {
  const store = getStore();
  store.counter += 1;

  const now = new Date().toISOString();
  const year = new Date().getFullYear();
  const orderNumber = `NU-${year}-DEMO${String(store.counter).padStart(3, "0")}`;

  const order: Order = {
    id: `dev-order-${store.counter}`,
    orderNumber,
    items: data.items,
    subtotal: data.subtotal,
    shipping: data.shipping,
    total: data.total,
    status: "confirmed",
    shippingAddress: data.shippingAddress,
    notes: data.notes,
    discountCode: data.discountCode,
    discountAmount: data.discountAmount,
    createdAt: now,
    updatedAt: now,
  };

  store.orders.set(orderNumber, order);
  return order;
}

/** Look up a mock order by its number (returns null when absent/inactive). */
export function getDevOrderByNumber(orderNumber: string): Order | null {
  if (!devFixturesActive()) return null;
  return getStore().orders.get(orderNumber) ?? null;
}
