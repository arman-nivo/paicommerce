"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ExternalLink, GripVertical, ImageOff, MoreHorizontal, Plus, Search, Trash2, X } from "lucide-react";
import { slugify, stripHtml, truncate } from "@pai/core";
import { Button, Card, CardBody, CardHeader, cn, Dropdown, DropdownItem, Field, Input, Select, Spinner, Switch, Textarea, toast, useConfirm } from "@pai/ui";
import { ImageField } from "@/components/media-picker";
import { EditLayout, Header } from "@/components/page";
import { RichTextEditor } from "@/components/rich-text-editor";
import { SaveBar, useDirtyState } from "@/components/save-bar";
import { useCan, useMoney } from "@/components/store-context";
import { run } from "@/lib/client";
import { ProductStatusBadge } from "@/components/status";
import { COLLECTION_SORT_ORDERS, type CollectionSortOrder } from "../../_lib/shared";
import { deleteCollections, saveCollection, searchProductsForCollection } from "../actions";

export type PickedProduct = { id: string; title: string; image: string | null; status: string; price: number };

export type CollectionFormValue = {
  title: string;
  description: string;
  imageUrl: string | null;
  slug: string;
  published: boolean;
  sortOrder: CollectionSortOrder;
  seoTitle: string;
  seoDescription: string;
  products: PickedProduct[];
};

export const EMPTY_COLLECTION: CollectionFormValue = { title: "", description: "", imageUrl: null, slug: "", published: true, sortOrder: "manual", seoTitle: "", seoDescription: "", products: [] };

