import { cache } from "react";
import { DEFAULT_PLANS } from "@pai/core";
import type { PlanLimits } from "@pai/db/schema";
import { manifests } from "@pai/theme-registry/manifests";
import type { ThemeManifest } from "@pai/theme-sdk";
import { demoStoreUrl } from "./site";

/* ─────────────────────────── Plans ─────────────────────────── */

export type MarketingPlan = {
  code: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  highlighted: boolean;
  limits: PlanLimits;
  features: string[];
};

const fallbackPlans = (): MarketingPlan[] =>
  DEFAULT_PLANS.map((p) => ({ ...p, currency: "BDT", highlighted: !!p.highlighted }));

async function loadDb() {
  try {
    return await import("@pai/db");
  } catch (e) {
    console.warn("[web] database unavailable:", (e as Error).message);
    return null;
  }
}

/** Active plans from the DB (`plans` table), falling back to DEFAULT_PLANS when empty/unavailable. */
export const getPlans = cache(async (): Promise<MarketingPlan[]> => {
  const mod = await loadDb();
  if (!mod) return fallbackPlans();
  try {
    const { db, plans, eq, asc } = mod;
    const rows = await db.select().from(plans).where(eq(plans.active, true)).orderBy(asc(plans.sort), asc(plans.priceMonthly));
    if (!rows.length) return fallbackPlans();
    return rows.map((r) => ({
      code: r.code,
      name: r.name,
      tagline: r.tagline ?? "",
      priceMonthly: r.priceMonthly,
      priceYearly: r.priceYearly,
      currency: r.currency,
      highlighted: r.highlighted,
      limits: r.limits,
      features: r.features,
    }));
  } catch (e) {
    console.warn("[web] plans query failed:", (e as Error).message);
    return fallbackPlans();
  }
});

/* ─────────────────────────── Themes ─────────────────────────── */

export type StoreTheme = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  categories: string[];
  tags: string[];
  price: number;
  version: string;
  thumbnail: string;
  screenshots: string[];
  features: string[];
  featured: boolean;
  rating: number;
  ratingCount: number;
  installs: number;
  demoUrl: string;
  updatedAt: string | null;
  developer: { name: string; slug: string | null; url: string | null; verified: boolean; bio: string | null };
  /** Theme code is installed in this deployment (has a manifest in the registry). */
  installed: boolean;
};

export { categoryLabel } from "./theme-labels";

function fromManifest(m: ThemeManifest): StoreTheme {
  return {
    slug: m.slug,
    name: m.name,
    tagline: m.tagline,
    description: m.description,
    categories: m.categories,
    tags: m.tags ?? [],
    price: m.price,
    version: m.version,
    thumbnail: m.thumbnail,
    screenshots: m.screenshots ?? [],
    features: m.features ?? [],
    featured: ["aurora", "volt", "freshmart", "lumiere"].includes(m.slug),
    rating: 0,
    ratingCount: 0,
    installs: 0,
    demoUrl: demoStoreUrl(m.slug),
    updatedAt: null,
    developer: { name: m.author.name, slug: null, url: m.author.url ?? null, verified: m.author.name.includes("PaiCommerce"), bio: null },
    installed: true,
  };
}

/** Approved Theme Store listings (DB `themes` joined with code manifests). Falls back to manifests. */
export const getThemes = cache(async (): Promise<StoreTheme[]> => {
  const fallback = () => manifests.map(fromManifest);
  const mod = await loadDb();
  if (!mod) return fallback();
  try {
    const { db, themes, developers, eq } = mod;
    const rows = await db
      .select({ t: themes, d: developers })
      .from(themes)
      .leftJoin(developers, eq(themes.developerId, developers.id));
    if (!rows.length) return fallback();
    // Themes whose code ships with this deployment are listed unless an admin row delists them
    // (draft/in_review/rejected/unlisted); DB-only themes need to be approved.
    const known = new Set(rows.map(({ t }) => t.slug));
    const codeOnly = manifests.filter((m) => !known.has(m.slug)).map(fromManifest);
    const listed = rows
      .filter(({ t }) => t.status === "approved")
      .map(({ t, d }) => {
        const m = manifests.find((x) => x.slug === t.slug);
        const base = m ? fromManifest(m) : null;
        return {
          slug: t.slug,
          name: t.name || base?.name || t.slug,
          tagline: t.tagline ?? base?.tagline ?? "",
          description: t.description ?? base?.description ?? "",
          categories: t.categories.length ? t.categories : base?.categories ?? ["general"],
          tags: t.tags.length ? t.tags : base?.tags ?? [],
          price: t.price,
          version: t.version,
          thumbnail: t.thumbnailUrl || base?.thumbnail || "",
          screenshots: t.screenshots.length ? t.screenshots : base?.screenshots ?? [],
          features: t.features.length ? t.features : base?.features ?? [],
          featured: t.featured,
          rating: t.ratingAvg,
          ratingCount: t.ratingCount,
          installs: t.installs,
          demoUrl: demoStoreUrl(t.slug, t.demoStoreSlug),
          updatedAt: (t.approvedAt ?? t.updatedAt)?.toISOString() ?? null,
          developer: d
            ? { name: d.displayName, slug: d.slug, url: d.website, verified: d.verified, bio: d.bio }
            : base?.developer ?? { name: "PaiCommerce Studio", slug: null, url: null, verified: true, bio: null },
          installed: !!m,
        } satisfies StoreTheme;
      });
    return [...listed, ...codeOnly];
  } catch (e) {
    console.warn("[web] themes query failed:", (e as Error).message);
    return fallback();
  }
});

export async function getTheme(slug: string): Promise<StoreTheme | null> {
  return (await getThemes()).find((t) => t.slug === slug) ?? null;
}

export type ThemeReview = { id: string; rating: number; body: string | null; storeName: string; createdAt: string };

export async function getThemeReviews(slug: string, limit = 12): Promise<ThemeReview[]> {
  const mod = await loadDb();
  if (!mod) return [];
  try {
    const { db, themes, themeReviews, stores, eq, desc } = mod;
    const rows = await db
      .select({ id: themeReviews.id, rating: themeReviews.rating, body: themeReviews.body, createdAt: themeReviews.createdAt, storeName: stores.name })
      .from(themeReviews)
      .innerJoin(themes, eq(themeReviews.themeId, themes.id))
      .innerJoin(stores, eq(themeReviews.storeId, stores.id))
      .where(eq(themes.slug, slug))
      .orderBy(desc(themeReviews.createdAt))
      .limit(limit);
    return rows.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() }));
  } catch (e) {
    console.warn("[web] theme reviews query failed:", (e as Error).message);
    return [];
  }
}

/** Live platform counters for social proof; null when the DB is unavailable. */
export const getPlatformStats = cache(async (): Promise<{ stores: number; themes: number } | null> => {
  const mod = await loadDb();
  if (!mod) return null;
  try {
    const { db, stores, themes, count, eq } = mod;
    const [[s], [t]] = await Promise.all([
      db.select({ n: count() }).from(stores),
      db.select({ n: count() }).from(themes).where(eq(themes.status, "approved")),
    ]);
    return { stores: s?.n ?? 0, themes: t?.n ?? 0 };
  } catch {
    return null;
  }
});
