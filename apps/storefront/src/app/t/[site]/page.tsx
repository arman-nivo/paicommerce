import type { Metadata } from "next";
import { renderThemePage } from "@/lib/render";
import { pageMeta, readParams, siteOr404, type PageProps } from "@/lib/pages";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const site = await siteOr404(params);
  const s = site.store;
  return {
    ...pageMeta(site, "/", { description: s.settings?.seo?.description ?? s.description, image: s.settings?.seo?.image ?? s.logoUrl }),
    title: { absolute: s.settings?.seo?.title ?? s.name },
  };
}

export default async function HomePage({ params, searchParams }: PageProps) {
  const site = await siteOr404(params);
  return renderThemePage(site, "index", { path: "/", searchParams: await readParams(searchParams) });
}
