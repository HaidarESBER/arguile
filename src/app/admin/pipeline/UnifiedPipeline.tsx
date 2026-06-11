"use client";

import { useState, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  RefreshCw,
  MessageSquare,
  Sparkles,
  Trash2,
  CheckCircle,
  XCircle,
  Eye,
  Edit3,
  Upload,
  Globe,
  ImageIcon,
  AlertTriangle,
  ExternalLink,
  X,
  Link as LinkIcon,
  Package,
  Loader2,
} from "lucide-react";
import { ScrapedProduct, ScrapedReview } from "@/types/scraper";
import {
  ProductDraft,
  getEffectiveName,
  getEffectiveDescription,
  getEffectiveCategory,
  getEffectivePrice,
  getEffectiveImages,
} from "@/types/curation";
import { ProductCategory, categoryLabels, formatPrice } from "@/types/product";
import {
  pipelineScrape,
  pipelineDeleteScraped,
  pipelineRetryScrape,
  pipelineRescrapeReviews,
  pipelineSendToCuration,
  pipelineBatchTranslate,
  pipelineRetranslate,
  pipelineSaveCurated,
  pipelineApprove,
  pipelineReject,
  pipelineSetInReview,
  pipelinePublish,
  pipelineUnpublish,
  pipelineRemoveDraft,
  pipelineUploadReviewImages,
  pipelineSyncReviewImages,
  pipelineUpdateReview,
} from "./actions";

// ─── Types ───────────────────────────────────────────────
type TabFilter = "all" | "scraped" | "translating" | "ready" | "published";

type UnifiedItem =
  | { type: "scraped"; data: ScrapedProduct; stage: "scraped" }
  | { type: "draft"; data: ProductDraft; stage: "translating" | "ready" | "published" };

interface UnifiedPipelineProps {
  scrapedProducts: ScrapedProduct[];
  drafts: ProductDraft[];
  reviewsByProduct: Record<string, ScrapedReview[]>;
  stats: { total: number; scraped: number; translating: number; ready: number; published: number };
}

const CATEGORIES: ProductCategory[] = ["chicha", "bol", "tuyau", "charbon", "accessoire"];

const STEPS = [
  { key: "scraped", label: "Scrape" },
  { key: "translating", label: "Traduire" },
  { key: "ready", label: "Revue" },
  { key: "published", label: "Publier" },
] as const;

const STAGE_INDEX: Record<string, number> = { scraped: 0, translating: 1, ready: 2, published: 3 };

