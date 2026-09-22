"use client";
import * as React from "react";
import { closestCenter, DndContext, KeyboardSensor, PointerSensor, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { restrictToVerticalAxis } from "./dnd-modifiers";
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ArrowDown, ArrowUp, ChevronRight, CircleDot, Copy, Ellipsis, Eye, EyeOff, GripVertical, Palette, Plus, Trash2, TriangleAlert } from "lucide-react";
import type { BlockInstance, BlockSchema, SectionInstance, SectionSchema, ThemeConfig } from "@pai/theme-sdk";
import { cn, Dropdown, DropdownItem, DropdownLabel } from "@pai/ui";
import { sectionIcon } from "./icons";
import { getList, listKey, sameList, subtitleFrom } from "./state";
import type { ListRef, Selection } from "./types";

export type TreeOps = {
  select: (sel: Selection) => void;
  hover: (sectionId: string | null) => void;
  reorderSections: (list: ListRef, from: number, to: number) => void;
  toggleSection: (list: ListRef, id: string) => void;
  duplicateSection: (list: ListRef, id: string) => void;
  removeSection: (list: ListRef, id: string) => void;
  moveSection: (list: ListRef, id: string, dir: -1 | 1) => void;
  addBlock: (list: ListRef, sectionId: string, type: string) => void;
  toggleBlock: (list: ListRef, sectionId: string, blockId: string) => void;
  removeBlock: (list: ListRef, sectionId: string, blockId: string) => void;
  reorderBlocks: (list: ListRef, sectionId: string, from: number, to: number) => void;
  openAddSection: (list: ListRef) => void;
  openThemeSettings: () => void;
};

type Props = {
  config: ThemeConfig;
  lists: { ref: ListRef; title: string; hint?: string }[];
  schemas: Record<string, SectionSchema>;
  selection: Selection;
  ops: TreeOps;
  settingsGroups: string[];
};

/** Blocks that can still be added to a section (respects BlockSchema.limit and SectionSchema.maxBlocks). */
export function addableBlocks(schema: SectionSchema | undefined, inst: SectionInstance): BlockSchema[] {
  if (!schema?.blocks?.length) return [];
  const blocks = inst.blocks ?? [];
  if (schema.maxBlocks != null && blocks.length >= schema.maxBlocks) return [];
  return schema.blocks.filter((b) => b.limit == null || blocks.filter((x) => x.type === b.type).length < b.limit);
}

export function SectionTree({ config, lists, schemas, selection, ops, settingsGroups }: Props) {
  const [collapsed, setCollapsed] = React.useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  // Auto-expand the section whose block is selected.
  const selSection = selection && (selection.kind === "section" || selection.kind === "block") ? selection.sectionId : null;
  React.useEffect(() => {
    if (selection?.kind === "block") setExpanded((e) => (e[selection.sectionId] ? e : { ...e, [selection.sectionId]: true }));
  }, [selection]);

  // Scroll the selected row into view (e.g. after clicking a section in the preview).
  React.useEffect(() => {
    if (!selSection) return;
    const el = document.querySelector(`[data-tree-section="${window.CSS.escape(selSection)}"]`);
    el?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selSection]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-4 scrollbar-thin">
        {lists.map(({ ref, title, hint }) => {
          const key = listKey(ref);
          const list = getList(config, ref);
          const isCollapsed = !!collapsed[key];
          return (
            <section key={key} className="border-b border-border py-2 last:border-b-0">
              <button
                type="button"
                onClick={() => setCollapsed((c) => ({ ...c, [key]: !c[key] }))}
                className="group flex w-full items-center gap-1.5 rounded-md px-2 py-1.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className={cn("size-3.5 transition-transform", !isCollapsed && "rotate-90")} />
                <span className="flex-1">{title}</span>
                <span className="rounded-full bg-muted px-1.5 py-px text-[10px] font-medium normal-case tracking-normal">{list.order.length}</span>
              </button>
              {!isCollapsed && (
                <SectionList
                  listRef={ref}
                  config={config}
                  schemas={schemas}
                  selection={selection}
                  ops={ops}
                  expanded={expanded}
                  setExpanded={(id, v) => setExpanded((e) => ({ ...e, [id]: v }))}
                  hint={hint}
                />
              )}
            </section>
          );
        })}
      </div>
      <div className="shrink-0 border-t border-border p-2">
        <button
          type="button"
          onClick={ops.openThemeSettings}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-2.5 py-2.5 text-left text-sm font-medium transition hover:bg-muted",
            selection?.kind === "theme" && "bg-accent text-primary hover:bg-accent",
          )}
        >
          <span className="flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-fuchsia-500 via-violet-500 to-sky-500 text-white">
            <Palette className="size-4" />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block">Theme settings</span>
            <span className="block truncate text-xs font-normal text-muted-foreground">{settingsGroups.slice(0, 4).join(", ") || "Colors, typography, layout"}</span>
          </span>
          <ChevronRight className="size-4 text-muted-foreground" />
        </button>
      </div>
    </div>
  );
}

