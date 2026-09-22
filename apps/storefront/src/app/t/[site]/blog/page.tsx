import type { Metadata } from "next";
import { dataFor } from "@/lib/data";
import { renderThemePage } from "@/lib/render";
import { pageMeta, readParams, siteOr404, type PageProps } from "@/lib/pages";

export async function generateMetadata({ params, searchParams }: PageProps): Promise<Metadata> {
  const site = await siteOr404(params);
  const sp = await readParams(searchParams);
  return pageMeta(site, "/blog", { title: "Blog", description: `Stories, guides and news from ${site.store.name}.`, noindex: !!sp.page && sp.page !== "1" });
}

export default async function BlogPage({ params, searchParams }: PageProps) {
  const site = await siteOr404(params);
  const sp = await readParams(searchParams);
  const page = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);
  const posts = await dataFor(site, "/blog").getPosts({ page, limit: 12 });
  return renderThemePage(site, "blog", { path: "/blog", searchParams: sp, resources: { posts } });
}
