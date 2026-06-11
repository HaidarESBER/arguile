"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Promotion } from "@/types/promotion";
import {
  createPromotionAction,
  updatePromotionAction,
  togglePromotionAction,
  deletePromotionAction,
} from "./actions";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "\u2014";
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatValue(promo: Promotion): string {
  if (promo.discountType === "percentage") {
    return `${promo.discountValue}%`;
  }
  return `${(promo.discountValue / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
  })} \u20AC`;
}

function formatMinOrder(cents: number): string {
  if (cents === 0) return "\u2014";
  return `${(cents / 100).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
  })} \u20AC`;
}

function formatUses(promo: Promotion): string {
  if (promo.maxUses === null) return `${promo.currentUses}/\u221E`;
  return `${promo.currentUses}/${promo.maxUses}`;
}

function formatValidity(promo: Promotion): string {
  if (!promo.expiresAt) return "Permanent";
  return `${formatDate(promo.startsAt)} - ${formatDate(promo.expiresAt)}`;
}

function isExpired(promo: Promotion): boolean {
  if (!promo.expiresAt) return false;
  return new Date(promo.expiresAt) < new Date();
}

function toDateInputValue(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toISOString().slice(0, 16);
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------
// Promotion Form (used for both create and edit)
// ---------------------------------------------------------------------------

function PromotionForm({
  initial,
  onSubmit,
  onCancel,
}: {
  initial?: Promotion;
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}) {
  const [discountType, setDiscountType] = useState(
    initial?.discountType ?? "percentage"
  );
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget);
    await onSubmit(formData);
    setSubmitting(false);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-secondary rounded-lg border border-primary/10 p-6 space-y-4"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Code */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Code
          </label>
          <input
            name="code"
            type="text"
            required
            defaultValue={initial?.code ?? ""}
            className="w-full px-3 py-2 border border-primary/20 rounded-md bg-background text-primary uppercase placeholder:normal-case"
            placeholder="ex: BIENVENUE10"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Description (optionnel)
          </label>
          <input
            name="description"
            type="text"
            defaultValue={initial?.description ?? ""}
            className="w-full px-3 py-2 border border-primary/20 rounded-md bg-background text-primary"
            placeholder="Note interne"
          />
        </div>
      </div>

      {/* Discount type + value */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Type de remise
          </label>
          <div className="flex gap-4 mt-2">
            <label className="flex items-center gap-1.5 text-sm text-primary cursor-pointer">
              <input
                type="radio"
                name="discountType"
                value="percentage"
                checked={discountType === "percentage"}
                onChange={() => setDiscountType("percentage")}
              />
              Pourcentage
            </label>
            <label className="flex items-center gap-1.5 text-sm text-primary cursor-pointer">
              <input
                type="radio"
                name="discountType"
                value="fixed_amount"
                checked={discountType === "fixed_amount"}
                onChange={() => setDiscountType("fixed_amount")}
              />
              Montant fixe
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Valeur {discountType === "percentage" ? "(%)" : "(\u20AC)"}
          </label>
          <input
            name="discountValue"
            type="number"
            required
            min="0"
            step={discountType === "percentage" ? "1" : "0.01"}
            defaultValue={
              initial
                ? initial.discountType === "percentage"
                  ? initial.discountValue
                  : (initial.discountValue / 100).toFixed(2)
                : ""
            }
            className="w-full px-3 py-2 border border-primary/20 rounded-md bg-background text-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Commande min. (\u20AC)
          </label>
          <input
            name="minimumOrder"
            type="number"
            min="0"
            step="0.01"
            defaultValue={
              initial && initial.minimumOrder > 0
                ? (initial.minimumOrder / 100).toFixed(2)
                : ""
            }
            className="w-full px-3 py-2 border border-primary/20 rounded-md bg-background text-primary"
            placeholder="0 = pas de minimum"
          />
        </div>
      </div>

      {/* Usage + dates */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Utilisations max.
          </label>
          <input
            name="maxUses"
            type="number"
            min="0"
            defaultValue={initial?.maxUses ?? ""}
            className="w-full px-3 py-2 border border-primary/20 rounded-md bg-background text-primary"
            placeholder="Illimite"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Date de debut
          </label>
          <input
            name="startsAt"
            type="datetime-local"
            defaultValue={toDateInputValue(initial?.startsAt)}
            className="w-full px-3 py-2 border border-primary/20 rounded-md bg-background text-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-primary mb-1">
            Date de fin
          </label>
          <input
            name="expiresAt"
            type="datetime-local"
            defaultValue={toDateInputValue(initial?.expiresAt)}
            className="w-full px-3 py-2 border border-primary/20 rounded-md bg-background text-primary"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-primary text-background rounded-md hover:bg-accent hover:text-primary transition-colors disabled:opacity-50"
        >
          {submitting
            ? "Enregistrement..."
            : initial
              ? "Mettre a jour"
              : "Creer le code promo"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-primary/30 text-primary rounded-md hover:bg-primary/5 transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Main Client Component
// ---------------------------------------------------------------------------

export function PromotionsClient({
  promotions,
}: {
  promotions: Promotion[];
}) {
  const router = useRouter();
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate(formData: FormData) {
    setError(null);
    const result = await createPromotionAction(formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    setShowCreate(false);
    router.refresh();
  }

  async function handleUpdate(id: string, formData: FormData) {
    setError(null);
    const result = await updatePromotionAction(id, formData);
    if (result.error) {
      setError(result.error);
      return;
    }
    setEditingId(null);
    router.refresh();
  }

  async function handleToggle(id: string, currentActive: boolean) {
    setError(null);
    const result = await togglePromotionAction(id, !currentActive);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  async function handleDelete(id: string, code: string) {
    if (!confirm(`Supprimer le code promo "${code}" ?`)) return;
    setError(null);
    const result = await deletePromotionAction(id);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Create button / form */}
      {!showCreate && editingId === null && (
        <button
          onClick={() => setShowCreate(true)}
          className="inline-flex items-center px-4 py-2 bg-primary text-background rounded-md hover:bg-accent hover:text-primary transition-colors"
        >
          + Nouveau code promo
        </button>
      )}

      {showCreate && (
        <PromotionForm
          onSubmit={handleCreate}
          onCancel={() => {
            setShowCreate(false);
            setError(null);
          }}
        />
      )}

      {/* Promotions Table */}
      <div className="bg-secondary rounded-lg border border-primary/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-primary/5 border-b border-primary/10">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Code
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Valeur
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Min. commande
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Utilisations
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Validite
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Statut
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {promotions.map((promo) => {
                const expired = isExpired(promo);

                if (editingId === promo.id) {
                  return (
                    <tr key={promo.id}>
                      <td colSpan={8} className="p-4">
                        <PromotionForm
                          initial={promo}
                          onSubmit={(formData) =>
                            handleUpdate(promo.id, formData)
                          }
                          onCancel={() => {
                            setEditingId(null);
                            setError(null);
                          }}
                        />
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={promo.id}
                    className={`hover:bg-primary/5 ${expired ? "opacity-50" : ""}`}
                  >
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-primary">
                        {promo.code}
                      </span>
                      {promo.description && (
                        <p className="text-xs text-primary/50 mt-0.5">
                          {promo.description}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${
                          promo.discountType === "percentage"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {promo.discountType === "percentage" ? "%" : "\u20AC"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-primary font-medium">
                      {formatValue(promo)}
                    </td>
                    <td className="px-4 py-3 text-primary/70">
                      {formatMinOrder(promo.minimumOrder)}
                    </td>
                    <td className="px-4 py-3 text-primary/70">
                      {formatUses(promo)}
                    </td>
                    <td className="px-4 py-3 text-primary/70 text-sm">
                      {formatValidity(promo)}
                    </td>
                    <td className="px-4 py-3">
                      {expired ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
                          Expire
                        </span>
                      ) : promo.isActive ? (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded">
                          Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingId(promo.id);
                            setShowCreate(false);
                            setError(null);
                          }}
                          className="px-3 py-1 text-sm border border-primary/30 text-primary rounded hover:bg-primary hover:text-background transition-colors"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() =>
                            handleToggle(promo.id, promo.isActive)
                          }
                          className={`px-3 py-1 text-sm rounded transition-colors ${
                            promo.isActive
                              ? "border border-orange-300 text-orange-700 hover:bg-orange-50"
                              : "border border-green-300 text-green-700 hover:bg-green-50"
                          }`}
                        >
                          {promo.isActive ? "Desactiver" : "Activer"}
                        </button>
                        <button
                          onClick={() => handleDelete(promo.id, promo.code)}
                          className="px-3 py-1 text-sm border border-red-300 text-red-700 rounded hover:bg-red-50 transition-colors"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {promotions.length === 0 && (
          <div className="p-8 text-center text-primary/60">
            Aucun code promo. Creez-en un pour commencer.
          </div>
        )}
      </div>
    </div>
  );
}
