import { redirect } from "next/navigation";
import { getDraftById } from "@/lib/curation";
import { getReviewsByScrapedProduct } from "@/lib/scraper/review-data";
import { DraftDetailView } from "./DraftDetailView";

export const dynamic = "force-dynamic";

interface DraftDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DraftDetailPage({ params }: DraftDetailPageProps) {
  const { id } = await params;
  const draft = await getDraftById(id);

  if (!draft) {
    redirect("/admin/curation");
  }

  // Fetch reviews if this draft has a scraped product
  const reviews = draft.scrapedProductId
    ? await getReviewsByScrapedProduct(draft.scrapedProductId)
    : [];

  return <DraftDetailView draft={draft} reviews={reviews} />;
}
