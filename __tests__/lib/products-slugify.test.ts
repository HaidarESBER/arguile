import { describe, it, expect } from "vitest";
import { slugify } from "@/lib/slugify";

describe("slugify", () => {
  it("converts to lowercase", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("replaces spaces with hyphens", () => {
    expect(slugify("foo bar baz")).toBe("foo-bar-baz");
  });

  it("removes diacritics", () => {
    expect(slugify("Chicha éléganté")).toBe("chicha-elegante");
  });

  it("removes special characters", () => {
    expect(slugify("hello! @world #2024")).toBe("hello-world-2024");
  });

  it("collapses multiple hyphens into one", () => {
    expect(slugify("hello---world")).toBe("hello-world");
  });

  it("collapses multiple spaces into one hyphen", () => {
    expect(slugify("hello   world")).toBe("hello-world");
  });

  it("handles accented characters (French)", () => {
    expect(slugify("Bol Céramique Artisanal")).toBe("bol-ceramique-artisanal");
  });

  it("handles mixed diacritics and special chars", () => {
    expect(slugify("Tête-à-tête & café!")).toBe("tete-a-tete-cafe");
  });

  it("handles empty string", () => {
    expect(slugify("")).toBe("");
  });

  it("handles string with only special characters", () => {
    expect(slugify("!@#$%")).toBe("");
  });

  it("preserves numbers", () => {
    expect(slugify("Product 123")).toBe("product-123");
  });

  it("handles already-slug-like input", () => {
    expect(slugify("already-a-slug")).toBe("already-a-slug");
  });
});