function SectionList({
  listRef,
  config,
  schemas,
  selection,
  ops,
  expanded,
  setExpanded,
  hint,
}: {
  listRef: ListRef;
  config: ThemeConfig;
  schemas: Record<string, SectionSchema>;
  selection: Selection;
  ops: TreeOps;
  expanded: Record<string, boolean>;
  setExpanded: (id: string, v: boolean) => void;
  hint?: string;
}) {
  const list = getList(config, listRef);
  const dndId = React.useId();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    ops.reorderSections(listRef, list.order.indexOf(String(e.active.id)), list.order.indexOf(String(e.over.id)));
  };
  return (
    <div className="mt-0.5 space-y-px">
      {list.order.length === 0 && listRef.kind === "template" && (
        <div className="mx-1 my-1 rounded-lg border border-dashed border-border px-3 py-4 text-center">
          <p className="text-sm font-medium">This page is empty</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{hint ?? "Add sections to build this page."}</p>
        </div>
      )}
      <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis]}>
        <SortableContext items={list.order} strategy={verticalListSortingStrategy}>
          {list.order.map((id, i) => {
            const inst = list.sections[id];
            if (!inst) return null;
            return (
              <SectionRow
                key={id}
                id={id}
                index={i}
                count={list.order.length}
                typeCount={list.order.filter((x) => list.sections[x]?.type === inst.type).length}
                inst={inst}
                schema={schemas[inst.type]}
                listRef={listRef}
                selection={selection}
                ops={ops}
                expanded={!!expanded[id]}
                setExpanded={(v) => setExpanded(id, v)}
              />
            );
          })}
        </SortableContext>
      </DndContext>
      <button
        type="button"
        onClick={() => ops.openAddSection(listRef)}
        className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-primary transition hover:bg-accent"
      >
        <span className="flex size-5 items-center justify-center rounded-full border border-current">
          <Plus className="size-3" />
        </span>
        Add section
      </button>
    </div>
  );
}

function RowMenu({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div onClick={(e) => e.stopPropagation()} className="flex">
      <Dropdown
        trigger={
          <button type="button" className="rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground" aria-label={label}>
            <Ellipsis className="size-4" />
          </button>
        }
      >
        {children}
      </Dropdown>
    </div>
  );
}

