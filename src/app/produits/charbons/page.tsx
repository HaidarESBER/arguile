import { Metadata } from "next";
import { CategoryPage, buildCategoryMetadata } from "../CategoryPage";

export function generateMetadata(): Promise<Metadata> {
  return buildCategoryMetadata("charbon");
}

export default function CharbonsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return <CategoryPage category="charbon" searchParams={searchParams} />;
}
