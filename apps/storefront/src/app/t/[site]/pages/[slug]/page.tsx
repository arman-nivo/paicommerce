import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dataFor } from "@/lib/data";
import { renderThemePage } from "@/lib/render";
import { pageMeta, readParams, segment, siteOr404, type PageProps } from "@/lib/pages";

type P = PageProps<{ slug: string }>;

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const site = await siteOr404(params);
  const slug = segment((await params).slug);
  const path = `/pages/${slug}`;
  const page = await dataFor(site, path).getPage(slug);
  if (!page) return { title: "Page not found" };
  return pageMeta(site, path, { title: page.seo?.title || page.title, description: page.seo?.description || page.content, image: page.seo?.image });
}

export default async function ContentPage({ params, searchParams }: P) {
  const site = await siteOr404(params);
  const slug = segment((await params).slug);
  const path = `/pages/${slug}`;
  const page = await dataFor(site, path).getPage(slug);
  if (!page) notFound();
  const { seo: _seo, ...sfPage } = page;
  void _seo;
  return renderThemePage(site, "page", { path, searchParams: await readParams(searchParams), resources: { page: sfPage } });
}
