import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { renderThemePage } from "@/lib/render";
import { siteUrl, type Site } from "@/lib/site";
import { pageMeta, readParams, siteOr404, type PageProps } from "@/lib/pages";

type P = PageProps<{ kind: string }>;

const POLICIES = {
  refund: "Refund & return policy",
  privacy: "Privacy policy",
  terms: "Terms of service",
  shipping: "Shipping policy",
} as const;

type Kind = keyof typeof POLICIES;

function policy(site: Site, kind: string) {
  if (!(kind in POLICIES)) return null;
  const content = site.store.settings?.policies?.[kind as Kind]?.trim();
  if (!content) return null;
  // Plain-text policies are converted to paragraphs; HTML is kept (sanitised by the theme's RichText).
  const html = /<[a-z][\s\S]*>/i.test(content)
    ? content
    : content
        .split(/\n{2,}/)
        .map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br/>")}</p>`)
        .join("");
  return { id: `policy-${kind}`, slug: kind, url: siteUrl(site, `/policies/${kind}`), title: POLICIES[kind as Kind], content: html };
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const site = await siteOr404(params);
  const p = policy(site, (await params).kind);
  if (!p) return { title: "Page not found" };
  return pageMeta(site, `/policies/${p.slug}`, { title: p.title, description: p.content });
}

/** Store policies from Settings → Policies (`/policies/refund|privacy|terms|shipping`). */
export default async function PolicyPage({ params, searchParams }: P) {
  const site = await siteOr404(params);
  const p = policy(site, (await params).kind);
  if (!p) notFound();
  return renderThemePage(site, "page", { path: `/policies/${p.slug}`, searchParams: await readParams(searchParams), resources: { page: p } });
}
