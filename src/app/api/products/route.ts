import { NextResponse } from "next/server";
import { getAllProducts } from "@/lib/products";

export async function GET() {
  try {
    const products = await getAllProducts();

    // Trim the payload: the long scraped `description` dominated the response
    // size. Consumers (wishlist page, quick view) only need short text.
    const trimmed = products.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      shortDescription: p.shortDescription,
      description: p.shortDescription,
      price: p.price,
      compareAtPrice: p.compareAtPrice,
      images: p.images,
      category: p.category,
      inStock: p.inStock,
      stockLevel: p.stockLevel,
      featured: p.featured,
    }));

    return NextResponse.json(trimmed, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
  }
}
