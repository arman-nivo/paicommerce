import Link from "next/link";
import { getManifest } from "@pai/theme-registry/manifests";
import { ArrowRight, Lightbulb, Palette, Sparkles, Store } from "lucide-react";
import { STOREFRONT_URL, storeUrl } from "@pai/core";
import { signPreviewToken } from "@pai/core/auth";
import { asc, db, desc, eq, storeThemes, themes } from "@pai/db";
import { Card, CardBody, CardHeader, EmptyState } from "@pai/ui";
import { Header } from "@/components/page";
import { getCtx } from "@/lib/ctx";
import { formatMoney } from "@/lib/format";
import { getThemeMeta } from "./_lib/catalog";
import { LibraryGrid, LiveThemeCard, type LibraryTheme } from "./_components/library";
import { LinkButton } from "./_components/link-button";
import { ThemeThumb } from "./_components/theme-thumb";

export const metadata = { title: "Themes" };

export default async function ThemesPage() {
  const ctx = await getCtx("themes.manage");
  const store = ctx.store;

  const [rows, suggestions] = await Promise.all([
    db.select().from(storeThemes).where(eq(storeThemes.storeId, store.id)).orderBy(desc(storeThemes.updatedAt)),
    db
      .select({ slug: themes.slug, name: themes.name, tagline: themes.tagline, price: themes.price, thumbnailUrl: themes.thumbnailUrl, categories: themes.categories, installs: themes.installs })
      .from(themes)
      .where(eq(themes.status, "approved"))
      .orderBy(desc(themes.featured), desc(themes.installs), asc(themes.name)),
  ]);

  const meta = await getThemeMeta(rows.map((r) => r.themeSlug));
  const library: (LibraryTheme & { role: string })[] = await Promise.all(
    rows.map(async (r) => {
      const m = meta[r.themeSlug]!;
      const token = await signPreviewToken({ sid: store.id, stid: r.id });
      return {
        id: r.id,
        role: r.role,
        name: r.name,
        themeSlug: r.themeSlug,
        themeName: m.themeName,
        version: m.version,
        thumbnail: m.thumbnail,
        hasDraft: r.draftConfig != null,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        publishedAt: r.publishedAt?.toISOString() ?? null,
        previewUrl: `${STOREFRONT_URL}/preview/${token}`,
        listingSlug: m.storeSlug,
      };
    }),
  );

  const live = library.find((t) => t.role === "live") ?? null;
  const others = library.filter((t) => t.role !== "live");
  const installedSlugs = new Set(rows.map((r) => r.themeSlug));
  const recommended = suggestions
    .filter((t) => !installedSlugs.has(t.slug))
    .sort((a, b) => Number(b.categories.includes(store.category)) - Number(a.categories.includes(store.category)))
    .slice(0, 3);

  return (
    <div className="space-y-6">
      <Header
        title="Themes"
        description="Choose how your online store looks. Customize colours, fonts and sections — no code needed."
        actions={
          <LinkButton href="/themes/store" variant="outline">
            <Store /> Visit Theme Store
          </LinkButton>
        }
      />

      {live ? (
        <LiveThemeCard theme={live} storeUrl={storeUrl(store)} />
      ) : (
        <Card>
          <EmptyState
            icon={<Palette />}
            title="Your store doesn't have a live theme yet"
            description={others.length ? "Publish one of the themes in your library below, or pick a new one from the Theme Store." : "Pick a theme from the Theme Store to give your store its look. Free themes are ready in one click."}
            action={
              <LinkButton href="/themes/store">
                <Sparkles /> Browse themes
              </LinkButton>
            }
          />
        </Card>
      )}

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold">Theme library</h2>
            <p className="text-sm text-muted-foreground">Themes you&apos;ve added but not published. Customize them safely — customers won&apos;t see them until you publish.</p>
          </div>
        </div>
        {others.length ? (
          <LibraryGrid themes={others} liveName={live?.name ?? null} />
        ) : (
          <Card className="border-dashed">
            <div className="flex flex-col items-center gap-3 px-6 py-10 text-center sm:flex-row sm:text-left">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
                <Palette className="size-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Try a new look without risk</p>
                <p className="text-sm text-muted-foreground">Add themes from the Theme Store to your library, customize them, and publish when you&apos;re happy.</p>
              </div>
              <LinkButton href="/themes/store" variant="outline">
                Explore themes <ArrowRight />
              </LinkButton>
            </div>
          </Card>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader
            title="From the Theme Store"
            description="Hand-picked designs for your kind of business"
            action={
              <LinkButton href="/themes/store" variant="link" size="sm">
                See all <ArrowRight />
              </LinkButton>
            }
          />
          <CardBody>
            {recommended.length ? (
              <div className="grid gap-4 sm:grid-cols-3">
                {recommended.map((t) => (
                  <Link key={t.slug} href={`/themes/store/${t.slug}`} className="group block">
                    <ThemeThumb src={t.thumbnailUrl || getManifest(t.slug)?.thumbnail} alt={t.name} className="aspect-[4/3] rounded-lg border border-border" />
                    <div className="mt-2 flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium group-hover:text-primary">{t.name}</p>
                      <span className="shrink-0 text-xs text-muted-foreground">{t.price > 0 ? formatMoney(t.price, "BDT") : "Free"}</span>
                    </div>
                    {t.tagline && <p className="line-clamp-1 text-xs text-muted-foreground">{t.tagline}</p>}
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                {suggestions.length ? "You’ve added every theme we recommend. Check the Theme Store for more." : "New themes are on their way — check back soon."}
              </p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Tips" />
          <CardBody className="space-y-4 text-sm">
            {[
              ["Customize before publishing", "Changes stay in draft until you publish, so you can experiment freely."],
              ["Duplicate before big changes", "Make a copy of your live theme to try a new layout — your store stays untouched."],
              ["Check on mobile", "Most Bangladeshi shoppers buy on their phone. Use the mobile view in the editor."],
              ["Use your own photos", "Real product and banner photos build trust and increase sales."],
            ].map(([t, d]) => (
              <div key={t} className="flex gap-3">
                <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-500" />
                <div>
                  <p className="font-medium">{t}</p>
                  <p className="text-muted-foreground">{d}</p>
                </div>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