export function CollectionForm({ id, initial, storeUrl }: { id: string | null; initial: CollectionFormValue; storeUrl: string }) {
  const router = useRouter();
  const canManage = useCan()("products.manage");
  const { value, setValue, set, dirty, reset, commit } = useDirtyState(initial);
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [slugTouched, setSlugTouched] = React.useState(!!id);
  const { confirm, dialog } = useConfirm();
  const isNew = !id;

  const save = async () => {
    if (!value.title.trim()) {
      setErrors({ title: "Give your collection a title" });
      toast.error("Give your collection a title");
      return;
    }
    setSaving(true);
    try {
      const res = await saveCollection({
        id,
        title: value.title,
        description: value.description,
        imageUrl: value.imageUrl,
        slug: value.slug,
        published: value.published,
        sortOrder: value.sortOrder,
        seoTitle: value.seoTitle,
        seoDescription: value.seoDescription,
        productIds: value.products.map((p) => p.id),
      });
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        toast.error(res.error);
        return;
      }
      setErrors({});
      const next = { ...value, slug: res.data.slug };
      commit(next);
      setValue(next);
      toast.success(isNew ? "Collection created" : "Collection saved");
      if (isNew) router.replace(`/products/collections/${res.data.id}`);
      else router.refresh();
    } catch {
      toast.error("Network error — please try again.");
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    const ok = await confirm({ title: `Delete “${initial.title}”?`, description: "Products stay in your store — only this collection is removed.", confirmLabel: "Delete collection", danger: true });
    if (!ok || !id) return;
    const r = await run(deleteCollections({ ids: [id] }), { success: "Collection deleted" });
    if (r) {
      commit(value);
      router.push("/products/collections");
    }
  };

  const dndId = React.useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const from = value.products.findIndex((p) => p.id === active.id);
    const to = value.products.findIndex((p) => p.id === over.id);
    set("products", arrayMove(value.products, from, to));
  };
  const manual = value.sortOrder === "manual";
  const host = storeUrl.replace(/^https?:\/\//, "");

  return (
    <>
      {dialog}
      <Header
        back={{ href: "/products/collections", label: "Collections" }}
        title={isNew ? "Create collection" : initial.title}
        actions={
          !isNew ? (
            <>
              <a href={`${storeUrl}/collections/${initial.slug}`} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm font-medium shadow-xs hover:bg-muted">
                <ExternalLink className="size-4" /> View on store
              </a>
              {canManage && (
                <Dropdown
                  trigger={
                    <Button variant="outline" size="icon" aria-label="More actions">
                      <MoreHorizontal />
                    </Button>
                  }
                >
                  <DropdownItem icon={<Trash2 />} danger onClick={onDelete}>
                    Delete collection
                  </DropdownItem>
                </Dropdown>
              )}
            </>
          ) : undefined
        }
      />
      <EditLayout
        main={
          <>
            <Card>
              <CardBody className="space-y-4">
                <Field label="Title" error={errors.title}>
                  <Input
                    value={value.title}
                    maxLength={120}
                    autoFocus={isNew}
                    placeholder="e.g. Eid Collection, Summer Sale, Men's Panjabi"
                    onChange={(e) => {
                      const t = e.target.value;
                      setValue((s) => ({ ...s, title: t, ...(slugTouched ? {} : { slug: t.trim() ? slugify(t) : "" }) }));
                    }}
                  />
                </Field>
                <Field label="Description" error={errors.description}>
                  <RichTextEditor value={value.description} onChange={(h) => set("description", h)} placeholder="Tell customers what this collection is about (optional)." minHeight={140} />
                </Field>
              </CardBody>
            </Card>

            <Card>
              <CardHeader
                title={`Products (${value.products.length})`}
                description={manual ? "Drag to set the order customers see." : `Shown on your store sorted by: ${COLLECTION_SORT_ORDERS.find((s) => s.value === value.sortOrder)?.label.toLowerCase()}.`}
              />
              <CardBody className="space-y-3">
                {canManage && <ProductSearch exclude={value.products.map((p) => p.id)} onAdd={(p) => set("products", [...value.products, p])} />}
                {value.products.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">No products yet — search above to add some.</p>
                ) : (
                  <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                    <SortableContext items={value.products.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                      <ul className="divide-y divide-border rounded-lg border border-border">
                        {value.products.map((p, i) => (
                          <ProductRow key={p.id} p={p} index={i} draggable={manual && canManage} onRemove={() => set("products", value.products.filter((x) => x.id !== p.id))} />
                        ))}
                      </ul>
                    </SortableContext>
                  </DndContext>
                )}
              </CardBody>
            </Card>

            <Card>
              <CardHeader title="Search engine listing" />
              <CardBody className="space-y-4">
                <div className="rounded-lg border border-border bg-background p-4">
                  <div className="truncate text-xs text-muted-foreground">
                    {host} › collections › {value.slug || "…"}
                  </div>
                  <div className="mt-1 truncate text-lg text-[#1a0dab] dark:text-[#8ab4f8]">{truncate(value.seoTitle || value.title || "Collection title", 65)}</div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{value.seoDescription || truncate(stripHtml(value.description), 155) || "Add a description to improve how this collection appears in search."}</p>
                </div>
                <Field label={`Page title (${value.seoTitle.length}/60)`} error={errors.seoTitle}>
                  <Input value={value.seoTitle} maxLength={120} placeholder={value.title} onChange={(e) => set("seoTitle", e.target.value)} />
                </Field>
                <Field label={`Meta description (${value.seoDescription.length}/155)`} error={errors.seoDescription}>
                  <Textarea rows={3} value={value.seoDescription} maxLength={320} onChange={(e) => set("seoDescription", e.target.value)} />
                </Field>
                <Field label="URL handle" error={errors.slug} hint={`${storeUrl}/collections/${value.slug || "…"}`}>
                  <Input
                    value={value.slug}
                    maxLength={80}
                    onChange={(e) => {
                      setSlugTouched(true);
                      set("slug", e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9ঀ-৿-]/g, ""));
                    }}
                    onBlur={() => set("slug", value.slug.replace(/-+/g, "-").replace(/^-|-$/g, ""))}
                  />
                </Field>
              </CardBody>
            </Card>
          </>
        }
        aside={
          <>
            <Card>
              <CardHeader title="Visibility" />
              <CardBody>
                <label className="flex items-center justify-between gap-3">
                  <span>
                    <span className="block text-sm font-medium">{value.published ? "Published" : "Hidden"}</span>
                    <span className="block text-xs text-muted-foreground">{value.published ? "Customers can browse this collection." : "Only you can see it."}</span>
                  </span>
                  <Switch checked={value.published} onChange={(e) => set("published", e.target.checked)} aria-label="Published" />
                </label>
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Collection image" />
              <CardBody>
                <ImageField value={value.imageUrl} onChange={(u) => set("imageUrl", u)} aspect="aspect-[4/3]" label="Add image" />
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Sort products" />
              <CardBody>
                <Select value={value.sortOrder} onChange={(e) => set("sortOrder", e.target.value as CollectionSortOrder)} aria-label="Sort order">
                  {COLLECTION_SORT_ORDERS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </CardBody>
            </Card>
          </>
        }
      />
      {isNew && (
        <div className="mt-5 flex justify-end gap-2">
          <Link href="/products/collections" className="inline-flex h-9 items-center rounded-lg border border-input px-4 text-sm hover:bg-muted">
            Cancel
          </Link>
          <Button onClick={save} loading={saving} disabled={!canManage}>
            Save collection
          </Button>
        </div>
      )}
      <SaveBar dirty={dirty} saving={saving} onSave={save} onDiscard={reset} />
    </>
  );
}

