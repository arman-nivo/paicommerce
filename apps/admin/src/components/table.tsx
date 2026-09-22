import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@pai/ui";
import { hrefWith, PAGE_SIZES, type SearchParams } from "@/lib/params";

/** Scrollable table container with a sticky header. */
export function DataTable({ children, className, maxHeight = "calc(100vh - 260px)" }: { children: React.ReactNode; className?: string; maxHeight?: string }) {
  return (
    <div className={cn("relative w-full overflow-auto scrollbar-thin", className)} style={{ maxHeight }}>
      <table className="w-full min-w-max caption-bottom text-sm">{children}</table>
    </div>
  );
}

export function THead({ children }: { children: React.ReactNode }) {
  return (
    <thead className="sticky top-0 z-10 bg-muted/95 text-[11px] uppercase tracking-wide text-muted-foreground backdrop-blur supports-[backdrop-filter]:bg-muted/80">
      <tr className="border-b border-border">{children}</tr>
    </thead>
  );
}

export function TH({ children, className, align }: { children?: React.ReactNode; className?: string; align?: "right" | "center" }) {
  return <th className={cn("h-9 whitespace-nowrap px-3 text-left align-middle font-medium first:pl-4 last:pr-4", align === "right" && "text-right", align === "center" && "text-center", className)}>{children}</th>;
}

export function SortTH({
  label,
  field,
  base,
  params,
  sort,
  dir,
  align,
  className,
}: {
  label: string;
  field: string;
  base: string;
  params: SearchParams;
  sort: string;
  dir: "asc" | "desc";
  align?: "right";
  className?: string;
}) {
  const active = sort === field;
  const nextDir = active && dir === "desc" ? "asc" : "desc";
  const Icon = active ? (dir === "asc" ? ArrowUp : ArrowDown) : ArrowUpDown;
  return (
    <TH align={align} className={className}>
      <Link
        href={hrefWith(base, params, { sort: field, dir: nextDir, page: undefined })}
        className={cn("inline-flex items-center gap-1 hover:text-foreground", active && "text-foreground", align === "right" && "flex-row-reverse")}
        scroll={false}
      >
        {label}
        <Icon className={cn("size-3", !active && "opacity-40")} />
      </Link>
    </TH>
  );
}

export function TR({ children, className }: { children: React.ReactNode; className?: string }) {
  return <tr className={cn("border-b border-border transition-colors last:border-0 hover:bg-muted/40", className)}>{children}</tr>;
}

export function TD({ children, className, align, colSpan }: { children?: React.ReactNode; className?: string; align?: "right" | "center"; colSpan?: number }) {
  return (
    <td colSpan={colSpan} className={cn("whitespace-nowrap px-3 py-2.5 align-middle first:pl-4 last:pr-4", align === "right" && "text-right tabular-nums", align === "center" && "text-center", className)}>
      {children}
    </td>
  );
}

export function Pagination({ base, params, page, size, total }: { base: string; params: SearchParams; page: number; size: number; total: number }) {
  const pages = Math.max(1, Math.ceil(total / size));
  const from = total ? (page - 1) * size + 1 : 0;
  const to = Math.min(total, page * size);
  const btn = "inline-flex size-8 items-center justify-center rounded-lg border border-border bg-card hover:bg-muted";
  const nums: number[] = [];
  for (let p = Math.max(1, page - 2); p <= Math.min(pages, page + 2); p++) nums.push(p);
  return (
    <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm sm:flex-row">
      <div className="flex items-center gap-3 text-muted-foreground">
        <span className="tabular-nums">
          {from.toLocaleString()}–{to.toLocaleString()} of {total.toLocaleString()}
        </span>
        <span className="hidden items-center gap-1 sm:flex">
          {PAGE_SIZES.map((s) => (
            <Link key={s} href={hrefWith(base, params, { size: s === 25 ? undefined : s, page: undefined })} className={cn("rounded px-1.5 py-0.5 text-xs", s === size ? "bg-muted font-medium text-foreground" : "hover:text-foreground")}>
              {s}
            </Link>
          ))}
          <span className="text-xs">/ page</span>
        </span>
      </div>
      <div className="flex items-center gap-1">
        {page > 1 ? (
          <Link className={btn} href={hrefWith(base, params, { page: page - 1 === 1 ? undefined : page - 1 })} aria-label="Previous page">
            <ChevronLeft className="size-4" />
          </Link>
        ) : (
          <span className={cn(btn, "pointer-events-none opacity-40")}>
            <ChevronLeft className="size-4" />
          </span>
        )}
        {nums.map((p) => (
          <Link key={p} href={hrefWith(base, params, { page: p === 1 ? undefined : p })} className={cn(btn, "w-auto min-w-8 px-2 tabular-nums", p === page && "border-primary bg-primary text-primary-foreground hover:bg-primary")}>
            {p}
          </Link>
        ))}
        {page < pages ? (
          <Link className={btn} href={hrefWith(base, params, { page: page + 1 })} aria-label="Next page">
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

export function EmptyRow({ colSpan, title = "Nothing found", description = "Try adjusting your filters." }: { colSpan: number; title?: string; description?: string }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-16 text-center">
        <p className="font-medium">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </td>
    </tr>
  );
}
