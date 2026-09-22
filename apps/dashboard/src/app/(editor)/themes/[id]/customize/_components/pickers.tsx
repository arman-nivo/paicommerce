"use client";
import * as React from "react";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { BookOpen, Check, ExternalLink, FileText, GripVertical, House, Image as ImageIcon, LayoutGrid, Link2, Package, Plus, Search, ShoppingCart, X } from "lucide-react";
import { Button, cn, Dialog, Input, Select, Skeleton } from "@pai/ui";
import { moveInArray } from "./state";
import type { PickerCollection, PickerMenu, PickerPage, PickerProduct } from "./types";

type Kind = "products" | "collections" | "menus" | "pages" | "posts";
type ItemOf<K extends Kind> = K extends "products" ? PickerProduct : K extends "collections" ? PickerCollection : K extends "menus" ? PickerMenu : PickerPage;

const cache = new Map<string, Promise<unknown[]>>();

function fetchResource<K extends Kind>(kind: K, q = "", slugs?: string[]): Promise<ItemOf<K>[]> {
  const params = new URLSearchParams({ kind });
  if (q) params.set("q", q);
  if (slugs?.length) params.set("slugs", slugs.join(","));
  const key = params.toString();
  if (!cache.has(key)) {
    const p = fetch(`/api/customizer/picker?${key}`)
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d: { items?: unknown[] }) => d.items ?? [])
      .catch(() => {
        cache.delete(key);
        return [];
      });
    cache.set(key, p);
    // Short-lived cache so newly created items show up without a reload.
    setTimeout(() => cache.delete(key), 60_000);
  }
  return cache.get(key)! as Promise<ItemOf<K>[]>;
}

