import { Metadata } from "next";
import { getPendingReviews, getAllReviewsAdmin } from "@/lib/reviews";
import { ReviewModerationClient } from "./ReviewModerationClient";

export const metadata: Metadata = {
  title: "Modération des avis | Admin",
  description: "Gérer et modérer les avis clients",
};

export default async function ReviewsPage() {
  const pendingReviews = await getPendingReviews();
  const allReviews = await getAllReviewsAdmin();

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">
          Modération des avis
        </h1>
        <p className="text-muted">
          Approuvez ou rejetez les avis clients avant leur publication
        </p>
      </div>

      <ReviewModerationClient
        pendingReviews={pendingReviews}
        allReviews={allReviews}
      />
    </div>
  );
}