// ─── Main Component ──────────────────────────────────────
export function UnifiedPipeline({ scrapedProducts, drafts, reviewsByProduct, stats }: UnifiedPipelineProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<TabFilter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [scrapeUrl, setScrapeUrl] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [editingDraft, setEditingDraft] = useState<ProductDraft | null>(null);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [editedReviewText, setEditedReviewText] = useState("");
  const [rejectingDraftId, setRejectingDraftId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const notify = (type: "success" | "error" | "info", text: string) => {
    setToast({ type, text });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 4000);
  };

  // Build unified items
  const items: UnifiedItem[] = [
    ...scrapedProducts.map((p): UnifiedItem => ({ type: "scraped", data: p, stage: "scraped" })),
    ...drafts.map((d): UnifiedItem => {
      const stage =
        d.status === "translating" || d.status === "pending_translation"
          ? "translating"
          : d.status === "published" && d.publishedProductId
          ? "published"
          : "ready";
      return { type: "draft", data: d, stage } as UnifiedItem;
    }),
  ];

  const filtered = activeTab === "all" ? items : items.filter((i) => i.stage === activeTab);

  const getReviews = (item: UnifiedItem): ScrapedReview[] => {
    const key = item.type === "scraped" ? item.data.id : item.data.scrapedProductId;
    return key ? reviewsByProduct[key] || [] : [];
  };

  // Scrape
  const handleScrape = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scrapeUrl.trim()) return;
    startTransition(async () => {
      const r = await pipelineScrape(scrapeUrl);
      if (r.success) {
        notify("success", "Produit scrape !");
        setScrapeUrl("");
      } else {
        notify("error", r.error || "Echec");
      }
      router.refresh();
    });
  };

  // Tab config
  const tabs: { value: TabFilter; label: string; count: number; dot: string }[] = [
    { value: "all", label: "Tous", count: stats.total, dot: "bg-primary/60" },
    { value: "scraped", label: "Scrapes", count: stats.scraped, dot: "bg-sky-500" },
    { value: "translating", label: "Traduction", count: stats.translating, dot: "bg-amber-500" },
    { value: "ready", label: "Prets", count: stats.ready, dot: "bg-emerald-500" },
    { value: "published", label: "Publies", count: stats.published, dot: "bg-violet-500" },
  ];

  return (
    <div className="space-y-5 relative">
      {/* Loading overlay */}
      {isPending && (
        <div className="fixed inset-0 bg-background/40 backdrop-blur-[2px] z-40 flex items-center justify-center pointer-events-none">
          <div className="bg-background-card px-5 py-3 rounded-xl shadow-lg border border-primary/10 flex items-center gap-3 pointer-events-auto">
            <Loader2 className="w-4 h-4 animate-spin text-accent" />
            <span className="text-sm text-primary/70">Chargement...</span>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-sm shadow-lg border backdrop-blur-sm max-w-sm
            ${toast.type === "success" ? "bg-emerald-50/95 text-emerald-800 border-emerald-200" : ""}
            ${toast.type === "error" ? "bg-red-50/95 text-red-800 border-red-200" : ""}
            ${toast.type === "info" ? "bg-sky-50/95 text-sky-800 border-sky-200" : ""}
          `}
        >
          {toast.type === "success" && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
          {toast.type === "error" && <XCircle className="w-4 h-4 flex-shrink-0" />}
          {toast.type === "info" && <Sparkles className="w-4 h-4 flex-shrink-0" />}
          <span className="flex-1 leading-snug">{toast.text}</span>
          <button onClick={() => setToast(null)} className="p-0.5 hover:opacity-60 flex-shrink-0">
            <X className="w-3 h-3" />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-heading font-bold text-primary">Pipeline</h1>
          <p className="text-xs text-primary/50 mt-0.5">Scraping, traduction, curation, publication</p>
        </div>
        <button
          onClick={() =>
            startTransition(async () => {
              const r = await pipelineBatchTranslate();
              notify("info", `${r.translated} traduit(s), ${r.errors} erreur(s)`);
              router.refresh();
            })
          }
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all bg-primary text-background hover:bg-accent hover:text-primary disabled:opacity-50"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Traduire tout
        </button>
      </div>

      {/* Scrape bar */}
      <form onSubmit={handleScrape} className="flex gap-2">
        <div className="relative flex-1">
          <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/30" />
          <input
            type="url"
            value={scrapeUrl}
            onChange={(e) => setScrapeUrl(e.target.value)}
            placeholder="Coller un lien produit..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-primary/15 bg-background-card text-sm text-primary placeholder:text-primary/35 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent/40 transition-all"
            required
            disabled={isPending}
          />
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 rounded-lg text-sm font-medium bg-primary text-background hover:bg-accent hover:text-primary transition-all disabled:opacity-50 whitespace-nowrap"
        >
          Scraper
        </button>
      </form>

      {/* Tabs */}
      <div className="flex gap-1.5 bg-background-card rounded-xl p-1.5 border border-primary/8">
        {tabs.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveTab(t.value)}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
              activeTab === t.value
                ? "bg-primary text-background shadow-sm"
                : "text-primary/55 hover:text-primary hover:bg-primary/5"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${activeTab === t.value ? "bg-background" : t.dot}`} />
            {t.label}
            <span className={`tabular-nums ${activeTab === t.value ? "text-background/70" : "text-primary/35"}`}>
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* Product list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-primary/40">
          <Package className="w-10 h-10 mb-3 stroke-[1.5]" />
          <p className="text-sm">
            {activeTab === "all" ? "Aucun produit. Collez un lien ci-dessus !" : "Aucun produit ici."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((item) => (
            <ProductRow
              key={item.data.id}
              item={item}
              reviews={getReviews(item)}
              isExpanded={expandedId === item.data.id}
              isPending={isPending}
              editingReviewId={editingReviewId}
              editedReviewText={editedReviewText}
              onToggle={() => setExpandedId(expandedId === item.data.id ? null : item.data.id)}
              onAction={(fn) => startTransition(fn)}
              onNotify={notify}
              onRefresh={() => router.refresh()}
              onEditDraft={setEditingDraft}
              onRejectDraft={setRejectingDraftId}
              onEditReview={(id, text) => { setEditingReviewId(id); setEditedReviewText(text); }}
              onCancelEditReview={() => setEditingReviewId(null)}
              onEditReviewTextChange={setEditedReviewText}
            />
          ))}
        </div>
      )}

      {/* Edit Modal */}
      {editingDraft && (
        <EditModal
          draft={editingDraft}
          isPending={isPending}
          onSave={(fields) =>
            startTransition(async () => {
              await pipelineSaveCurated(editingDraft.id, fields);
              notify("success", "Enregistre !");
              setEditingDraft(null);
              router.refresh();
            })
          }
          onClose={() => setEditingDraft(null)}
        />
      )}

      {/* Reject Modal */}
      {rejectingDraftId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
          <div className="bg-background-card rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4 border border-primary/10">
            <h3 className="font-heading font-semibold text-primary text-lg">Rejeter</h3>
            <textarea
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Raison du rejet..."
              className="w-full px-3 py-2 border border-primary/15 rounded-lg bg-background text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent/40"
              autoFocus
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => { setRejectingDraftId(null); setRejectionReason(""); }}
                className="px-4 py-2 text-sm text-primary/60 hover:text-primary transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  if (!rejectionReason.trim()) return;
                  startTransition(async () => {
                    await pipelineReject(rejectingDraftId, rejectionReason);
                    notify("info", "Rejete");
                    setRejectingDraftId(null);
                    setRejectionReason("");
                    router.refresh();
                  });
                }}
                disabled={isPending || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Product Row ─────────────────────────────────────────
function ProductRow({
  item,
  reviews,
  isExpanded,
  isPending,
  editingReviewId,
  editedReviewText,
  onToggle,
  onAction,
  onNotify,
  onRefresh,
  onEditDraft,
  onRejectDraft,
  onEditReview,
  onCancelEditReview,
  onEditReviewTextChange,
}: {
  item: UnifiedItem;
  reviews: ScrapedReview[];
  isExpanded: boolean;
  isPending: boolean;
  editingReviewId: string | null;
  editedReviewText: string;
  onToggle: () => void;
  onAction: (fn: () => Promise<void>) => void;
  onNotify: (type: "success" | "error" | "info", text: string) => void;
  onRefresh: () => void;
  onEditDraft: (d: ProductDraft) => void;
  onRejectDraft: (id: string) => void;
  onEditReview: (id: string, text: string) => void;
  onCancelEditReview: () => void;
  onEditReviewTextChange: (text: string) => void;
}) {
  const name = item.type === "scraped" ? item.data.rawName : getEffectiveName(item.data);
  const stageIdx = STAGE_INDEX[item.stage] ?? 0;

  const allImages =
    item.type === "scraped"
      ? item.data.rawImages.map((raw, i) => item.data.uploadedImageUrls[i] || raw)
      : getEffectiveImages(item.data);
  const heroImg = allImages[0] || "";

  const price =
    item.type === "draft" ? getEffectivePrice(item.data) : null;
  const priceText =
    item.type === "scraped" ? item.data.rawPriceText : null;

  return (
    <div
      className={`bg-background-card rounded-xl border transition-all duration-200 ${
        isExpanded ? "border-accent/30 shadow-md" : "border-primary/8 hover:border-primary/15 hover:shadow-sm"
      }`}
    >
      {/* ── Collapsed row ── */}
      <div className="flex items-center gap-4 px-4 py-3 cursor-pointer select-none" onClick={onToggle}>
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-background">
          {heroImg ? (
            <img src={heroImg} alt="" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-5 h-5 text-primary/15" />
            </div>
          )}
        </div>

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm text-primary truncate leading-tight">{name}</h3>
          <div className="flex items-center gap-3 mt-1 text-[11px] text-primary/45">
            {reviews.length > 0 && (
              <span className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                {reviews.length}
              </span>
            )}
            {price && <span className="text-primary/65 font-medium">{formatPrice(price)}</span>}
            {priceText && <span>{priceText}</span>}
            {item.type === "scraped" && (
              <span className="flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                {item.data.rawImages.length}
              </span>
            )}
          </div>
        </div>

        {/* Step indicator */}
        <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full transition-colors ${
                  i <= stageIdx ? "bg-accent" : "bg-primary/10"
                }`}
                title={s.label}
              />
              {i < STEPS.length - 1 && (
                <div className={`w-4 h-px ${i < stageIdx ? "bg-accent" : "bg-primary/10"}`} />
              )}
            </div>
          ))}
        </div>

        {/* Primary CTA */}
        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
          <PrimaryCTA item={item} isPending={isPending} onAction={onAction} onNotify={onNotify} onRefresh={onRefresh} />
          <ChevronDown
            className={`w-4 h-4 text-primary/30 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* ── Expanded panel ── */}
      {isExpanded && (
        <div className="border-t border-primary/8 px-4 pb-4 pt-3 space-y-4">
          {/* Image strip */}
          {allImages.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {allImages.map((img, i) => (
                <a
                  key={i}
                  href={img}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0"
                >
                  <img
                    src={img}
                    alt=""
                    className="w-20 h-20 rounded-lg object-cover border border-primary/8 hover:border-accent/40 transition-all"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80"%3E%3Crect width="80" height="80" fill="%23fef2f2"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="11" fill="%23ef4444"%3Eerr%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </a>
              ))}
            </div>
          )}

          {/* Details grid */}
          <DetailsGrid item={item} />

          {/* Reviews */}
          {reviews.length > 0 && (
            <ReviewsList
              reviews={reviews}
              editingReviewId={editingReviewId}
              editedReviewText={editedReviewText}
              isPending={isPending}
              onAction={onAction}
              onRefresh={onRefresh}
              onEditReview={onEditReview}
              onCancelEditReview={onCancelEditReview}
              onEditReviewTextChange={onEditReviewTextChange}
            />
          )}

          {/* Action bar */}
          <ActionBar
            item={item}
            reviews={reviews}
            isPending={isPending}
            onAction={onAction}
            onNotify={onNotify}
            onRefresh={onRefresh}
            onEditDraft={onEditDraft}
            onRejectDraft={onRejectDraft}
            onCollapse={onToggle}
          />
        </div>
      )}
    </div>
  );
}

