import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { anonymizeName, formatRelativeDate } from "@/data/reviews";

// The mock seed reviews (and their getProductReviews/getProductRatingStats
// helpers) were removed — real review data comes from Supabase via
// src/lib/reviews.ts. Only the pure display helpers remain here.

describe("anonymizeName", () => {
  it("masks the middle of each name part", () => {
    expect(anonymizeName("Marie D.")).toBe("M***e D.");
  });

  it("keeps short parts as-is", () => {
    expect(anonymizeName("Al B.")).toBe("Al B.");
  });
});

describe("formatRelativeDate", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 'Aujourd'hui' for today", () => {
    vi.setSystemTime(new Date("2026-02-11T12:00:00Z"));
    expect(formatRelativeDate("2026-02-11T10:00:00Z")).toBe("Aujourd'hui");
  });

  it("returns 'Hier' for yesterday", () => {
    vi.setSystemTime(new Date("2026-02-11T12:00:00Z"));
    expect(formatRelativeDate("2026-02-10T10:00:00Z")).toBe("Hier");
  });

  it("returns 'Il y a X jours' for 2-6 days ago", () => {
    vi.setSystemTime(new Date("2026-02-11T12:00:00Z"));
    expect(formatRelativeDate("2026-02-08T10:00:00Z")).toBe("Il y a 3 jours");
  });

  it("returns 'Il y a 1 semaine' for 7 days", () => {
    vi.setSystemTime(new Date("2026-02-11T12:00:00Z"));
    expect(formatRelativeDate("2026-02-04T10:00:00Z")).toBe("Il y a 1 semaine");
  });

  it("returns 'Il y a X semaines' for 2+ weeks (pluralized)", () => {
    vi.setSystemTime(new Date("2026-02-11T12:00:00Z"));
    expect(formatRelativeDate("2026-01-25T10:00:00Z")).toBe("Il y a 2 semaines");
  });

  it("returns 'Il y a 1 mois' for ~30 days", () => {
    vi.setSystemTime(new Date("2026-02-11T12:00:00Z"));
    expect(formatRelativeDate("2026-01-10T10:00:00Z")).toBe("Il y a 1 mois");
  });

  it("returns 'Il y a X mois' for several months", () => {
    vi.setSystemTime(new Date("2026-06-15T12:00:00Z"));
    expect(formatRelativeDate("2026-02-11T10:00:00Z")).toBe("Il y a 4 mois");
  });

  it("returns 'Il y a 1 an' for ~365 days", () => {
    vi.setSystemTime(new Date("2027-02-15T12:00:00Z"));
    expect(formatRelativeDate("2026-02-11T10:00:00Z")).toBe("Il y a 1 an");
  });

  it("returns 'Il y a X ans' for multiple years (pluralized)", () => {
    vi.setSystemTime(new Date("2028-06-15T12:00:00Z"));
    expect(formatRelativeDate("2026-02-11T10:00:00Z")).toBe("Il y a 2 ans");
  });
});
