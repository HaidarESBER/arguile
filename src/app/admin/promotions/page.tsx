import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { getPromotions } from "@/lib/promotions";
import { PromotionsClient } from "./PromotionsClient";

export const dynamic = "force-dynamic";

export default async function AdminPromotionsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  const promotions = await getPromotions();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-heading font-semibold text-primary">
        Codes Promo
      </h2>
      <PromotionsClient promotions={promotions} />
    </div>
  );
}
