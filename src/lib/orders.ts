import "server-only";
import {
  Order,
  OrderItem,
  CreateOrderData,
  generateOrderNumber,
} from "@/types/order";
import {
  sendShippingNotificationEmail,
  sendOrderStatusUpdateEmail,
} from "@/lib/email";
import { createAdminClient } from "@/lib/supabase/admin";
import { getDevOrderByNumber } from "@/lib/dev-orders";
import { ShippingAddress } from "@/types/checkout";

// Server-only data layer: uses the Supabase service-role client and performs
// no auth checks. It must NEVER be imported from a client component (that
// would compile its exports into publicly reachable Server Actions).
// Client components must go through guarded actions (see
// src/app/admin/commandes/actions.ts).

// ---------------------------------------------------------------------------
// Column mapping helpers: snake_case DB <-> camelCase TypeScript
// ---------------------------------------------------------------------------

interface OrderRow {
  id: string;
  order_number: string;
  user_email: string;
  subtotal: number;
  shipping: number;
  total: number;
  status: string;
  shipping_address: ShippingAddress;
  notes: string | null;
  discount_code: string | null;
  discount_amount: number | null;
  tracking_number: string | null;
  tracking_url: string | null;
  estimated_delivery: string | null;
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_image: string;
  price: number;
  quantity: number;
}

function toOrderItem(row: OrderItemRow): OrderItem {
  return {
    productId: row.product_id,
    productName: row.product_name,
    productImage: row.product_image,
    price: row.price,
    quantity: row.quantity,
  };
}