function SectionRow({
  id,
  index,
  count,
  typeCount,
  inst,
  schema,
  listRef,
  selection,
  ops,
  expanded,
  setExpanded,
}: {
  id: string;
  index: number;
  count: number;
  typeCount: number;
  inst: SectionInstance;
  schema: SectionSchema | undefined;
  listRef: ListRef;
  selection: Selection;
  ops: TreeOps;
  expanded: boolean;
  setExpanded: (v: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const selected = selection?.kind === "section" && selection.sectionId === id && sameList(selection.list, listRef);
  const childSelected = selection?.kind === "block" && selection.sectionId === id && sameList(selection.list, listRef);
  const Icon = schema ? sectionIcon(schema.icon, schema.category) : TriangleAlert;
  const name = schema?.name ?? `Unknown section (${inst.type})`;
  const subtitle = subtitleFrom(inst.settings);
  const hasBlocks = !!schema?.blocks?.length || !!inst.blocks?.length;
  const blocks = inst.blocks ?? [];
  const addable = addableBlocks(schema, inst);

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), transition }} className={cn(isDragging && "relative z-20")} data-tree-section={id}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => ops.select({ kind: "section", list: listRef, sectionId: id })}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            ops.select({ kind: "section", list: listRef, sectionId: id });
          }
        }}
        onMouseEnter={() => ops.hover(id)}
        onMouseLeave={() => ops.hover(null)}
        className={cn(
          "group flex h-10 cursor-pointer items-center gap-1 rounded-lg pl-0.5 pr-1 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring/40",
          selected ? "bg-accent text-primary" : childSelected ? "bg-muted/70" : "hover:bg-muted",
          isDragging && "bg-card shadow-lg ring-1 ring-border",
          inst.disabled && "opacity-55",
        )}
      >
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          className={cn("rounded p-0.5 text-muted-foreground hover:text-foreground", !hasBlocks && "invisible")}
          aria-label={expanded ? "Collapse blocks" : "Expand blocks"}
          tabIndex={hasBlocks ? 0 : -1}
        >
          <ChevronRight className={cn("size-3.5 transition-transform", expanded && "rotate-90")} />
        </button>
        <Icon className={cn("size-4 shrink-0", selected ? "text-primary" : schema ? "text-muted-foreground" : "text-amber-500")} />
        <span className="ml-1 min-w-0 flex-1 leading-tight">
          <span className={cn("block truncate", inst.disabled && "line-through decoration-muted-foreground/50")}>{name}</span>
          {subtitle && <span className="block truncate text-[11px] text-muted-foreground">{subtitle}</span>}
        </span>
        <span className={cn("flex items-center opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100", (selected || inst.disabled) && "opacity-100")}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              ops.toggleSection(listRef, id);
            }}
            className="rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground"
            aria-label={inst.disabled ? "Show section" : "Hide section"}
            title={inst.disabled ? "Show section" : "Hide section"}
          >
            {inst.disabled ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
          <RowMenu label="Section actions">
            <DropdownItem icon={<ArrowUp />} disabled={index === 0} onClick={() => ops.moveSection(listRef, id, -1)} className="disabled:opacity-40">
              Move up
            </DropdownItem>
            <DropdownItem icon={<ArrowDown />} disabled={index === count - 1} onClick={() => ops.moveSection(listRef, id, 1)} className="disabled:opacity-40">
              Move down
            </DropdownItem>
            <DropdownItem icon={<Copy />} onClick={() => ops.duplicateSection(listRef, id)} disabled={!schema || (schema.limit != null && typeCount >= schema.limit)} className="disabled:opacity-40">
              Duplicate
            </DropdownItem>
            <DropdownItem icon={inst.disabled ? <Eye /> : <EyeOff />} onClick={() => ops.toggleSection(listRef, id)}>
              {inst.disabled ? "Show" : "Hide"}
            </DropdownItem>
            <div className="my-1 h-px bg-border" />
            <DropdownItem icon={<Trash2 />} danger onClick={() => ops.removeSection(listRef, id)}>
              Remove section
            </DropdownItem>
          </RowMenu>
          <span
            className="cursor-grab touch-none rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground active:cursor-grabbing"
            aria-label="Drag to reorder"
            title="Drag to reorder"
            onClick={(e) => e.stopPropagation()}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </span>
        </span>
      </div>
      {expanded && hasBlocks && (
        <BlockList
          listRef={listRef}
          sectionId={id}
          blocks={blocks}
          schema={schema}
          addable={addable}
          selection={selection}
          ops={ops}
        />
      )}
    </div>
  );
}

