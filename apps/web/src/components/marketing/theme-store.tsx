"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { BUSINESS_CATEGORIES } from "@pai/theme-sdk";
import { cn } from "@pai/ui";
import type { StoreTheme } from "@/lib/data";
import { ThemeCard } from "./theme-card";

type Sort = "featured" | "popular" | "rating" | "newest" | "price-asc" | "price-desc" | "name";
const SORTS: { v: Sort; label: string }[] = [
  { v: "featured", label: "Featured" },
  { v: "popular", label: "Most installed" },
  { v: "rating", label: "Top rated" },
  { v: "newest", label: "Recently updated" },
  { v: "price-asc", label: "Price: low to high" },
  { v: "price-desc", label: "Price: high to low" },
  { v: "name", label: "Name A–Z" },
];

export function ThemeStore({ themes }: { themes: StoreTheme[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "all");
  const [price, setPrice] = useState<"all" | "free" | "premium">((params.get("price") as "free" | "premium") ?? "all");
  const [sort, setSort] = useState<Sort>((params.get("sort") as Sort) ?? "featured");
  const [showFilters, setShowFilters] = useState(false);

  // Keep URL shareable.
  useEffect(() => {
    const sp = new URLSearchParams();
    if (q) sp.set("q", q);
    if (category !== "all") sp.set("category", category);
    if (price !== "all") sp.set("price", price);
    if (sort !== "featured") sp.set("sort", sort);
    const qs = sp.toString();
    const t = setTimeout(() => router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false }), 250);
    return () => clearTimeout(t);
  }, [q, category, price, sort, pathname, router]);

  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const t of themes) for (const c of t.categories) m.set(c, (m.get(c) ?? 0) + 1);
    return m;
  }, [themes]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = themes.filter((t) => {
      if (category !== "all" && !t.categories.includes(category)) return false;
      if (price === "free" && t.price > 0) return false;
      if (price === "premium" && t.price === 0) return false;
      if (!needle) return true;
      return [t.name, t.tagline, t.description, t.developer.name, ...t.features, ...t.tags, ...t.categories].join(" ").toLowerCase().includes(needle);
    });
    const by: Record<Sort, (a: StoreTheme, b: StoreTheme) => number> = {
      featured: (a, b) => Number(b.featured) - Number(a.featured) || b.installs - a.installs || a.name.localeCompare(b.name),
      popular: (a, b) => b.installs - a.installs,
      rating: (a, b) => b.rating - a.rating || b.ratingCount - a.ratingCount,
      newest: (a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""),
      "price-asc": (a, b) => a.price - b.price,
      "price-desc": (a, b) => b.price - a.price,
      name: (a, b) => a.name.localeCompare(b.name),
    };
    return list.sort(by[sort]);
  }, [themes, q, category, price, sort]);

  const cats = BUSINESS_CATEGORIES.filter((c) => counts.has(c.id));
  const active = category !== "all" || price !== "all" || q;

  const Sidebar = (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Price</p>
        <div className="mt-3 grid grid-cols-3 gap-1 rounded-xl bg-slate-100 p-1">
          {(["all", "free", "premium"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPrice(p)}
              aria-pressed={price === p}
              className={cn("rounded-lg py-1.5 text-sm font-medium capitalize transition", price === p ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800")}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">Business category</p>
        <ul className="mt-3 space-y-0.5">
          <li>
            <button
              type="button"
              onClick={() => setCategory("all")}
              className={cn("flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition", category === "all" ? "bg-brand-50 font-semibold text-brand-700" : "text-slate-600 hover:bg-slate-50")}
            >
              All categories <span className="text-xs text-slate-400">{themes.length}</span>
            </button>
          </li>
          {cats.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setCategory(c.id)}
                className={cn("flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm transition", category === c.id ? "bg-brand-50 font-semibold text-brand-700" : "text-slate-600 hover:bg-slate-50")}
              >
                <span className="truncate">{c.label}</span> <span className="text-xs text-slate-400">{counts.get(c.id)}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[250px_1fr]">
      <aside className="hidden lg:block">
        <div className="sticky top-24">{Sidebar}</div>
      </aside>

      <div className="min-w-0">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Search themes</span>
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search themes, features, developers…"
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-sm shadow-sm focus:border-brand-400 focus:outline-none focus:ring-3 focus:ring-brand-500/15"
            />
            {q && (
              <button type="button" onClick={() => setQ("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700" aria-label="Clear search">
                <X className="size-4" />
              </button>
            )}
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowFilters((s) => !s)}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium lg:hidden"
              aria-expanded={showFilters}
            >
              <SlidersHorizontal className="size-4" /> Filters
            </button>
            <label className="relative">
              <span className="sr-only">Sort by</span>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="h-11 appearance-none rounded-xl border border-slate-200 bg-white pl-4 pr-10 text-sm font-medium shadow-sm focus:border-brand-400 focus:outline-none"
              >
                {SORTS.map((s) => (
                  <option key={s.v} value={s.v}>
                    {s.label}
                  </option>
                ))}
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="m6 9 6 6 6-6" />
              </svg>
            </label>
          </div>
        </div>

        {showFilters && <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 lg:hidden">{Sidebar}</div>}

        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <span aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "theme" : "themes"}
          </span>
          {active && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setCategory("all");
                setPrice("all");
              }}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200"
            >
              Clear filters ×
            </button>
          )}
        </div>

        {filtered.length ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((t) => (
              <ThemeCard key={t.slug} theme={t} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-20 text-center">
            <p className="text-lg font-semibold">No themes match your filters</p>
            <p className="mt-1 text-sm text-slate-500">Try another category or clear your search. New themes are added every month.</p>
          </div>
        )}
      </div>
    </div>
  );
}
