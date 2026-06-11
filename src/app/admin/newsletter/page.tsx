import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/session";
import { getSubscribers, getSubscriberCount } from "@/lib/newsletter";
import { NewsletterClient } from "./NewsletterClient";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  const [subscribers, activeCount] = await Promise.all([
    getSubscribers(),
    getSubscriberCount(),
  ]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-heading font-semibold text-primary">
        Newsletter
      </h2>
      <NewsletterClient subscribers={subscribers} activeCount={activeCount} />
    </div>
  );
}