function ProductRow({ p, index, draggable, onRemove }: { p: PickedProduct; index: number; draggable: boolean; onRemove: () => void }) {
  const money = useMoney();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: p.id, disabled: !draggable });
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={cn("flex items-center gap-3 bg-card px-3 py-2", isDragging && "relative z-10 shadow-lg")}>
      {draggable ? (
        <button type="button" {...attributes} {...listeners} className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted" aria-label={`Reorder ${p.title}`}>
          <GripVertical className="size-4" />
        </button>
      ) : (
        <span className="w-6 text-center text-xs tabular-nums text-muted-foreground">{index + 1}</span>
      )}
      <Thumb src={p.image} />
      <Link href={`/products/${p.id}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:underline">
        {p.title}
      </Link>
      <span className="hidden sm:inline">
        <ProductStatusBadge status={p.status} />
      </span>
      <span className="hidden w-20 text-right text-sm tabular-nums text-muted-foreground sm:inline">{money(p.price)}</span>
      <Button type="button" size="icon-sm" variant="ghost" onClick={onRemove} aria-label={`Remove ${p.title}`}>
        <X />
      </Button>
    </li>
  );
}

function Thumb({ src }: { src: string | null }) {
  return (
    <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" />
      ) : (
        <ImageOff className="size-3.5 text-muted-foreground/60" />
      )}
    </span>
  );
}

function ProductSearch({ exclude, onAdd }: { exclude: string[]; onAdd: (p: PickedProduct) => void }) {
  const money = useMoney();
  const [q, setQ] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<PickedProduct[]>([]);
  const ref = React.useRef<HTMLDivElement>(null);
  const excludeKey = exclude.join(",");

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      const r = await searchProductsForCollection({ q, exclude: excludeKey ? excludeKey.split(",") : [] }).catch(() => null);
      if (cancelled) return;
      setLoading(false);
      if (r?.ok) setResults(r.data);
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [q, open, excludeKey]);

  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input value={q} onChange={(e) => setQ(e.target.value)} onFocus={() => setOpen(true)} onKeyDown={(e) => e.key === "Escape" && setOpen(false)} placeholder="Search products to add" className="pl-9" />
      {open && (
        <div className="absolute inset-x-0 top-full z-30 mt-1 max-h-80 overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-xl scrollbar-thin">
          {loading && !results.length ? (
            <div className="flex items-center justify-center py-6">
              <Spinner className="text-muted-foreground" />
            </div>
          ) : results.length ? (
            results.map((p) => (
              <button
                type="button"
                key={p.id}
                onClick={() => {
                  onAdd(p);
                  setResults((r) => r.filter((x) => x.id !== p.id));
                }}
                className="flex w-full items-center gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-muted"
              >
                <Thumb src={p.image} />
                <span className="min-w-0 flex-1 truncate text-sm">{p.title}</span>
                <span className="text-xs tabular-nums text-muted-foreground">{money(p.price)}</span>
                <Plus className="size-4 text-primary" />
              </button>
            ))
          ) : (
            <p className="px-3 py-5 text-center text-sm text-muted-foreground">{q ? "No matching products" : "All products are already in this collection"}</p>
          )}
        </div>
      )}
    </div>
  );
}
