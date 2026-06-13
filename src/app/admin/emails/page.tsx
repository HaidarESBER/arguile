import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { getEmailLog, emailKindLabels } from "@/lib/email-log";
import { formatDate } from "@/lib/date-utils";

export const dynamic = "force-dynamic";

export default async function AdminEmailsPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  const emails = await getEmailLog();
  const sentCount = emails.filter((e) => e.status === "sent").length;
  const failedCount = emails.filter((e) => e.status === "failed").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h2 className="text-2xl font-heading font-semibold text-primary">
          Emails envoyés
        </h2>
        <div className="flex gap-4 text-sm">
          <span className="text-primary/70">
            <strong className="text-green-600">{sentCount}</strong> envoyés
          </span>
          {failedCount > 0 && (
            <span className="text-primary/70">
              <strong className="text-red-600">{failedCount}</strong> échoués
            </span>
          )}
        </div>
      </div>

      {emails.length === 0 ? (
        <div className="bg-secondary rounded-lg border border-primary/10 p-12 text-center">
          <p className="text-primary/70">Aucun email envoyé pour le moment.</p>
          <p className="text-primary/50 text-sm mt-2">
            Les emails (confirmations de commande, expéditions, messages de
            contact, etc.) apparaîtront ici une fois envoyés.
          </p>
        </div>
      ) : (
        <div className="bg-secondary rounded-lg border border-primary/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-primary/5 border-b border-primary/10">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">Destinataire</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">Sujet</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-primary/70">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/10">
                {emails.map((email) => (
                  <tr key={email.id} className="hover:bg-primary/5 transition-colors">
                    <td className="px-4 py-3 text-sm text-primary/70 whitespace-nowrap">
                      {formatDate(email.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-sm text-primary whitespace-nowrap">
                      {emailKindLabels[email.kind] || email.kind}
                    </td>
                    <td className="px-4 py-3 text-sm text-primary/80">
                      {email.recipient}
                    </td>
                    <td className="px-4 py-3 text-sm text-primary/80 max-w-xs truncate">
                      {email.subject}
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      {email.status === "sent" ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Envoyé
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700"
                          title={email.error || undefined}
                        >
                          Échoué
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs text-primary/50">
        Journal des {emails.length} derniers emails. Pour le détail complet
        (ouvertures, clics), consultez votre tableau de bord Brevo.
      </p>
    </div>
  );
}
