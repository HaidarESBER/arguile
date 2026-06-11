export const dynamic = 'force-dynamic';

import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { getProductById, updateProduct } from "@/lib/products";
import { ProductCategory } from "@/types/product";
import { ProductForm } from "@/components/admin";
import { requireAdmin } from "@/lib/session";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  // Capture slug for server action closure
  const productSlug = product.slug;

  async function handleUpdate(formData: FormData) {
    "use server";

    const name = formData.get("name") as string;
    const shortDescription = formData.get("shortDescription") as string;
    const description = formData.get("description") as string;
    const priceStr = formData.get("price") as string;
    const compareAtPriceStr = formData.get("compareAtPrice") as string;
    const category = formData.get("category") as ProductCategory;
    const imagesStr = formData.get("images") as string;
    const stockLevelStr = formData.get("stockLevel") as string;
    const inStock = formData.get("inStock") === "on";
    const featured = formData.get("featured") === "on";

    // Convert EUR to cents
    const price = Math.round(parseFloat(priceStr) * 100);
    const compareAtPrice = compareAtPriceStr
      ? Math.round(parseFloat(compareAtPriceStr) * 100)
      : undefined;

    // Parse stock level
    const stockLevel = stockLevelStr ? parseInt(stockLevelStr) : 0;

    // Parse images
    const images = imagesStr
      ? imagesStr
          .split(",")
          .map((url) => url.trim())
          .filter((url) => url.length > 0)
      : [];

    await updateProduct(id, {
      name,
      shortDescription: shortDescription || "",
      description: description || "",
      price,
      compareAtPrice,
      category,
      images,
      stockLevel,
      inStock,
      featured,
    });

    revalidateTag("products", "max");
    revalidatePath("/");
    revalidatePath("/admin/produits");
    revalidatePath("/produits");
    revalidatePath(`/produits/${productSlug}`);
    redirect("/admin/produits");
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/produits"
          className="text-primary/70 hover:text-primary transition-colors"
        >
          &larr; Retour
        </Link>
      </div>

      <h2 className="text-2xl font-heading font-semibold text-primary">
        Modifier le Produit
      </h2>

      {/* Form */}
      <ProductForm initialData={product} onSubmit={handleUpdate} />
    </div>
  );
}
