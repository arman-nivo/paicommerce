import Link from "next/link";
import { cn } from "@pai/ui";
import { hrefWith, type SearchParams } from "@/lib/params";

/** Server-rendered tabs driven by a search param. */
export function LinkTabs({ base, params, param = "tab", tabs, current }: { base: string; params: SearchParams; param?: string; tabs: { value: string; label: string; count?: number }[]; current: string }) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border scrollbar-thin">
      {tabs.map((t, i) => (
        <Link
          key={t.value}
          href={hrefWith(base, {}, { [param]: i === 0 ? undefined : t.value })}
          scroll={false}
          className={cn(
            "-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition",
            current === t.value ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {t.label}
          {t.count != null && <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums text-muted-foreground">{t.count}</span>}
        </Link>
      ))}
    </div>
  );
}

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
      ← {children}
    </Link>
  );
}

export function DL({ items, className }: { items: [React.ReactNode, React.ReactNode][]; className?: string }) {
  return (
    <dl className={cn("divide-y divide-border text-sm", className)}>
      {items.map(([k, v], i) => (
        <div key={i} className="flex items-start justify-between gap-4 py-2">
          <dt className="shrink-0 text-muted-foreground">{k}</dt>
          <dd className="min-w-0 text-right font-medium">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
