import { describe, it, expect } from "vitest";
import { isValidEmail, isValidFrenchPostalCode, isValidPhone } from "@/types/checkout";

describe("isValidEmail", () => {
  it("accepts valid email", () => {
    expect(isValidEmail("user@example.com")).toBe(true);
  });

  it("accepts email with subdomain", () => {
    expect(isValidEmail("user@sub.example.com")).toBe(true);
  });

  it("rejects email without @", () => {
    expect(isValidEmail("userexample.com")).toBe(false);
  });

  it("rejects email without domain", () => {
    expect(isValidEmail("user@")).toBe(false);
  });

  it("rejects email without local part", () => {
    expect(isValidEmail("@example.com")).toBe(false);
  });

  it("rejects email with spaces", () => {
    expect(isValidEmail("user @example.com")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidEmail("")).toBe(false);
  });
});

describe("isValidFrenchPostalCode", () => {
  // France (5 digits)
  it("accepts valid French postal code", () => {
    expect(isValidFrenchPostalCode("75001", "France")).toBe(true);
  });

  it("rejects French postal code with letters", () => {
    expect(isValidFrenchPostalCode("7500A", "France")).toBe(false);
  });

  it("rejects French postal code with wrong length", () => {
    expect(isValidFrenchPostalCode("7500", "France")).toBe(false);
  });

  // Germany (5 digits)
  it("accepts valid German postal code", () => {
    expect(isValidFrenchPostalCode("10115", "Allemagne")).toBe(true);
  });

  // Netherlands (4 digits + 2 letters)
  it("accepts valid Dutch postal code", () => {
    expect(isValidFrenchPostalCode("1012 AB", "Pays-Bas")).toBe(true);
  });

  it("accepts Dutch postal code without space", () => {
    expect(isValidFrenchPostalCode("1012AB", "Pays-Bas")).toBe(true);
  });

  // Poland (XX-XXX)
  it("accepts valid Polish postal code", () => {
    expect(isValidFrenchPostalCode("00-950", "Pologne")).toBe(true);
  });

  it("rejects Polish postal code without hyphen", () => {
    expect(isValidFrenchPostalCode("00950", "Pologne")).toBe(false);
  });

  // Portugal (XXXX-XXX)
  it("accepts valid Portuguese postal code", () => {
    expect(isValidFrenchPostalCode("1000-001", "Portugal")).toBe(true);
  });

  // Ireland (alphanumeric)
  it("accepts valid Irish Eircode", () => {
    expect(isValidFrenchPostalCode("D01 F5P2", "Irlande")).toBe(true);
  });

  it("accepts Irish Eircode without space", () => {
    expect(isValidFrenchPostalCode("D01F5P2", "Irlande")).toBe(true);
  });

  // Latvia (LV-XXXX)
  it("accepts valid Latvian postal code", () => {
    expect(isValidFrenchPostalCode("LV-1010", "Lettonie")).toBe(true);
  });

  it("accepts Latvian postal code case-insensitive", () => {
    expect(isValidFrenchPostalCode("lv-1010", "Lettonie")).toBe(true);
  });

  // Lithuania (LT-XXXXX)
  it("accepts valid Lithuanian postal code", () => {
    expect(isValidFrenchPostalCode("LT-01001", "Lituanie")).toBe(true);
  });

  // Malta (XXX XXXX)
  it("accepts valid Maltese postal code", () => {
    expect(isValidFrenchPostalCode("VLT 1117", "Malte")).toBe(true);
  });

  it("accepts Maltese postal code without space", () => {
    expect(isValidFrenchPostalCode("VLT1117", "Malte")).toBe(true);
  });

  // Invalid country
  it("returns false for unknown country", () => {
    expect(isValidFrenchPostalCode("12345", "Narnia")).toBe(false);
  });

  // Whitespace handling
  it("trims whitespace from postal code", () => {
    expect(isValidFrenchPostalCode("  75001  ", "France")).toBe(true);
  });
});

describe("isValidPhone", () => {
  it("accepts French mobile number", () => {
    expect(isValidPhone("0612345678")).toBe(true);
  });

  it("accepts international format with +33", () => {
    expect(isValidPhone("+33612345678")).toBe(true);
  });

  it("accepts number with spaces", () => {
    expect(isValidPhone("06 12 34 56 78")).toBe(true);
  });

  it("accepts number with dashes", () => {
    expect(isValidPhone("06-12-34-56-78")).toBe(true);
  });

  it("accepts number with parentheses", () => {
    expect(isValidPhone("+33(0)612345678")).toBe(true);
  });

  it("rejects too short number", () => {
    expect(isValidPhone("061234")).toBe(false);
  });

  it("rejects empty string", () => {
    expect(isValidPhone("")).toBe(false);
  });

  it("rejects letters", () => {
    expect(isValidPhone("abcdefghij")).toBe(false);
  });
});
