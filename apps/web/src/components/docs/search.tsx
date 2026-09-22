"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CornerDownLeft, FileText, Hash, Search, X } from "lucide-react";
import type { DocSearchEntry } from "@/lib/docs";

const OPEN_EVENT = "pai-docs:open-search";

function hrefFor(slug: string, hash?: string) {
  return (slug ? `/docs/${slug}` : "/docs") + (hash ? `#${hash}` : "");
}

/** Button that opens the search dialog (can be rendered in several places). */
export function SearchTrigger({ className, compact }: { className?: string; compact?: boolean }) {
  const [mac, setMac] = useState(true);
  useEffect(() => setMac(/Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent)), []);
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
      className={
        "group flex items-center gap-2 rounded-lg border border-border bg-white text-left text-sm text-muted-foreground shadow-xs transition hover:border-slate-300 hover:text-foreground focus-visible:outline-2 focus-visible:outline-brand-500 " +
        (compact ? "h-9 px-2.5" : "h-10 w-full px-3") +
        " " +
        (className ?? "")
      }
      aria-label="Search documentation"
    >
      <Search className="size-4 shrink-0" aria-hidden />
      {!compact && <span className="flex-1">Search docs…</span>}
      <kbd className={`${compact ? "hidden sm:inline-flex" : "inline-flex"} items-center gap-0.5 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground`}>
        {mac ? "⌘" : "Ctrl"} K
      </kbd>
    </button>
  );
}

type Result = {
  key: string;
  slug: string;
  hash?: string;
  title: string;
  context: string;
  snippet?: string;
  kind: "page" | "heading";
};

