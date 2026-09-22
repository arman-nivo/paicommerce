import Link from "next/link";
import { Palette, Sparkles } from "lucide-react";
import { Card, cn, EmptyState } from "@pai/ui";
import { Header } from "@/components/page";
import { ClearFilters, FilterSelect, SearchBox } from "@/components/url-controls";
import { getCtx } from "@/lib/ctx";
import { str, type SearchParams } from "@/lib/format";
import { CATEGORY_LABELS, CATEGORY_OPTIONS, getApprovedThemes, getStoreThemeState, type CatalogTheme } from "../_lib/catalog";
import { StoreThemeCard } from "../_components/store-card";

export const metadata = { title: "Theme Store" };

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Top rated" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

function sortThemes(list: CatalogTheme[], sort: string) {
  const by: Record<string, (a: CatalogTheme, b: CatalogTheme) => number> = {
    popular: (a, b) => Number(b.featured) - Number(a.featured) || b.installs - a.installs,
    newest: (a, b) => b.releasedAt.getTime() - a.releasedAt.getTime(),
    rating: (a, b) => b.ratingAvg - a.ratingAvg || b.ratingCount - a.ratingCount,
    "price-asc": (a, b) => a.price - b.price || b.installs - a.installs,
    "price-desc": (a, b) => b.price - a.price || b.installs - a.installs,
  };
  return [...list].sort(by[sort] ?? by.popular!);
}

export default async function ThemeStorePage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await getCtx("themes.manage");
  const sp = await searchParams;
  const q = str(sp.q).trim().toLowerCase();
  const category = str(sp.category);
  const price = str(sp.price);
  const sort = str(sp.sort) || "popular";

  const [all, state] = await Promise.all([getApprovedThemes(), getStoreThemeState(ctx.store.id)]);
  const storeCategory = ctx.store.category;

  const filtered = sortThemes(
    all.filter((t) => {
      if (category && !t.categories.includes(category)) return false;
      if (price === "free" && t.price > 0) return false;
      if (price === "premium" && t.price === 0) return false;
      if (q) {
        const hay = [t.name, t.tagline, t.author, ...t.tags, ...t.features].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    }),
    sort,
  );

  const unfiltered = !q && !category && !price;
  const recommended = unfiltered ? sortThemes(all.filter((t) => t.categories.includes(storeCategory)), "popular").slice(0, 4) : [];
  const usedCategories = CATEGORY_OPTIONS.filter((c) => all.some((t) => t.categories.includes(c.id)));

  const stateFor = (t: CatalogTheme) => ({
    installed: state.installed.has(t.slug),
    live: state.liveSlug === t.slug,
    purchased: state.purchased.has(t.id),
    recommended: t.categories.includes(storeCategory),
  });

  const chipHref = (cat: string | null) => {
    const p = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (k !== "category" && k !== "page" && typeof v === "string" && v) p.set(k, v);
    if (cat) p.set("category", cat);
    const s = p.toString();
    return s ? `/themes/store?${s}` : "/themes/store";
  };

  return (
    <div className="space-y-6">
      <Header
        title="Theme Store"
        description="Beautiful, fast themes built for Bangladeshi shoppers — mobile-first, COD-ready and fully customizable."
        back={{ href: "/themes", label: "Themes" }}
      />

      {recommended.length > 0 && (
        <section className="rounded-2xl border border-border bg-gradient-to-br from-accent/70 to-card p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="size-4 text-primary" />
            <h2 className="text-sm font-semibold">Recommended for your store</h2>
            <span className="text-xs text-muted-foreground">· {CATEGORY_LABELS[storeCategory] ?? "Your category"}</span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {recommended.map((t) => (
              <StoreThemeCard key={t.id} theme={t} state={{ ...stateFor(t), recommended: false }} />
            ))}
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchBox placeholder="Search themes, styles or features…" />
          <div className="flex flex-wrap gap-2">
            <FilterSelect
              param="price"
              placeholder="All prices"
              options={[
                { value: "free", label: "Free" },
                { value: "premium", label: "Premium" },
              ]}
            />
            <FilterSelect param="sort" placeholder="Most popular" options={SORTS} />
            <ClearFilters />
          </div>
        </div>

        {usedCategories.length > 0 && (
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-thin">
            {[{ id: "", label: "All" }, ...usedCategories].map((c) => {
              const active = (category || "") === c.id;
              return (
                <Link
                  key={c.id || "all"}
                  href={chipHref(c.id || null)}
                  scroll={false}
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition",
                    active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {c.label}
                  {c.id === storeCategory && !active && <span className="ml-1 text-primary">★</span>}
                </Link>
              );
            })}
          </div>
        )}

        <p className="text-sm text-muted-foreground">
          {filtered.length} {filtered.length === 1 ? "theme" : "themes"}
          {category && ` for ${CATEGORY_LABELS[category] ?? category}`}
        </p>

        {filtered.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {filtered.map((t) => (
              <StoreThemeCard key={t.id} theme={t} state={stateFor(t)} />
            ))}
          </div>
        ) : (
          <Card>
            <EmptyState
              icon={<Palette />}
              title={all.length ? "No themes match your filters" : "The Theme Store is being stocked"}
              description={all.length ? "Try a different category or search term." : "New themes are reviewed and added regularly. Check back soon."}
              action={
                all.length ? (
                  <Link href="/themes/store" className="text-sm font-medium text-primary hover:underline">
                    Clear all filters
                  </Link>
                ) : undefined
              }
            />
          </Card>
        )}
      </section>
    </div>
  );
}
