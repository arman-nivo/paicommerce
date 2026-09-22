/**
 * Theme Store catalogue helpers (server only).
 * DB `themes` rows are the listing; empty fields fall back to the theme package manifest.
 */
import { and, db, developers, eq, inArray, storeThemes, themePurchases, themes } from "@pai/db";
import { STOREFRONT_ROOT_DOMAIN } from "@pai/core";
import { BUSINESS_CATEGORIES } from "@pai/theme-sdk";
import { getManifest } from "@pai/theme-registry/manifests";

export type CatalogTheme = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  categories: string[];
  tags: string[];
  price: number;
  version: string;
  thumbnailUrl: string | null;
  screenshots: string[];
  features: string[];
  demoStoreSlug: string | null;
  featured: boolean;
  ratingAvg: number;
  ratingCount: number;
  installs: number;
  status: string;
  developerId: string | null;
  author: string;
  authorVerified: boolean;
  authorUrl: string | null;
  releasedAt: Date;
};

const selection = {
  theme: themes,
  devName: developers.displayName,
  devVerified: developers.verified,
  devWebsite: developers.website,
};

type Row = { theme: typeof themes.$inferSelect; devName: string | null; devVerified: boolean | null; devWebsite: string | null };

function toCatalog(r: Row): CatalogTheme {
  const t = r.theme;
  const m = getManifest(t.slug);
  return {
    id: t.id,
    slug: t.slug,
    name: t.name || m?.name || t.slug,
    tagline: t.tagline || m?.tagline || "",
    description: t.description || m?.description || "",
    categories: t.categories.length ? t.categories : (m?.categories ?? []),
    tags: t.tags.length ? t.tags : (m?.tags ?? []),
    price: t.price,
    version: t.version || m?.version || "1.0.0",
    thumbnailUrl: t.thumbnailUrl || m?.thumbnail || null,
    screenshots: t.screenshots.length ? t.screenshots : (m?.screenshots ?? []),
    features: t.features.length ? t.features : (m?.features ?? []),
    demoStoreSlug: t.demoStoreSlug,
    featured: t.featured,
    ratingAvg: t.ratingAvg,
    ratingCount: t.ratingCount,
    installs: t.installs,
    status: t.status,
    developerId: t.developerId,
    author: r.devName || m?.author.name || "PaiCommerce",
    authorVerified: !!r.devVerified,
    authorUrl: r.devWebsite || m?.author.url || null,
    releasedAt: t.approvedAt ?? t.createdAt,
  };
}

/** All approved themes in the Theme Store. */
export async function getApprovedThemes(): Promise<CatalogTheme[]> {
  const rows = await db.select(selection).from(themes).leftJoin(developers, eq(developers.id, themes.developerId)).where(eq(themes.status, "approved"));
  return rows.map(toCatalog);
}

export async function getThemeBySlug(slug: string): Promise<CatalogTheme | null> {
  const [row] = await db.select(selection).from(themes).leftJoin(developers, eq(developers.id, themes.developerId)).where(eq(themes.slug, slug)).limit(1);
  return row ? toCatalog(row) : null;
}

/** Per-store ownership info: installed slugs (with counts), live slug, purchased theme ids. */
export async function getStoreThemeState(storeId: string) {
  const [rows, purchases] = await Promise.all([
    db.select({ id: storeThemes.id, themeSlug: storeThemes.themeSlug, role: storeThemes.role }).from(storeThemes).where(eq(storeThemes.storeId, storeId)),
    db.select({ themeId: themePurchases.themeId }).from(themePurchases).where(eq(themePurchases.storeId, storeId)),
  ]);
  const installed = new Map<string, number>();
  for (const r of rows) installed.set(r.themeSlug, (installed.get(r.themeSlug) ?? 0) + 1);
  return {
    installed,
    liveSlug: rows.find((r) => r.role === "live")?.themeSlug ?? null,
    purchased: new Set(purchases.map((p) => p.themeId)),
    firstInstallId: (slug: string) => rows.find((r) => r.themeSlug === slug)?.id ?? null,
  };
}

export async function hasPurchased(storeId: string, themeId: string) {
  const [p] = await db.select({ id: themePurchases.id }).from(themePurchases).where(and(eq(themePurchases.storeId, storeId), eq(themePurchases.themeId, themeId))).limit(1);
  return !!p;
}

export type ThemeMeta = { thumbnail: string | null; version: string; themeName: string; storeSlug: string | null };

/** Listing metadata for installed themes by slug (DB listing first, then manifest). */
export async function getThemeMeta(slugs: string[]): Promise<Record<string, ThemeMeta>> {
  const out: Record<string, ThemeMeta> = {};
  const uniq = [...new Set(slugs)];
  if (!uniq.length) return out;
  const rows = await db
    .select({ slug: themes.slug, name: themes.name, thumbnailUrl: themes.thumbnailUrl, version: themes.version, status: themes.status })
    .from(themes)
    .where(inArray(themes.slug, uniq));
  for (const s of uniq) {
    const r = rows.find((x) => x.slug === s);
    const m = getManifest(s);
    out[s] = {
      thumbnail: r?.thumbnailUrl || m?.thumbnail || null,
      version: r?.version || m?.version || "1.0.0",
      themeName: r?.name || m?.name || s,
      storeSlug: r && (r.status === "approved" || r.status === "unlisted") ? s : null,
    };
  }
  return out;
}

export function demoUrl(demoStoreSlug: string | null) {
  if (!demoStoreSlug) return null;
  const proto = STOREFRONT_ROOT_DOMAIN.startsWith("localhost") ? "http" : "https";
  return `${proto}://${demoStoreSlug}.${STOREFRONT_ROOT_DOMAIN}`;
}

export const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(BUSINESS_CATEGORIES.map((c) => [c.id, c.label]));
export const CATEGORY_OPTIONS = BUSINESS_CATEGORIES.map((c) => ({ id: c.id as string, label: c.label as string }));
