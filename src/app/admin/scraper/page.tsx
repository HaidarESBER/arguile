import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/session';
import { getScraperStats, getAllScrapedProducts } from "@/lib/scraper/data";
import { ScraperDashboard } from "./ScraperDashboard";

export const dynamic = "force-dynamic";

export default async function AdminScraperPage() {
  try {
    await requireAdmin();
  } catch {
    redirect("/");
  }

  const [stats, scrapedProducts] = await Promise.all([
    getScraperStats(),
    getAllScrapedProducts(),
  ]);

  return <ScraperDashboard stats={stats} scrapedProducts={scrapedProducts} />;
}
