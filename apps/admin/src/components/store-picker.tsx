"use client";

import * as React from "react";
import { Store, X } from "lucide-react";
import { Input } from "@pai/ui";

export type PickedStore = { id: string; name: string; slug: string };

/** Async store combobox backed by /api/search?type=stores. */
export function StorePicker({ value, onChange }: { value: PickedStore | null; onChange: (s: PickedStore | null) => void }) {
  const [q, setQ] = React.useState("");
  const [items, setItems] = React.useState<PickedStore[]>([]);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  React.useEffect(() => {
    if (q.trim().length < 2) {
      setItems([]);
      return;
    }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?type=stores&q=${encodeURIComponent(q.trim())}`, { signal: ctrl.signal });
        if (r.ok) {
          setItems((await r.json()).results);
          setActive(0);
        }
      } catch {}
    }, 150);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [q]);

  if (value)
    return (
      <div className="flex h-9 items-center gap-2 rounded-lg border border-input bg-card px-3 text-sm">
        <Store className="size-4 text-muted-foreground" />
        <span className="flex-1 truncate font-medium">{value.name}</span>
        <span className="text-xs text-muted-foreground">{value.slug}</span>
        <button type="button" onClick={() => onChange(null)} className="rounded p-0.5 text-muted-foreground hover:bg-muted" aria-label="Clear store">
          <X className="size-3.5" />
        </button>
      </div>
    );

  return (
    <div className="relative">
      <Input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((a) => Math.min(items.length - 1, a + 1));
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((a) => Math.max(0, a - 1));
          } else if (e.key === "Enter" && items[active]) {
            e.preventDefault();
            onChange(items[active]!);
          }
        }}
        placeholder="Search store by name or slug…"
        role="combobox"
        aria-expanded={open}
      />
      {open && items.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-border bg-card p-1 shadow-xl">
          {items.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => onChange(s)}
                className={`flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm ${i === active ? "bg-accent" : "hover:bg-muted"}`}
              >
                <span className="font-medium">{s.name}</span>
                <span className="text-xs text-muted-foreground">{s.slug}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
