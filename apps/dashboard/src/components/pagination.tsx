import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@pai/ui";

/** Server-side pagination. `params` = current searchParams (page is replaced). */
export function Pagination({ page, pageSize, total, basePath, params }: { page: number; pageSize: number; total: number; basePath: string; params: Record<string, string | string[] | undefined> }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const href = (p: number) => {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) if (v != null && k !== "page" && v !== "") sp.set(k, Array.isArray(v) ? v[0]! : v);
    if (p > 1) sp.set("page", String(p));
    const s = sp.toString();
    return s ? `${basePath}?${s}` : basePath;
  };
  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = Math.min(total, page * pageSize);
  const btn = "inline-flex h-8 items-center gap-1 rounded-lg border border-input bg-card px-2.5 text-sm hover:bg-muted";
  return (
    <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm text-muted-foreground">
      <span>
        {from.toLocaleString()}–{to.toLocaleString()} of {total.toLocaleString()}
      </span>
      <div className="flex items-center gap-2">
        <span className="hidden sm:inline">
          Page {page} of {pages}
        </span>
        {page > 1 ? (
          <Link className={btn} href={href(page - 1)} aria-label="Previous page">
            <ChevronLeft className="size-4" />
          </Link>
        ) : (
          <span className={cn(btn, "pointer-events-none opacity-40")}>
            <ChevronLeft className="size-4" />
          </span>
        )}
        {page < pages ? (
          <Link className={btn} href={href(page + 1)} aria-label="Next page">
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <span className={cn(btn, "pointer-events-none opacity-40")}>
            <ChevronRight className="size-4" />
          </span>
        )}
      </div>
    </div>
  );
}
