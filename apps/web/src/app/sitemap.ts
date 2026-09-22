import type { MetadataRoute } from "next";
import { POSTS } from "@/lib/blog";
import { getThemes } from "@/lib/data";
import { getAllDocSlugs } from "@/lib/docs";
import { LEGAL } from "@/lib/legal";
import { absoluteUrl } from "@/lib/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: { path: string; priority: number; freq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
    { path: "/", priority: 1, freq: "weekly" },
    { path: "/features", priority: 0.9, freq: "monthly" },
    { path: "/pricing", priority: 0.9, freq: "monthly" },
    { path: "/themes", priority: 0.9, freq: "daily" },
    { path: "/developers", priority: 0.7, freq: "monthly" },
    { path: "/about", priority: 0.5, freq: "yearly" },
    { path: "/contact", priority: 0.6, freq: "yearly" },
    { path: "/blog", priority: 0.6, freq: "weekly" },
    { path: "/changelog", priority: 0.5, freq: "weekly" },
    { path: "/status", priority: 0.3, freq: "daily" },
  ];
  const themes = await getThemes();
  return [
    ...staticRoutes.map((r) => ({ url: absoluteUrl(r.path), lastModified: now, changeFrequency: r.freq, priority: r.priority })),
    ...themes.map((t) => ({ url: absoluteUrl(`/themes/${t.slug}`), lastModified: t.updatedAt ? new Date(t.updatedAt) : now, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...POSTS.map((p) => ({ url: absoluteUrl(`/blog/${p.slug}`), lastModified: new Date(p.date), changeFrequency: "monthly" as const, priority: 0.5 })),
    ...getAllDocSlugs().map((s) => ({ url: absoluteUrl(s ? `/docs/${s}` : "/docs"), lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...LEGAL.map((l) => ({ url: absoluteUrl(`/legal/${l.slug}`), lastModified: new Date(l.updated), changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
