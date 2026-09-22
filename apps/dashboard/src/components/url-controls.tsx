"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Search, X } from "lucide-react";
import { cn, Select } from "@pai/ui";

function useSetParams() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  return React.useCallback(
    (updates: Record<string, string | null | undefined>) => {
      const next = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (v == null || v === "") next.delete(k);
        else next.set(k, v);
      }
      next.delete("page");
      const s = next.toString();
      router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
    },
    [router, pathname, sp],
  );
}

/** Debounced search box bound to ?q= (or another param). */
export function SearchBox({ placeholder = "Search…", param = "q", className }: { placeholder?: string; param?: string; className?: string }) {
  const sp = useSearchParams();
  const setParams = useSetParams();
  const [v, setV] = React.useState(sp.get(param) ?? "");
  const first = React.useRef(true);
  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => setParams({ [param]: v.trim() || null }), 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v]);
  return (
    <div className={cn("relative min-w-0 flex-1", className)}>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        value={v}
        onChange={(e) => setV(e.target.value)}
        placeholder={placeholder}
        className="h-9 w-full rounded-lg border border-input bg-card pl-9 pr-8 text-sm shadow-xs placeholder:text-muted-foreground/70 focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/15"
      />
      {v && (
        <button onClick={() => setV("")} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-muted-foreground hover:bg-muted" aria-label="Clear search">
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

/** A <select> bound to a query param. */
export function FilterSelect({ param, options, placeholder, className }: { param: string; options: { value: string; label: string }[]; placeholder: string; className?: string }) {
  const sp = useSearchParams();
  const setParams = useSetParams();
  return (
    <Select value={sp.get(param) ?? ""} onChange={(e) => setParams({ [param]: e.target.value || null })} className={cn("w-auto min-w-36", className)} aria-label={placeholder}>
      <option value="">{placeholder}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </Select>
  );
}

/** Date input bound to a query param (yyyy-mm-dd). */
export function DateParam({ param, label }: { param: string; label: string }) {
  const sp = useSearchParams();
  const setParams = useSetParams();
  return (
    <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
      {label}
      <input
        type="date"
        value={sp.get(param) ?? ""}
        onChange={(e) => setParams({ [param]: e.target.value || null })}
        className="h-9 rounded-lg border border-input bg-card px-2 text-sm text-foreground shadow-xs focus:border-ring focus:outline-none"
      />
    </label>
  );
}

/** Link-based tabs bound to a query param (server-rendered lists). */
export function UrlTabs({ param = "tab", tabs, className }: { param?: string; tabs: { value: string; label: string; count?: number }[]; className?: string }) {
  const sp = useSearchParams();
  const pathname = usePathname();
  const current = sp.get(param) ?? tabs[0]?.value ?? "";
  return (
    <div className={cn("flex gap-1 overflow-x-auto border-b border-border px-2 scrollbar-thin", className)}>
      {tabs.map((t) => {
        const next = new URLSearchParams(sp.toString());
        if (t.value === tabs[0]?.value) next.delete(param);
        else next.set(param, t.value);
        next.delete("page");
        const s = next.toString();
        const active = current === t.value;
        return (
          <Link
            key={t.value}
            href={s ? `${pathname}?${s}` : pathname}
            scroll={false}
            className={cn(
              "-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition",
              active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
            {t.count != null && <span className={cn("rounded-full px-1.5 text-xs tabular-nums", active ? "bg-accent text-primary" : "bg-muted text-muted-foreground")}>{t.count}</span>}
          </Link>
        );
      })}
    </div>
  );
}

export function ClearFilters({ keep = [] as string[] }) {
  const sp = useSearchParams();
  const pathname = usePathname();
  const active = [...sp.keys()].filter((k) => !keep.includes(k) && k !== "page");
  if (!active.length) return null;
  const next = new URLSearchParams();
  for (const k of keep) if (sp.get(k)) next.set(k, sp.get(k)!);
  const s = next.toString();
  return (
    <Link href={s ? `${pathname}?${s}` : pathname} className="inline-flex h-9 items-center gap-1 rounded-lg px-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
      <X className="size-3.5" /> Clear
    </Link>
  );
}
