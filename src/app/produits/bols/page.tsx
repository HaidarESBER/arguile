import { Metadata } from "next";
import { CategoryPage, buildCategoryMetadata } from "../CategoryPage";

export function generateMetadata(): Promise<Metadata> {
  return buildCategoryMetadata("bol");
}

export default function BolsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return <CategoryPage category="bol" searchParams={searchParams} />;
}
