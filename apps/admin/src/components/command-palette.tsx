"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import { createPortal } from "react-dom";
import { ArrowRight, CornerDownLeft, FileText, Moon, Package, Search, Store, User } from "lucide-react";
import { cn, Kbd } from "@pai/ui";
import type { NavItem } from "./nav";

type Result = { id: string; type: "page" | "store" | "user" | "order" | "action"; title: string; subtitle?: string; href?: string; run?: () => void };

const TYPE_LABEL: Record<Result["type"], string> = { page: "Pages", store: "Stores", user: "Users", order: "Orders", action: "Actions" };
const TYPE_ICON = { page: FileText, store: Store, user: User, order: Package, action: Moon };

export function CommandPalette({ open, onClose, nav, onToggleTheme }: { open: boolean; onClose: () => void; nav: NavItem[]; onToggleTheme: () => void }) {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const [remote, setRemote] = React.useState<Result[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open) {
      setQ("");
      setRemote([]);
      setActive(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const term = q.trim();
    if (term.length < 2) {
      setRemote([]);
      return;
    }
    const ctrl = new AbortController();
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: ctrl.signal });
        if (res.ok) setRemote((await res.json()).results as Result[]);
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
  }, [q, open]);

  const term = q.trim().toLowerCase();
  const pages: Result[] = nav
    .filter((n) => !term || n.label.toLowerCase().includes(term) || n.keywords?.includes(term))
    .map((n) => ({ id: "p:" + n.href, type: "page", title: n.label, subtitle: n.shortcut ? `G then ${n.shortcut.toUpperCase()}` : undefined, href: n.href }));
  const actions: Result[] = [
    { id: "a:theme", type: "action" as const, title: "Toggle dark mode", subtitle: "Shift+D", run: onToggleTheme },
    { id: "a:review", type: "action" as const, title: "Open theme review queue", href: "/themes/review" },
    { id: "a:invoice", type: "action" as const, title: "Create manual invoice", href: "/billing?tab=invoices&new=1" },
    { id: "a:sync", type: "action" as const, title: "Sync themes from code registry", href: "/themes/registry" },
  ].filter((a) => !term || a.title.toLowerCase().includes(term));
  const results = [...remote, ...pages, ...actions];

  React.useEffect(() => setActive(0), [q, remote.length]);

  const select = (r: Result | undefined) => {
    if (!r) return;
    onClose();
    if (r.run) r.run();
    else if (r.href) router.push(r.href);
  };

  React.useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open || typeof document === "undefined") return null;

  let idx = -1;
  const groups = (["store", "user", "order", "page", "action"] as const).map((type) => ({ type, items: results.filter((r) => r.type === type) })).filter((g) => g.items.length);

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-start justify-center p-4 pt-[12vh]">
      <div className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div role="dialog" aria-modal aria-label="Command palette" className="relative w-full max-w-xl animate-slide-up overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center gap-2 border-b border-border px-4">
          <Search className="size-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") onClose();
              else if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((a) => Math.min(results.length - 1, a + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((a) => Math.max(0, a - 1));
              } else if (e.key === "Enter") {
                e.preventDefault();
                select(results[active]);
              }
            }}
            placeholder="Search stores, users, orders (e.g. “demo #1024”) or jump to…"
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            aria-label="Search"
          />
          {loading && <span className="size-3.5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />}
          <Kbd>Esc</Kbd>
        </div>
        <div ref={listRef} className="max-h-[55vh] overflow-y-auto p-2 scrollbar-thin">
          {results.length === 0 && <p className="px-3 py-10 text-center text-sm text-muted-foreground">{loading ? "Searching…" : "No results"}</p>}
          {groups.map((g) => (
            <div key={g.type} className="mb-1">
              <div className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{TYPE_LABEL[g.type]}</div>
              {g.items.map((r) => {
                idx++;
                const i = results.indexOf(r);
                const Icon = TYPE_ICON[r.type];
                return (
                  <button
                    key={r.id}
                    data-idx={i}
                    onMouseMove={() => setActive(i)}
                    onClick={() => select(r)}
                    className={cn("flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm", active === i ? "bg-accent text-foreground" : "text-foreground/90")}
                  >
                    <Icon className="size-4 shrink-0 text-muted-foreground" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium">{r.title}</span>
                      {r.subtitle && <span className="block truncate text-xs text-muted-foreground">{r.subtitle}</span>}
                    </span>
                    {active === i ? <CornerDownLeft className="size-3.5 text-muted-foreground" /> : <ArrowRight className="size-3.5 text-muted-foreground/0" />}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 border-t border-border px-4 py-2 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> navigate
          </span>
          <span className="inline-flex items-center gap-1">
            <Kbd>↵</Kbd> open
          </span>
          <span className="ml-auto">{idx + 1} results</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
