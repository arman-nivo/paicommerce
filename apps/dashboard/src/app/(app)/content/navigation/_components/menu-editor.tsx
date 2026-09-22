"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CornerDownRight, GripVertical, IndentDecrease, IndentIncrease, ListTree, Pencil, Plus, Trash2 } from "lucide-react";
import type { MenuItem } from "@pai/db/schema";
import { Badge, Button, Card, CardBody, CardHeader, cn, Dialog, EmptyState, Field, Input, Tooltip, useConfirm } from "@pai/ui";
import { EditLayout, Header } from "@/components/page";
import { SaveBar, useDirtyState } from "@/components/save-bar";
import { useStore } from "@/components/store-context";
import { run } from "@/lib/client";
import { deleteMenu, saveMenu } from "../actions";
import { LinkPicker } from "./link-picker";
import { buildTree, canIndent, flatten, MAX_DEPTH, moveItem, shiftDepth, subtreeEnd, type FlatItem } from "./tree";

type EditState = { mode: "add"; parentIndex: number | null } | { mode: "edit"; index: number };

export function MenuEditor({ id, handle, initialTitle, initialItems }: { id: string; handle: string; initialTitle: string; initialItems: MenuItem[] }) {
  const router = useRouter();
  const { store } = useStore();
  const { value, setValue, dirty, reset, commit } = useDirtyState({ title: initialTitle, items: flatten(initialItems) });
  const [saving, setSaving] = React.useState(false);
  const [editing, setEditing] = React.useState<EditState | null>(null);
  const { confirm, dialog } = useConfirm();
  const reserved = handle === "main" || handle === "footer";
  const flat = value.items;
  const setFlat = (fn: (f: FlatItem[]) => FlatItem[]) => setValue((s) => ({ ...s, items: fn(s.items) }));

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));

  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    setFlat((f) => moveItem(f, String(e.active.id), String(e.over!.id)));
  };

  const save = async () => {
    setSaving(true);
    const res = await run(saveMenu({ id, title: value.title, items: buildTree(flat) }), { success: "Menu saved" });
    setSaving(false);
    if (res) {
      commit();
      router.refresh();
    }
  };

  const removeItem = async (i: number) => {
    const end = subtreeEnd(flat, i);
    const kids = end - i - 1;
    if (kids > 0) {
      const ok = await confirm({ title: `Remove “${flat[i]!.label}”?`, description: `Its ${kids} nested ${kids === 1 ? "link" : "links"} will be removed too.`, confirmLabel: "Remove", danger: true });
      if (!ok) return;
    }
    setFlat((f) => [...f.slice(0, i), ...f.slice(end)]);
  };

  const removeMenu = async () => {
    const ok = await confirm({ title: `Delete “${value.title}”?`, description: "Theme sections using this menu will stop showing it. This can't be undone.", confirmLabel: "Delete menu", danger: true });
    if (!ok) return;
    if (await run(deleteMenu({ id }), { success: "Menu deleted" })) {
      commit();
      router.push("/content/navigation");
    }
  };

  const submitItem = (label: string, url: string) => {
    if (!editing) return;
    if (editing.mode === "edit") {
      setFlat((f) => f.map((x, idx) => (idx === editing.index ? { ...x, label, url } : x)));
    } else if (editing.parentIndex == null) {
      setFlat((f) => [...f, { id: crypto.randomUUID(), label, url, depth: 0 }]);
    } else {
      const p = editing.parentIndex;
      setFlat((f) => {
        const end = subtreeEnd(f, p);
        return [...f.slice(0, end), { id: crypto.randomUUID(), label, url, depth: f[p]!.depth + 1 }, ...f.slice(end)];
      });
    }
    setEditing(null);
  };

  const editingItem = editing?.mode === "edit" ? flat[editing.index] : undefined;

  return (
    <>
      {dialog}
      <Header
        back={{ href: "/content/navigation", label: "Navigation" }}
        title={initialTitle}
        description={
          <span className="inline-flex items-center gap-2">
            Handle <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{handle}</code>
            {reserved && <Badge tone="brand">Default</Badge>}
          </span>
        }
        actions={
          !reserved && (
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700" onClick={removeMenu}>
              <Trash2 /> Delete menu
            </Button>
          )
        }
      />
      <EditLayout
        main={
          <Card>
            <CardHeader
              title="Menu items"
              description="Drag to reorder. Use the indent buttons to nest links (up to 3 levels) for dropdown menus."
              action={
                flat.length > 0 && (
                  <Button size="sm" variant="outline" onClick={() => setEditing({ mode: "add", parentIndex: null })}>
                    <Plus /> Add item
                  </Button>
                )
              }
            />
            {flat.length === 0 ? (
              <EmptyState
                icon={<ListTree />}
                title="This menu is empty"
                description="Add links to your collections, products, pages or any website."
                action={
                  <Button onClick={() => setEditing({ mode: "add", parentIndex: null })}>
                    <Plus /> Add menu item
                  </Button>
                }
              />
            ) : (
              <CardBody className="space-y-1.5 p-3">
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                  <SortableContext items={flat.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                    {flat.map((item, i) => (
                      <Row
                        key={item.id}
                        item={item}
                        canIndent={canIndent(flat, i)}
                        onIndent={() => setFlat((f) => shiftDepth(f, i, 1))}
                        onOutdent={() => setFlat((f) => shiftDepth(f, i, -1))}
                        onEdit={() => setEditing({ mode: "edit", index: i })}
                        onAddChild={item.depth < MAX_DEPTH ? () => setEditing({ mode: "add", parentIndex: i }) : undefined}
                        onRemove={() => removeItem(i)}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
                <button
                  type="button"
                  onClick={() => setEditing({ mode: "add", parentIndex: null })}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-border py-2.5 text-sm font-medium text-muted-foreground transition hover:border-primary hover:text-primary"
                >
                  <Plus className="size-4" /> Add menu item
                </button>
              </CardBody>
            )}
          </Card>
        }
        aside={
          <>
            <Card>
              <CardHeader title="Menu name" />
              <CardBody>
                <Input value={value.title} maxLength={80} onChange={(e) => setValue((s) => ({ ...s, title: e.target.value }))} />
              </CardBody>
            </Card>
            <Card>
              <CardHeader title="Preview" description="Roughly how customers will see it." />
              <CardBody>
                <MenuPreview items={buildTree(flat)} storeName={store.name} footer={handle === "footer"} />
              </CardBody>
            </Card>
          </>
        }
      />
      <ItemDialog key={editing ? JSON.stringify(editing) : "closed"} open={!!editing} initial={editingItem} isChild={editing?.mode === "add" && editing.parentIndex != null} onClose={() => setEditing(null)} onSubmit={submitItem} />
      <SaveBar dirty={dirty} saving={saving} onSave={save} onDiscard={reset} />
    </>
  );
}

function Row({ item, canIndent, onIndent, onOutdent, onEdit, onAddChild, onRemove }: { item: FlatItem; canIndent: boolean; onIndent: () => void; onOutdent: () => void; onEdit: () => void; onAddChild?: () => void; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition, marginLeft: item.depth * 28 }}
      className={cn("group flex items-center gap-2 rounded-lg border border-border bg-card px-2 py-2 transition-shadow", isDragging && "relative z-10 shadow-lg ring-2 ring-primary/30")}
    >
      <button type="button" className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:bg-muted active:cursor-grabbing" aria-label={`Drag ${item.label}`} {...attributes} {...listeners}>
        <GripVertical className="size-4" />
      </button>
      {item.depth > 0 && <CornerDownRight className="size-3.5 shrink-0 text-muted-foreground" />}
      <button type="button" onClick={onEdit} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-medium">{item.label}</span>
        <span className="block truncate text-xs text-muted-foreground">{item.url}</span>
      </button>
      <div className="flex shrink-0 items-center gap-0.5">
        <Tooltip label="Move out">
          <Button type="button" size="icon-sm" variant="ghost" onClick={onOutdent} disabled={item.depth === 0} aria-label="Outdent">
            <IndentDecrease />
          </Button>
        </Tooltip>
        <Tooltip label="Nest under item above">
          <Button type="button" size="icon-sm" variant="ghost" onClick={onIndent} disabled={!canIndent} aria-label="Indent">
            <IndentIncrease />
          </Button>
        </Tooltip>
        {onAddChild && (
          <span className="hidden sm:inline-flex">
            <Tooltip label="Add nested link">
              <Button type="button" size="icon-sm" variant="ghost" onClick={onAddChild} aria-label="Add nested link">
                <Plus />
              </Button>
            </Tooltip>
          </span>
        )}
        <Tooltip label="Edit">
          <Button type="button" size="icon-sm" variant="ghost" onClick={onEdit} aria-label="Edit">
            <Pencil />
          </Button>
        </Tooltip>
        <Tooltip label="Remove">
          <Button type="button" size="icon-sm" variant="ghost" className="text-red-600 hover:text-red-700" onClick={onRemove} aria-label="Remove">
            <Trash2 />
          </Button>
        </Tooltip>
      </div>
    </div>
  );
}

function ItemDialog({ open, initial, isChild, onClose, onSubmit }: { open: boolean; initial?: FlatItem; isChild?: boolean; onClose: () => void; onSubmit: (label: string, url: string) => void }) {
  const [label, setLabel] = React.useState(initial?.label ?? "");
  const [url, setUrl] = React.useState(initial?.url ?? "");
  const autoLabel = React.useRef<string | null>(initial ? null : "");
  const valid = label.trim() && url.trim() && /^(\/|#|https?:\/\/|mailto:|tel:)/i.test(url.trim());
  const submit = () => valid && onSubmit(label.trim(), url.trim());

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={initial ? "Edit menu item" : isChild ? "Add nested link" : "Add menu item"}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={!valid}>
            {initial ? "Done" : "Add"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Label" hint="The text customers see. Filled in automatically when you pick a link.">
          <Input
            value={label}
            maxLength={80}
            placeholder="e.g. New arrivals"
            onChange={(e) => {
              setLabel(e.target.value);
              autoLabel.current = null;
            }}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </Field>
        <Field label="Link">
          <LinkPicker
            url={url}
            onPick={(u, suggested) => {
              setUrl(u);
              if (suggested && (autoLabel.current !== null || !label.trim())) {
                setLabel(suggested);
                autoLabel.current = suggested;
              }
            }}
          />
        </Field>
      </div>
    </Dialog>
  );
}

function MenuPreview({ items, storeName, footer }: { items: MenuItem[]; storeName: string; footer: boolean }) {
  if (!items.length) return <p className="text-sm text-muted-foreground">Add items to see a preview.</p>;
  if (footer)
    return (
      <div className="rounded-lg bg-muted/60 p-3">
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          {items.map((i) => (
            <div key={i.id}>
              <div className="truncate text-foreground">{i.label}</div>
              {i.children?.map((c) => (
                <div key={c.id} className="truncate pl-2 text-muted-foreground">
                  {c.label}
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="mt-3 border-t border-border pt-2 text-[10px] text-muted-foreground">© {storeName}</div>
      </div>
    );
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="flex items-center gap-3 border-b border-border bg-muted/40 px-3 py-2">
        <span className="truncate text-xs font-bold">{storeName}</span>
      </div>
      <ul className="space-y-1 p-3 text-xs">
        {items.map((i) => (
          <li key={i.id}>
            <span className="font-medium">{i.label}</span>
            {!!i.children?.length && (
              <ul className="mt-0.5 space-y-0.5 border-l border-border pl-2.5 text-muted-foreground">
                {i.children.map((c) => (
                  <li key={c.id}>
                    {c.label}
                    {!!c.children?.length && <ul className="border-l border-border pl-2.5">{c.children.map((g) => <li key={g.id}>{g.label}</li>)}</ul>}
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
