"use client";

import { useState, useTransition } from "react";
import { ScrapedProduct, ScrapedReview } from "@/types/scraper";
import { ChevronDown, ChevronUp, Image as ImageIcon, MessageSquare, Sparkles, CheckCircle, Clock, XCircle, AlertCircle, Trash2, RefreshCw } from "lucide-react";
import { scrapeUrlAction, sendToCurationAction, deleteScrapedProductAction, retryScrapingAction, rescrapeReviewsAction } from "./actions";

interface UnifiedSourcingDashboardProps {
  scrapedProducts: ScrapedProduct[];
  reviewsByProduct: Map<string, ScrapedReview[]>;
}

export function UnifiedSourcingDashboard({
  scrapedProducts,
  reviewsByProduct,
}: UnifiedSourcingDashboardProps) {
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    startTransition(async () => {
      const result = await scrapeUrlAction(scrapeUrl);
      if (result.success) {
        setMessage({ type: "success", text: "Product scraped successfully!" });
        setScrapeUrl("");
      } else {
        setMessage({ type: "error", text: result.error || "Failed to scrape" });
      }
    });
  };

  const handleSendToCuration = async (productId: string) => {
    setMessage(null);

    startTransition(async () => {
      const result = await sendToCurationAction(productId);
      if (result.success) {
        setMessage({ type: "success", text: "Sent to curation! Images are being uploaded..." });
      } else {
        setMessage({ type: "error", text: result.error || "Failed to send to curation" });
      }
    });
  };

  const handleDelete = async (productId: string) => {
    if (!confirm("Delete this product? This cannot be undone.")) {
      return;
    }

    setMessage(null);

    startTransition(async () => {
      const result = await deleteScrapedProductAction(productId);
      if (result.success) {
        setMessage({ type: "success", text: "Product deleted successfully!" });
      } else {
        setMessage({ type: "error", text: result.error || "Failed to delete product" });
      }
    });
  };

  const handleRetry = async (productId: string, sourceUrl: string) => {
    setMessage(null);

    startTransition(async () => {
      const result = await retryScrapingAction(productId, sourceUrl);
      if (result.success) {
        setMessage({ type: "success", text: "Re-scraped successfully! Check for updated images." });
      } else {
        setMessage({ type: "error", text: result.error || "Failed to retry scraping" });
      }
    });
  };

  const handleRescrapeReviews = async (productId: string, sourceUrl: string) => {
    setMessage(null);

    startTransition(async () => {
      const result = await rescrapeReviewsAction(productId, sourceUrl);
      if (result.success) {
        setMessage({
          type: "success",
          text: result.message || `Added ${result.newReviews} new reviews`
        });
      } else {
        setMessage({ type: "error", text: result.error || "Failed to re-scrape reviews" });
      }
    });
  };

  const toggleExpand = (productId: string) => {
    setExpandedProduct(expandedProduct === productId ? null : productId);
  };

  const getStatusInfo = (product: ScrapedProduct) => {
    const reviews = reviewsByProduct.get(product.id) || [];
    const translatedReviews = reviews.filter(r => r.translationStatus === "translated").length;
    const uploadedImages = product.uploadedImageUrls.length;
    const totalImages = product.rawImages.length;

    const steps = [
      {
        label: "Scraped",
        status: product.scrapeStatus === "success" ? "complete" : "error",
        detail: `${reviews.length} reviews, ${totalImages} images`,
      },
      {
        label: "Reviews Translated",
        status: translatedReviews === reviews.length && reviews.length > 0 ? "complete" :
                translatedReviews > 0 ? "in-progress" : "pending",
        detail: `${translatedReviews}/${reviews.length}`,
      },
      {
        label: "Images Uploaded",
        status: product.imageUploadStatus === "uploaded" ? "complete" :
                product.imageUploadStatus === "uploading" ? "in-progress" :
                product.imageUploadStatus === "failed" ? "error" : "pending",
        detail: `${uploadedImages}/${totalImages}`,
      },
      {
        label: "AI Translation",
        status: product.sentToCuration ? "complete" : "pending",
        detail: product.sentToCuration ? "Sent to curation" : "Waiting",
      },
    ];

    return steps;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "complete": return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "in-progress": return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      case "error": return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-primary">
              Product Sourcing Pipeline
            </h1>
            <p className="text-primary/70 mt-1">
              Scrape, translate, and curate products in one place
            </p>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`p-4 rounded-lg ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Scrape Form */}
        <div className="bg-secondary rounded-lg border border-primary/10 p-6">
          <h2 className="text-lg font-heading font-semibold text-primary mb-4">
            Add New Product
          </h2>
          <form onSubmit={handleScrape} className="flex gap-3">
            <input
              type="url"
              value={scrapeUrl}
              onChange={(e) => setScrapeUrl(e.target.value)}
              placeholder="https://www.aliexpress.com/item/..."
              className="flex-1 px-4 py-3 border border-primary/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
              disabled={isPending}
            />
            <button
              type="submit"
              disabled={isPending}
              className="px-6 py-3 bg-primary text-background rounded-lg hover:bg-accent hover:text-primary transition-colors disabled:opacity-50 font-medium"
            >
              {isPending ? "Scraping..." : "Scrape Product"}
            </button>
          </form>
        </div>

        {/* Products List */}
        <div className="space-y-4">
          {scrapedProducts.map((product) => {
            const isExpanded = expandedProduct === product.id;
            const reviews = reviewsByProduct.get(product.id) || [];
            const statusSteps = getStatusInfo(product);
            const allComplete = statusSteps.every(s => s.status === "complete");

            return (
              <div
                key={product.id}
                className={`bg-secondary rounded-lg border transition-all ${
                  allComplete ? "border-green-500/30" : "border-primary/10"
                }`}
              >
                {/* Product Header - Always Visible */}
                <div
                  className="p-6 cursor-pointer hover:bg-primary/5 transition-colors"
                  onClick={() => toggleExpand(product.id)}
                >
                  <div className="flex items-start gap-4">
                    {/* Main Image */}
                    <div className="flex-shrink-0">
                      {product.rawImages[0] ? (
                        <img
                          src={product.uploadedImageUrls[0] || product.rawImages[0]}
                          alt={product.rawName}
                          className="w-24 h-24 object-cover rounded-lg border border-primary/10"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-primary/10 rounded-lg flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-primary/40" />
                        </div>
                      )}
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-primary mb-1">
                            {product.rawName}
                          </h3>
                          {product.rawDescription && (
                            <p className="text-sm text-primary/60 line-clamp-2">
                              {product.rawDescription}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-2 text-sm text-primary/60">
                            {product.rawPriceText && (
                              <span className="font-medium">{product.rawPriceText}</span>
                            )}
                            <span className="flex items-center gap-1">
                              <ImageIcon className="w-4 h-4" />
                              {product.rawImages.length} images
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {reviews.length} reviews
                            </span>
                          </div>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-primary/60 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-primary/60 flex-shrink-0" />
                        )}
                      </div>

                      {/* Progress Steps */}
                      <div className="grid grid-cols-4 gap-3">
                        {statusSteps.map((step, idx) => (
                          <div
                            key={idx}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md ${
                              step.status === "complete" ? "bg-green-50" :
                              step.status === "in-progress" ? "bg-blue-50" :
                              step.status === "error" ? "bg-red-50" : "bg-gray-50"
                            }`}
                          >
                            {getStatusIcon(step.status)}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-medium text-primary">
                                {step.label}
                              </div>
                              <div className="text-xs text-primary/60 truncate">
                                {step.detail}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-primary/10 p-6 space-y-6">
                    {/* All Images */}
                    <div>
                      <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Product Images ({product.rawImages.length})
                      </h4>
                      <div className="grid grid-cols-6 gap-3">
                        {product.rawImages.map((img, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={product.uploadedImageUrls[idx] || img}
                              alt={`Product ${idx + 1}`}
                              className="w-full aspect-square object-cover rounded-lg border border-primary/10"
                            />
                            {product.uploadedImageUrls[idx] && (
                              <div className="absolute top-1 right-1 bg-green-500 text-white rounded-full p-1">
                                <CheckCircle className="w-3 h-3" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Product Details */}
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-semibold text-primary mb-2">Description</h4>
                        <p className="text-sm text-primary/70">
                          {product.rawDescription || "No description available"}
                        </p>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-semibold text-primary mb-1">Price</h4>
                          <p className="text-sm text-primary/70">{product.rawPriceText || "N/A"}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-primary mb-1">Category</h4>
                          <p className="text-sm text-primary/70">{product.rawCategory || "N/A"}</p>
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-primary mb-1">Source</h4>
                          <a
                            href={product.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {product.sourceName}
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Reviews */}
                    {reviews.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-primary mb-3 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4" />
                          Customer Reviews ({reviews.length})
                        </h4>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {reviews.slice(0, 10).map((review) => (
                            <div
                              key={review.id}
                              className="bg-background rounded-lg p-4 border border-primary/10"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className="flex">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <span
                                        key={star}
                                        className={`text-sm ${
                                          star <= review.rating ? "text-yellow-500" : "text-gray-300"
                                        }`}
                                      >
                                        ★
                                      </span>
                                    ))}
                                  </div>
                                  <span className="text-xs text-primary/60">
                                    {review.authorName} • {review.authorCountry}
                                  </span>
                                </div>
                                <span
                                  className={`text-xs px-2 py-1 rounded ${
                                    review.translationStatus === "translated"
                                      ? "bg-green-100 text-green-700"
                                      : "bg-gray-100 text-gray-700"
                                  }`}
                                >
                                  {review.translationStatus}
                                </span>
                              </div>
                              <p className="text-sm text-primary/80">
                                {review.translatedText || review.reviewText}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-4 border-t border-primary/10 flex-wrap">
                      <button
                        onClick={() => handleRetry(product.id, product.sourceUrl)}
                        disabled={isPending}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Retry Scraping
                      </button>
                      <button
                        onClick={() => handleRescrapeReviews(product.id, product.sourceUrl)}
                        disabled={isPending}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        <MessageSquare className="w-4 h-4" />
                        Update Reviews
                      </button>
                      {!product.sentToCuration && product.scrapeStatus === "success" && (
                        <button
                          onClick={() => handleSendToCuration(product.id)}
                          disabled={isPending}
                          className="px-4 py-2 bg-primary text-background rounded-lg hover:bg-accent hover:text-primary transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          <Sparkles className="w-4 h-4" />
                          Send to Curation & Translate
                        </button>
                      )}
                      {product.sentToCuration && (
                        <span className="px-4 py-2 bg-green-100 text-green-700 rounded-lg flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          In Curation Pipeline
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={isPending}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50 ml-auto"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {scrapedProducts.length === 0 && (
          <div className="text-center py-12 text-primary/60">
            No products yet. Enter a URL above to start scraping!
          </div>
        )}
      </div>
    </div>
  );
}
