"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { Search, X } from "lucide-react";
import { cn, Input, Select } from "@pai/ui";

export type FilterDef = { key: string; label: string; options: { value: string; label: string }[] };

export function useUpdateParams() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, start] = React.useTransition();
  const update = React.useCallback(
    (updates: Record<string, string | undefined>) => {
      const q = new URLSearchParams(sp.toString());
      for (const [k, v] of Object.entries(updates)) {
        if (!v) q.delete(k);
        else q.set(k, v);
      }
      if (!("page" in updates)) q.delete("page");
      const s = q.toString();
      start(() => router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false }));
    },
    [router, pathname, sp],
  );
  return { update, params: sp, pending };
}

export function FilterBar({
  search,
  filters = [],
  dates,
  children,
  className,
}: {
  search?: string;
  filters?: FilterDef[];
  dates?: { from: string; to: string; label?: string };
  children?: React.ReactNode;
  className?: string;
}) {
  const { update, params, pending } = useUpdateParams();
  const [q, setQ] = React.useState(params.get("q") ?? "");
  const inputRef = React.useRef<HTMLInputElement>(null);
  const first = React.useRef(true);

  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const t = setTimeout(() => {
      if ((params.get("q") ?? "") !== q) update({ q: q || undefined });
    }, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName) && !t.isContentEditable) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const activeKeys = [...filters.map((f) => f.key), ...(dates ? [dates.from, dates.to] : []), "q"].filter((k) => params.get(k));

  return (
    <div className={cn("flex flex-wrap items-center gap-2 border-b border-border p-3", className)}>
      {search !== undefined && (
        <div className="relative min-w-[220px] flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={search}
            aria-label="Search"
            className="h-8 w-full rounded-lg border border-input bg-card pl-8 pr-8 text-sm shadow-xs transition placeholder:text-muted-foreground/70 focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/15"
          />
          {pending ? (
            <span className="absolute right-2.5 top-1/2 size-3 -translate-y-1/2 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
          ) : (
            <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-border px-1 font-mono text-[10px] text-muted-foreground sm:block">/</kbd>
          )}
        </div>
      )}
      {filters.map((f) => (
        <Select
          key={f.key}
          aria-label={f.label}
          value={params.get(f.key) ?? ""}
          onChange={(e) => update({ [f.key]: e.target.value || undefined })}
          className={cn("h-8 w-auto min-w-[130px] text-xs", params.get(f.key) && "border-primary/60 bg-accent")}
        >
          <option value="">{f.label}: All</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {f.label}: {o.label}
            </option>
          ))}
        </Select>
      ))}
      {dates && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span>{dates.label ?? "Created"}</span>
          <Input type="date" value={params.get(dates.from) ?? ""} onChange={(e) => update({ [dates.from]: e.target.value || undefined })} className="h-8 w-[140px] text-xs" aria-label="From date" />
          <span>–</span>
          <Input type="date" value={params.get(dates.to) ?? ""} onChange={(e) => update({ [dates.to]: e.target.value || undefined })} className="h-8 w-[140px] text-xs" aria-label="To date" />
        </div>
      )}
      {children}
      {activeKeys.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setQ("");
            update(Object.fromEntries(activeKeys.map((k) => [k, undefined])));
          }}
          className="inline-flex h-8 items-center gap-1 rounded-lg px-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-3.5" /> Clear
        </button>
      )}
    </div>
  );
}

/** Link-like segmented tabs driven by a search param (e.g. status). */
export function ParamTabs({ param, tabs, className }: { param: string; tabs: { value: string; label: string; count?: number }[]; className?: string }) {
  const { update, params } = useUpdateParams();
  const current = params.get(param) ?? "";
  return (
    <div className={cn("flex gap-1 overflow-x-auto border-b border-border px-3 scrollbar-thin", className)}>
      {tabs.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => update({ [param]: t.value || undefined })}
          className={cn(
            "-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition",
            current === t.value ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {t.label}
          {t.count != null && <span className="rounded-full bg-muted px-1.5 text-xs tabular-nums text-muted-foreground">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}
