import { describe, it, expect } from "vitest";
import { formatPrice } from "@/types/product";

describe("formatPrice", () => {
  it("formats cents to EUR with French locale", () => {
    const result = formatPrice(4999);
    // French locale uses comma as decimal separator
    // The exact format may vary by environment, but should contain 49,99 and EUR
    expect(result).toMatch(/49[,.]99/);
    expect(result).toMatch(/EUR|€/);
  });

  it("formats zero cents", () => {
    const result = formatPrice(0);
    expect(result).toMatch(/0[,.]00/);
  });

  it("formats whole euros (no cents remainder)", () => {
    const result = formatPrice(5000);
    expect(result).toMatch(/50[,.]00/);
  });

  it("formats small amounts", () => {
    const result = formatPrice(99);
    expect(result).toMatch(/0[,.]99/);
  });

  it("formats large amounts", () => {
    const result = formatPrice(99999);
    expect(result).toMatch(/999[,.]99/);
  });
});
