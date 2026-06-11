import { describe, it, expect, vi, beforeEach } from "vitest";

// Use vi.hoisted so the mock variable is available when vi.mock factory runs
const { mockFrom } = vi.hoisted(() => {
  return { mockFrom: vi.fn() };
});

// Mock Supabase server client
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn().mockResolvedValue({ from: mockFrom }),
}));

import { getUserById, getUserByEmail } from "@/lib/users";

const sampleProfile = {
  id: "user-1",
  email: "existing@example.com",
  first_name: "Jean",
  last_name: "Dupont",
  is_admin: false,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getUserById", () => {
  it("returns session for existing user", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: sampleProfile, error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const session = await getUserById("user-1");
    expect(session).not.toBeNull();
    expect(session!.email).toBe("existing@example.com");
    expect(session!.firstName).toBe("Jean");
    expect(session!.lastName).toBe("Dupont");
  });

  it("returns null for non-existent user", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
    };
    mockFrom.mockReturnValue(chain);

    const session = await getUserById("nonexistent");
    expect(session).toBeNull();
  });

  it("returns isAdmin flag from profile", async () => {
    const adminProfile = { ...sampleProfile, is_admin: true };
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: adminProfile, error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const session = await getUserById("user-1");
    expect(session!.isAdmin).toBe(true);
  });
});

describe("getUserByEmail", () => {
  it("returns session for existing email", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: sampleProfile, error: null }),
    };
    mockFrom.mockReturnValue(chain);

    const session = await getUserByEmail("existing@example.com");
    expect(session).not.toBeNull();
    expect(session!.firstName).toBe("Jean");
  });

  it("returns null for non-existent email", async () => {
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: { code: "PGRST116" } }),
    };
    mockFrom.mockReturnValue(chain);

    const session = await getUserByEmail("nobody@example.com");
    expect(session).toBeNull();
  });

  it("queries with lowercased and trimmed email", async () => {
    const eqMock = vi.fn().mockReturnThis();
    const chain = {
      select: vi.fn().mockReturnThis(),
      eq: eqMock,
      single: vi.fn().mockResolvedValue({ data: sampleProfile, error: null }),
    };
    mockFrom.mockReturnValue(chain);

    await getUserByEmail("  TEST@Example.COM  ");
    expect(eqMock).toHaveBeenCalledWith("email", "test@example.com");
  });
});
