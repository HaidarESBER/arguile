import { describe, it, expect } from "vitest";
import {
  getCountryByCode,
  EUROPEAN_COUNTRIES,
} from "@/data/countries";

describe("getCountryByCode", () => {
  it("returns France for code FR", () => {
    const country = getCountryByCode("FR");
    expect(country).toBeDefined();
    expect(country!.name).toBe("France");
    expect(country!.region).toBe("france");
  });

  it("returns Germany for code DE", () => {
    const country = getCountryByCode("DE");
    expect(country).toBeDefined();
    expect(country!.name).toBe("Allemagne");
    expect(country!.region).toBe("eu-schengen");
  });

  it("returns Ireland for code IE", () => {
    const country = getCountryByCode("IE");
    expect(country).toBeDefined();
    expect(country!.region).toBe("eu-non-schengen");
  });

  it("returns Switzerland for code CH", () => {
    const country = getCountryByCode("CH");
    expect(country).toBeDefined();
    expect(country!.region).toBe("non-eu");
  });

  it("returns undefined for unknown code", () => {
    const country = getCountryByCode("XX");
    expect(country).toBeUndefined();
  });

  it("is case-sensitive (lowercase returns undefined)", () => {
    const country = getCountryByCode("fr");
    expect(country).toBeUndefined();
  });
});

describe("EUROPEAN_COUNTRIES", () => {
  it("contains France", () => {
    expect(EUROPEAN_COUNTRIES.some((c) => c.code === "FR")).toBe(true);
  });

  it("has all required fields on every country", () => {
    for (const country of EUROPEAN_COUNTRIES) {
      expect(country.code).toBeTruthy();
      expect(country.name).toBeTruthy();
      expect(country.region).toBeTruthy();
      expect(country.flag).toBeTruthy();
    }
  });

  it("is sorted alphabetically by name (French)", () => {
    for (let i = 1; i < EUROPEAN_COUNTRIES.length; i++) {
      const cmp = EUROPEAN_COUNTRIES[i - 1].name.localeCompare(
        EUROPEAN_COUNTRIES[i].name,
        "fr"
      );
      expect(cmp).toBeLessThanOrEqual(0);
    }
  });

  it("contains all 4 regions", () => {
    const regions = new Set(EUROPEAN_COUNTRIES.map((c) => c.region));
    expect(regions).toContain("france");
    expect(regions).toContain("eu-schengen");
    expect(regions).toContain("eu-non-schengen");
    expect(regions).toContain("non-eu");
  });
});