function toOrder(row: OrderRow, itemRows?: OrderItemRow[]): Order {
  return {
    id: row.id,
    orderNumber: row.order_number,
    items: itemRows ? itemRows.map(toOrderItem) : [],
    subtotal: row.subtotal,
    shipping: row.shipping,
    total: row.total,
    status: row.status as Order["status"],
    shippingAddress: row.shipping_address,
    notes: row.notes ?? undefined,
    discountCode: row.discount_code ?? undefined,
    discountAmount: row.discount_amount ?? undefined,
    trackingNumber: row.tracking_number ?? undefined,
    trackingUrl: row.tracking_url ?? undefined,
    estimatedDelivery: row.estimated_delivery ?? undefined,
    stripeSessionId: row.stripe_session_id ?? undefined,
    stripePaymentIntentId: row.stripe_payment_intent_id ?? undefined,
    shippedAt: row.shipped_at ?? undefined,
    deliveredAt: row.delivered_at ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Parse a Supabase row that includes nested order_items relation
 */
function toOrderFromJoin(row: OrderRow & { order_items?: OrderItemRow[] }): Order {
  const { order_items, ...orderRow } = row;
  return toOrder(orderRow, order_items ?? []);
}

// ---------------------------------------------------------------------------
// Order number generation (queries DB for next sequence)
// ---------------------------------------------------------------------------

async function generateNextOrderNumber(): Promise<string> {
  const admin = createAdminClient();
  const year = new Date().getFullYear();
  const prefix = `NU-${year}-`;

  const { data } = await admin
    .from("orders")
    .select("order_number")
    .like("order_number", `${prefix}%`)
    .order("order_number", { ascending: false })
    .limit(1);

  const existingNumbers = data ? data.map((r: { order_number: string }) => r.order_number) : [];
  return generateOrderNumber(existingNumbers);
}

// ---------------------------------------------------------------------------
// Public operations (use admin client — no auth context yet, RLS bypassed)
// ---------------------------------------------------------------------------

/**
 * Create a new order
 * @param data - Order data from checkout form
 * @returns Created order with generated ID and order number
 */
export async function createOrder(data: CreateOrderData): Promise<Order> {
  const admin = createAdminClient();

  // Concurrent checkouts can generate the same order number (read-then-insert
  // race on the unique constraint). Retry with a freshly generated number on
  // unique violation (Postgres error code 23505).
  const MAX_ATTEMPTS = 3;
  let orderRow: OrderRow | null = null;
  let lastError: { code?: string; message?: string } | null = null;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    const orderNumber = await generateNextOrderNumber();

    // Insert order (let Postgres handle UUID generation)
    const { data: insertedRow, error: orderError } = await admin
      .from("orders")
      .insert({
        order_number: orderNumber,
        user_email: data.shippingAddress.email,
        subtotal: data.subtotal,
        shipping: data.shipping,
        total: data.total,
        status: data.status || "pending",
        shipping_address: data.shippingAddress,
        notes: data.notes || null,
        discount_code: data.discountCode || null,
        discount_amount: data.discountAmount || null,
      })
      .select()
      .single();

    if (insertedRow) {
      orderRow = insertedRow as OrderRow;
      break;
    }

    lastError = orderError;
    // Retry only on unique violation (order number collision)
    if (orderError?.code !== "23505") {
      break;
    }
  }

  if (!orderRow) {
    throw new Error(`Failed to create order: ${lastError?.message ?? "Unknown error"}`);
  }

  const createdRow = orderRow;

  // Insert order items
  const itemInserts = data.items.map((item) => ({
    order_id: createdRow.id,
    product_id: item.productId,
    product_name: item.productName,
    product_image: item.productImage,
    price: item.price,
    quantity: item.quantity,
  }));

  const { data: itemRows, error: itemsError } = await admin
    .from("order_items")
    .insert(itemInserts)
    .select();

  if (itemsError) {
    console.error("Failed to insert order items:", itemsError);
  }

  // NOTE: the confirmation email is intentionally NOT sent here. The order is
  // still pending_payment at this point; the email is sent by the Stripe
  // webhook once the payment succeeds (see /api/webhooks/stripe).
  return toOrder(createdRow, (itemRows as OrderItemRow[]) ?? []);
}

/**
 * Get an order by its order number
 * @param orderNumber - Human-readable order number (e.g., NU-2026-0001)
 * @returns Order if found, null otherwise
 */
export async function getOrderByNumber(
  orderNumber: string
): Promise<Order | null> {
  // Dev mock-checkout orders live in memory (no-op outside dev fixture mode)
  const devOrder = getDevOrderByNumber(orderNumber);
  if (devOrder) return devOrder;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("*, order_items(*)")
    .eq("order_number", orderNumber)
    .single();

  if (error || !data) {
    return null;
  }

  return toOrderFromJoin(data as OrderRow & { order_items?: OrderItemRow[] });
}

/**
 * Get an order by its ID
 * @param id - Order UUID
 * @returns Order if found, null otherwise
 */
export async function getOrderById(id: string): Promise<Order | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  if (error || !data) {
    return null;
  }

  return toOrderFromJoin(data as OrderRow & { order_items?: OrderItemRow[] });
}

/**
 * Get all orders
 * @returns Array of all orders, sorted by creation date (newest first)
 */
export async function getAllOrders(): Promise<Order[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching all orders:", error);
    return [];
  }

  return (data as (OrderRow & { order_items?: OrderItemRow[] })[]).map(
    toOrderFromJoin
  );
}

/**
 * Get orders by customer email
 * @param email - Customer email address
 * @returns Array of orders for this customer, sorted by creation date (newest first)
 */
export async function getOrdersByEmail(email: string): Promise<Order[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("orders")
    .select("*, order_items(*)")
    .ilike("user_email", email)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders by email:", error);
    return [];
  }

  return (data as (OrderRow & { order_items?: OrderItemRow[] })[]).map(
    toOrderFromJoin
  );
}

/**
 * Update order status
 * @param id - Order ID
 * @param status - New status
 * @returns Updated order
 */
