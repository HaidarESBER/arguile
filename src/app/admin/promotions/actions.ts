"use server";

import { requireAdmin } from "@/lib/session";

import { revalidatePath } from "next/cache";
import {
  createPromotion,
  updatePromotion,
  deletePromotion,
} from "@/lib/promotions";
import { DiscountType } from "@/types/promotion";

const PROMOTIONS_PATH = "/admin/promotions";

/**
 * Create a new promotion from form data.
 */
export async function createPromotionAction(formData: FormData) {
  await requireAdmin();
  const code = (formData.get("code") as string)?.trim().toUpperCase();
  const description = (formData.get("description") as string)?.trim() || null;
  const discountType = formData.get("discountType") as DiscountType;
  const discountValueRaw = formData.get("discountValue") as string;
  const minimumOrderRaw = formData.get("minimumOrder") as string;
  const maxUsesRaw = formData.get("maxUses") as string;
  const startsAt = (formData.get("startsAt") as string) || undefined;
  const expiresAt = (formData.get("expiresAt") as string) || null;

  if (!code || !discountType || !discountValueRaw) {
    return { error: "Code, type et valeur sont requis" };
  }

  const discountValue =
    discountType === "percentage"
      ? parseInt(discountValueRaw, 10)
      : Math.round(parseFloat(discountValueRaw) * 100); // Convert euros to cents

  const minimumOrder = minimumOrderRaw
    ? Math.round(parseFloat(minimumOrderRaw) * 100)
    : 0;

  const maxUses = maxUsesRaw ? parseInt(maxUsesRaw, 10) : null;

  try {
    await createPromotion({
      code,
      description,
      discountType,
      discountValue,
      minimumOrder,
      maxUses,
      startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    });
    revalidatePath(PROMOTIONS_PATH);
    return { success: true };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

/**
 * Update an existing promotion from form data.
 */
export async function updatePromotionAction(id: string, formData: FormData) {
  await requireAdmin();
  const code = (formData.get("code") as string)?.trim().toUpperCase();
  const description = (formData.get("description") as string)?.trim() || null;
  const discountType = formData.get("discountType") as DiscountType;
  const discountValueRaw = formData.get("discountValue") as string;
  const minimumOrderRaw = formData.get("minimumOrder") as string;
  const maxUsesRaw = formData.get("maxUses") as string;
  const startsAt = (formData.get("startsAt") as string) || undefined;
  const expiresAt = (formData.get("expiresAt") as string) || null;

  if (!code || !discountType || !discountValueRaw) {
    return { error: "Code, type et valeur sont requis" };
  }

  const discountValue =
    discountType === "percentage"
      ? parseInt(discountValueRaw, 10)
      : Math.round(parseFloat(discountValueRaw) * 100);

  const minimumOrder = minimumOrderRaw
    ? Math.round(parseFloat(minimumOrderRaw) * 100)
    : 0;

  const maxUses = maxUsesRaw ? parseInt(maxUsesRaw, 10) : null;

  try {
    await updatePromotion(id, {
      code,
      description,
      discountType,
      discountValue,
      minimumOrder,
      maxUses,
      startsAt: startsAt ? new Date(startsAt).toISOString() : undefined,
      expiresAt: expiresAt ? new Date(expiresAt).toISOString() : null,
    });
    revalidatePath(PROMOTIONS_PATH);
    return { success: true };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

/**
 * Toggle a promotion's active status.
 */
export async function togglePromotionAction(id: string, isActive: boolean) {
  await requireAdmin();
  try {
    await updatePromotion(id, { isActive });
    revalidatePath(PROMOTIONS_PATH);
    return { success: true };
  } catch (err) {
    return { error: (err as Error).message };
  }
}

/**
 * Delete a promotion.
 */
export async function deletePromotionAction(id: string) {
  await requireAdmin();
  try {
    await deletePromotion(id);
    revalidatePath(PROMOTIONS_PATH);
    return { success: true };
  } catch (err) {
    return { error: (err as Error).message };
  }
}
