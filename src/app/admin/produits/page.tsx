import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { getAllProducts, deleteProduct } from "@/lib/products";
import { formatPrice, categoryLabels } from "@/types/product";
import { DeleteButton } from "./DeleteButton";
import { requireAdmin } from "@/lib/session";

export const dynamic = "force-dynamic";

async function handleDelete(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  await deleteProduct(id);
  revalidateTag("products", "max");
  revalidatePath("/");
  revalidatePath("/produits");
  revalidatePath("/admin/produits");
}

export default async function AdminProductsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }
  const products = await getAllProducts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-heading font-semibold text-primary">
          Produits
        </h2>
        <Link
          href="/admin/produits/nouveau"
          className="inline-flex items-center px-4 py-2 bg-primary text-background rounded-md hover:bg-accent hover:text-primary transition-colors w-fit"
        >
          + Ajouter un produit
        </Link>
      </div>

      {/* Products Table */}
      <div className="bg-secondary rounded-lg border border-primary/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary/5 border-b border-primary/10">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Image
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Nom
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Prix
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Categorie
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Stock
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-primary/5">
                  <td className="px-4 py-3">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center">
                        <span className="text-primary/40 text-xs">N/A</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-primary">{product.name}</p>
                      {product.featured && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-accent/20 text-accent rounded">
                          Vedette
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-primary">
                    {formatPrice(product.price)}
                    {product.compareAtPrice && (
                      <span className="block text-xs text-primary/50 line-through">
                        {formatPrice(product.compareAtPrice)}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-primary/70">
                    {categoryLabels[product.category]}
                  </td>
                  <td className="px-4 py-3">
                    {product.inStock ? (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                        En stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                        Rupture
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Link
                        href={`/admin/produits/${product.id}`}
                        className="px-3 py-1 text-sm border border-primary/30 text-primary rounded hover:bg-primary hover:text-background transition-colors"
                      >
                        Modifier
                      </Link>
                      <DeleteButton id={product.id} name={product.name} onDelete={handleDelete} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {products.length === 0 && (
          <div className="p-8 text-center text-primary/60">
            Aucun produit. Commencez par en ajouter un.
          </div>
        )}
      </div>
    </div>
  );
}
