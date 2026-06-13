import { Metadata } from "next";
import { CategoryPage, buildCategoryMetadata } from "../CategoryPage";

export function generateMetadata(): Promise<Metadata> {
  return buildCategoryMetadata("tuyau");
}

export default function TuyauxPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  return <CategoryPage category="tuyau" searchParams={searchParams} />;
}
