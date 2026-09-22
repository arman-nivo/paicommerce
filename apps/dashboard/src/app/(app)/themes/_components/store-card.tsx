import Link from "next/link";
import { BadgeCheck, Download, Star } from "lucide-react";
import { Badge } from "@pai/ui";
import { formatMoney, formatNumber } from "@/lib/format";
import type { CatalogTheme } from "../_lib/catalog";
import { ThemeThumb } from "./theme-thumb";

export function Stars({ value, className = "size-3.5" }: { value: number; className?: string }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value.toFixed(1)} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} className={`${className} ${value >= i - 0.25 ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`} />
      ))}
    </span>
  );
}

export function StoreThemeCard({ theme, state }: { theme: CatalogTheme; state: { installed: boolean; live: boolean; purchased: boolean; recommended: boolean } }) {
  return (
    <Link href={`/themes/store/${theme.slug}`} className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition hover:-translate-y-0.5 hover:shadow-md">
      <ThemeThumb src={theme.thumbnailUrl} alt={`${theme.name} theme preview`} className="aspect-[4/3] border-b border-border">
        <div className="absolute left-2 top-2 flex flex-wrap gap-1">
          {state.live ? (
            <Badge tone="green" dot className="shadow-sm">
              Live
            </Badge>
          ) : state.installed ? (
            <Badge tone="blue" className="shadow-sm">
              Installed
            </Badge>
          ) : null}
          {state.purchased && (
            <Badge tone="purple" className="shadow-sm">
              Purchased
            </Badge>
          )}
          {theme.featured && (
            <Badge tone="brand" className="shadow-sm">
              Featured
            </Badge>
          )}
        </div>
        {state.recommended && (
          <span className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">Recommended for you</span>
        )}
      </ThemeThumb>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="truncate font-semibold group-hover:text-primary">{theme.name}</h3>
          <span className={`shrink-0 text-sm font-semibold ${theme.price > 0 ? "" : "text-emerald-600 dark:text-emerald-400"}`}>
            {theme.price > 0 ? formatMoney(theme.price, "BDT") : "Free"}
          </span>
        </div>
        <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground">
          by {theme.author}
          {theme.authorVerified && <BadgeCheck className="size-3.5 shrink-0 text-primary" aria-label="Verified developer" />}
        </p>
        {theme.tagline && <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{theme.tagline}</p>}
        <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Stars value={theme.ratingAvg} />
            {theme.ratingCount > 0 ? `${theme.ratingAvg.toFixed(1)} (${formatNumber(theme.ratingCount)})` : "No reviews"}
          </span>
          <span className="flex items-center gap-1">
            <Download className="size-3.5" /> {formatNumber(theme.installs)}
          </span>
        </div>
      </div>
    </Link>
  );
}