// ─── Primary CTA (on collapsed row) ─────────────────────
function PrimaryCTA({
  item, isPending, onAction, onNotify, onRefresh,
}: {
  item: UnifiedItem; isPending: boolean;
  onAction: (fn: () => Promise<void>) => void; onNotify: (t: "success"|"error"|"info", m: string) => void; onRefresh: () => void;
}) {
  if (item.type === "scraped") {
    return (
      <button
        onClick={() =>
          onAction(async () => {
            const r = await pipelineSendToCuration(item.data.id);
            if (r.success) onNotify("success", "Envoye !");
            else onNotify("error", r.error || "Echec");
            onRefresh();
          })
        }
        disabled={isPending}
        className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-sky-500 text-white hover:bg-sky-600 transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        Traduire
      </button>
    );
  }

  const d = item.data;
  if (d.status === "translated" || d.status === "in_review") {
    return (
      <button
        onClick={() =>
          onAction(async () => { await pipelineApprove(d.id); onNotify("success", "Approuve !"); onRefresh(); })
        }
        disabled={isPending}
        className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        Approuver
      </button>
    );
  }
  if (d.status === "approved") {
    return (
      <button
        onClick={() =>
          onAction(async () => { await pipelinePublish(d.id); onNotify("success", "Publie !"); onRefresh(); })
        }
        disabled={isPending}
        className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 whitespace-nowrap"
      >
        Publier
      </button>
    );
  }
  if (d.status === "published") {
    return (
      <a
        href={`/produits/${(d as ProductDraft & { slug?: string }).slug || d.publishedProductId}`}
        target="_blank"
        rel="noopener noreferrer"
        className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-violet-500 text-white hover:bg-violet-600 transition-colors whitespace-nowrap inline-flex items-center gap-1"
      >
        <Eye className="w-3 h-3" />
        Voir
      </a>
    );
  }
  // translating
  return (
    <span className="px-3 py-1.5 rounded-lg text-[11px] font-medium bg-amber-100 text-amber-700 whitespace-nowrap inline-flex items-center gap-1.5">
      <Loader2 className="w-3 h-3 animate-spin" />
      Traduction...
    </span>
  );
}

