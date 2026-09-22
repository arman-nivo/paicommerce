"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, Search, X } from "lucide-react";
import { cn } from "../lib/utils";
import type { PredictiveSearchResult } from "../lib/types";
import { trackEvent, useStorefront } from "./storefront-context";

function usePredictive(query: string) {
  const sf = useStorefront();
  const [data, setData] = useState<PredictiveSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setData(null);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(sf.api(`/search?q=${encodeURIComponent(q)}&limit=6`), { signal: ctrl.signal });
        if (res.ok) setData((await res.json()) as PredictiveSearchResult);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 180);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query, sf]);
  return { data, loading };
}

export type SearchBoxProps = {
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
  defaultValue?: string;
  /** Show the predictive dropdown (default true). */
  predictive?: boolean;
  onNavigate?: () => void;
};

/** Search input with predictive results (products + collections) from `{base}/api/search`. */
export function SearchBox({ placeholder = "Search products…", className, autoFocus, defaultValue = "", predictive = true, onNavigate }: SearchBoxProps) {
  const sf = useStorefront();
  const router = useRouter();
  const [q, setQ] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const { data, loading } = usePredictive(predictive ? q : "");
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const submit = (query: string) => {
    if (!query.trim()) return;
    trackEvent({ event: "Search", query: query.trim() });
    setOpen(false);
    onNavigate?.();
    router.push(sf.url(`/search?q=${encodeURIComponent(query.trim())}`));
  };

  const items = data?.products ?? [];

  return (
    <div ref={wrap} className={cn("relative", className)}>
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          if (active >= 0 && items[active]) {
            onNavigate?.();
            router.push(items[active]!.url);
            return;
          }
          submit(q);
        }}
      >
        <label className="relative block">
          <span className="sr-only">Search</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 opacity-60" />
          <input
            type="search"
            value={q}
            autoFocus={autoFocus}
            onChange={(e) => {
              setQ(e.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(items.length - 1, a + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(-1, a - 1));
              } else if (e.key === "Escape") setOpen(false);
            }}
            placeholder={placeholder}
            className="pai-input pl-10 pr-10"
            aria-autocomplete="list"
            aria-expanded={open && !!data}
          />
          {loading ? <LoaderCircle className="absolute right-3.5 top-1/2 size-4 -translate-y-1/2 animate-spin opacity-60" /> : null}
        </label>
      </form>
      {predictive && open && q.trim().length >= 2 && data ? (
        <div className="animate-pai-pop absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-pai border border-pai-border bg-pai-bg text-pai-fg shadow-2xl">
          {data.collections.length ? (
            <div className="flex flex-wrap gap-2 border-b border-pai-border p-3">
              {data.collections.map((c) => (
                <Link key={c.id} href={c.url} onClick={() => { setOpen(false); onNavigate?.(); }} className="rounded-full bg-pai-muted px-3 py-1 text-xs font-medium hover:bg-pai-border">
                  {c.title}
                </Link>
              ))}
            </div>
          ) : null}
          {items.length ? (
            <ul role="listbox" className="max-h-[60vh] overflow-y-auto py-1">
              {items.map((p, i) => (
                <li key={p.id} role="option" aria-selected={i === active}>
                  <Link
                    href={p.url}
                    onClick={() => { setOpen(false); onNavigate?.(); }}
                    className={cn("flex items-center gap-3 px-3 py-2 hover:bg-pai-muted", i === active && "bg-pai-muted")}
                  >
                    <span className="size-12 shrink-0 overflow-hidden rounded-[min(var(--pai-radius),8px)] bg-pai-muted">
                      {p.featuredImage ? <img src={p.featuredImage.url} alt="" loading="lazy" className="pai-img-cover" /> : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{p.title}</span>
                      {p.vendor ? <span className="block truncate text-xs opacity-60">{p.vendor}</span> : null}
                    </span>
                    <span className="text-sm font-semibold">{sf.format(p.price)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="p-4 text-sm opacity-70">No products found for “{q}”.</p>
          )}
          <button type="button" onClick={() => submit(q)} className="flex w-full items-center justify-between border-t border-pai-border px-4 py-3 text-sm font-medium hover:bg-pai-muted">
            See all results for “{q}” <ArrowRight className="size-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

/** Header search icon that opens a full-width search overlay. */
export function SearchToggle({ className, label = "Search" }: { className?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={label} className={cn("inline-grid place-items-center", className)}>
        <Search className="size-5" />
      </button>
      {open ? (
        <div className="fixed inset-0 z-[75]" role="dialog" aria-modal="true" aria-label="Search">
          <button type="button" aria-label="Close search" className="animate-pai-fade absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="animate-pai-pop relative border-b border-pai-border bg-pai-bg py-5 text-pai-fg shadow-xl">
            <div className="pai-container flex items-start gap-3">
              <SearchBox autoFocus className="flex-1" onNavigate={() => setOpen(false)} />
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid size-11 shrink-0 place-items-center rounded-full hover:bg-pai-muted">
                <X className="size-5" />
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
