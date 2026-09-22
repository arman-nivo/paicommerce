import type { Metadata } from "next";
import { renderThemePage } from "@/lib/render";
import { pageMeta, readParams, siteOr404, type PageProps } from "@/lib/pages";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const site = await siteOr404(params);
  return pageMeta(site, "/collections", { title: "Collections", description: `Browse every collection at ${site.store.name}.` });
}

export default async function CollectionsPage({ params, searchParams }: PageProps) {
  const site = await siteOr404(params);
  return renderThemePage(site, "collections", { path: "/collections", searchParams: await readParams(searchParams) });
}
