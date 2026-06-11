import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted so mock variable is available when vi.mock factory runs
const { mockFrom } = vi.hoisted(() => {
  return { mockFrom: vi.fn() };
});

// Mock Supabase admin client
vi.mock("@/lib/supabase/admin", () => ({
  createAdminClient: () => ({ from: mockFrom }),
}));

// Mock email module
vi.mock("@/lib/email", () => ({
  sendOrderConfirmationEmail: vi.fn().mockResolvedValue(undefined),
  sendShippingNotificationEmail: vi.fn().mockResolvedValue(undefined),
  sendOrderStatusUpdateEmail: vi.fn().mockResolvedValue(undefined),
}));

import {
  createOrder,
  getOrderByNumber,
  getOrderById,
  getAllOrders,
  getOrdersByEmail,
  updateOrderStatus,
  getOrderStats,
} from "@/lib/orders";

const baseShippingAddress = {
  firstName: "Jean",
  lastName: "Dupont",
  email: "jean@example.com",
  phone: "+33612345678",
  address: "1 rue de la Paix",
  city: "Paris",
  postalCode: "75001",
  country: "France",
};

const sampleOrderRow1 = {
  id: "order-1",
  order_number: "NU-2026-0001",
  user_email: "jean@example.com",
  subtotal: 4999,
  shipping: 590,
  total: 5589,
  status: "pending",
  shipping_address: baseShippingAddress,
  notes: null,
  discount_code: null,
  discount_amount: null,
  tracking_number: null,
  tracking_url: null,
  estimated_delivery: null,
  stripe_session_id: null,
  stripe_payment_intent_id: null,
  shipped_at: null,
  delivered_at: null,
  created_at: "2026-02-01T10:00:00Z",
  updated_at: "2026-02-01T10:00:00Z",
  order_items: [
    {
      id: "item-1",
      order_id: "order-1",
      product_id: "1",
      product_name: "Chicha Crystal",
      product_image: "/img.jpg",
      price: 4999,
      quantity: 1,
    },
  ],
};

const sampleOrderRow2 = {
  id: "order-2",
  order_number: "NU-2026-0002",
  user_email: "marie@example.com",
  subtotal: 3998,
  shipping: 590,
  total: 4588,
  status: "shipped",
  shipping_address: {
    firstName: "Marie",
    lastName: "Martin",
    email: "marie@example.com",
    phone: "+33698765432",
    address: "2 avenue des Champs",
    city: "Lyon",
    postalCode: "69001",
    country: "France",
  },
  notes: null,
  discount_code: null,
  discount_amount: null,
  tracking_number: "TRACK123",
  tracking_url: null,
  estimated_delivery: null,
  stripe_session_id: null,
  stripe_payment_intent_id: null,
  shipped_at: null,
  delivered_at: null,
  created_at: "2026-02-05T14:00:00Z",
  updated_at: "2026-02-06T09:00:00Z",
  order_items: [
    {
      id: "item-2",
      order_id: "order-2",
      product_id: "2",
      product_name: "Bol",
      product_image: "/img2.jpg",
      price: 1999,
      quantity: 2,
    },
  ],
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createOrder", () => {
  it("creates an order with generated id and order number", async () => {
    const data = {
      items: [
        {
          productId: "1",
          productName: "Test",
          productImage: "/img.jpg",
          price: 1000,
          quantity: 1,
        },
      ],
      subtotal: 1000,
      shipping: 590,
      total: 1590,
      shippingAddress: {
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        phone: "+33612345678",
        address: "1 test street",
        city: "Paris",
        postalCode: "75001",
        country: "France",
      },
    };

    // 1. generateNextOrderNumber: from("orders").select().like().order().limit()
    const numberChain = {
      select: vi.fn().mockReturnThis(),
      like: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [{ order_number: "NU-2026-0002" }],
        error: null,
      }),
    };

    // 2. insert order: from("orders").insert().select().single()
    const createdRow = {
      id: "new-order-id",
      order_number: "NU-2026-0003",
      user_email: "test@example.com",
      subtotal: 1000,
      shipping: 590,
      total: 1590,
      status: "pending",
      shipping_address: data.shippingAddress,
      notes: null,
      discount_code: null,
      discount_amount: null,
      tracking_number: null,
      tracking_url: null,
      estimated_delivery: null,
      stripe_session_id: null,
      stripe_payment_intent_id: null,
      shipped_at: null,
      delivered_at: null,
      created_at: "2026-02-10T00:00:00Z",
      updated_at: "2026-02-10T00:00:00Z",
    };
    const insertChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: createdRow, error: null }),
    };

    // 3. insert items: from("order_items").insert().select()
    const itemsChain = {
      insert: vi.fn().mockReturnThis(),
      select: vi.fn().mockResolvedValue({
        data: [
          {
            id: "item-new",
            order_id: "new-order-id",
            product_id: "1",
            product_name: "Test",
            product_image: "/img.jpg",
            price: 1000,
            quantity: 1,
          },
        ],
        error: null,
      }),
    };

    mockFrom
      .mockReturnValueOnce(numberChain)
      .mockReturnValueOnce(insertChain)
      .mockReturnValueOnce(itemsChain);

    const order = await createOrder(data);
    expect(order.id).toBe("new-order-id");
    expect(order.orderNumber).toBe("NU-2026-0003");
    expect(order.status).toBe("pending");
  });
});

