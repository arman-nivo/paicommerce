"use client";
import Link from "next/link";
import * as React from "react";
import { Check, ImageOff, Minus, Plus } from "lucide-react";
import { Badge, cn, Spinner, Switch, Table, TBody, TD, TH, THead, TR, toast } from "@pai/ui";
import { adjustStock, setTrackInventory } from "../actions";

export type StockRow = {
  kind: "product" | "variant";
  id: string;
  productId: string;
  productTitle: string;
  variantTitle: string | null;
  sku: string | null;
  inventory: number;
  track: boolean;
  image: string | null;
  status: string;
};

type Mode = "set" | "add";

export function InventoryTable({ rows, threshold, canManage }: { rows: StockRow[]; threshold: number; canManage: boolean }) {
  const [mode, setMode] = React.useState<Mode>("set");
  const [track, setTrack] = React.useState<Record<string, boolean>>({});
  React.useEffect(() => setTrack(Object.fromEntries(rows.map((r) => [r.productId, r.track]))), [rows]);

  const toggleTrack = async (productId: string, v: boolean) => {
    setTrack((t) => ({ ...t, [productId]: v }));
    try {
      const r = await setTrackInventory({ productId, track: v });
      if (!r.ok) throw new Error(r.error);
      toast.success(v ? "Now tracking stock" : "Stock tracking turned off");
    } catch (e) {
      setTrack((t) => ({ ...t, [productId]: !v }));
      toast.error((e as Error).message || "Couldn't update tracking");
    }
  };

  return (
    <>
      {canManage && (
        <div className="flex flex-wrap items-center gap-3 border-b border-border bg-muted/30 px-4 py-2.5 text-sm">
          <span className="text-muted-foreground">Edit mode</span>
          <div className="inline-grid grid-cols-2 rounded-lg bg-muted p-0.5" role="radiogroup" aria-label="Stock edit mode">
            {(
              [
                ["set", "Set quantity"],
                ["add", "Add / remove"],
              ] as const
            ).map(([v, l]) => (
              <button
                key={v}
                role="radio"
                aria-checked={mode === v}
                onClick={() => setMode(v)}
                className={cn("h-7 rounded-md px-3 text-xs font-medium transition", mode === v ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground")}
              >
                {l}
              </button>
            ))}
          </div>
          <span className="text-xs text-muted-foreground">{mode === "set" ? "Type the exact quantity you have on hand." : "Type how many arrived (e.g. 20) or were lost (e.g. -2)."} Saves on Enter or when you leave the field.</span>
        </div>
      )}
      <Table>
        <THead>
          <TR className="hover:bg-transparent">
            <TH>Product</TH>
            <TH className="hidden sm:table-cell">SKU</TH>
            <TH className="hidden md:table-cell">Track</TH>
            <TH className="w-64">Available</TH>
          </TR>
        </THead>
        <TBody>
          {rows.map((r, i) => {
            const tracked = track[r.productId] ?? r.track;
            const firstOfProduct = r.kind === "product" || rows[i - 1]?.productId !== r.productId;
            return (
              <TR key={r.id}>
                <TD>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                      {r.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.image} alt="" className="size-full object-cover" loading="lazy" />
                      ) : (
                        <ImageOff className="size-4 text-muted-foreground/60" />
                      )}
                    </span>
                    <div className="min-w-0">
                      <Link href={`/products/${r.productId}`} className="block max-w-xs truncate font-medium hover:underline">
                        {r.productTitle}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {r.variantTitle && <span className="truncate">{r.variantTitle}</span>}
                        {r.status !== "active" && <Badge className="py-0 text-[10px] capitalize">{r.status}</Badge>}
                        <span className="sm:hidden">{r.sku}</span>
                      </div>
                    </div>
                  </div>
                </TD>
                <TD className="hidden text-sm text-muted-foreground sm:table-cell">{r.sku || "—"}</TD>
                <TD className="hidden md:table-cell">
                  {firstOfProduct ? (
                    <Switch checked={tracked} disabled={!canManage} onChange={(e) => toggleTrack(r.productId, e.target.checked)} aria-label={`Track stock for ${r.productTitle}`} />
                  ) : (
                    <span className="text-xs text-muted-foreground">↑</span>
                  )}
                </TD>
                <TD>
                  {tracked ? (
                    <StockEditor row={r} mode={mode} threshold={threshold} disabled={!canManage} />
                  ) : (
                    <span className="text-sm text-muted-foreground">Not tracked</span>
                  )}
                </TD>
              </TR>
            );
          })}
        </TBody>
      </Table>
    </>
  );
}

