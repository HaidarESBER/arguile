import { describe, it, expect } from "vitest";
import {
  calculateSubtotal,
  calculateTotalItems,
  formatCartTotal,
} from "@/types/cart";
import { Product } from "@/types/product";

function makeProduct(price: number): Product {
  return {
    id: "p1",
    slug: "test",
    name: "Test",
    description: "Test",
    shortDescription: "Test",
    price,
    images: [],
    category: "chicha",
    inStock: true,
    featured: false,
  };
}

describe("calculateSubtotal", () => {
  it("sums price * quantity for all items", () => {
    const items = [
      { product: makeProduct(1000), quantity: 2 },
      { product: makeProduct(2500), quantity: 1 },
    ];
    expect(calculateSubtotal(items)).toBe(4500);
  });

  it("returns 0 for empty cart", () => {
    expect(calculateSubtotal([])).toBe(0);
  });

  it("handles single item", () => {
    const items = [{ product: makeProduct(5999), quantity: 3 }];
    expect(calculateSubtotal(items)).toBe(17997);
  });
});

describe("calculateTotalItems", () => {
  it("sums all quantities", () => {
    const items = [
      { product: makeProduct(1000), quantity: 2 },
      { product: makeProduct(2000), quantity: 3 },
    ];
    expect(calculateTotalItems(items)).toBe(5);
  });

  it("returns 0 for empty cart", () => {
    expect(calculateTotalItems([])).toBe(0);
  });

  it("handles single item with quantity 1", () => {
    const items = [{ product: makeProduct(1000), quantity: 1 }];
    expect(calculateTotalItems(items)).toBe(1);
  });
});

describe("formatCartTotal", () => {
  it("formats cents to EUR with French locale", () => {
    const result = formatCartTotal(14997);
    expect(result).toMatch(/149[,.]97/);
    expect(result).toMatch(/EUR|€/);
  });

  it("formats zero", () => {
    const result = formatCartTotal(0);
    expect(result).toMatch(/0[,.]00/);
  });

  it("formats small amount", () => {
    const result = formatCartTotal(50);
    expect(result).toMatch(/0[,.]50/);
  });
});