export async function updateOrderStatus(
  id: string,
  status: Order["status"]
): Promise<Order> {
  const admin = createAdminClient();

  // Fetch current order to get previous status
  const { data: existing, error: fetchError } = await admin
    .from("orders")
    .select("*, order_items(*)")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    throw new Error(`Order with id ${id} not found`);
  }

  const previousStatus = (existing as OrderRow).status as Order["status"];
  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    status,
  };

  // Set timestamp when shipped
  if (status === "shipped" && previousStatus !== "shipped") {
    updates.shipped_at = now;
  }

  // Set timestamp when delivered
  if (status === "delivered" && previousStatus !== "delivered") {
    updates.delivered_at = now;
  }

  const { data: updated, error: updateError } = await admin
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select("*, order_items(*)")
    .single();

  if (updateError || !updated) {
    throw new Error(`Failed to update order status: ${updateError?.message ?? "Unknown error"}`);
  }

  const updatedOrder = toOrderFromJoin(
    updated as OrderRow & { order_items?: OrderItemRow[] }
  );

  // Send status-specific email notification in background (fire-and-forget)
  if (status === "shipped" && updatedOrder.trackingNumber) {
    sendShippingNotificationEmail(updatedOrder).catch((err) =>
      console.error("Failed to send shipping notification email:", err)
    );
  } else if (
    status === "confirmed" ||
    status === "processing" ||
    status === "delivered" ||
    status === "cancelled"
  ) {
    sendOrderStatusUpdateEmail(updatedOrder, status, previousStatus).catch(
      (err) =>
        console.error("Failed to send order status update email:", err)
    );
  }

  return updatedOrder;
}

/**
 * Update order tracking information
 * @param id - Order ID
 * @param trackingInfo - Tracking number, URL, and estimated delivery
 * @returns Updated order
 */
export async function updateOrderTracking(
  id: string,
  trackingInfo: {
    trackingNumber?: string;
    trackingUrl?: string;
    estimatedDelivery?: string;
  }
): Promise<Order> {
  const admin = createAdminClient();

  const updates: Record<string, unknown> = {};
  if (trackingInfo.trackingNumber !== undefined)
    updates.tracking_number = trackingInfo.trackingNumber;
  if (trackingInfo.trackingUrl !== undefined)
    updates.tracking_url = trackingInfo.trackingUrl;
  if (trackingInfo.estimatedDelivery !== undefined)
    updates.estimated_delivery = trackingInfo.estimatedDelivery;

  const { data: updated, error } = await admin
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select("*, order_items(*)")
    .single();

  if (error || !updated) {
    throw new Error(`Failed to update order tracking: ${error?.message ?? "Unknown error"}`);
  }

  return toOrderFromJoin(
    updated as OrderRow & { order_items?: OrderItemRow[] }
  );
}

/**
 * Update order with Stripe session and payment intent IDs
 * @param id - Order ID
 * @param stripeData - Stripe session ID and/or payment intent ID
 * @returns Updated order
 */
export async function updateOrderStripeData(
  id: string,
  stripeData: {
    stripeSessionId?: string;
    stripePaymentIntentId?: string;
  }
): Promise<Order> {
  const admin = createAdminClient();

  const updates: Record<string, unknown> = {};
  if (stripeData.stripeSessionId !== undefined)
    updates.stripe_session_id = stripeData.stripeSessionId;
  if (stripeData.stripePaymentIntentId !== undefined)
    updates.stripe_payment_intent_id = stripeData.stripePaymentIntentId;

  const { data: updated, error } = await admin
    .from("orders")
    .update(updates)
    .eq("id", id)
    .select("*, order_items(*)")
    .single();

  if (error || !updated) {
    throw new Error(`Failed to update order Stripe data: ${error?.message ?? "Unknown error"}`);
  }

  return toOrderFromJoin(
    updated as OrderRow & { order_items?: OrderItemRow[] }
  );
}

/**
 * Order statistics for admin dashboard
 */
export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
}

/**
 * Get order statistics
 * @returns Order counts by status
 */
export async function getOrderStats(): Promise<OrderStats> {
  const admin = createAdminClient();
  const { data, error } = await admin.from("orders").select("status");

  if (error) {
    console.error("Error fetching order stats:", error);
    return { total: 0, pending: 0, processing: 0, shipped: 0, delivered: 0 };
  }

  const rows = data as { status: string }[];
  return {
    total: rows.length,
    pending: rows.filter((r) => r.status === "pending").length,
    processing: rows.filter((r) => r.status === "processing").length,
    shipped: rows.filter((r) => r.status === "shipped").length,
    delivered: rows.filter((r) => r.status === "delivered").length,
  };
}
