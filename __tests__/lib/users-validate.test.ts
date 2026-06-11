import { describe, it, expect } from "vitest";
import { validatePassword } from "@/lib/password-validation";

describe("validatePassword", () => {
  it("accepts a valid strong password", () => {
    const result = validatePassword("MyStr0ng!Pass");
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("rejects password shorter than 12 characters", () => {
    const result = validatePassword("Short1!a");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("12");
  });

  it("rejects password with exactly 11 characters", () => {
    const result = validatePassword("Abcdefgh1!a");
    expect(result.valid).toBe(false);
  });

  it("accepts password with exactly 12 characters", () => {
    const result = validatePassword("Abcdefgh1!ab");
    expect(result.valid).toBe(true);
  });

  it("rejects password without uppercase", () => {
    const result = validatePassword("alllowercase1!");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("majuscule");
  });

  it("rejects password without lowercase", () => {
    const result = validatePassword("ALLUPPERCASE1!");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("minuscule");
  });

  it("rejects password without digit", () => {
    const result = validatePassword("NoDigitsHere!!");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("chiffre");
  });

  it("rejects password without special character", () => {
    const result = validatePassword("NoSpecials123A");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("spécial");
  });

  it("rejects common password 'password123!' (fails uppercase check first)", () => {
    const result = validatePassword("password123!");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("majuscule");
  });

  it("rejects common password case-insensitively", () => {
    const result = validatePassword("Password123!");
    expect(result.valid).toBe(false);
    expect(result.error).toContain("commun");
  });

  it("rejects 'azerty123!'", () => {
    const result = validatePassword("azerty123!");
    expect(result.valid).toBe(false);
  });

  it("rejects 'admin123!' with sufficient padding", () => {
    // The common password list has 'admin123!' but it's only 9 chars
    // So it would fail length check first
    const result = validatePassword("admin123!");
    expect(result.valid).toBe(false);
  });
});