function escapeRe(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function snippetFor(text: string, terms: string[]): string | undefined {
  const lower = text.toLowerCase();
  let pos = -1;
  for (const t of terms) {
    pos = lower.indexOf(t);
    if (pos !== -1) break;
  }
  if (pos === -1) return undefined;
  const start = Math.max(0, pos - 50);
  const end = Math.min(text.length, pos + 110);
  return (start > 0 ? "…" : "") + text.slice(start, end).trim() + (end < text.length ? "…" : "");
}

function search(index: DocSearchEntry[], query: string): Result[] {
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  const scored: { r: Result; score: number }[] = [];

  for (const e of index) {
    const title = e.title.toLowerCase();
    const desc = e.description.toLowerCase();
    const text = e.text.toLowerCase();
    const headingText = e.headings.map((h) => h.text.toLowerCase());
    const slug = e.slug.toLowerCase();

    let pageScore = 0;
    let allMatch = true;
    for (const t of terms) {
      let s = 0;
      if (title.includes(t)) s += title.startsWith(t) ? 14 : 10;
      if (slug.includes(t)) s += 4;
      if (headingText.some((h) => h.includes(t))) s += 5;
      if (desc.includes(t)) s += 3;
      if (text.includes(t)) s += 1;
      if (!s) allMatch = false;
      pageScore += s;
    }
    if (allMatch) {
      scored.push({
        score: pageScore,
        r: { key: e.slug || "index", slug: e.slug, title: e.title, context: e.group, snippet: e.description || snippetFor(e.text, terms), kind: "page" },
      });
    }
    e.headings.forEach((h, idx) => {
      const ht = headingText[idx]!;
      const hits = terms.filter((t) => ht.includes(t) || title.includes(t));
      if (hits.length === terms.length && terms.some((t) => ht.includes(t))) {
        scored.push({
          score: 8 + terms.filter((t) => ht.includes(t)).length * 4 - idx * 0.01,
          r: { key: `${e.slug}#${h.id}`, slug: e.slug, hash: h.id, title: h.text, context: e.title, kind: "heading" },
        });
      }
    });
  }
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((s) => s.r);
}

function Highlight({ text, query }: { text: string; query: string }) {
  const terms = query.split(/\s+/).filter((t) => t.length > 1);
  if (!terms.length) return <>{text}</>;
  const re = new RegExp(`(${terms.map(escapeRe).join("|")})`, "ig");
  return (
    <>
      {text.split(re).map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-sm bg-brand-100 px-0.5 text-brand-900">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

const SUGGESTED = ["quickstart", "themes", "themes/sections", "themes/settings", "api", "webhooks"];

/** The ⌘K search dialog. Render once (in the docs layout). */
export function DocsSearchDialog({ index }: { index: DocSearchEntry[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const results = useMemo<Result[]>(() => {
    if (query.trim()) return search(index, query.trim());
    return SUGGESTED.map((s) => index.find((e) => e.slug === s))
      .filter((e): e is DocSearchEntry => !!e)
      .map((e) => ({ key: e.slug, slug: e.slug, title: e.title, context: e.group, snippet: e.description, kind: "page" as const }));
  }, [index, query]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        return;
      }
      const target = e.target as HTMLElement | null;
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        setOpen(true);
      }
    };
    window.addEventListener(OPEN_EVENT, onOpen);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(OPEN_EVENT, onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => inputRef.current?.focus(), 10);
    return () => {
      document.body.style.overflow = prev;
      clearTimeout(t);
    };
  }, [open]);

  useEffect(() => setActive(0), [query]);

  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function go(r: Result | undefined) {
    if (!r) return;
    close();
    router.push(hrefFor(r.slug, r.hash));
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[10vh] sm:pt-[14vh]" role="presentation">
      <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] animate-fade-in" onClick={close} aria-hidden />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search documentation"
        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-white shadow-2xl ring-1 ring-black/5 animate-slide-up"
        onKeyDown={onKeyDown}
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4.5 shrink-0 text-muted-foreground" aria-hidden />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search guides, sections, API endpoints…"
            className="h-14 flex-1 bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
            role="combobox"
            aria-expanded="true"
            aria-controls="docs-search-results"
            aria-activedescendant={results[active] ? `docs-search-${active}` : undefined}
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" onClick={close} className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground" aria-label="Close search">
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <div className="max-h-[min(60vh,440px)] overflow-y-auto overscroll-contain p-2">
          {!query.trim() && <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Suggested</p>}
          {results.length === 0 ? (
            <div className="px-4 py-10 text-center">
              <p className="text-sm font-medium text-foreground">No results for “{query}”</p>
              <p className="mt-1 text-sm text-muted-foreground">Try a section name like “settings”, “webhooks” or “createBaseTheme”.</p>
            </div>
          ) : (
            <ul id="docs-search-results" ref={listRef} role="listbox" aria-label="Results" className="space-y-0.5">
              {results.map((r, i) => {
                const Icon = r.kind === "heading" ? Hash : FileText;
                const isActive = i === active;
                return (
                  <li key={r.key} id={`docs-search-${i}`} role="option" aria-selected={isActive} data-index={i}>
                    <button
                      type="button"
                      onMouseMove={() => setActive(i)}
                      onClick={() => go(r)}
                      className={`flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition ${isActive ? "bg-brand-50" : ""}`}
                    >
                      <span className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-md ring-1 ${isActive ? "bg-white text-brand-600 ring-brand-200" : "bg-muted text-muted-foreground ring-border"}`}>
                        <Icon className="size-3.5" aria-hidden />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-[11px] font-medium text-muted-foreground">{r.context}</span>
                        <span className={`block truncate text-sm font-semibold ${isActive ? "text-brand-800" : "text-foreground"}`}>
                          <Highlight text={r.title} query={query} />
                        </span>
                        {r.snippet && (
                          <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-muted-foreground">
                            <Highlight text={r.snippet} query={query} />
                          </span>
                        )}
                      </span>
                      {isActive && <CornerDownLeft className="mt-2 size-3.5 shrink-0 text-brand-500" aria-hidden />}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 border-t border-border bg-muted/50 px-4 py-2.5 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-white px-1 font-mono">↑</kbd>
              <kbd className="rounded border border-border bg-white px-1 font-mono">↓</kbd> navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="rounded border border-border bg-white px-1 font-mono">↵</kbd> open
            </span>
            <span className="hidden items-center gap-1 sm:flex">
              <kbd className="rounded border border-border bg-white px-1 font-mono">esc</kbd> close
            </span>
          </span>
          <span>{index.length} pages</span>
        </div>
      </div>
    </div>
  );
}