describe("getOrderByNumber", () => {
  it("returns order when found", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: sampleOrderRow1, error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const order = await getOrderByNumber("NU-2026-0001");
    expect(order).not.toBeNull();
    expect(order!.id).toBe("order-1");
  });

  it("returns null when not found", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
    };
    mockFrom.mockReturnValue(chain);

    const order = await getOrderByNumber("NU-2026-9999");
    expect(order).toBeNull();
  });
});

describe("getOrderById", () => {
  it("returns order when found", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: sampleOrderRow1, error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const order = await getOrderById("order-1");
    expect(order).not.toBeNull();
    expect(order!.orderNumber).toBe("NU-2026-0001");
  });

  it("returns null when not found", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
    };
    mockFrom.mockReturnValue(chain);

    const order = await getOrderById("nonexistent");
    expect(order).toBeNull();
  });
});

describe("getAllOrders", () => {
  it("returns all orders sorted newest first", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [sampleOrderRow2, sampleOrderRow1],
        error: null,
      }),
    };
    mockFrom.mockReturnValue(chain);

    const orders = await getAllOrders();
    expect(orders).toHaveLength(2);
    expect(orders[0].id).toBe("order-2");
    expect(orders[1].id).toBe("order-1");
  });
});

describe("getOrdersByEmail", () => {
  it("returns orders matching email (case-insensitive via ilike)", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [sampleOrderRow1],
        error: null,
      }),
    };
    mockFrom.mockReturnValue(chain);

    const orders = await getOrdersByEmail("JEAN@example.com");
    expect(orders).toHaveLength(1);
    expect(orders[0].id).toBe("order-1");
  });

  it("returns empty array when no orders match", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      ilike: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const orders = await getOrdersByEmail("nobody@example.com");
    expect(orders).toEqual([]);
  });
});

describe("updateOrderStatus", () => {
  it("updates order status", async () => {
    // Fetch existing order
    const fetchChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: sampleOrderRow1, error: null }),
    };

    // Update order
    const updatedRow = { ...sampleOrderRow1, status: "processing" };
    const updateChain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: updatedRow, error: null }),
    };

    mockFrom
      .mockReturnValueOnce(fetchChain)
      .mockReturnValueOnce(updateChain);

    const updated = await updateOrderStatus("order-1", "processing");
    expect(updated.status).toBe("processing");
  });

  it("sets shippedAt timestamp when shipping", async () => {
    const fetchChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: sampleOrderRow1, error: null }),
    };

    const updatedRow = {
      ...sampleOrderRow1,
      status: "shipped",
      shipped_at: "2026-02-10T12:00:00Z",
    };
    const updateChain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: updatedRow, error: null }),
    };

    mockFrom
      .mockReturnValueOnce(fetchChain)
      .mockReturnValueOnce(updateChain);

    const updated = await updateOrderStatus("order-1", "shipped");
    expect(updated.shippedAt).toBeTruthy();
  });

  it("sets deliveredAt timestamp when delivered", async () => {
    const fetchChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: sampleOrderRow1, error: null }),
    };

    const updatedRow = {
      ...sampleOrderRow1,
      status: "delivered",
      delivered_at: "2026-02-10T12:00:00Z",
    };
    const updateChain = {
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: updatedRow, error: null }),
    };

    mockFrom
      .mockReturnValueOnce(fetchChain)
      .mockReturnValueOnce(updateChain);

    const updated = await updateOrderStatus("order-1", "delivered");
    expect(updated.deliveredAt).toBeTruthy();
  });

  it("throws when order not found", async () => {
    const fetchChain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
    };
    mockFrom.mockReturnValue(fetchChain);

    await expect(
      updateOrderStatus("nonexistent", "processing")
    ).rejects.toThrow("not found");
  });
});

describe("getOrderStats", () => {
  it("returns correct counts by status", async () => {
    const chain = {
      select: vi.fn().mockResolvedValue({
        data: [{ status: "pending" }, { status: "shipped" }],
        error: null,
      }),
    };
    mockFrom.mockReturnValue(chain);

    const stats = await getOrderStats();
    expect(stats.total).toBe(2);
    expect(stats.pending).toBe(1);
    expect(stats.shipped).toBe(1);
    expect(stats.processing).toBe(0);
    expect(stats.delivered).toBe(0);
  });

  it("returns zeros for empty list", async () => {
    const chain = {
      select: vi.fn().mockResolvedValue({ data: [], error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const stats = await getOrderStats();
    expect(stats.total).toBe(0);
    expect(stats.pending).toBe(0);
  });
});
