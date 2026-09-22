import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, TriangleAlert } from "lucide-react";
import { storeUrl, STOREFRONT_URL } from "@pai/core";
import { signPreviewToken } from "@pai/core/auth";
import { and, asc, blogPosts, collections, db, desc, eq, ne, pages, products, storeThemes } from "@pai/db";
import { getManifest, loadTheme } from "@pai/theme-registry";
import { resolveThemeConfig, TEMPLATE_TYPES, type TemplateType, type ThemeConfig, type ThemeDefinition } from "@pai/theme-sdk";
import { buttonVariants } from "@pai/ui";
import { getCtx } from "@/lib/ctx";
import { Customizer } from "./_components/customizer";
import type { EditorData, EditorPreset } from "./_components/types";

export const metadata: Metadata = { title: "Customize theme" };

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** JSON round-trip: guarantees only plain data crosses to the client. */
const json = <T,>(v: T): T => JSON.parse(JSON.stringify(v ?? null)) as T;

export default async function CustomizePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await getCtx("themes.manage");
  if (!UUID_RE.test(id)) notFound();
  const row = await db.query.storeThemes.findFirst({ where: and(eq(storeThemes.id, id), eq(storeThemes.storeId, ctx.store.id)) });
  if (!row) notFound();

  let theme: ThemeDefinition;
  try {
    theme = await loadTheme(row.themeSlug);
  } catch (e) {
    console.error("[customizer] failed to load theme", row.themeSlug, e);
    return <ThemeLoadError name={row.name} />;
  }

  const sid = ctx.store.id;
  const [firstProduct, firstCollection, firstPage, firstPost, live] = await Promise.all([
    db.select({ slug: products.slug }).from(products).where(and(eq(products.storeId, sid), eq(products.status, "active"))).orderBy(desc(products.featured), desc(products.salesCount)).limit(1),
    db.select({ slug: collections.slug }).from(collections).where(and(eq(collections.storeId, sid), eq(collections.published, true))).orderBy(asc(collections.position)).limit(1),
    db.select({ slug: pages.slug }).from(pages).where(and(eq(pages.storeId, sid), eq(pages.published, true))).orderBy(asc(pages.createdAt)).limit(1),
    db.select({ slug: blogPosts.slug }).from(blogPosts).where(and(eq(blogPosts.storeId, sid), eq(blogPosts.published, true))).orderBy(desc(blogPosts.publishedAt)).limit(1),
    db.select({ name: storeThemes.name }).from(storeThemes).where(and(eq(storeThemes.storeId, sid), eq(storeThemes.role, "live"), ne(storeThemes.id, row.id))).limit(1),
  ]);
  const fill: Record<string, string | undefined> = {
    product: firstProduct[0]?.slug,
    collection: firstCollection[0]?.slug,
    page: firstPage[0]?.slug,
    post: firstPost[0]?.slug,
  };
  const templatePaths = Object.fromEntries(
    TEMPLATE_TYPES.map((t) => {
      const m = t.path.match(/\{(\w+)\}/);
      if (!m) return [t.id, t.path];
      const slug = fill[m[1]!];
      return [t.id, slug ? t.path.replace(m[0], encodeURIComponent(slug)) : "/"];
    }),
  ) as Record<TemplateType, string>;

  const config = resolveThemeConfig(theme, (row.draftConfig ?? row.config) as Partial<ThemeConfig> | null, row.presetId);
  const presets: EditorPreset[] = (theme.presets ?? []).map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category,
    description: p.description ?? null,
    thumbnail: p.thumbnail ?? null,
    settings: p.settings ?? null,
    templates: p.templates ?? null,
    groups: p.groups ?? null,
  }));

  const data: EditorData = json({
    manifest: getManifest(row.themeSlug) ?? theme.manifest,
    settingsSchema: theme.settingsSchema,
    sectionSchemas: theme.sections.map((s) => s.schema),
    presets,
    config,
    storeTheme: {
      id: row.id,
      name: row.name,
      role: row.role,
      themeSlug: row.themeSlug,
      presetId: row.presetId,
      updatedAt: row.updatedAt.toISOString(),
      publishedAt: row.publishedAt?.toISOString() ?? null,
      hasPublishedConfig: !!row.config,
      hasDraft: !!row.draftConfig,
    },
    previewToken: await signPreviewToken({ sid, stid: row.id }),
    storefrontUrl: STOREFRONT_URL.replace(/\/+$/, ""),
    storeUrl: storeUrl(ctx.store),
    templatePaths,
    liveThemeName: live[0]?.name ?? null,
  });

  return <Customizer data={data} />;
}

function ThemeLoadError({ name }: { name: string }) {
  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300">
          <TriangleAlert className="size-6" />
        </div>
        <h1 className="text-lg font-semibold">We couldn&apos;t open “{name}”</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">The theme files failed to load. This is usually temporary — try again in a moment. Your saved customizations are safe.</p>
        <div className="mt-6 flex justify-center gap-2">
          <Link href="/themes" className={buttonVariants({ variant: "outline" })}>
            <ArrowLeft /> Back to themes
          </Link>
        </div>
      </div>
    </div>
  );
}