// ─── Details Grid ────────────────────────────────────────
function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-primary/40 mb-0.5">{label}</dt>
      <dd className="text-xs text-primary/80">{children || <span className="text-primary/25">-</span>}</dd>
    </div>
  );
}

function DetailsGrid({ item }: { item: UnifiedItem }) {
  if (item.type === "scraped") {
    return (
      <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 bg-background rounded-lg p-3 border border-primary/6">
        <Cell label="Nom">{item.data.rawName}</Cell>
        <Cell label="Prix">{item.data.rawPriceText}</Cell>
        <Cell label="Categorie">{item.data.rawCategory}</Cell>
        <Cell label="Source">
          <a href={item.data.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline inline-flex items-center gap-1">
            {item.data.sourceName} <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </Cell>
        {item.data.rawDescription && (
          <div className="col-span-full">
            <Cell label="Description">
              <span className="line-clamp-2">{item.data.rawDescription}</span>
            </Cell>
          </div>
        )}
      </dl>
    );
  }

  const d = item.data;
  const cat = getEffectiveCategory(d);

  return (
    <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-3 bg-background rounded-lg p-3 border border-primary/6">
      <Cell label="Nom">{getEffectiveName(d)}</Cell>
      <Cell label="Prix">{getEffectivePrice(d) ? formatPrice(getEffectivePrice(d)!) : null}</Cell>
      <Cell label="Categorie">{cat ? categoryLabels[cat as ProductCategory] || cat : null}</Cell>
      <Cell label="Source">
        {d.rawSourceUrl ? (
          <a href={d.rawSourceUrl} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline inline-flex items-center gap-1">
            {d.rawSourceName || "Lien"} <ExternalLink className="w-2.5 h-2.5" />
          </a>
        ) : null}
      </Cell>

      {/* AI row */}
      {d.aiName && (
        <>
          <div className="col-span-full border-t border-primary/6 pt-2 -mx-3 px-3">
            <span className="text-[10px] uppercase tracking-wider text-accent/70 flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5" /> Traduction IA
            </span>
          </div>
          <Cell label="Nom IA">{d.aiName}</Cell>
          <Cell label="Cat. IA">{d.aiCategory}</Cell>
          <Cell label="Prix suggere">{d.aiSuggestedPrice ? formatPrice(d.aiSuggestedPrice) : null}</Cell>
          <Cell label="Modele">{d.aiModel}</Cell>
        </>
      )}

      {d.translationError && (
        <div className="col-span-full">
          <div className="flex items-start gap-2 px-2.5 py-2 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-700">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
            <span className="break-all">{d.translationError}</span>
          </div>
        </div>
      )}
    </dl>
  );
}

// ─── Reviews List ────────────────────────────────────────
function ReviewsList({
  reviews, editingReviewId, editedReviewText, isPending, onAction, onRefresh, onEditReview, onCancelEditReview, onEditReviewTextChange,
}: {
  reviews: ScrapedReview[]; editingReviewId: string | null; editedReviewText: string; isPending: boolean;
  onAction: (fn: () => Promise<void>) => void; onRefresh: () => void;
  onEditReview: (id: string, text: string) => void; onCancelEditReview: () => void; onEditReviewTextChange: (t: string) => void;
}) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? reviews : reviews.slice(0, 4);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-primary/50 uppercase tracking-wider">
          Avis ({reviews.length})
        </h4>
      </div>
      <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
        {visible.map((rev) => {
          const isEditing = editingReviewId === rev.id;
          const hasRaw = rev.reviewImages?.length > 0;
          const hasUploaded = rev.uploadedReviewImages?.length > 0;
          const imgs = hasUploaded ? rev.uploadedReviewImages : rev.reviewImages || [];

          return (
            <div key={rev.id} className="bg-background rounded-lg border border-primary/6 p-2.5">
              {/* Header */}
              <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                <Stars rating={rev.rating} />
                <StatusPill status={rev.translationStatus} />
                {rev.curatedText && <span className="text-[9px] px-1.5 py-0.5 bg-accent/15 text-accent-dark rounded font-medium">edite</span>}
                {rev.authorName && (
                  <span className="text-[10px] text-primary/35 ml-auto truncate max-w-[140px]">
                    {rev.authorName}{rev.authorCountry ? ` (${rev.authorCountry})` : ""}
                  </span>
                )}
              </div>

              {/* Text */}
              {isEditing ? (
                <div className="space-y-1.5">
                  <textarea
                    value={editedReviewText}
                    onChange={(e) => onEditReviewTextChange(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-primary/15 rounded-lg text-xs text-primary bg-background-card focus:outline-none focus:ring-2 focus:ring-accent/30"
                    rows={3}
                    autoFocus
                  />
                  <div className="flex gap-1.5">
                    <button
                      onClick={() =>
                        onAction(async () => {
                          await pipelineUpdateReview(rev.id, editedReviewText.trim() || null);
                          onCancelEditReview();
                          onRefresh();
                        })
                      }
                      disabled={isPending}
                      className="px-2 py-1 bg-emerald-500 text-white text-[10px] rounded-md hover:bg-emerald-600 disabled:opacity-50 font-medium"
                    >
                      OK
                    </button>
                    <button onClick={onCancelEditReview} className="px-2 py-1 text-primary/50 text-[10px] hover:text-primary">
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <div className="group/review">
                  <p className="text-[11px] text-primary/70 leading-relaxed line-clamp-3">
                    {rev.curatedText || rev.translatedText || rev.reviewText}
                  </p>
                  <button
                    onClick={() => onEditReview(rev.id, rev.curatedText || rev.translatedText || rev.reviewText)}
                    className="text-[10px] text-accent hover:text-accent-dark mt-0.5 opacity-0 group-hover/review:opacity-100 transition-opacity"
                  >
                    editer
                  </button>
                </div>
              )}

              {/* Photos */}
              {imgs.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-primary/35">{imgs.length} photo(s)</span>
                    {hasRaw && !hasUploaded && (
                      <span className="text-[9px] px-1 py-px bg-amber-50 text-amber-600 rounded">brutes</span>
                    )}
                    {hasUploaded && (
                      <span className="text-[9px] px-1 py-px bg-emerald-50 text-emerald-600 rounded flex items-center gap-0.5">
                        <CheckCircle className="w-2 h-2" /> uploadees
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {imgs.map((img, i) => (
                      <a key={i} href={img} target="_blank" rel="noopener noreferrer">
                        <img
                          src={img}
                          alt=""
                          className="w-12 h-12 rounded-md object-cover border border-primary/8 hover:border-accent/30 transition-all"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48"%3E%3Crect width="48" height="48" fill="%23fef2f2"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-size="8" fill="%23ef4444"%3Eerr%3C/text%3E%3C/svg%3E';
                          }}
                        />
                      </a>
                    ))}
                  </div>
                  {/* Debug (collapsed) */}
                  {hasRaw && (
                    <details className="group/debug">
                      <summary className="text-[9px] text-primary/25 cursor-pointer hover:text-primary/40 select-none">
                        debug
                      </summary>
                      <div className="mt-1 px-2 py-1.5 bg-amber-50/60 border border-amber-200/60 rounded text-[9px] text-primary/50 space-y-0.5">
                        <div>raw: {rev.reviewImages.length} | uploaded: {rev.uploadedReviewImages?.length || 0}</div>
                        {rev.reviewImages[0] && <div className="truncate">raw[0]: <span className="text-sky-600">{rev.reviewImages[0]}</span></div>}
                        {rev.uploadedReviewImages?.[0] && <div className="truncate">up[0]: <span className="text-emerald-600">{rev.uploadedReviewImages[0]}</span></div>}
                      </div>
                    </details>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {reviews.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-1.5 text-[11px] text-accent hover:text-accent-dark font-medium"
        >
          {showAll ? "Voir moins" : `Voir les ${reviews.length} avis`}
        </button>
      )}
    </div>
  );
}

// ─── Action Bar ──────────────────────────────────────────
function Btn({
  children, onClick, disabled, variant = "secondary", className = "",
}: {
  children: React.ReactNode; onClick: () => void; disabled: boolean; variant?: "primary" | "secondary" | "danger"; className?: string;
}) {
  const base = "inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg transition-colors disabled:opacity-50 whitespace-nowrap";
  const v = {
    primary: "bg-primary text-background hover:bg-accent hover:text-primary",
    secondary: "bg-primary/6 text-primary/70 hover:bg-primary/12 hover:text-primary",
    danger: "text-red-500 hover:bg-red-50 hover:text-red-600",
  };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${v[variant]} ${className}`}>
      {children}
    </button>
  );
}

function ActionBar({
  item, reviews, isPending, onAction, onNotify, onRefresh, onEditDraft, onRejectDraft, onCollapse,
}: {
  item: UnifiedItem; reviews: ScrapedReview[]; isPending: boolean;
  onAction: (fn: () => Promise<void>) => void; onNotify: (t: "success"|"error"|"info", m: string) => void; onRefresh: () => void;
  onEditDraft: (d: ProductDraft) => void; onRejectDraft: (id: string) => void; onCollapse: () => void;
}) {
  if (item.type === "scraped") {
    return (
      <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-primary/6">
        <Btn
          variant="primary"
          disabled={isPending}
          onClick={() =>
            onAction(async () => {
              const r = await pipelineSendToCuration(item.data.id);
              if (r.success) onNotify("success", "Envoye !");
              else onNotify("error", r.error || "Echec");
              onRefresh();
            })
          }
        >
          <Sparkles className="w-3 h-3" /> Curation & Traduction
        </Btn>
        <Btn disabled={isPending} onClick={() =>
          onAction(async () => {
            const r = await pipelineRetryScrape(item.data.id, item.data.sourceUrl);
            if (r.success) onNotify("success", "Re-scrape OK");
            else onNotify("error", r.error || "Echec");
            onRefresh();
          })
        }>
          <RefreshCw className="w-3 h-3" /> Re-scraper
        </Btn>
        <Btn disabled={isPending} onClick={() =>
          onAction(async () => {
            const r = await pipelineRescrapeReviews(item.data.id, item.data.sourceUrl);
            if (r.success) onNotify("success", r.message || "OK");
            else onNotify("error", r.error || "Echec");
            onRefresh();
          })
        }>
          <MessageSquare className="w-3 h-3" /> Re-scraper avis
        </Btn>
        <div className="flex-1" />
        <Btn
          variant="danger"
          disabled={isPending}
          onClick={() => {
            if (!confirm("Supprimer ce produit ?")) return;
            onAction(async () => {
              const r = await pipelineDeleteScraped(item.data.id);
              if (r.success) {
                onNotify("success", "Supprime");
                onCollapse();
              } else {
                onNotify("error", r.error || "Echec");
              }
              onRefresh();
            });
          }}
        >
          <Trash2 className="w-3 h-3" /> Supprimer
        </Btn>
      </div>
    );
  }

  const d = item.data;
  return (
    <div className="flex items-center gap-1.5 flex-wrap pt-2 border-t border-primary/6">
      {/* Translating */}
      {(d.status === "pending_translation" || d.status === "translating") && (
        <Btn disabled={isPending} onClick={() => onAction(async () => { await pipelineRetranslate(d.id); onNotify("info", "Retraduction lancee"); onRefresh(); })}>
          <RefreshCw className="w-3 h-3" /> Forcer retraduction
        </Btn>
      )}

      {/* Translated / In review */}
      {(d.status === "translated" || d.status === "in_review") && (
        <>
          <Btn disabled={isPending} onClick={() => onEditDraft(d)}><Edit3 className="w-3 h-3" /> Editer</Btn>
          <Btn variant="primary" disabled={isPending} onClick={() => onAction(async () => { await pipelineApprove(d.id); onNotify("success", "Approuve !"); onRefresh(); })}>
            <CheckCircle className="w-3 h-3" /> Approuver
          </Btn>
          <Btn variant="danger" disabled={isPending} onClick={() => onRejectDraft(d.id)}><XCircle className="w-3 h-3" /> Rejeter</Btn>
          <Btn disabled={isPending} onClick={() => onAction(async () => { await pipelineRetranslate(d.id); onNotify("info", "Retraduction"); onRefresh(); })}>
            <Globe className="w-3 h-3" /> Retraduire
          </Btn>
        </>
      )}

      {/* Approved */}
      {d.status === "approved" && (
        <>
          <Btn disabled={isPending} onClick={() => onEditDraft(d)}><Edit3 className="w-3 h-3" /> Editer</Btn>
          <Btn variant="primary" disabled={isPending} onClick={() => onAction(async () => { await pipelinePublish(d.id); onNotify("success", "Publie !"); onRefresh(); })}>
            <CheckCircle className="w-3 h-3" /> Publier
          </Btn>
        </>
      )}

      {/* Rejected */}
      {d.status === "rejected" && (
        <>
          {d.rejectionReason && (
            <span className="text-[10px] text-red-600 bg-red-50 px-2 py-1 rounded-lg border border-red-200 mr-1">
              Raison : {d.rejectionReason}
            </span>
          )}
          <Btn disabled={isPending} onClick={() => onAction(async () => { await pipelineSetInReview(d.id); onNotify("info", "Remis en revue"); onRefresh(); })}>
            <RefreshCw className="w-3 h-3" /> Remettre en revue
          </Btn>
        </>
      )}

      {/* Published */}
      {d.status === "published" && (
        <>
          {d.publishedProductId && (
            <a
              href={`/produits/${(d as ProductDraft & { slug?: string }).slug || d.publishedProductId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium rounded-lg bg-violet-50 text-violet-700 hover:bg-violet-100 transition-colors"
            >
              <ExternalLink className="w-3 h-3" /> Voir sur le site
            </a>
          )}
          {d.scrapedProductId && reviews.some((r) => r.uploadedReviewImages.length > 0) && (
            <Btn disabled={isPending} onClick={() =>
              onAction(async () => {
                const r = await pipelineSyncReviewImages(d.id);
                if (r.success) onNotify("success", r.message || "Sync OK");
                else onNotify("error", r.error || "Echec");
                onRefresh();
              })
            }>
              <RefreshCw className="w-3 h-3" /> Sync images avis
            </Btn>
          )}
          <Btn variant="danger" disabled={isPending} onClick={() => {
            if (!confirm("Depublier ?")) return;
            onAction(async () => { await pipelineUnpublish(d.id); onNotify("info", "Depublie"); onRefresh(); });
          }}>
            <XCircle className="w-3 h-3" /> Depublier
          </Btn>
        </>
      )}

      {/* Upload review images */}
      {d.status !== "published" && d.scrapedProductId && reviews.some((r) => r.reviewImages.length > 0) && (
        <Btn disabled={isPending} onClick={() =>
          onAction(async () => {
            const r = await pipelineUploadReviewImages(d.id, d.scrapedProductId!);
            if (r.success) onNotify("success", r.message || "Upload OK");
            else onNotify("error", r.error || "Echec");
            onRefresh();
          })
        }>
          <Upload className="w-3 h-3" /> Upload images avis
        </Btn>
      )}

      {/* Delete */}
      {d.status !== "published" && (
        <>
          <div className="flex-1" />
          <Btn variant="danger" disabled={isPending} onClick={() => {
            if (!confirm("Supprimer ?")) return;
            onAction(async () => { await pipelineRemoveDraft(d.id); onNotify("success", "Supprime"); onCollapse(); onRefresh(); });
          }}>
            <Trash2 className="w-3 h-3" /> Supprimer
          </Btn>
        </>
      )}
    </div>
  );
}

// ─── Tiny helpers ────────────────────────────────────────
function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={`text-[10px] ${s <= rating ? "text-amber-400" : "text-primary/15"}`}>★</span>
      ))}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, { bg: string; label: string }> = {
    translated: { bg: "bg-emerald-100 text-emerald-700", label: "traduit" },
    pending: { bg: "bg-gray-100 text-gray-500", label: "en attente" },
    failed: { bg: "bg-red-100 text-red-600", label: "echec" },
    translating: { bg: "bg-amber-100 text-amber-600", label: "traduction..." },
  };
  const s = map[status];
  if (!s) return null;
  return <span className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${s.bg}`}>{s.label}</span>;
}

// ─── Edit Modal ──────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] uppercase tracking-wider text-primary/45 font-medium mb-1">{label}</label>
      {children}
    </div>
  );
}

function EditModal({
  draft, isPending, onSave, onClose,
}: {
  draft: ProductDraft; isPending: boolean;
  onSave: (f: { curatedName: string|null; curatedDescription: string|null; curatedShortDescription: string|null; curatedCategory: string|null; curatedPrice: number|null; curatedCompareAtPrice: number|null; curatedImages: string[] }) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(draft.curatedName || getEffectiveName(draft));
  const [desc, setDesc] = useState(draft.curatedDescription || getEffectiveDescription(draft));
  const [shortDesc, setShortDesc] = useState(draft.curatedShortDescription || draft.aiShortDescription || "");
  const [cat, setCat] = useState(draft.curatedCategory || getEffectiveCategory(draft) || "chicha");
  const [price, setPrice] = useState(() => { const p = getEffectivePrice(draft); return p ? (p / 100).toFixed(2) : ""; });
  const [comparePrice, setComparePrice] = useState(draft.curatedCompareAtPrice ? (draft.curatedCompareAtPrice / 100).toFixed(2) : "");
  const [imgs, setImgs] = useState(getEffectiveImages(draft).join(", "));

  const handleSave = () => {
    const pc = price ? Math.round(parseFloat(price) * 100) : null;
    const cc = comparePrice ? Math.round(parseFloat(comparePrice) * 100) : null;
    const il = imgs ? imgs.split(",").map((u) => u.trim()).filter(Boolean) : [];
    onSave({ curatedName: name || null, curatedDescription: desc || null, curatedShortDescription: shortDesc || null, curatedCategory: cat || null, curatedPrice: pc, curatedCompareAtPrice: cc, curatedImages: il });
  };

  const inputCls = "w-full px-3 py-2 border border-primary/12 rounded-lg bg-background text-sm text-primary focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/30 transition-all";

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center z-50 p-4">
      <div className="bg-background-card rounded-xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-primary/10">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-primary/8 flex-shrink-0">
          <h3 className="font-heading font-semibold text-primary text-lg">Editer</h3>
          <button onClick={onClose} className="p-1 text-primary/30 hover:text-primary transition-colors"><X className="w-5 h-5" /></button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <Field label="Nom"><input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} /></Field>
          <Field label="Description"><textarea rows={3} value={desc} onChange={(e) => setDesc(e.target.value)} className={`${inputCls} resize-y`} /></Field>
          <Field label="Description courte"><input type="text" value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} className={inputCls} /></Field>
          <Field label="Categorie">
            <select value={cat} onChange={(e) => setCat(e.target.value)} className={inputCls}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{categoryLabels[c]}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Prix (EUR)"><input type="number" step="0.01" min="0" value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} placeholder="49.99" /></Field>
            <Field label="Prix barre (EUR)"><input type="number" step="0.01" min="0" value={comparePrice} onChange={(e) => setComparePrice(e.target.value)} className={inputCls} placeholder="59.99" /></Field>
          </div>
          <Field label="Images (URLs, virgules)"><textarea rows={2} value={imgs} onChange={(e) => setImgs(e.target.value)} className={`${inputCls} resize-y`} /></Field>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-primary/8 flex-shrink-0">
          <button onClick={onClose} className="px-4 py-2 text-sm text-primary/55 hover:text-primary transition-colors">Annuler</button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="px-5 py-2 bg-primary text-background text-sm rounded-lg hover:bg-accent hover:text-primary transition-all disabled:opacity-50 font-medium"
          >
            {isPending ? "..." : "Enregistrer"}
          </button>
        </div>
      </div>
    </div>
  );
}
