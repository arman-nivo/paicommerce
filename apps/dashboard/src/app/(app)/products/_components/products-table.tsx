"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Archive, CircleCheck, FilePen, FolderPlus, ImageOff, Trash2, X } from "lucide-react";
import { Button, Checkbox, cn, Dialog, Select, Table, TBody, TD, TH, THead, TR, useConfirm } from "@pai/ui";
import { ProductStatusBadge } from "@/components/status";
import { useMoney } from "@/components/store-context";
import { run } from "@/lib/client";
import type { ActionResult } from "@/lib/types";
import { addProductsToCollection, deleteProducts, setProductsStatus } from "../actions";

export type ProductRow = {
  id: string;
  title: string;
  vendor: string | null;
  productType: string | null;
  status: string;
  image: string | null;
  priceMin: number;
  priceMax: number;
  compareAtPrice: number | null;
  trackInventory: boolean;
  inventory: number;
  variantCount: number;
  salesCount: number;
  collectionCount: number;
};

export function Thumb({ src, className }: { src: string | null; className?: string }) {
  return (
    <span className={cn("flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted", className)}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" className="size-full object-cover" loading="lazy" />
      ) : (
        <ImageOff className="size-4 text-muted-foreground/60" />
      )}
    </span>
  );
}

export function StockText({ track, inventory, variants, threshold }: { track: boolean; inventory: number; variants: number; threshold: number }) {
  if (!track) return <span className="text-muted-foreground">Not tracked</span>;
  const suffix = variants > 0 ? ` across ${variants} variant${variants > 1 ? "s" : ""}` : "";
  if (inventory <= 0)
    return (
      <span className="font-medium text-red-600 dark:text-red-400">
        Out of stock<span className="font-normal text-muted-foreground">{suffix}</span>
      </span>
    );
  return (
    <span className={cn(inventory <= threshold && "font-medium text-amber-600 dark:text-amber-400")}>
      {inventory.toLocaleString()} in stock<span className="font-normal text-muted-foreground">{suffix}</span>
    </span>
  );
}

