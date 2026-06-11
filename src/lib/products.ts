import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";
import { Product } from "@/types/product";
import { slugify } from "@/lib/slugify";
import { createAdminClient, logSupabaseError } from "@/lib/supabase/admin";
import {
  DEV_FIXTURE_PRODUCTS,
  devFixturesActive,
} from "@/data/dev-fixtures";

// NOTE: deliberately NOT a "use server" module. The previous module-level
// "use server" directive exposed createProduct/updateProduct/deleteProduct as
// publicly callable server actions (anyone could mutate the catalog). This
// module must only ever be imported from server code.

/**
 * Lightweight product shape for list/grid views.
 * Omits the heavy `description` and keeps only the first image so we don't
 * serialize the entire catalog (full descriptions included) to the client.
 */
export type ProductListItem = Omit<Product, "description" | "specs">;

export function toProductListItem(product: Product): ProductListItem {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    images: product.images.slice(0, 1),
    category: product.category,
    inStock: product.inStock,
    stockLevel: product.stockLevel,
    featured: product.featured,
  };
}

// ---------------------------------------------------------------------------
// Column mapping helpers: snake_case DB <-> camelCase TypeScript
// ---------------------------------------------------------------------------

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  description: string;
  short_description: string;
  price: number;
  compare_at_price: number | null;
  images: string[];
  category: string;
  in_stock: boolean;
  stock_level: number | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    shortDescription: row.short_description,
    price: row.price,
    compareAtPrice: row.compare_at_price ?? undefined,
    images: row.images,
    category: row.category as Product["category"],
    inStock: row.in_stock,
    stockLevel: row.stock_level ?? undefined,
    featured: row.featured,
  };
}

function toProductRow(product: Partial<Product>): Record<string, unknown> {
  const row: Record<string, unknown> = {};

  if (product.name !== undefined) row.name = product.name;
  if (product.description !== undefined) row.description = product.description;
  if (product.shortDescription !== undefined)
    row.short_description = product.shortDescription;
  if (product.price !== undefined) row.price = product.price;
  if (product.compareAtPrice !== undefined)
    row.compare_at_price = product.compareAtPrice;
  if (product.images !== undefined) row.images = product.images;
  if (product.category !== undefined) row.category = product.category;
  if (product.inStock !== undefined) row.in_stock = product.inStock;
  if (product.stockLevel !== undefined) row.stock_level = product.stockLevel;
  if (product.featured !== undefined) row.featured = product.featured;
  if (product.slug !== undefined) row.slug = product.slug;

  return row;
}

// ---------------------------------------------------------------------------
// Public queries (anon key via server client - RLS allows public reads)
// ---------------------------------------------------------------------------

// Read queries are wrapped in React cache() (per-request dedupe) +
// unstable_cache (cross-request data cache, tag "products", revalidate 300s).
// Admin mutations below call revalidateTag("products") to bust this cache.
const PRODUCTS_CACHE_OPTIONS: { tags: string[]; revalidate: number } = {
  tags: ["products"],
  revalidate: 300,
};

/**
 * Get all products
 * Uses admin client to avoid cookies() dependency (works in static generation)
 */
export const getAllProducts = cache(
  unstable_cache(
    async (): Promise<Product[]> => {
      if (devFixturesActive()) return DEV_FIXTURE_PRODUCTS;
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        logSupabaseError("Error fetching products:", error);
        return [];
      }

      return (data as ProductRow[]).map(toProduct);
    },
    ["products-all"],
    PRODUCTS_CACHE_OPTIONS
  )
);

/**
 * Get a product by its ID
 * Uses admin client to avoid cookies() dependency (works in static generation)
 */
export const getProductById = cache(
  unstable_cache(
    async (id: string): Promise<Product | null> => {
      if (devFixturesActive()) {
        return DEV_FIXTURE_PRODUCTS.find((p) => p.id === id) ?? null;
      }
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        logSupabaseError("Error fetching product by id:", error);
        return null;
      }

      return toProduct(data as ProductRow);
    },
    ["products-by-id"],
    PRODUCTS_CACHE_OPTIONS
  )
);

