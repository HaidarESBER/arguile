import { describe, it, expect } from "vitest";
import { generateOrderNumber, calculateLineTotal } from "@/types/order";

describe("generateOrderNumber", () => {
  it("generates first order number for empty list", () => {
    const result = generateOrderNumber([]);
    const year = new Date().getFullYear();
    expect(result).toBe(`NU-${year}-0001`);
  });

  it("increments from existing order numbers", () => {
    const year = new Date().getFullYear();
    const existing = [`NU-${year}-0001`, `NU-${year}-0002`];
    const result = generateOrderNumber(existing);
    expect(result).toBe(`NU-${year}-0003`);
  });

  it("finds highest number even if unordered", () => {
    const year = new Date().getFullYear();
    const existing = [`NU-${year}-0005`, `NU-${year}-0002`, `NU-${year}-0010`];
    const result = generateOrderNumber(existing);
    expect(result).toBe(`NU-${year}-0011`);
  });

  it("ignores order numbers from other years", () => {
    const year = new Date().getFullYear();
    const existing = [`NU-2020-0050`, `NU-${year}-0003`];
    const result = generateOrderNumber(existing);
    expect(result).toBe(`NU-${year}-0004`);
  });

  it("pads number to 4 digits", () => {
    const result = generateOrderNumber([]);
    expect(result).toMatch(/NU-\d{4}-\d{4}$/);
  });

  it("handles numbers beyond 4 digits", () => {
    const year = new Date().getFullYear();
    const existing = [`NU-${year}-9999`];
    const result = generateOrderNumber(existing);
    expect(result).toBe(`NU-${year}-10000`);
  });
});

describe("calculateLineTotal", () => {
  it("multiplies price by quantity", () => {
    const item = {
      productId: "1",
      productName: "Test",
      productImage: "/img.jpg",
      price: 2500,
      quantity: 3,
    };
    expect(calculateLineTotal(item)).toBe(7500);
  });

  it("returns price for quantity of 1", () => {
    const item = {
      productId: "1",
      productName: "Test",
      productImage: "/img.jpg",
      price: 1000,
      quantity: 1,
    };
    expect(calculateLineTotal(item)).toBe(1000);
  });

  it("returns 0 for quantity of 0", () => {
    const item = {
      productId: "1",
      productName: "Test",
      productImage: "/img.jpg",
      price: 5000,
      quantity: 0,
    };
    expect(calculateLineTotal(item)).toBe(0);
  });
});