export function ProductsTable({ rows, collections, canManage, threshold }: { rows: ProductRow[]; collections: { id: string; title: string }[]; canManage: boolean; threshold: number }) {
  const router = useRouter();
  const money = useMoney();
  const { confirm, dialog } = useConfirm();
  const [selected, setSelected] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState(false);
  const [colOpen, setColOpen] = React.useState(false);
  const [colId, setColId] = React.useState("");

  React.useEffect(() => setSelected((s) => s.filter((id) => rows.some((r) => r.id === id))), [rows]);

  const all = rows.length > 0 && selected.length === rows.length;
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const bulk = async <T,>(p: Promise<ActionResult<T>>, success: string) => {
    setBusy(true);
    const r = await run(p, { success });
    setBusy(false);
    if (r !== undefined) {
      setSelected([]);
      router.refresh();
    }
    return r;
  };

  const onStatus = (status: "active" | "draft" | "archived") => bulk(setProductsStatus({ ids: selected, status }), `${selected.length} product${selected.length > 1 ? "s" : ""} set to ${status}`);
  const onDelete = async () => {
    const ok = await confirm({
      title: `Delete ${selected.length} product${selected.length > 1 ? "s" : ""}?`,
      description: "This permanently removes them, their variants and reviews. Past orders keep their line items. This can't be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (ok) await bulk(deleteProducts({ ids: selected }), "Products deleted");
  };
  const onAddToCollection = async () => {
    if (!colId) return;
    const r = await bulk(addProductsToCollection({ ids: selected, collectionId: colId }), "Added to collection");
    if (r !== undefined) setColOpen(false);
  };

  const price = (r: ProductRow) => (r.priceMin === r.priceMax ? money(r.priceMin) : `${money(r.priceMin)} – ${money(r.priceMax)}`);

  return (
    <>
      {dialog}
      {canManage && selected.length > 0 && (
        <div className="sticky top-14 z-20 flex flex-wrap items-center gap-2 border-b border-border bg-accent/60 px-3 py-2 backdrop-blur">
          <span className="mr-1 text-sm font-medium">{selected.length} selected</span>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => onStatus("active")}>
            <CircleCheck /> Set active
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => onStatus("draft")}>
            <FilePen /> Set draft
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => onStatus("archived")}>
            <Archive /> Archive
          </Button>
          {collections.length > 0 && (
            <Button size="sm" variant="outline" disabled={busy} onClick={() => setColOpen(true)}>
              <FolderPlus /> Add to collection
            </Button>
          )}
          <Button size="sm" variant="outline" disabled={busy} onClick={onDelete} className="text-red-600">
            <Trash2 /> Delete
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected([])} className="ml-auto">
            <X /> Clear
          </Button>
        </div>
      )}

      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              {canManage && (
                <TH className="w-10 pr-0">
                  <Checkbox aria-label="Select all" checked={all} onChange={() => setSelected(all ? [] : rows.map((r) => r.id))} />
                </TH>
              )}
              <TH>Product</TH>
              <TH>Status</TH>
              <TH>Inventory</TH>
              <TH className="text-right">Price</TH>
              <TH className="text-right">Sales</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((r) => (
              <TR key={r.id} className={cn("cursor-pointer", selected.includes(r.id) && "bg-accent/40")} onClick={() => router.push(`/products/${r.id}`)}>
                {canManage && (
                  <TD className="w-10 pr-0" onClick={(e) => e.stopPropagation()}>
                    <Checkbox aria-label={`Select ${r.title}`} checked={selected.includes(r.id)} onChange={() => toggle(r.id)} />
                  </TD>
                )}
                <TD>
                  <div className="flex min-w-0 items-center gap-3">
                    <Thumb src={r.image} />
                    <div className="min-w-0">
                      <Link href={`/products/${r.id}`} className="block max-w-md truncate font-medium hover:underline" onClick={(e) => e.stopPropagation()}>
                        {r.title}
                      </Link>
                      {(r.vendor || r.productType) && <div className="truncate text-xs text-muted-foreground">{[r.productType, r.vendor].filter(Boolean).join(" · ")}</div>}
                    </div>
                  </div>
                </TD>
                <TD>
                  <ProductStatusBadge status={r.status} />
                </TD>
                <TD className="whitespace-nowrap text-sm">
                  <StockText track={r.trackInventory} inventory={r.inventory} variants={r.variantCount} threshold={threshold} />
                </TD>
                <TD className="whitespace-nowrap text-right tabular-nums">
                  {price(r)}
                  {r.compareAtPrice != null && r.compareAtPrice > r.priceMin && <div className="text-xs text-muted-foreground line-through">{money(r.compareAtPrice)}</div>}
                </TD>
                <TD className="text-right tabular-nums text-muted-foreground">{r.salesCount.toLocaleString()}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <ul className="divide-y divide-border md:hidden">
        {rows.map((r) => (
          <li key={r.id} className={cn("flex items-center gap-3 px-3 py-3", selected.includes(r.id) && "bg-accent/40")}>
            {canManage && <Checkbox aria-label={`Select ${r.title}`} checked={selected.includes(r.id)} onChange={() => toggle(r.id)} />}
            <Link href={`/products/${r.id}`} className="flex min-w-0 flex-1 items-center gap-3">
              <Thumb src={r.image} className="size-12" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{r.title}</div>
                <div className="mt-0.5 text-xs">
                  <StockText track={r.trackInventory} inventory={r.inventory} variants={r.variantCount} threshold={threshold} />
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <ProductStatusBadge status={r.status} />
                  <span className="text-sm tabular-nums">{price(r)}</span>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <Dialog
        open={colOpen}
        onClose={() => setColOpen(false)}
        size="sm"
        title="Add to collection"
        description={`Add ${selected.length} selected product${selected.length > 1 ? "s" : ""} to a collection.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setColOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onAddToCollection} loading={busy} disabled={!colId}>
              Add
            </Button>
          </>
        }
      >
        <Select value={colId} onChange={(e) => setColId(e.target.value)} aria-label="Collection">
          <option value="">Choose a collection…</option>
          {collections.map((c) => (
            <option key={c.id} value={c.id}>
              {c.title}
            </option>
          ))}
        </Select>
      </Dialog>
    </>
  );
}
