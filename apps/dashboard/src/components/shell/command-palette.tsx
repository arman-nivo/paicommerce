"use client";
import { useRouter } from "next/navigation";
import * as React from "react";
import { createPortal } from "react-dom";
import { ArrowRight, CornerDownLeft, Package, Search, ShoppingBag, User } from "lucide-react";
import { cn, Kbd, Spinner } from "@pai/ui";
import { hasPermission } from "@pai/core";
import { NAV, SETTINGS_NAV } from "@/lib/nav";
import { useStore } from "../store-context";
import { ICONS } from "./icons";

type Result = { id: string; group: string; label: string; sub?: string; href: string; icon: React.ReactNode };

type SearchResponse = {
  orders: { id: string; number: number; name: string; phone: string | null; total: string }[];
  products: { id: string; title: string; status: string; image: string | null }[];
  customers: { id: string; name: string; phone: string | null; email: string | null }[];
};

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const { member } = useStore();
  const [q, setQ] = React.useState("");
  const [idx, setIdx] = React.useState(0);
  const [remote, setRemote] = React.useState<Result[]>([]);
  const [loading, setLoading] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (open) {
      setQ("");
      setIdx(0);
      setRemote([]);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  const pages: Result[] = React.useMemo(() => {
    const out: Result[] = [];
    for (const g of NAV)
      for (const i of g.items) {
        if (i.permission && !hasPermission(member, i.permission)) continue;
        const Icon = ICONS[i.icon]!;
        out.push({ id: `p-${i.href}`, group: "Pages", label: i.label, sub: i.keywords, href: i.href, icon: <Icon /> });
        for (const c of i.children ?? []) if (c.href !== i.href && (!c.permission || hasPermission(member, c.permission))) out.push({ id: `p-${c.href}`, group: "Pages", label: `${i.label} › ${c.label}`, href: c.href, icon: <Icon /> });
      }
    for (const s of SETTINGS_NAV) {
      if (s.permission && !hasPermission(member, s.permission)) continue;
      const Icon = ICONS[s.icon] ?? ICONS.settings!;
      out.push({ id: `s-${s.href}`, group: "Settings", label: `Settings › ${s.label}`, sub: s.description, href: s.href, icon: <Icon /> });
    }
    out.push({ id: "a-new-product", group: "Actions", label: "Add a product", href: "/products/new", icon: <Package /> });
    out.push({ id: "a-new-order", group: "Actions", label: "Create an order", href: "/orders/new", icon: <ShoppingBag /> });
    out.push({ id: "a-customize", group: "Actions", label: "Customize theme", href: "/themes", icon: <ICONS.themes /> });
    out.push({ id: "a-support", group: "Actions", label: "Contact support", href: "/support", icon: <ICONS.support /> });
    return out;
  }, [member]);

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
        const data = (await res.json()) as SearchResponse;
        setRemote([
          ...data.orders.map((o) => ({ id: `o-${o.id}`, group: "Orders", label: `#${o.number} · ${o.name}`, sub: [o.phone, o.total].filter(Boolean).join(" · "), href: `/orders/${o.id}`, icon: <ShoppingBag /> })),
          ...data.products.map((p) => ({ id: `pr-${p.id}`, group: "Products", label: p.title, sub: p.status, href: `/products/${p.id}`, icon: <Package /> })),
          ...data.customers.map((c) => ({ id: `c-${c.id}`, group: "Customers", label: c.name, sub: [c.phone, c.email].filter(Boolean).join(" · "), href: `/customers/${c.id}`, icon: <User /> })),
        ]);
      } catch {
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
  const filteredPages = term ? pages.filter((p) => `${p.label} ${p.sub ?? ""}`.toLowerCase().includes(term)).slice(0, 8) : pages.filter((p) => p.group !== "Settings").slice(0, 12);
  const results = [...remote, ...filteredPages];

  React.useEffect(() => setIdx(0), [q, remote.length]);
  React.useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${idx}"]`)?.scrollIntoView({ block: "nearest" });
  }, [idx]);

  const go = (r: Result | undefined) => {
    if (!r) return;
    onClose();
    router.push(r.href);
  };

  if (!open || typeof document === "undefined") return null;
  let lastGroup = "";
  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-start justify-center p-3 pt-[10vh]">
      <div className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative w-full max-w-xl animate-slide-up overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search className="size-4 text-muted-foreground" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIdx((i) => Math.min(results.length - 1, i + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setIdx((i) => Math.max(0, i - 1));
              } else if (e.key === "Enter") {
                e.preventDefault();
                go(results[idx]);
              } else if (e.key === "Escape") onClose();
            }}
            placeholder="Search or jump to…  (order #, phone, product, customer)"
            className="h-14 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
          {loading && <Spinner className="text-muted-foreground" />}
          <Kbd>Esc</Kbd>
        </div>
        <div ref={listRef} className="max-h-[60vh] overflow-y-auto p-2 scrollbar-thin">
          {!results.length && <div className="px-3 py-10 text-center text-sm text-muted-foreground">{loading ? "Searching…" : `No results for “${q}”`}</div>}
          {results.map((r, i) => {
            const header = r.group !== lastGroup ? r.group : null;
            lastGroup = r.group;
            return (
              <React.Fragment key={r.id}>
                {header && <div className="px-2.5 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{header}</div>}
                <button
                  data-idx={i}
                  onMouseMove={() => setIdx(i)}
                  onClick={() => go(r)}
                  className={cn("flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm [&_svg]:size-4", i === idx ? "bg-accent text-foreground" : "text-foreground")}
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-md border border-border bg-card text-muted-foreground">{r.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{r.label}</span>
                    {r.sub && <span className="block truncate text-xs text-muted-foreground">{r.sub}</span>}
                  </span>
                  {i === idx ? <CornerDownLeft className="text-muted-foreground" /> : <ArrowRight className="text-transparent" />}
                </button>
              </React.Fragment>
            );
          })}
        </div>
        <div className="flex items-center gap-4 border-t border-border bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
          <span className="flex items-center gap-1"><Kbd>↵</Kbd> open</span>
          <span className="ml-auto hidden items-center gap-1 sm:flex"><Kbd>g</Kbd> then <Kbd>o</Kbd> orders · <Kbd>p</Kbd> products</span>
        </div>
      </div>
    </div>,
    document.body,
  );
}
