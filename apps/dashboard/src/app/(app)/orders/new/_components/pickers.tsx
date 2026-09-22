"use client";
import * as React from "react";
import { Package, Search, UserRound } from "lucide-react";
import { Avatar, cn, Spinner } from "@pai/ui";
import { useMoney } from "@/components/store-context";
import { searchOrderCustomers, searchOrderProducts, type CustomerHit, type ProductHit } from "../actions";
import type { DraftLine } from "./order-form";

function useOutside(ref: React.RefObject<HTMLElement | null>, onOut: () => void) {
  React.useEffect(() => {
    const h = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && onOut();
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [ref, onOut]);
}

function useDebounced<T>(value: T, ms = 250) {
  const [v, setV] = React.useState(value);
  React.useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}

const inputCls =
  "h-10 w-full rounded-lg border border-input bg-card pl-9 pr-9 text-sm shadow-xs placeholder:text-muted-foreground/70 focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/15";

export function ProductPicker({ onAdd }: { onAdd: (l: DraftLine) => void }) {
  const money = useMoney();
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [hits, setHits] = React.useState<ProductHit[]>([]);
  const [loading, setLoading] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const dq = useDebounced(q);
  useOutside(ref, React.useCallback(() => setOpen(false), []));

  React.useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoading(true);
    searchOrderProducts({ q: dq }).then((r) => {
      if (!alive) return;
      setLoading(false);
      setHits(r.ok ? r.data : []);
    });
    return () => {
      alive = false;
    };
  }, [dq, open]);

  const add = (p: ProductHit, v?: ProductHit["variants"][number]) => {
    onAdd({ productId: p.id, variantId: v?.id ?? null, quantity: 1, title: p.title, variantTitle: v?.title ?? null, imageUrl: v?.imageUrl || p.imageUrl });
    setOpen(false);
    setQ("");
  };

  const stockLabel = (s: number | null) => (s == null ? null : s <= 0 ? <span className="text-red-600">Out of stock</span> : <span>{s} in stock</span>);

  return (
    <div ref={ref} className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setOpen(true)} placeholder="Search products by name or SKU…" className={inputCls} />
      {loading && open && <Spinner className="absolute right-3 top-3 text-muted-foreground" />}
      {open && (
        <div className="absolute inset-x-0 top-full z-40 mt-1.5 max-h-96 overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-xl scrollbar-thin">
          {!loading && !hits.length && <p className="px-3 py-6 text-center text-sm text-muted-foreground">{q ? `No active products match “${q}”.` : "No active products yet."}</p>}
          {hits.map((p) =>
            p.variants.length ? (
              <div key={p.id} className="py-1">
                <div className="flex items-center gap-2 px-2 py-1">
                  <Thumb url={p.imageUrl} />
                  <span className="truncate text-sm font-medium">{p.title}</span>
                </div>
                {p.variants.map((v) => {
                  const out = v.stock != null && v.stock <= 0;
                  return (
                    <button
                      key={v.id}
                      type="button"
                      disabled={out}
                      onClick={() => add(p, v)}
                      className="flex w-full items-center justify-between gap-2 rounded-lg py-1.5 pl-12 pr-2 text-left text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <span className="truncate">{v.title}</span>
                      <span className="flex shrink-0 items-center gap-3 text-xs text-muted-foreground">
                        {stockLabel(v.stock)}
                        <span className="font-medium tabular-nums text-foreground">{money(v.price)}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <button
                key={p.id}
                type="button"
                disabled={p.stock != null && p.stock <= 0}
                onClick={() => add(p)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Thumb url={p.imageUrl} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{p.title}</span>
                  <span className="text-xs text-muted-foreground">{stockLabel(p.stock) ?? (p.sku ? `SKU ${p.sku}` : null)}</span>
                </span>
                <span className="text-sm font-medium tabular-nums">{money(p.price)}</span>
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}

export function Thumb({ url, className }: { url: string | null; className?: string }) {
  return url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className={cn("size-9 shrink-0 rounded-md border border-border object-cover", className)} />
  ) : (
    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted text-muted-foreground", className)}>
      <Package className="size-4" />
    </span>
  );
}

export function CustomerPicker({ onPick }: { onPick: (c: CustomerHit) => void }) {
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [hits, setHits] = React.useState<CustomerHit[]>([]);
  const [loading, setLoading] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const dq = useDebounced(q.trim());
  useOutside(ref, React.useCallback(() => setOpen(false), []));

  React.useEffect(() => {
    if (!dq) {
      setHits([]);
      return;
    }
    let alive = true;
    setLoading(true);
    searchOrderCustomers({ q: dq }).then((r) => {
      if (!alive) return;
      setLoading(false);
      setHits(r.ok ? r.data : []);
      setOpen(true);
    });
    return () => {
      alive = false;
    };
  }, [dq]);

  return (
    <div ref={ref} className="relative">
      <UserRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => hits.length && setOpen(true)} placeholder="Find an existing customer by name or phone…" className={inputCls} />
      {loading && <Spinner className="absolute right-3 top-3 text-muted-foreground" />}
      {open && dq && !loading && (
        <div className="absolute inset-x-0 top-full z-40 mt-1.5 max-h-80 overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-xl scrollbar-thin">
          {!hits.length && <p className="px-3 py-4 text-center text-sm text-muted-foreground">No customer found — fill in the details below to add a new one.</p>}
          {hits.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onPick(c);
                setOpen(false);
                setQ("");
              }}
              className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left hover:bg-muted"
            >
              <Avatar name={c.name} size={30} />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{c.name}</span>
                <span className="block truncate text-xs text-muted-foreground">{[c.phone, c.email].filter(Boolean).join(" · ")}</span>
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {c.ordersCount} order{c.ordersCount === 1 ? "" : "s"}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
