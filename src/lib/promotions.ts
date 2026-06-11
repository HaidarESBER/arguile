import "server-only";
import { Promotion, CreatePromotionData } from "@/types/promotion";
import { createAdminClient } from "@/lib/supabase/admin";

// Server-only data layer: uses the Supabase service-role client and performs
// no auth checks. It must NEVER be imported from a client component (that
// would compile its exports into publicly reachable Server Actions).
// Client components must go through guarded actions or API routes.

// ---------------------------------------------------------------------------
// Column mapping helpers: snake_case DB <-> camelCase TypeScript
// ---------------------------------------------------------------------------

interface PromotionRow {
  id: string;
  code: string;
  description: string | null;
  discount_type: string;
  discount_value: number;
  minimum_order: number;
  max_uses: number | null;
  current_uses: number;
  starts_at: string;
  expires_at: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function toPromotion(row: PromotionRow): Promotion {
  return {
    id: row.id,
    code: row.code,
    description: row.description,
    discountType: row.discount_type as Promotion["discountType"],
    discountValue: row.discount_value,
    minimumOrder: row.minimum_order,
    maxUses: row.max_uses,
    currentUses: row.current_uses,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ---------------------------------------------------------------------------
// CRUD Operations
// ---------------------------------------------------------------------------

/**
 * Fetch all promotions, ordered by created_at desc.
 */
export async function getPromotions(): Promise<Promotion[]> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("promotions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching promotions:", error);
    return [];
  }

  return (data as PromotionRow[]).map(toPromotion);
}

/**
 * Fetch a single promotion by its uppercase code.
 */
export async function getPromotionByCode(
  code: string
): Promise<Promotion | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("promotions")
    .select("*")
    .eq("code", code.toUpperCase())
    .single();

  if (error || !data) {
    return null;
  }

  return toPromotion(data as PromotionRow);
}

/**
 * Create a new promotion.
 */
export async function createPromotion(
  input: CreatePromotionData
): Promise<Promotion> {
  const admin = createAdminClient();

  const { data, error } = await admin
    .from("promotions")
    .insert({
      code: input.code.toUpperCase(),
      description: input.description ?? null,
      discount_type: input.discountType,
      discount_value: input.discountValue,
      minimum_order: input.minimumOrder ?? 0,
      max_uses: input.maxUses ?? null,
      starts_at: input.startsAt ?? new Date().toISOString(),
      expires_at: input.expiresAt ?? null,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error(
      `Failed to create promotion: ${error?.message ?? "Unknown error"}`
    );
  }

  return toPromotion(data as PromotionRow);
}

/**
 * Update an existing promotion.
 */
export async function updatePromotion(
  id: string,
  input: Partial<CreatePromotionData> & { isActive?: boolean }
): Promise<Promotion> {
  const admin = createAdminClient();

  const updates: Record<string, unknown> = {};
  if (input.code !== undefined) updates.code = input.code.toUpperCase();
  if (input.description !== undefined) updates.description = input.description;
  if (input.discountType !== undefined)
    updates.discount_type = input.discountType;
  if (input.discountValue !== undefined)
    updates.discount_value = input.discountValue;
  if (input.minimumOrder !== undefined)
    updates.minimum_order = input.minimumOrder;
  if (input.maxUses !== undefined) updates.max_uses = input.maxUses;
  if (input.startsAt !== undefined) updates.starts_at = input.startsAt;
  if (input.expiresAt !== undefined) updates.expires_at = input.expiresAt;
  if (input.isActive !== undefined) updates.is_active = input.isActive;

  const { data, error } = await admin
    .from("promotions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    throw new Error(
      `Failed to update promotion: ${error?.message ?? "Unknown error"}`
    );
  }

  return toPromotion(data as PromotionRow);
}

/**
 * Delete a promotion by ID.
 */
export async function deletePromotion(id: string): Promise<void> {
  const admin = createAdminClient();

  const { error } = await admin.from("promotions").delete().eq("id", id);

  if (error) {
    throw new Error(
      `Failed to delete promotion: ${error.message}`
    );
  }
}

/**
 * Increment the current_uses counter by 1.
 * Atomic: uses the increment_promotion_uses SQL function
 * (see supabase/migrations/checkout_stock_and_promotions.sql).
 */
export async function incrementPromotionUses(id: string): Promise<void> {
  const admin = createAdminClient();

  const { error } = await admin.rpc("increment_promotion_uses", {
    promotion_id: id,
  });

  if (error) {
    throw new Error(`Failed to increment promotion uses: ${error.message}`);
  }
}

/**
 * Validate a promotion code against the current cart subtotal.
 * Checks: is_active, date range, usage limits, minimum order.
 *
 * @param code - The promotion code (case-insensitive)
 * @param subtotalCents - Cart subtotal in cents
 * @returns Validation result with the promotion if valid
 */
export async function validatePromotion(
  code: string,
  subtotalCents: number
): Promise<{
  valid: boolean;
  promotion?: Promotion;
  error?: string;
}> {
  const promotion = await getPromotionByCode(code);

  if (!promotion) {
    return { valid: false, error: "Code promo introuvable" };
  }

  if (!promotion.isActive) {
    return { valid: false, error: "Ce code promo n'est plus actif" };
  }

  const now = new Date();
  const startsAt = new Date(promotion.startsAt);
  if (now < startsAt) {
    return { valid: false, error: "Ce code promo n'est pas encore actif" };
  }

  if (promotion.expiresAt) {
    const expiresAt = new Date(promotion.expiresAt);
    if (now > expiresAt) {
      return { valid: false, error: "Ce code promo a expire" };
    }
  }

  if (
    promotion.maxUses !== null &&
    promotion.currentUses >= promotion.maxUses
  ) {
    return {
      valid: false,
      error: "Ce code promo a atteint le nombre maximum d'utilisations",
    };
  }

  if (subtotalCents < promotion.minimumOrder) {
    const minEuros = (promotion.minimumOrder / 100).toLocaleString("fr-FR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    return {
      valid: false,
      error: `Commande minimum de ${minEuros} \u20AC requise`,
    };
  }

  return { valid: true, promotion };
}
