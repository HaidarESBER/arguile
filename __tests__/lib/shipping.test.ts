import { describe, it, expect } from "vitest";
import {
  calculateShippingCost,
  formatShippingPrice,
  shouldShowCustomsWarning,
  getCustomsWarningMessage,
} from "@/lib/shipping";

describe("calculateShippingCost", () => {
  it("returns correct standard rate for france", () => {
    const rate = calculateShippingCost("france", "standard");
    expect(rate.cost).toBe(590);
    expect(rate.currency).toBe("EUR");
    expect(rate.carrier).toBe("Colissimo Suivi");
  });

  it("returns correct express rate for france", () => {
    const rate = calculateShippingCost("france", "express");
    expect(rate.cost).toBe(990);
    expect(rate.carrier).toBe("Chronopost");
  });

  it("returns correct standard rate for eu-schengen", () => {
    const rate = calculateShippingCost("eu-schengen", "standard");
    expect(rate.cost).toBe(890);
    expect(rate.carrier).toBe("Colissimo International");
  });

  it("returns correct express rate for eu-schengen", () => {
    const rate = calculateShippingCost("eu-schengen", "express");
    expect(rate.cost).toBe(1590);
    expect(rate.carrier).toBe("Chronopost International");
  });

  it("returns correct standard rate for eu-non-schengen", () => {
    const rate = calculateShippingCost("eu-non-schengen", "standard");
    expect(rate.cost).toBe(1190);
  });

  it("returns correct express rate for eu-non-schengen", () => {
    const rate = calculateShippingCost("eu-non-schengen", "express");
    expect(rate.cost).toBe(1590);
  });

  it("returns correct standard rate for non-eu", () => {
    const rate = calculateShippingCost("non-eu", "standard");
    expect(rate.cost).toBe(1490);
  });

  it("returns correct express rate for non-eu", () => {
    const rate = calculateShippingCost("non-eu", "express");
    expect(rate.cost).toBe(1990);
  });

  it("defaults to standard when no method specified", () => {
    const rate = calculateShippingCost("france");
    expect(rate.cost).toBe(590);
  });
});

describe("formatShippingPrice", () => {
  it("formats cents to euros with two decimals", () => {
    expect(formatShippingPrice(590)).toBe("€5.90");
  });

  it("formats zero correctly", () => {
    expect(formatShippingPrice(0)).toBe("€0.00");
  });

  it("formats large amounts", () => {
    expect(formatShippingPrice(1990)).toBe("€19.90");
  });
});

describe("shouldShowCustomsWarning", () => {
  it("returns true for non-eu region above threshold", () => {
    expect(shouldShowCustomsWarning("non-eu", 20001)).toBe(true);
  });

  it("returns false for non-eu region at exactly threshold", () => {
    expect(shouldShowCustomsWarning("non-eu", 20000)).toBe(false);
  });

  it("returns false for non-eu region below threshold", () => {
    expect(shouldShowCustomsWarning("non-eu", 19999)).toBe(false);
  });

  it("returns false for france even above threshold", () => {
    expect(shouldShowCustomsWarning("france", 30000)).toBe(false);
  });

  it("returns false for eu-schengen even above threshold", () => {
    expect(shouldShowCustomsWarning("eu-schengen", 30000)).toBe(false);
  });

  it("returns false for eu-non-schengen even above threshold", () => {
    expect(shouldShowCustomsWarning("eu-non-schengen", 30000)).toBe(false);
  });
});

describe("getCustomsWarningMessage", () => {
  it("returns a non-empty French warning message", () => {
    const msg = getCustomsWarningMessage();
    expect(msg).toContain("douane");
    expect(msg.length).toBeGreaterThan(0);
  });
});
