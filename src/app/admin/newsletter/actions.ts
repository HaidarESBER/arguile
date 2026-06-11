"use server";

import { requireAdmin } from "@/lib/session";

import { revalidatePath } from "next/cache";
import { unsubscribe } from "@/lib/newsletter";
import { runWinBackCampaign } from "@/lib/email-campaigns";

export async function unsubscribeAction(email: string) {
  await requireAdmin();
  const success = await unsubscribe(email);
  if (success) {
    revalidatePath("/admin/newsletter");
  }
  return success;
}

export async function triggerWinBackCampaignAction() {
  await requireAdmin();
  const summary = await runWinBackCampaign();
  revalidatePath("/admin/newsletter");
  return summary;
}