/** Search a resource list (debounced). */
export function useResource<K extends Kind>(kind: K, q: string, enabled = true) {
  const [items, setItems] = React.useState<ItemOf<K>[] | null>(null);
  React.useEffect(() => {
    if (!enabled) return;
    let alive = true;
    const t = setTimeout(() => fetchResource(kind, q.trim()).then((r) => alive && setItems(r)), q ? 200 : 0);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, [kind, q, enabled]);
  return items;
}

/** Resolve the display data for already-selected slugs. */
function useSelected<K extends "products" | "collections">(kind: K, slugs: string[]) {
  const key = slugs.join(",");
  const [map, setMap] = React.useState<Record<string, ItemOf<K>> | null>(null);
  React.useEffect(() => {
    if (!key) return;
    setMap(null);
    let alive = true;
    fetchResource(kind, "", key.split(",")).then((items) => {
      if (!alive) return;
      setMap(Object.fromEntries(items.map((i) => [(i as PickerProduct).slug, i])) as Record<string, ItemOf<K>>);
    });
    return () => {
      alive = false;
    };
  }, [kind, key]);
  return map;
}

function Thumb({ src, className }: { src: string | null | undefined; className?: string }) {
  return (
    <span className={cn("flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted text-muted-foreground", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {src ? <img src={src} alt="" className="size-full object-cover" loading="lazy" /> : <ImageIcon className="size-4" />}
    </span>
  );
}

/* ─────────────────────────── Product / collection dialog ─────────────────────────── */

function ResourceDialog({
  kind,
  open,
  onClose,
  selected,
  multiple,
  limit,
  onDone,
}: {
  kind: "products" | "collections";
  open: boolean;
  onClose: () => void;
  selected: string[];
  multiple?: boolean;
  limit?: number;
  onDone: (slugs: string[]) => void;
}) {
  const [q, setQ] = React.useState("");
  const [picked, setPicked] = React.useState<string[]>(selected);
  React.useEffect(() => {
    if (open) {
      setPicked(selected);
      setQ("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const items = useResource(kind, q, open) as (PickerProduct | PickerCollection)[] | null;
  const noun = kind === "products" ? "product" : "collection";
  const full = !!limit && picked.length >= limit;

  const toggle = (slug: string) => {
    if (!multiple) {
      onDone([slug]);
      onClose();
      return;
    }
    setPicked((p) => (p.includes(slug) ? p.filter((s) => s !== slug) : full ? p : [...p, slug]));
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="md"
      title={multiple ? `Select ${noun}s` : `Select a ${noun}`}
      description={limit && multiple ? `Choose up to ${limit}. Drag to reorder after selecting.` : undefined}
      footer={
        multiple ? (
          <>
            <span className="mr-auto self-center text-xs text-muted-foreground">
              {picked.length} selected{limit ? ` of ${limit}` : ""}
            </span>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => {
                onDone(picked);
                onClose();
              }}
            >
              Done
            </Button>
          </>
        ) : undefined
      }
    >
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${noun}s`} className="pl-9" />
      </div>
      <div className="-mx-2 max-h-[55vh] space-y-0.5 overflow-y-auto scrollbar-thin">
        {items === null &&
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-2 py-1.5">
              <Skeleton className="size-9" />
              <Skeleton className="h-4 flex-1" />
            </div>
          ))}
        {items?.map((it) => {
          const on = picked.includes(it.slug);
          const disabled = multiple && !on && full;
          return (
            <button
              key={it.slug}
              type="button"
              disabled={disabled}
              onClick={() => toggle(it.slug)}
              className={cn("flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-muted disabled:opacity-40", on && "bg-accent")}
            >
              <Thumb src={it.image} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{it.title}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  /{kind}/{it.slug}
                  {"status" in it && it.status && it.status !== "active" ? ` · ${it.status}` : ""}
                </span>
              </span>
              {on && <Check className="size-4 shrink-0 text-primary" />}
            </button>
          );
        })}
        {items?.length === 0 && (
          <div className="px-2 py-10 text-center text-sm text-muted-foreground">
            {q ? `No ${noun}s match “${q}”.` : `You don't have any ${noun}s yet.`}
            <div className="mt-2">
              <a href={kind === "products" ? "/products/new" : "/products/collections"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                Create one <ExternalLink className="size-3" />
              </a>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}

/** Single product or collection picker (value = slug). */
export function SlugPicker({ kind, value, onChange }: { kind: "products" | "collections"; value: string; onChange: (slug: string) => void }) {
  const [open, setOpen] = React.useState(false);
  const map = useSelected(kind, value ? [value] : []) as Record<string, PickerProduct | PickerCollection> | null;
  const item = value && map ? map[value] : undefined;
  const noun = kind === "products" ? "product" : "collection";
  const Icon = kind === "products" ? Package : LayoutGrid;
  return (
    <>
      {value ? (
        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-card p-2">
          <Thumb src={item?.image} />
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{item?.title ?? value}</div>
            {map && !item && <div className="text-xs text-amber-600">Not found — it may have been deleted</div>}
          </div>
          <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>
            Change
          </Button>
          <button type="button" onClick={() => onChange("")} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label={`Remove ${noun}`}>
            <X className="size-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border px-3 py-3 text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
        >
          <Icon className="size-4" /> Select {noun}
        </button>
      )}
      <ResourceDialog kind={kind} open={open} onClose={() => setOpen(false)} selected={value ? [value] : []} onDone={(s) => onChange(s[0] ?? "")} />
    </>
  );
}

function SortableProduct({ slug, item, onRemove }: { slug: string; item?: PickerProduct; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: slug });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex items-center gap-2 rounded-lg border border-border bg-card p-1.5", isDragging && "relative z-10 shadow-lg")}
    >
      <button type="button" className="cursor-grab touch-none rounded p-0.5 text-muted-foreground hover:text-foreground" aria-label="Drag to reorder" {...attributes} {...listeners}>
        <GripVertical className="size-4" />
      </button>
      <Thumb src={item?.image} className="size-8" />
      <span className="min-w-0 flex-1 truncate text-sm">{item?.title ?? slug}</span>
      <button type="button" onClick={onRemove} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Remove">
        <X className="size-3.5" />
      </button>
    </div>
  );
}

/** Multi product picker (value = ordered slugs). */
export function ProductListPicker({ value, onChange, limit }: { value: string[]; onChange: (slugs: string[]) => void; limit?: number }) {
  const [open, setOpen] = React.useState(false);
  const map = useSelected("products", value) ?? {};
  const dndId = React.useId();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    onChange(moveInArray(value, value.indexOf(String(e.active.id)), value.indexOf(String(e.over.id))));
  };
  return (
    <div className="space-y-1.5">
      {value.length > 0 && (
        <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={value} strategy={verticalListSortingStrategy}>
            <div className="space-y-1">
              {value.map((slug) => (
                <SortableProduct key={slug} slug={slug} item={map[slug]} onRemove={() => onChange(value.filter((s) => s !== slug))} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setOpen(true)}>
        <Plus /> {value.length ? "Edit products" : "Select products"}
        {limit ? <span className="text-muted-foreground">({value.length}/{limit})</span> : null}
      </Button>
      <ResourceDialog kind="products" open={open} onClose={() => setOpen(false)} selected={value} multiple limit={limit} onDone={onChange} />
    </div>
  );
}

/** Menu picker (value = menu handle). */
export function MenuPicker({ value, onChange }: { value: string; onChange: (handle: string) => void }) {
  const menus = useResource("menus", "");
  const known = menus?.some((m) => m.handle === value);
  return (
    <div className="space-y-1">
      <Select value={value} onChange={(e) => onChange(e.target.value)} disabled={menus === null}>
        <option value="">— No menu —</option>
        {menus?.map((m) => (
          <option key={m.handle} value={m.handle}>
            {m.title} ({m.count} {m.count === 1 ? "link" : "links"})
          </option>
        ))}
        {value && menus && !known && <option value={value}>{value} (not created yet)</option>}
      </Select>
      <a href="/content/navigation" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
        Edit menus <ExternalLink className="size-3" />
      </a>
    </div>
  );
}

/* ─────────────────────────── Link picker (url fields) ─────────────────────────── */

type LinkTab = "collections" | "products" | "pages" | "posts";

export function LinkInput({ value, onChange, placeholder, onFocus }: { value: string; onChange: (v: string) => void; placeholder?: string; onFocus?: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [tab, setTab] = React.useState<LinkTab | null>(null);
  const [q, setQ] = React.useState("");
  const ref = React.useRef<HTMLDivElement>(null);
  const items = useResource((tab ?? "pages") as LinkTab, q, open && !!tab) as (PickerProduct | PickerCollection | PickerPage)[] | null;

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const pick = (url: string) => {
    onChange(url);
    setOpen(false);
    setTab(null);
    setQ("");
  };
  const prefix: Record<LinkTab, string> = { collections: "/collections/", products: "/products/", pages: "/pages/", posts: "/blog/" };
  const quick: { label: string; url?: string; tab?: LinkTab; icon: React.ReactNode }[] = [
    { label: "Home page", url: "/", icon: <House /> },
    { label: "All products", url: "/collections/all", icon: <Package /> },
    { label: "All collections", url: "/collections", icon: <LayoutGrid /> },
    { label: "Collection…", tab: "collections", icon: <LayoutGrid /> },
    { label: "Product…", tab: "products", icon: <Package /> },
    { label: "Page…", tab: "pages", icon: <FileText /> },
    { label: "Blog post…", tab: "posts", icon: <BookOpen /> },
    { label: "Blog", url: "/blog", icon: <BookOpen /> },
    { label: "Search", url: "/search", icon: <Search /> },
    { label: "Cart", url: "/cart", icon: <ShoppingCart /> },
  ];

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-1.5">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input value={value} onChange={(e) => onChange(e.target.value)} onFocus={onFocus} placeholder={placeholder ?? "Paste a link or pick one"} className="pl-8" />
        </div>
        <Button type="button" size="sm" variant="outline" className="h-9" onClick={() => setOpen((o) => !o)}>
          Browse
        </Button>
      </div>
      {open && (
        <div className="absolute inset-x-0 top-full z-40 mt-1 animate-fade-in rounded-xl border border-border bg-card p-1 shadow-xl">
          {!tab ? (
            <div className="max-h-72 overflow-y-auto scrollbar-thin">
              {quick.map((o) => (
                <button
                  key={o.label}
                  type="button"
                  onClick={() => (o.url ? pick(o.url) : setTab(o.tab!))}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-muted [&_svg]:size-4 [&_svg]:text-muted-foreground"
                >
                  {o.icon}
                  <span className="flex-1">{o.label}</span>
                  {o.url && <span className="font-mono text-[11px] text-muted-foreground">{o.url}</span>}
                </button>
              ))}
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-1 p-1">
                <Button type="button" size="sm" variant="ghost" onClick={() => setTab(null)}>
                  ←
                </Button>
                <Input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${tab}`} className="h-8" />
              </div>
              <div className="max-h-60 overflow-y-auto scrollbar-thin">
                {items === null && <div className="px-3 py-4 text-sm text-muted-foreground">Loading…</div>}
                {items?.map((it) => (
                  <button
                    key={it.slug}
                    type="button"
                    onClick={() => pick(prefix[tab] + it.slug)}
                    className="flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-muted"
                  >
                    {"image" in it && <Thumb src={it.image} className="size-7" />}
                    <span className="min-w-0 flex-1 truncate">{it.title}</span>
                  </button>
                ))}
                {items?.length === 0 && <div className="px-3 py-4 text-sm text-muted-foreground">Nothing found.</div>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
