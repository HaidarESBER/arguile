"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ProductDraft, DraftStatus, getEffectiveName, getEffectiveCategory, getEffectivePrice } from "@/types/curation";
import { formatPrice } from "@/types/product";
import { triggerBatchTranslation } from "./actions";

interface CurationDashboardProps {
  stats: Record<DraftStatus, number>;
  drafts: ProductDraft[];
}

type FilterStatus = DraftStatus | "all";

const STATUS_LABELS: Record<DraftStatus, string> = {
  pending_translation: "A traduire",
  translating: "En traduction",
  translated: "Traduits",
  in_review: "En revue",
  approved: "Approuves",
  rejected: "Rejetes",
  published: "Publies",
};

const STATUS_COLORS: Record<DraftStatus, string> = {
  pending_translation: "bg-primary/10 text-primary/70",
  translating: "bg-blue-100 text-blue-700 animate-pulse",
  translated: "bg-blue-100 text-blue-700",
  in_review: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  published: "bg-emerald-100 text-emerald-700",
};

const FILTER_TABS: { value: FilterStatus; label: string }[] = [
  { value: "all", label: "Tous" },
  { value: "pending_translation", label: "A traduire" },
  { value: "translated", label: "Traduits" },
  { value: "in_review", label: "En revue" },
  { value: "approved", label: "Approuves" },
  { value: "rejected", label: "Rejetes" },
  { value: "published", label: "Publies" },
];

export function CurationDashboard({ stats, drafts }: CurationDashboardProps) {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [isPending, startTransition] = useTransition();
  const [translationMessage, setTranslationMessage] = useState<string | null>(null);

  const filteredDrafts = filter === "all"
    ? drafts
    : drafts.filter((d) => d.status === filter);

  const totalDrafts = Object.values(stats).reduce((sum, n) => sum + n, 0);

  async function handleBatchTranslate() {
    setTranslationMessage(null);
    startTransition(async () => {
      try {
        const result = await triggerBatchTranslation();
        setTranslationMessage(
          `Traduction terminee: ${result.translated} traduits, ${result.errors} erreurs`
        );
      } catch {
        setTranslationMessage("Erreur lors de la traduction");
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-heading font-semibold text-primary">
          Curation
        </h2>
        <button
          onClick={handleBatchTranslate}
          disabled={isPending}
          className="inline-flex items-center px-4 py-2 bg-primary text-background rounded-md hover:bg-accent hover:text-primary transition-colors w-fit disabled:opacity-50"
        >
          {isPending ? "Traduction en cours..." : "Lancer traduction"}
        </button>
      </div>

      {translationMessage && (
        <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-700">
          {translationMessage}
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        <div className="bg-secondary rounded-lg border border-primary/10 p-4">
          <p className="text-xs text-primary/60 uppercase tracking-wide">Total</p>
          <p className="text-2xl font-heading font-semibold text-primary mt-1">{totalDrafts}</p>
        </div>
        {(Object.entries(STATUS_LABELS) as [DraftStatus, string][]).map(([status, label]) => (
          <div key={status} className="bg-secondary rounded-lg border border-primary/10 p-4">
            <p className="text-xs text-primary/60 uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-heading font-semibold text-primary mt-1">{stats[status] || 0}</p>
          </div>
        ))}
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
                ({stats[tab.value as DraftStatus] || 0})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Draft List */}
      <div className="bg-secondary rounded-lg border border-primary/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary/5 border-b border-primary/10">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Nom
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Source
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Categorie
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Prix
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {filteredDrafts.map((draft) => {
                const effectivePrice = getEffectivePrice(draft);
                const effectiveCategory = getEffectiveCategory(draft);

                return (
                  <tr key={draft.id} className="hover:bg-primary/5">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/curation/${draft.id}`}
                        className="font-medium text-primary hover:text-accent transition-colors"
                      >
                        {getEffectiveName(draft)}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-primary/60">
                      {draft.rawSourceName || "-"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${STATUS_COLORS[draft.status]}`}>
                        {STATUS_LABELS[draft.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-primary/70">
                      {effectiveCategory || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-primary">
                      {effectivePrice ? formatPrice(effectivePrice) : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-primary/60">
                      {new Date(draft.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredDrafts.length === 0 && (
          <div className="p-8 text-center text-primary/60">
            {filter === "all"
              ? "Aucun brouillon. Les produits scrapes apparaitront ici."
              : `Aucun brouillon avec le statut "${STATUS_LABELS[filter as DraftStatus]}".`}
          </div>
        )}
      </div>
    </div>
  );
}
