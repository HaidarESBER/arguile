import { NextRequest, NextResponse } from "next/server";
import { getAllProducts } from "@/lib/products";
import { smartSearch } from "@/lib/search/smart-search";

/**
 * Lightweight product search endpoint.
 *
 * Replaces the previous pattern where every keystroke in the header search /
 * search overlay downloaded the full catalog (full descriptions included)
 * from /api/products and filtered client-side.
 *
 * Uses the smart-search module (synonyms, accent normalization, typo
 * tolerance, relevance scoring) over the server-cached catalog and returns
 * only the fields the result lists render.
 */
export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
    const limitParam = parseInt(request.nextUrl.searchParams.get("limit") ?? "", 10);
    const limit = Math.min(Number.isNaN(limitParam) ? 8 : Math.max(limitParam, 1), 20);

    if (q.length < 2) {
      return NextResponse.json([], {
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      });
    }

    const products = await getAllProducts();
    const results = smartSearch(products, q, { limit }).map(({ product }) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: product.price,
      image: product.images[0] ?? null,
      category: product.category,
    }));

    return NextResponse.json(results, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    });
  } catch (error) {
    console.error("Error searching products:", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