/**
 * Get a product by its slug
 * Uses admin client to avoid cookies() dependency (works in static generation)
 */
export const getProductBySlug = cache(
  unstable_cache(
    async (slug: string): Promise<Product | null> => {
      if (devFixturesActive()) {
        return DEV_FIXTURE_PRODUCTS.find((p) => p.slug === slug) ?? null;
      }
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) {
        return null;
      }

      return toProduct(data as ProductRow);
    },
    ["products-by-slug"],
    PRODUCTS_CACHE_OPTIONS
  )
);

/**
 * Get all product slugs (for static generation)
 * Uses admin client to avoid cookies() dependency (works in static generation)
 */
export const getAllProductSlugs = cache(
  unstable_cache(
    async (): Promise<string[]> => {
      if (devFixturesActive()) return DEV_FIXTURE_PRODUCTS.map((p) => p.slug);
      const supabase = createAdminClient();
      const { data, error } = await supabase.from("products").select("slug");

      if (error) {
        logSupabaseError("Error fetching product slugs:", error);
        return [];
      }

      return (data as { slug: string }[]).map((row) => row.slug);
    },
    ["products-slugs"],
    PRODUCTS_CACHE_OPTIONS
  )
);

// ---------------------------------------------------------------------------
// Admin mutations (service role key - bypasses RLS until auth in 09-03)
// ---------------------------------------------------------------------------

/**
 * Ensure a slug is unique among existing products.
 * Appends -1, -2, etc. if needed. Optionally excludes a product id (for updates).
 */
async function ensureUniqueSlug(
  slug: string,
  excludeId?: string
): Promise<string> {
  const admin = createAdminClient();
  let candidate = slug;
  let counter = 1;

  for (;;) {
    let query = admin.from("products").select("id").eq("slug", candidate);

    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data } = await query;
    if (!data || data.length === 0) break;

    candidate = `${slug}-${counter}`;
    counter++;
  }

  return candidate;
}

/**
 * Create a new product
 * Auto-generates id (via Postgres gen_random_uuid()) and slug
 */
export async function createProduct(
  data: Omit<Product, "id" | "slug">
): Promise<Product> {
  const admin = createAdminClient();
  const slug = await ensureUniqueSlug(slugify(data.name));

  const row = {
    ...toProductRow(data as Partial<Product>),
    slug,
  };

  const { data: created, error } = await admin
    .from("products")
    .insert(row)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create product: ${error.message}`);
  }

  return toProduct(created as ProductRow);
}

/**
 * Update an existing product
 */
export async function updateProduct(
  id: string,
  data: Partial<Product>
): Promise<Product> {
  const admin = createAdminClient();

  // Check product exists and get current name for slug comparison
  const { data: existing, error: fetchError } = await admin
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (fetchError || !existing) {
    throw new Error(`Product with id ${id} not found`);
  }

  const row = toProductRow(data);

  // If name changed, regenerate slug
  if (data.name && data.name !== (existing as ProductRow).name) {
    row.slug = await ensureUniqueSlug(slugify(data.name), id);
  }

  const { data: updated, error } = await admin
    .from("products")
    .update(row)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update product: ${error.message}`);
  }

  return toProduct(updated as ProductRow);
}

/**
 * Delete a product by ID
 */
export async function deleteProduct(id: string): Promise<void> {
  const admin = createAdminClient();

  const { error } = await admin.from("products").delete().eq("id", id);

  if (error) {
    throw new Error(`Failed to delete product: ${error.message}`);
  }
}

/**
 * Get product statistics for admin dashboard
 */
export async function getProductStats(): Promise<{
  total: number;
  featured: number;
  outOfStock: number;
}> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .select("featured, in_stock");

  if (error) {
    logSupabaseError("Error fetching product stats:", error);
    return { total: 0, featured: 0, outOfStock: 0 };
  }

  const rows = data as { featured: boolean; in_stock: boolean }[];
  return {
    total: rows.length,
    featured: rows.filter((r) => r.featured).length,
    outOfStock: rows.filter((r) => !r.in_stock).length,
  };
}
