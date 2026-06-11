"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/session";
import { updateOrderStatus } from "@/lib/orders";
import { Order } from "@/types/order";

const COMMANDES_PATH = "/admin/commandes";

/**
 * Update an order's status (admin only).
 * Guarded Server Action wrapping the server-only data layer in @/lib/orders.
 */
export async function updateOrderStatusAction(
  id: string,
  status: Order["status"]
): Promise<void> {
  await requireAdmin();
  await updateOrderStatus(id, status);
  revalidatePath(COMMANDES_PATH);
}