function StockEditor({ row, mode, threshold, disabled }: { row: StockRow; mode: Mode; threshold: number; disabled?: boolean }) {
  const [qty, setQty] = React.useState(row.inventory);
  const [draft, setDraft] = React.useState(mode === "set" ? String(row.inventory) : "");
  const [state, setState] = React.useState<"idle" | "saving" | "saved">("idle");
  const saving = React.useRef(false);

  React.useEffect(() => setQty(row.inventory), [row.inventory]);
  React.useEffect(() => setDraft(mode === "set" ? String(qty) : ""), [mode, qty]);

  const commit = async (raw?: string) => {
    const text = (raw ?? draft).trim();
    if (saving.current) return;
    if (text === "" || text === "-") {
      setDraft(mode === "set" ? String(qty) : "");
      return;
    }
    const n = Math.trunc(Number(text));
    if (!Number.isFinite(n)) {
      toast.error("Enter a whole number");
      setDraft(mode === "set" ? String(qty) : "");
      return;
    }
    if ((mode === "set" && n === qty) || (mode === "add" && n === 0)) return;
    const prev = qty;
    const optimistic = mode === "set" ? n : qty + n;
    setQty(optimistic);
    saving.current = true;
    setState("saving");
    try {
      const r = await adjustStock({ kind: row.kind, id: row.id, mode, value: n });
      if (!r.ok) throw new Error(r.error);
      setQty(r.data.inventory);
      setState("saved");
      setTimeout(() => setState("idle"), 1500);
    } catch (e) {
      setQty(prev);
      setState("idle");
      toast.error((e as Error).message || "Couldn't update stock");
    } finally {
      saving.current = false;
    }
  };

  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  React.useEffect(() => () => void (timer.current && clearTimeout(timer.current)), []);
  const step = (d: number) => {
    const v = String((Number(draft) || 0) + d);
    setDraft(v);
    if (mode === "set") {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => commit(v), 600);
    }
  };

  const low = qty > 0 && qty <= threshold;
  const out = qty <= 0;
  const preview = mode === "add" && draft && Number.isFinite(Number(draft)) && Number(draft) !== 0 ? qty + Math.trunc(Number(draft)) : null;

  return (
    <div className="flex items-center gap-2">
      <div className={cn("flex h-9 items-center overflow-hidden rounded-lg border bg-card shadow-xs", out ? "border-red-300 dark:border-red-500/50" : low ? "border-amber-300 dark:border-amber-500/50" : "border-input")}>
        <button type="button" disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={() => step(-1)} className="flex h-full w-8 items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40" aria-label="Decrease">
          <Minus className="size-3.5" />
        </button>
        <input
          value={draft}
          disabled={disabled}
          inputMode="numeric"
          placeholder={mode === "add" ? "+0" : undefined}
          onChange={(e) => setDraft(e.target.value.replace(/[^0-9-]/g, ""))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commit();
              if (mode === "add") (e.target as HTMLInputElement).blur();
            } else if (e.key === "Escape") setDraft(mode === "set" ? String(qty) : "");
          }}
          onBlur={() => commit()}
          className={cn("h-full w-16 border-x border-border bg-transparent text-center text-sm tabular-nums outline-none", out && mode === "set" && "text-red-600", low && mode === "set" && "text-amber-600")}
          aria-label={mode === "set" ? "Quantity" : "Quantity to add"}
        />
        <button type="button" disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={() => step(1)} className="flex h-full w-8 items-center justify-center text-muted-foreground hover:bg-muted disabled:opacity-40" aria-label="Increase">
          <Plus className="size-3.5" />
        </button>
      </div>
      <span className="w-24 text-xs">
        {state === "saving" ? (
          <Spinner className="size-3.5 text-muted-foreground" />
        ) : state === "saved" ? (
          <span className="inline-flex items-center gap-1 text-emerald-600">
            <Check className="size-3.5" /> Saved
          </span>
        ) : preview != null ? (
          <span className="text-muted-foreground">
            {qty} → <span className="font-medium text-foreground">{preview}</span>
          </span>
        ) : mode === "add" ? (
          <span className={cn("tabular-nums", out ? "text-red-600" : low ? "text-amber-600" : "text-muted-foreground")}>{qty} now</span>
        ) : out ? (
          <span className="font-medium text-red-600">Out of stock</span>
        ) : low ? (
          <span className="font-medium text-amber-600">Low stock</span>
        ) : null}
      </span>
    </div>
  );
}
