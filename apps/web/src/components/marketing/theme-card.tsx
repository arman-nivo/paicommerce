import Link from "next/link";
import { ArrowUpRight, BadgeCheck, Download, Star } from "lucide-react";
import { formatCompact, formatMoney } from "@pai/core";
import { cn } from "@pai/ui";
import type { StoreTheme } from "@/lib/data";
import { categoryLabel } from "@/lib/theme-labels";
import { ThemePreview } from "./theme-preview";

export function PriceTag({ price, className }: { price: number; className?: string }) {
  return price === 0 ? (
    <span className={cn("rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/15", className)}>Free</span>
  ) : (
    <span className={cn("rounded-full bg-slate-900 px-2.5 py-0.5 text-xs font-semibold text-white", className)}>{formatMoney(price, "BDT")}</span>
  );
}

export function Rating({ value, count, className }: { value: number; count: number; className?: string }) {
  if (!count) return <span className={cn("text-xs font-medium text-brand-600", className)}>New</span>;
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs font-medium text-slate-600", className)}>
      <Star className="size-3.5 fill-amber-400 text-amber-400" />
      {value.toFixed(1)} <span className="text-slate-400">({count})</span>
    </span>
  );
}

export function ThemeCard({ theme, className }: { theme: StoreTheme; className?: string }) {
  return (
    <article className={cn("group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-20px_rgba(15,23,42,0.35)]", className)}>
      <div className="relative bg-gradient-to-b from-slate-50 to-slate-100/70 p-4 pb-0">
        <ThemePreview slug={theme.slug} name={theme.name} tagline={theme.tagline} thumbnail={theme.thumbnail} className="translate-y-1 rounded-b-none shadow-lg transition duration-500 group-hover:translate-y-0" />
        {theme.featured && (
          <span className="absolute left-6 top-6 rounded-full bg-white/90 px-2.5 py-0.5 text-[11px] font-semibold text-slate-900 shadow-sm ring-1 ring-slate-900/5 backdrop-blur">
            ★ Featured
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col border-t border-slate-100 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-bold">
              <Link href={`/themes/${theme.slug}`} className="after:absolute after:inset-0 focus-visible:outline-none">
                {theme.name}
              </Link>
            </h3>
            <p className="mt-0.5 line-clamp-1 text-sm text-slate-500">{theme.tagline}</p>
          </div>
          <PriceTag price={theme.price} className="shrink-0" />
        </div>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {theme.categories.slice(0, 3).map((c) => (
            <span key={c} className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
              {categoryLabel(c)}
            </span>
          ))}
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-4 text-xs text-slate-500">
          <span className="inline-flex min-w-0 items-center gap-1 truncate">
            {theme.developer.name}
            {theme.developer.verified && <BadgeCheck className="size-3.5 shrink-0 text-brand-600" aria-label="Verified developer" />}
          </span>
          <span className="flex shrink-0 items-center gap-3">
            {theme.installs > 0 && (
              <span className="inline-flex items-center gap-1">
                <Download className="size-3.5" /> {formatCompact(theme.installs)}
              </span>
            )}
            <Rating value={theme.rating} count={theme.ratingCount} />
          </span>
        </div>
      </div>
      <a
        href={theme.demoUrl}
        target="_blank"
        rel="noreferrer"
        className="absolute right-6 top-6 z-10 inline-flex items-center gap-1 rounded-full bg-slate-900/85 px-3 py-1 text-xs font-semibold text-white opacity-0 shadow-lg backdrop-blur transition group-hover:opacity-100 focus-visible:opacity-100"
      >
        Live demo <ArrowUpRight className="size-3.5" />
      </a>
    </article>
  );
}
