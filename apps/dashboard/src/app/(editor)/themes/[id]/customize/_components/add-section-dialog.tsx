"use client";
import * as React from "react";
import { Plus, Search } from "lucide-react";
import type { SectionCategory, SectionList, SectionSchema, TemplateType } from "@pai/theme-sdk";
import { cn, Dialog, Input } from "@pai/ui";
import { CATEGORY_LABELS, CATEGORY_ORDER, sectionIcon } from "./icons";
import type { ListRef } from "./types";

type Entry = { schema: SectionSchema; presetIndex: number; name: string; full: boolean };

/** Which section schemas can be added to a list (template or header/footer group). */
export function allowedSchemas(schemas: SectionSchema[], ref: ListRef): SectionSchema[] {
  return schemas.filter((s) => {
    if (!s.presets?.length) return false;
    if (ref.kind === "group") return s.group === ref.key || (!s.group && s.category === ref.key);
    if (s.group) return false;
    return !s.templates || s.templates.includes(ref.key as TemplateType);
  });
}

export function AddSectionDialog({
  open,
  onClose,
  listRef,
  listTitle,
  list,
  schemas,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  listRef: ListRef | null;
  listTitle: string;
  list: SectionList | null;
  schemas: SectionSchema[];
  onAdd: (schema: SectionSchema, presetIndex: number) => void;
}) {
  const [q, setQ] = React.useState("");
  const [active, setActive] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (open) {
      setQ("");
      setActive(null);
    }
  }, [open]);

  const entries = React.useMemo<Entry[]>(() => {
    if (!listRef || !list) return [];
    const counts: Record<string, number> = {};
    for (const id of list.order) {
      const t = list.sections[id]?.type;
      if (t) counts[t] = (counts[t] ?? 0) + 1;
    }
    return allowedSchemas(schemas, listRef).flatMap((schema) =>
      (schema.presets ?? []).map((p, i) => ({
        schema,
        presetIndex: i,
        name: p.name || schema.name,
        full: schema.limit != null && (counts[schema.type] ?? 0) >= schema.limit,
      })),
    );
  }, [schemas, listRef, list]);

  const needle = q.trim().toLowerCase();
  const filtered = needle
    ? entries.filter((e) => [e.name, e.schema.name, e.schema.description ?? "", CATEGORY_LABELS[e.schema.category] ?? ""].some((t) => t.toLowerCase().includes(needle)))
    : entries;

  const groups = CATEGORY_ORDER.map((c) => ({ category: c, items: filtered.filter((e) => e.schema.category === c) })).filter((g) => g.items.length);
  // Categories not covered by CATEGORY_ORDER (future-proof).
  const extra = filtered.filter((e) => !CATEGORY_ORDER.includes(e.schema.category as SectionCategory));
  if (extra.length) groups.push({ category: "content", items: extra });

  const activeEntry = filtered.find((e) => `${e.schema.type}:${e.presetIndex}` === active) ?? filtered.find((e) => !e.full) ?? null;

  const add = (e: Entry) => {
    if (e.full) return;
    onAdd(e.schema, e.presetIndex);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} size="lg" title="Add section" description={`Choose a section to add to ${listTitle}.`}>
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && activeEntry) add(activeEntry);
          }}
          placeholder="Search sections (e.g. banner, reviews, products)"
          className="pl-9"
        />
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_220px]">
        <div className="max-h-[55vh] space-y-4 overflow-y-auto pr-1 scrollbar-thin">
          {groups.map((g) => (
            <div key={g.category}>
              <h3 className="mb-1.5 px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{CATEGORY_LABELS[g.category]}</h3>
              <div className="grid gap-1 sm:grid-cols-2">
                {g.items.map((e) => {
                  const Icon = sectionIcon(e.schema.icon, e.schema.category);
                  const key = `${e.schema.type}:${e.presetIndex}`;
                  const isActive = activeEntry && `${activeEntry.schema.type}:${activeEntry.presetIndex}` === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={e.full}
                      onMouseEnter={() => setActive(key)}
                      onFocus={() => setActive(key)}
                      onClick={() => add(e)}
                      className={cn(
                        "group flex items-center gap-2.5 rounded-lg border px-2.5 py-2 text-left text-sm transition disabled:cursor-not-allowed disabled:opacity-50",
                        isActive ? "border-primary/40 bg-accent" : "border-transparent hover:bg-muted",
                      )}
                    >
                      <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground", isActive && "bg-card text-primary")}>
                        <Icon className="size-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{e.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{e.full ? "Already added (limit reached)" : e.name !== e.schema.name ? e.schema.name : e.schema.description || CATEGORY_LABELS[e.schema.category]}</span>
                      </span>
                      {!e.full && <Plus className="size-4 shrink-0 text-primary opacity-0 transition group-hover:opacity-100" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {!groups.length && (
            <div className="py-12 text-center text-sm text-muted-foreground">
              {entries.length ? `No sections match “${q}”.` : "No sections can be added here with this theme."}
            </div>
          )}
        </div>
        <aside className="hidden rounded-xl border border-border bg-muted/40 p-4 md:block">
          {activeEntry ? (
            <div className="space-y-3">
              {(() => {
                const Icon = sectionIcon(activeEntry.schema.icon, activeEntry.schema.category);
                return (
                  <div className="flex aspect-[4/3] items-center justify-center rounded-lg border border-border bg-card text-primary">
                    <Icon className="size-10 opacity-80" strokeWidth={1.25} />
                  </div>
                );
              })()}
              <div>
                <div className="text-sm font-semibold">{activeEntry.name}</div>
                <div className="text-xs text-muted-foreground">{CATEGORY_LABELS[activeEntry.schema.category]}</div>
              </div>
              <p className="text-xs leading-relaxed text-muted-foreground">{activeEntry.schema.description || "Add this section, then customize its content and style in the settings panel."}</p>
              {!!activeEntry.schema.blocks?.length && (
                <p className="text-xs text-muted-foreground">
                  Contains blocks: {activeEntry.schema.blocks.map((b) => b.name).join(", ")}
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Hover a section to see what it does.</p>
          )}
        </aside>
      </div>
    </Dialog>
  );
}
