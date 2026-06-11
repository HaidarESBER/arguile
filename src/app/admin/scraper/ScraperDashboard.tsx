"use client";

import { useState, useTransition } from "react";
import { ScrapedProduct } from "@/types/scraper";
import {
  scrapeUrlAction,
  scrapeMultipleAction,
  sendToCurationAction,
  sendAllToCurationAction,
} from "./actions";

interface ScraperDashboardProps {
  stats: {
    total: number;
    success: number;
    failed: number;
    sent: number;
    unsent: number;
  };
  scrapedProducts: ScrapedProduct[];
}

type FilterStatus = "all" | "success" | "failed" | "sent" | "unsent";

const STATUS_LABELS: Record<string, string> = {
  success: "Succes",
  partial: "Partiel",
  failed: "Echoue",
};

const STATUS_COLORS: Record<string, string> = {
  success: "bg-green-100 text-green-700",
  partial: "bg-yellow-100 text-yellow-700",
  failed: "bg-red-100 text-red-700",
};

const FILTER_TABS: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "success", label: "Succes" },
  { value: "failed", label: "Echecs" },
  { value: "sent", label: "Envoyes" },
  { value: "unsent", label: "Non envoyes" },
];

export function ScraperDashboard({
  stats,
  scrapedProducts,
}: ScraperDashboardProps) {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [singleUrl, setSingleUrl] = useState("");
  const [multipleUrls, setMultipleUrls] = useState("");

  const filteredProducts = scrapedProducts.filter((product) => {
    if (filter === "all") return true;
    if (filter === "success") return product.scrapeStatus === "success";
    if (filter === "failed") return product.scrapeStatus === "failed";
    if (filter === "sent") return product.sentToCuration === true;
    if (filter === "unsent")
      return product.sentToCuration === false && product.scrapeStatus === "success";
    return true;
  });

  async function handleScrapeSingle(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const result = await scrapeUrlAction(formData);
        if (result.success) {
          setMessage({ type: "success", text: "URL scrapee avec succes" });
          setSingleUrl("");
        } else {
          setMessage({
            type: "error",
            text: result.error || "Erreur lors du scraping",
          });
        }
      } catch {
        setMessage({ type: "error", text: "Erreur lors du scraping" });
      }
    });
  }

  async function handleScrapeMultiple(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const result = await scrapeMultipleAction(formData);
        if (result.success) {
          setMessage({
            type: "success",
            text: `${result.scraped} URLs scrapees, ${result.errors} erreurs`,
          });
          setMultipleUrls("");
        } else {
          setMessage({
            type: "error",
            text: result.error || "Erreur lors du scraping",
          });
        }
      } catch {
        setMessage({ type: "error", text: "Erreur lors du scraping" });
      }
    });
  }

  async function handleSendToCuration(productId: string) {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await sendToCurationAction(productId);
        if (result.success) {
          setMessage({
            type: "success",
            text: "Produit envoye en curation",
          });
        } else {
          setMessage({
            type: "error",
            text: result.error || "Erreur lors de l'envoi",
          });
        }
      } catch {
        setMessage({ type: "error", text: "Erreur lors de l'envoi" });
      }
    });
  }

  async function handleSendAllToCuration() {
    setMessage(null);
    startTransition(async () => {
      try {
        const result = await sendAllToCurationAction();
        if (result.success) {
          setMessage({
            type: "success",
            text: `${result.sent} produits envoyes en curation`,
          });
        } else {
          setMessage({
            type: "error",
            text: result.error || "Erreur lors de l'envoi",
          });
        }
      } catch {
        setMessage({ type: "error", text: "Erreur lors de l'envoi" });
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-heading font-semibold text-primary">
          Sourcing
        </h2>
        {stats.unsent > 0 && (
          <button
            onClick={handleSendAllToCuration}
            disabled={isPending}
            className="inline-flex items-center px-4 py-2 bg-primary text-background rounded-md hover:bg-accent hover:text-primary transition-colors w-fit disabled:opacity-50"
          >
            {isPending
              ? "Envoi en cours..."
              : `Envoyer tout en curation (${stats.unsent})`}
          </button>
        )}
      </div>

      {message && (
        <div
          className={`px-4 py-3 rounded-md text-sm border ${
            message.type === "success"
              ? "bg-green-50 border-green-200 text-green-700"
              : "bg-red-50 border-red-200 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-secondary rounded-lg border border-primary/10 p-4">
          <p className="text-xs text-primary/60 uppercase tracking-wide">
            Total
          </p>
          <p className="text-2xl font-heading font-semibold text-primary mt-1">
            {stats.total}
          </p>
        </div>
        <div className="bg-secondary rounded-lg border border-primary/10 p-4">
          <p className="text-xs text-primary/60 uppercase tracking-wide">
            Succes
          </p>
          <p className="text-2xl font-heading font-semibold text-primary mt-1">
            {stats.success}
          </p>
        </div>
        <div className="bg-secondary rounded-lg border border-primary/10 p-4">
          <p className="text-xs text-primary/60 uppercase tracking-wide">
            Echecs
          </p>
          <p className="text-2xl font-heading font-semibold text-primary mt-1">
            {stats.failed}
          </p>
        </div>
        <div className="bg-secondary rounded-lg border border-primary/10 p-4">
          <p className="text-xs text-primary/60 uppercase tracking-wide">
            Envoyes
          </p>
          <p className="text-2xl font-heading font-semibold text-primary mt-1">
            {stats.sent}
          </p>
        </div>
        <div className="bg-secondary rounded-lg border border-primary/10 p-4">
          <p className="text-xs text-primary/60 uppercase tracking-wide">
            Non envoyes
          </p>
          <p className="text-2xl font-heading font-semibold text-primary mt-1">
            {stats.unsent}
          </p>
        </div>
      </div>

      {/* URL Input Section */}
      <div className="bg-secondary rounded-lg border border-primary/10 p-6">
        <h3 className="text-lg font-heading font-semibold text-primary mb-4">
          Scraper des URLs
        </h3>

        {/* Single URL */}
        <form onSubmit={handleScrapeSingle} className="mb-4">
          <div className="flex gap-2">
            <input
              type="url"
              name="url"
              value={singleUrl}
              onChange={(e) => setSingleUrl(e.target.value)}
              placeholder="https://www.aliexpress.com/item/..."
              className="flex-1 px-3 py-2 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
              disabled={isPending}
            />
            <button
              type="submit"
              disabled={isPending}
              className="px-4 py-2 bg-primary text-background rounded-md hover:bg-accent hover:text-primary transition-colors disabled:opacity-50"
            >
              Scraper
            </button>
          </div>
        </form>

        {/* Multiple URLs */}
        <form onSubmit={handleScrapeMultiple}>
          <textarea
            name="urls"
            value={multipleUrls}
            onChange={(e) => setMultipleUrls(e.target.value)}
            placeholder="Une URL par ligne&#10;https://example.com/product-1&#10;https://example.com/product-2"
            rows={4}
            className="w-full px-3 py-2 border border-primary/20 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 mb-2"
            disabled={isPending}
          />
          <button
            type="submit"
            disabled={isPending}
            className="px-4 py-2 bg-primary text-background rounded-md hover:bg-accent hover:text-primary transition-colors disabled:opacity-50"
          >
            Scraper tout
          </button>
        </form>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-primary/10 pb-3">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              filter === tab.value
                ? "bg-primary text-background"
                : "text-primary/70 hover:bg-primary/10"
            }`}
          >
            {tab.label}
            {tab.value !== "all" && (
              <span className="ml-1 text-xs opacity-70">
                ({stats[tab.value] || 0})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Results Table */}
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
                  Source
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Prix
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Avis
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Images
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Envoye
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-primary/5">
                  <td className="px-4 py-3">
                    {product.rawImages && product.rawImages[0] ? (
                      <img
                        src={product.rawImages[0]}
                        alt={product.rawName}
                        className="w-12 h-12 object-cover rounded"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-primary/10 rounded flex items-center justify-center text-primary/40 text-xs">
                        N/A
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-primary max-w-xs truncate">
                      {product.rawName}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-primary/60">
                    {product.sourceName}
                  </td>
                  <td className="px-4 py-3 text-sm text-primary/70">
                    {product.rawPriceText || "-"}
                  </td>
                  <td className="px-4 py-3">
                    {product.reviewCount > 0 ? (
                      <span className="text-sm text-primary/70">
                        {product.reviewCount} avis
                      </span>
                    ) : (
                      <span className="text-xs text-primary/40">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-col gap-1">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${
                          product.imageUploadStatus === 'uploaded'
                            ? 'bg-green-100 text-green-700'
                            : product.imageUploadStatus === 'failed'
                            ? 'bg-red-100 text-red-700'
                            : product.imageUploadStatus === 'uploading'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {product.imageUploadStatus === 'uploaded'
                          ? 'Uploadees'
                          : product.imageUploadStatus === 'failed'
                          ? 'Echec'
                          : product.imageUploadStatus === 'uploading'
                          ? 'Upload...'
                          : 'En attente'}
                      </span>
                      <span className="text-xs text-primary/50">
                        {product.uploadedImageUrls.length}/{product.rawImages.length}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
                        STATUS_COLORS[product.scrapeStatus]
                      }`}
                    >
                      {STATUS_LABELS[product.scrapeStatus]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-primary/60">
                    {product.sentToCuration ? "Oui" : "Non"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      {!product.sentToCuration &&
                        product.scrapeStatus === "success" && (
                          <button
                            onClick={() => handleSendToCuration(product.id)}
                            disabled={isPending}
                            className="text-xs px-2 py-1 bg-primary text-background rounded hover:bg-accent hover:text-primary transition-colors disabled:opacity-50"
                          >
                            Envoyer
                          </button>
                        )}
                      <a
                        href={product.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs px-2 py-1 border border-primary/20 text-primary rounded hover:bg-primary/10 transition-colors"
                      >
                        Source
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-8 text-center text-primary/60">
            {filter === "all"
              ? "Aucun produit scrape. Entrez des URLs ci-dessus pour commencer."
              : `Aucun produit avec le filtre "${
                  FILTER_TABS.find((t) => t.value === filter)?.label
                }".`}
          </div>
        )}
      </div>
    </div>
  );
}
