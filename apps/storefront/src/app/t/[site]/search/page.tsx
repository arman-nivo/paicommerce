import type { Metadata } from "next";
import { renderThemePage } from "@/lib/render";
import { pageMeta, readParams, siteOr404, type PageProps } from "@/lib/pages";

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const site = await siteOr404(params);
  const q = (await readParams(searchParams)).q?.trim();
  return pageMeta(site, "/search", { title: q ? `Search: ${q}` : "Search", noindex: true });
}

export default async function SearchPage({ params, searchParams }: PageProps) {
  const site = await siteOr404(params);
  return renderThemePage(site, "search", { path: "/search", searchParams: await readParams(searchParams) });
}
