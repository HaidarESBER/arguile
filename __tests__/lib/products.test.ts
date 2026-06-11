import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Supabase admin client
const mockFrom = vi.fn();
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

import {
  getAllProducts,
  getProductById,
  getProductBySlug,
  getAllProductSlugs,
  deleteProduct,
  getProductStats,
} from "@/lib/products";

const sampleRows = [
  {
    id: "1",
    slug: "chicha-crystal",
    name: "Chicha Crystal",
    description: "A crystal chicha",
    short_description: "Crystal",
    price: 4999,
    compare_at_price: null,
    images: ["/img1.jpg"],
    category: "chicha",
    in_stock: true,
    stock_level: null,
    featured: true,
    created_at: "2026-01-01",
    updated_at: "2026-01-01",
  },
  {
    id: "2",
    slug: "bol-ceramique",
    name: "Bol Céramique",
    description: "A ceramic bowl",
    short_description: "Bowl",
    price: 1999,
    compare_at_price: null,
    images: ["/img2.jpg"],
    category: "bol",
    in_stock: false,
    stock_level: null,
    featured: false,
    created_at: "2026-01-02",
    updated_at: "2026-01-02",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getAllProducts", () => {
  it("returns all products mapped to Product type", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: sampleRows, error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const products = await getAllProducts();
    expect(products).toHaveLength(2);
    expect(products[0].name).toBe("Chicha Crystal");
    expect(products[0].shortDescription).toBe("Crystal");
    expect(products[0].inStock).toBe(true);
  });

  it("returns empty array on error", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: null, error: { message: "fail" } }),
    };
    mockFrom.mockReturnValue(chain);

    const products = await getAllProducts();
    expect(products).toEqual([]);
  });
});

describe("getProductById", () => {
  it("returns product when found", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: sampleRows[0], error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const product = await getProductById("1");
    expect(product).not.toBeNull();
    expect(product!.name).toBe("Chicha Crystal");
  });

  it("returns null on error", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { message: "not found" } }),
    };
    mockFrom.mockReturnValue(chain);

    const product = await getProductById("nonexistent");
    expect(product).toBeNull();
  });
});

describe("getProductBySlug", () => {
  it("returns product when found", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: sampleRows[0], error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const product = await getProductBySlug("chicha-crystal");
    expect(product).not.toBeNull();
    expect(product!.id).toBe("1");
  });

  it("returns null when not found", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
    };
    mockFrom.mockReturnValue(chain);

    const product = await getProductBySlug("nonexistent");
    expect(product).toBeNull();
  });
});

describe("getAllProductSlugs", () => {
  it("returns all slugs", async () => {
    const chain = {
      select: vi.fn().mockResolvedValue({
        data: [{ slug: "chicha-crystal" }, { slug: "bol-ceramique" }],
        error: null,
      }),
    };
    mockFrom.mockReturnValue(chain);

    const slugs = await getAllProductSlugs();
    expect(slugs).toEqual(["chicha-crystal", "bol-ceramique"]);
  });
});

describe("deleteProduct", () => {
  it("deletes product without error", async () => {
    const chain = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
    };
    mockFrom.mockReturnValue(chain);

    await expect(deleteProduct("1")).resolves.toBeUndefined();
  });

  it("throws when delete fails", async () => {
    const chain = {
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: { message: "delete failed" } }),
    };
    mockFrom.mockReturnValue(chain);

    await expect(deleteProduct("1")).rejects.toThrow("delete failed");
  });
});

describe("getProductStats", () => {
  it("returns correct statistics", async () => {
    const chain = {
      select: vi.fn().mockResolvedValue({
        data: [
          { featured: true, in_stock: true },
          { featured: false, in_stock: false },
        ],
        error: null,
      }),
    };
    mockFrom.mockReturnValue(chain);

    const stats = await getProductStats();
    expect(stats.total).toBe(2);
    expect(stats.featured).toBe(1);
    expect(stats.outOfStock).toBe(1);
  });

  it("returns zeros on error", async () => {
    const chain = {
      select: vi.fn().mockResolvedValue({ data: null, error: { message: "fail" } }),
    };
    mockFrom.mockReturnValue(chain);

    const stats = await getProductStats();
    expect(stats.total).toBe(0);
    expect(stats.featured).toBe(0);
    expect(stats.outOfStock).toBe(0);
  });
});
