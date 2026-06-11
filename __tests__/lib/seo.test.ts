import { describe, it, expect } from "vitest";
import {
  generateProductSchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  generateOpenGraphTags,
  generateTwitterCardTags,
  jsonLdScriptProps,
  SITE_URL,
} from "@/lib/seo";
import { Product } from "@/types/product";

const mockProduct: Product = {
  id: "test-1",
  slug: "test-product",
  name: "Test Product",
  description: "A test product description",
  shortDescription: "Short desc",
  price: 4999,
  images: ["/img1.jpg", "/img2.jpg"],
  category: "chicha",
  inStock: true,
  featured: false,
};

describe("generateProductSchema", () => {
  it("generates valid Product schema with required fields", () => {
    const schema = generateProductSchema(mockProduct);
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Product");
    expect(schema.name).toBe("Test Product");
    expect(schema.sku).toBe("test-1");
  });

  it("uses shortDescription when available", () => {
    const schema = generateProductSchema(mockProduct);
    expect(schema.description).toBe("Short desc");
  });

  it("formats price as decimal string", () => {
    const schema = generateProductSchema(mockProduct);
    expect(schema.offers.price).toBe("49.99");
    expect(schema.offers.priceCurrency).toBe("EUR");
  });

  it("sets InStock availability when product is in stock", () => {
    const schema = generateProductSchema(mockProduct);
    expect(schema.offers.availability).toBe("https://schema.org/InStock");
  });

  it("sets OutOfStock availability when product is out of stock", () => {
    const outOfStock = { ...mockProduct, inStock: false };
    const schema = generateProductSchema(outOfStock);
    expect(schema.offers.availability).toBe("https://schema.org/OutOfStock");
  });

  it("includes brand as Nuage", () => {
    const schema = generateProductSchema(mockProduct);
    expect(schema.brand.name).toBe("Nuage");
  });

  it("does not include aggregateRating without ratingStats", () => {
    const schema = generateProductSchema(mockProduct) as Record<string, unknown>;
    expect(schema.aggregateRating).toBeUndefined();
  });

  it("includes aggregateRating when ratingStats provided", () => {
    const stats = { averageRating: 4.5, totalReviews: 10 };
    const schema = generateProductSchema(mockProduct, stats) as Record<string, unknown>;
    const rating = schema.aggregateRating as Record<string, unknown>;
    expect(rating).toBeDefined();
    expect(rating.ratingValue).toBe("4.5");
    expect(rating.reviewCount).toBe(10);
  });

  it("does not include aggregateRating when totalReviews is 0", () => {
    const stats = { averageRating: 0, totalReviews: 0 };
    const schema = generateProductSchema(mockProduct, stats) as Record<string, unknown>;
    expect(schema.aggregateRating).toBeUndefined();
  });
});

describe("generateOrganizationSchema", () => {
  it("generates valid Organization schema", () => {
    const schema = generateOrganizationSchema();
    expect(schema["@context"]).toBe("https://schema.org");
    expect(schema["@type"]).toBe("Organization");
    expect(schema.name).toBe("Nuage");
    expect(schema.url).toBe(SITE_URL);
  });

  it("includes contact point", () => {
    const schema = generateOrganizationSchema();
    expect(schema.contactPoint.contactType).toBe("Customer Service");
  });
});

describe("generateBreadcrumbSchema", () => {
  it("generates BreadcrumbList schema", () => {
    const items = [
      { name: "Accueil", url: "/" },
      { name: "Produits", url: "/produits" },
    ];
    const schema = generateBreadcrumbSchema(items);
    expect(schema["@type"]).toBe("BreadcrumbList");
    expect(schema.itemListElement).toHaveLength(2);
  });

  it("positions items starting at 1", () => {
    const items = [
      { name: "Accueil", url: "/" },
      { name: "Produits", url: "/produits" },
    ];
    const schema = generateBreadcrumbSchema(items);
    expect(schema.itemListElement[0].position).toBe(1);
    expect(schema.itemListElement[1].position).toBe(2);
  });

  it("prepends base URL to item urls", () => {
    const items = [{ name: "Test", url: "/test" }];
    const schema = generateBreadcrumbSchema(items);
    expect(schema.itemListElement[0].item).toBe(`${SITE_URL}/test`);
  });
});

describe("generateOpenGraphTags", () => {
  it("generates basic OG tags", () => {
    const tags = generateOpenGraphTags({
      title: "Test",
      description: "Desc",
      url: "https://nuage.fr/test",
    });
    expect(tags["og:title"]).toBe("Test");
    expect(tags["og:description"]).toBe("Desc");
    expect(tags["og:locale"]).toBe("fr_FR");
  });

  it("defaults type to website", () => {
    const tags = generateOpenGraphTags({
      title: "Test",
      description: "Desc",
      url: "https://nuage.fr",
    });
    expect(tags["og:type"]).toBe("website");
  });

  it("absolutizes relative image URLs", () => {
    const tags = generateOpenGraphTags({
      title: "Test",
      description: "Desc",
      url: "https://nuage.fr",
      image: "/img.jpg",
    }) as Record<string, unknown>;
    expect(tags["og:image"]).toBe(`${SITE_URL}/img.jpg`);
    expect(tags["og:image:alt"]).toBe("Test");
  });

  it("includes price for product type", () => {
    const tags = generateOpenGraphTags({
      title: "Test",
      description: "Desc",
      url: "https://nuage.fr",
      type: "product",
      price: 4999,
    }) as Record<string, unknown>;
    expect(tags["og:price:amount"]).toBe("49.99");
    expect(tags["og:price:currency"]).toBe("EUR");
  });
});

describe("generateTwitterCardTags", () => {
  it("generates summary_large_image card", () => {
    const tags = generateTwitterCardTags({
      title: "Test",
      description: "Desc",
    });
    expect(tags["twitter:card"]).toBe("summary_large_image");
    expect(tags["twitter:title"]).toBe("Test");
  });

  it("includes image when provided", () => {
    const tags = generateTwitterCardTags({
      title: "Test",
      description: "Desc",
      image: "/img.jpg",
    }) as Record<string, unknown>;
    expect(tags["twitter:image"]).toBe("/img.jpg");
  });

  it("does not include image key when not provided", () => {
    const tags = generateTwitterCardTags({
      title: "Test",
      description: "Desc",
    }) as Record<string, unknown>;
    expect(tags["twitter:image"]).toBeUndefined();
  });
});

describe("jsonLdScriptProps", () => {
  it("returns script tag props with JSON-LD type", () => {
    const props = jsonLdScriptProps({ test: true });
    expect(props.type).toBe("application/ld+json");
    expect(props.dangerouslySetInnerHTML.__html).toBe('{"test":true}');
  });
});
