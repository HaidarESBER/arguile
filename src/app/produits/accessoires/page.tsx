import { Metadata } from "next";
import { CategoryPage, buildCategoryMetadata } from "../CategoryPage";

export function generateMetadata(): Promise<Metadata> {
  return buildCategoryMetadata("accessoire");
}

export default function AccessoiresPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return <CategoryPage category="accessoire" searchParams={searchParams} />;
}