function BlockList({
  listRef,
  sectionId,
  blocks,
  schema,
  addable,
  selection,
  ops,
}: {
  listRef: ListRef;
  sectionId: string;
  blocks: BlockInstance[];
  schema: SectionSchema | undefined;
  addable: BlockSchema[];
  selection: Selection;
  ops: TreeOps;
}) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }));
  const ids = blocks.map((b) => b.id);
  const dndId = React.useId();
  const onDragEnd = (e: DragEndEvent) => {
    if (!e.over || e.active.id === e.over.id) return;
    ops.reorderBlocks(listRef, sectionId, ids.indexOf(String(e.active.id)), ids.indexOf(String(e.over.id)));
  };
  return (
    <div className="relative mb-1 ml-[18px] border-l border-border pl-2">
      <DndContext id={dndId} sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd} modifiers={[restrictToVerticalAxis]}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          {blocks.map((b) => (
            <BlockRow
              key={b.id}
              block={b}
              blockSchema={schema?.blocks?.find((x) => x.type === b.type)}
              selected={selection?.kind === "block" && selection.blockId === b.id && selection.sectionId === sectionId}
              onSelect={() => ops.select({ kind: "block", list: listRef, sectionId, blockId: b.id })}
              onToggle={() => ops.toggleBlock(listRef, sectionId, b.id)}
              onRemove={() => ops.removeBlock(listRef, sectionId, b.id)}
              onHover={(v) => ops.hover(v ? sectionId : null)}
            />
          ))}
        </SortableContext>
      </DndContext>
      {addable.length > 0 ? (
        addable.length === 1 ? (
          <button
            type="button"
            onClick={() => ops.addBlock(listRef, sectionId, addable[0]!.type)}
            className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-primary hover:bg-accent"
          >
            <Plus className="size-3.5" /> Add {addable[0]!.name.toLowerCase()}
          </button>
        ) : (
          <Dropdown
            align="start"
            trigger={
              <button type="button" className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs font-medium text-primary hover:bg-accent">
                <Plus className="size-3.5" /> Add block
              </button>
            }
          >
            <DropdownLabel>Add block</DropdownLabel>
            {addable.map((b) => (
              <DropdownItem key={b.type} icon={<CircleDot />} onClick={() => ops.addBlock(listRef, sectionId, b.type)}>
                {b.name}
              </DropdownItem>
            ))}
          </Dropdown>
        )
      ) : schema?.blocks?.length ? (
        <p className="px-2 py-1.5 text-[11px] text-muted-foreground">Block limit reached{schema.maxBlocks ? ` (${schema.maxBlocks})` : ""}</p>
      ) : null}
    </div>
  );
}

function BlockRow({
  block,
  blockSchema,
  selected,
  onSelect,
  onToggle,
  onRemove,
  onHover,
}: {
  block: BlockInstance;
  blockSchema: BlockSchema | undefined;
  selected: boolean;
  onSelect: () => void;
  onToggle: () => void;
  onRemove: () => void;
  onHover: (v: boolean) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const subtitle = subtitleFrom(block.settings);
  const name = blockSchema?.name ?? block.type;
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), transition }}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onSelect();
        }
      }}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
      className={cn(
        "group flex h-8 cursor-pointer items-center gap-1.5 rounded-md pl-2 pr-1 text-[13px] outline-none transition focus-visible:ring-2 focus-visible:ring-ring/40",
        selected ? "bg-accent text-primary" : "hover:bg-muted",
        isDragging && "relative z-20 bg-card shadow-lg ring-1 ring-border",
        block.disabled && "opacity-55",
      )}
    >
      <CircleDot className={cn("size-3 shrink-0", selected ? "text-primary" : "text-muted-foreground")} />
      <span className={cn("min-w-0 flex-1 truncate", block.disabled && "line-through decoration-muted-foreground/50")}>
        {subtitle ? (
          <>
            {subtitle}
            <span className="ml-1.5 text-[11px] text-muted-foreground">{name}</span>
          </>
        ) : (
          name
        )}
      </span>
      <span className={cn("flex items-center opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100", (selected || block.disabled) && "opacity-100")}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="rounded p-1 text-muted-foreground hover:bg-background hover:text-foreground"
          aria-label={block.disabled ? "Show block" : "Hide block"}
          title={block.disabled ? "Show block" : "Hide block"}
        >
          {block.disabled ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="rounded p-1 text-muted-foreground hover:bg-background hover:text-red-600"
          aria-label="Remove block"
          title="Remove block"
        >
          <Trash2 className="size-3.5" />
        </button>
        <span className="cursor-grab touch-none rounded p-1 text-muted-foreground hover:text-foreground" onClick={(e) => e.stopPropagation()} aria-label="Drag to reorder" {...attributes} {...listeners}>
          <GripVertical className="size-3.5" />
        </span>
      </span>
    </div>
  );
}
