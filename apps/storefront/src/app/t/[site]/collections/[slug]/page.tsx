import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { dataFor } from "@/lib/data";
import { renderThemePage } from "@/lib/render";
import { pageMeta, readParams, segment, siteOr404, type PageProps } from "@/lib/pages";

type P = PageProps<{ slug: string }>;

export async function generateMetadata({ params, searchParams }: P): Promise<Metadata> {
  const site = await siteOr404(params);
  const slug = segment((await params).slug);
  const path = `/collections/${slug}`;
  const data = dataFor(site, path);
  const [collection, seo] = await Promise.all([data.getCollection(slug), slug === "all" ? null : data.getCollectionSeo(slug)]);
  if (!collection) return { title: "Collection not found" };
  const sp = await readParams(searchParams);
  // Filtered / sorted / paginated variants are not separate pages for search engines.
  const filtered = !!(sp.sort || sp.min || sp.max || sp.instock || (sp.page && sp.page !== "1"));
  return pageMeta(site, path, {
    title: seo?.title || collection.title,
    description: seo?.description || collection.description || `Shop ${collection.title} at ${site.store.name}.`,
    image: seo?.image || collection.image?.url,
    noindex: filtered,
  });
}

export default async function CollectionPage({ params, searchParams }: P) {
  const site = await siteOr404(params);
  const slug = segment((await params).slug);
  const path = `/collections/${slug}`;
  const collection = await dataFor(site, path).getCollection(slug);
  if (!collection) notFound();
  return renderThemePage(site, "collection", { path, searchParams: await readParams(searchParams), resources: { collection } });
}
