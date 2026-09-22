"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Eye, EyeOff, FolderOpen, GripVertical, Trash2, X } from "lucide-react";
import { Badge, Button, Checkbox, cn, toast, useConfirm } from "@pai/ui";
import { run } from "@/lib/client";
import { COLLECTION_SORT_ORDERS } from "../../_lib/shared";
import { deleteCollections, reorderCollections, setCollectionsPublished } from "../actions";

export type CollectionRow = { id: string; title: string; slug: string; imageUrl: string | null; published: boolean; sortOrder: string; products: number };

const SORT_LABEL = Object.fromEntries(COLLECTION_SORT_ORDERS.map((s) => [s.value, s.label.replace(" (drag to reorder)", "")]));

export function CollectionList({ rows, canManage, reorderable }: { rows: CollectionRow[]; canManage: boolean; reorderable: boolean }) {
  const router = useRouter();
  const [items, setItems] = React.useState(rows);
  const [selected, setSelected] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState(false);
  const { confirm, dialog } = useConfirm();
  React.useEffect(() => {
    setItems(rows);
    setSelected((s) => s.filter((id) => rows.some((r) => r.id === id)));
  }, [rows]);

  const dndId = React.useId();
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const prev = items;
    const next = arrayMove(items, items.findIndex((i) => i.id === active.id), items.findIndex((i) => i.id === over.id));
    setItems(next);
    const r = await reorderCollections({ ids: next.map((i) => i.id) });
    if (!r.ok) {
      setItems(prev);
      toast.error(r.error);
    } else toast.success("Order saved");
  };

  const bulk = async (fn: () => Promise<unknown>) => {
    setBusy(true);
    const r = await fn();
    setBusy(false);
    if (r !== undefined) {
      setSelected([]);
      router.refresh();
    }
  };

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));
  const allOn = selected.length === items.length && items.length > 0;

  return (
    <>
      {dialog}
      {canManage && (
        <div className={cn("flex flex-wrap items-center gap-2 border-b border-border px-4 py-2", selected.length ? "bg-accent/60" : "bg-muted/30")}>
          <Checkbox aria-label="Select all" checked={allOn} onChange={() => setSelected(allOn ? [] : items.map((i) => i.id))} />
          {selected.length ? (
            <>
              <span className="mr-1 text-sm font-medium">{selected.length} selected</span>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => bulk(() => run(setCollectionsPublished({ ids: selected, published: true }), { success: "Published" }))}>
                <Eye /> Publish
              </Button>
              <Button size="sm" variant="outline" disabled={busy} onClick={() => bulk(() => run(setCollectionsPublished({ ids: selected, published: false }), { success: "Hidden from store" }))}>
                <EyeOff /> Hide
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600"
                disabled={busy}
                onClick={async () => {
                  const ok = await confirm({
                    title: `Delete ${selected.length} collection${selected.length > 1 ? "s" : ""}?`,
                    description: "Products inside stay in your store — only the grouping is removed.",
                    confirmLabel: "Delete",
                    danger: true,
                  });
                  if (ok) bulk(() => run(deleteCollections({ ids: selected }), { success: "Deleted" }));
                }}
              >
                <Trash2 /> Delete
              </Button>
              <Button size="sm" variant="ghost" className="ml-auto" onClick={() => setSelected([])}>
                <X /> Clear
              </Button>
            </>
          ) : (
            <span className="text-xs text-muted-foreground">{reorderable ? "Drag the handles to change the order collections appear in your store." : `${items.length} collections`}</span>
          )}
        </div>
      )}
      <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <ul className="divide-y divide-border">
            {items.map((c) => (
              <Row key={c.id} c={c} reorderable={reorderable} canManage={canManage} selected={selected.includes(c.id)} onToggle={() => toggle(c.id)} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </>
  );
}

function Row({ c, reorderable, canManage, selected, onToggle }: { c: CollectionRow; reorderable: boolean; canManage: boolean; selected: boolean; onToggle: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: c.id, disabled: !reorderable });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("flex items-center gap-3 bg-card px-4 py-3 transition-colors hover:bg-muted/40", selected && "bg-accent/40", isDragging && "relative z-10 shadow-lg")}
    >
      {canManage && <Checkbox aria-label={`Select ${c.title}`} checked={selected} onChange={onToggle} />}
      {reorderable && (
        <button type="button" {...attributes} {...listeners} className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing" aria-label={`Reorder ${c.title}`}>
          <GripVertical className="size-4" />
        </button>
      )}
      <Link href={`/products/collections/${c.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
          {c.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.imageUrl} alt="" className="size-full object-cover" loading="lazy" />
          ) : (
            <FolderOpen className="size-5 text-muted-foreground/60" />
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium">{c.title}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {c.products.toLocaleString()} product{c.products === 1 ? "" : "s"} · {SORT_LABEL[c.sortOrder] ?? c.sortOrder}
          </span>
        </span>
        {c.published ? (
          <Badge tone="green" dot>
            Published
          </Badge>
        ) : (
          <Badge dot>Hidden</Badge>
        )}
      </Link>
    </li>
  );
}
