"use client";

import { useState, useTransition } from "react";
import type { NewsletterSubscriber } from "@/types/newsletter";
import { unsubscribeAction, triggerWinBackCampaignAction } from "./actions";

interface Props {
  subscribers: NewsletterSubscriber[];
  activeCount: number;
}

export function NewsletterClient({ subscribers, activeCount }: Props) {
  const [isPending, startTransition] = useTransition();
  const [campaignResult, setCampaignResult] = useState<{
    sent: number;
    skipped: number;
    errors: number;
  } | null>(null);
  const [campaignLoading, setCampaignLoading] = useState(false);

  function handleUnsubscribe(email: string) {
    if (!confirm(`Desinscrire ${email} de la newsletter ?`)) return;
    startTransition(async () => {
      await unsubscribeAction(email);
    });
  }

  async function handleTriggerCampaign() {
    if (!confirm("Lancer la campagne win-back maintenant ?")) return;
    setCampaignLoading(true);
    setCampaignResult(null);
    try {
      const result = await triggerWinBackCampaignAction();
      setCampaignResult({
        sent: result.sent,
        skipped: result.skipped,
        errors: result.errors,
      });
    } catch {
      setCampaignResult({ sent: 0, skipped: 0, errors: 1 });
    } finally {
      setCampaignLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      {/* KPI Card */}
      <div className="bg-white border border-primary/10 rounded-lg p-6 max-w-xs">
        <p className="text-sm text-primary/60 mb-1">Abonnes actifs</p>
        <p className="text-4xl font-heading font-bold text-primary">
          {activeCount}
        </p>
      </div>

      {/* Subscriber Table */}
      <div className="bg-white border border-primary/10 rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-primary/10">
          <h3 className="text-lg font-heading font-semibold text-primary">
            Abonnes
          </h3>
        </div>

        {subscribers.length === 0 ? (
          <p className="px-6 py-8 text-center text-primary/50">
            Aucun abonne pour le moment.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-secondary/50 text-left">
                  <th className="px-6 py-3 font-medium text-primary/70">
                    Email
                  </th>
                  <th className="px-6 py-3 font-medium text-primary/70">
                    Statut
                  </th>
                  <th className="px-6 py-3 font-medium text-primary/70">
                    Source
                  </th>
                  <th className="px-6 py-3 font-medium text-primary/70">
                    Date d&apos;inscription
                  </th>
                  <th className="px-6 py-3 font-medium text-primary/70">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {subscribers.map((sub) => (
                  <tr
                    key={sub.id}
                    className={
                      sub.status === "unsubscribed" ? "opacity-60" : ""
                    }
                  >
                    <td className="px-6 py-3 text-primary">{sub.email}</td>
                    <td className="px-6 py-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                          sub.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {sub.status === "active" ? "Actif" : "Desinscrit"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-primary/70">{sub.source}</td>
                    <td className="px-6 py-3 text-primary/70">
                      {new Date(sub.subscribedAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-6 py-3">
                      {sub.status === "active" && (
                        <button
                          onClick={() => handleUnsubscribe(sub.email)}
                          disabled={isPending}
                          className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50 transition-colors"
                        >
                          Desinscrire
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Campaigns Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-heading font-semibold text-primary">
          Campagnes
        </h3>

        {/* Config overview */}
        <div className="bg-white border border-primary/10 rounded-lg p-6 text-sm text-primary/70 space-y-1">
          <p>
            <span className="font-medium text-primary">Win-back :</span>{" "}
            clients inactifs depuis 30+ jours, max 50 emails par envoi, planifie
            les lundis a 10h.
          </p>
          <p>
            <span className="font-medium text-primary">Panier abandonne :</span>{" "}
            declenche automatiquement via webhook Stripe.
          </p>
        </div>

        {/* Manual trigger */}
        <button
          onClick={handleTriggerCampaign}
          disabled={campaignLoading}
          className="px-4 py-2 bg-primary text-background rounded-md text-sm font-medium hover:bg-primary/90 disabled:opacity-50 transition-colors"
        >
          {campaignLoading
            ? "Envoi en cours..."
            : "Lancer la campagne win-back"}
        </button>

        {/* Campaign result */}
        {campaignResult && (
          <div className="bg-white border border-primary/10 rounded-lg p-4 flex gap-4 text-sm">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-primary">
                {campaignResult.sent} envoye{campaignResult.sent > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
              <span className="text-primary">
                {campaignResult.skipped} ignore
                {campaignResult.skipped > 1 ? "s" : ""}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span className="text-primary">
                {campaignResult.errors} erreur
                {campaignResult.errors > 1 ? "s" : ""}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
