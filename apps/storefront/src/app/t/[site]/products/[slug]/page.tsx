import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { stripHtml, truncate } from "@pai/core";
import { dataFor } from "@/lib/data";
import { renderThemePage } from "@/lib/render";
import { storeBaseUrl } from "@/lib/site";
import { pageMeta, readParams, segment, siteOr404, type PageProps } from "@/lib/pages";

type P = PageProps<{ slug: string }>;

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const site = await siteOr404(params);
  const slug = segment((await params).slug);
  const path = `/products/${slug}`;
  const data = dataFor(site, path);
  const [product, seo] = await Promise.all([data.getProduct(slug), data.getProductSeo(slug)]);
  if (!product) return { title: "Product not found" };
  return pageMeta(site, path, {
    title: seo?.title || product.title,
    description: seo?.description || product.description,
    image: seo?.image || product.featuredImage?.url,
  });
}

export default async function ProductPage({ params, searchParams }: P) {
  const site = await siteOr404(params);
  const slug = segment((await params).slug);
  const path = `/products/${slug}`;
  const sp = await readParams(searchParams);
  const data = dataFor(site, path);
  const product = await data.getProduct(slug);
  if (!product) notFound();
  // Optional collection context for breadcrumbs (?collection=slug).
  const collection = sp.collection ? await data.getCollection(sp.collection) : null;

  const base = await storeBaseUrl(site);
  const origin = new URL(base).origin;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: truncate(stripHtml(product.description), 500) || undefined,
    image: product.images.map((i) => i.url),
    sku: product.variants[0]?.sku ?? undefined,
    brand: product.vendor ? { "@type": "Brand", name: product.vendor } : undefined,
    aggregateRating: product.rating.count ? { "@type": "AggregateRating", ratingValue: product.rating.average.toFixed(1), reviewCount: product.rating.count } : undefined,
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: site.store.currency,
      lowPrice: (product.priceMin / 100).toFixed(2),
      highPrice: (product.priceMax / 100).toFixed(2),
      offerCount: Math.max(1, product.variants.length),
      availability: product.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      url: `${origin}${product.url}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      {await renderThemePage(site, "product", { path, searchParams: sp, resources: { product, collection } })}
    </>
  );
}
