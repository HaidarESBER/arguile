import { Metadata } from "next";
import { CategoryPage, buildCategoryMetadata } from "../CategoryPage";

export function generateMetadata(): Promise<Metadata> {
  return buildCategoryMetadata("chicha");
}

export default function ChichasPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return <CategoryPage category="chicha" searchParams={searchParams} />;
}
