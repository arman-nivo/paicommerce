"use client";

import * as React from "react";
import { X } from "lucide-react";

type Ctx = { ids: string[]; selected: Set<string>; toggle: (id: string) => void; setAll: (on: boolean) => void; clear: () => void };
const SelectionCtx = React.createContext<Ctx | null>(null);

export function SelectionProvider({ ids, children }: { ids: string[]; children: React.ReactNode }) {
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const key = ids.join(",");
  React.useEffect(() => setSelected(new Set()), [key]);
  const value = React.useMemo<Ctx>(
    () => ({
      ids,
      selected,
      toggle: (id) =>
        setSelected((s) => {
          const n = new Set(s);
          if (n.has(id)) n.delete(id);
          else n.add(id);
          return n;
        }),
      setAll: (on) => setSelected(on ? new Set(ids) : new Set()),
      clear: () => setSelected(new Set()),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, selected],
  );
  return <SelectionCtx.Provider value={value}>{children}</SelectionCtx.Provider>;
}

export function useSelection() {
  const ctx = React.useContext(SelectionCtx);
  if (!ctx) throw new Error("useSelection outside SelectionProvider");
  return ctx;
}

export function SelectAll() {
  const { ids, selected, setAll } = useSelection();
  const all = ids.length > 0 && selected.size === ids.length;
  const some = selected.size > 0 && !all;
  return (
    <input
      type="checkbox"
      aria-label="Select all rows"
      className="size-4 rounded border-input accent-[var(--primary)]"
      checked={all}
      ref={(el) => {
        if (el) el.indeterminate = some;
      }}
      onChange={(e) => setAll(e.target.checked)}
    />
  );
}

export function RowCheck({ id }: { id: string }) {
  const { selected, toggle } = useSelection();
  return <input type="checkbox" aria-label="Select row" className="size-4 rounded border-input accent-[var(--primary)]" checked={selected.has(id)} onChange={() => toggle(id)} />;
}

/** Floating bar that appears when rows are selected. */
export function BulkBar({ children }: { children: (ids: string[], clear: () => void) => React.ReactNode }) {
  const { selected, clear } = useSelection();
  if (!selected.size) return null;
  return (
    <div className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4">
      <div className="flex animate-slide-up flex-wrap items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 shadow-2xl">
        <span className="px-1 text-sm font-medium tabular-nums">{selected.size} selected</span>
        <span className="h-5 w-px bg-border" />
        {children([...selected], clear)}
        <button type="button" onClick={clear} className="rounded-md p-1 text-muted-foreground hover:bg-muted" aria-label="Clear selection">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
