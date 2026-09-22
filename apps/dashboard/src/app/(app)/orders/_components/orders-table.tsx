"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { CircleCheck, Download, FileText, Loader, Package, Printer, SearchX, Truck, X } from "lucide-react";
import { Badge, Button, buttonVariants, Checkbox, cn, Dialog, Dropdown, DropdownItem, EmptyState, Select, Table, TBody, TD, TH, THead, toast, TR } from "@pai/ui";
import { FulfillmentBadge, PaymentBadge } from "@/components/status";
import { useMoney } from "@/components/store-context";
import { RelativeTime } from "@/components/time";
import { run } from "@/lib/client";
import { bulkBookCourier, bulkChangeStatus } from "../actions";
import { courierName, METHOD_SHORT, SOURCE_SHORT } from "../_lib/labels";

export type OrderRow = {
  id: string;
  number: number;
  createdAt: string;
  name: string;
  phone: string | null;
  total: number;
  paymentStatus: string;
  paymentMethod: string;
  fulfillmentStatus: string;
  courier: { provider: string; consignmentId?: string; trackingCode?: string; trackingUrl?: string; status?: string } | null;
  source: string;
  items: number;
};

export function OrdersTable({ rows, canManage, couriers, filtered }: { rows: OrderRow[]; canManage: boolean; couriers: { provider: string; name: string }[]; filtered: boolean }) {
  const money = useMoney();
  const router = useRouter();
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [busy, setBusy] = React.useState<string | null>(null);
  const [courierOpen, setCourierOpen] = React.useState(false);
  const [provider, setProvider] = React.useState(couriers[0]?.provider ?? "");

  // Drop selections that are no longer on the page (after filter/page change).
  const idsKey = rows.map((r) => r.id).join(",");
  React.useEffect(() => {
    setSelected((s) => new Set([...s].filter((id) => idsKey.includes(id))));
  }, [idsKey]);

  if (!rows.length) {
    return (
      <EmptyState
        icon={<SearchX />}
        title={filtered ? "No orders match these filters" : "No orders yet"}
        description="Try a different search, status tab or date range."
        action={
          <Link href="/orders" className={buttonVariants({ variant: "outline" })}>
            Clear filters
          </Link>
        }
      />
    );
  }

  const allSelected = rows.length > 0 && rows.every((r) => selected.has(r.id));
  const toggle = (id: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  const toggleAll = () => setSelected(allSelected ? new Set() : new Set(rows.map((r) => r.id)));
  const ids = [...selected];

  async function bulkStatus(to: "confirmed" | "processing" | "shipped", verb: string) {
    setBusy(to);
    const res = await run(bulkChangeStatus({ ids, to }));
    setBusy(null);
    if (!res) return;
    const msg = `${res.updated} ${res.updated === 1 ? "order" : "orders"} ${verb}${res.skipped ? `, ${res.skipped} skipped (not allowed from their current status)` : ""}`;
    if (res.updated) toast.success(msg);
    else toast.warning(msg);
    setSelected(new Set());
    router.refresh();
  }

  async function bulkBook() {
    if (!provider) return;
    setBusy("courier");
    const res = await run(bulkBookCourier({ ids, provider }), { loading: `Booking ${ids.length} parcel${ids.length > 1 ? "s" : ""}…` });
    setBusy(null);
    if (!res) return;
    setCourierOpen(false);
    const parts = [`${res.booked} booked`];
    if (res.skipped) parts.push(`${res.skipped} skipped (already booked or not shippable)`);
    if (res.failed) parts.push(`${res.failed} failed`);
    const text = parts.join(", ");
    if (res.failed) toast.error(text, { description: res.errors.join("\n"), duration: 10000 });
    else if (res.booked) toast.success(text);
    else toast.warning(text);
    setSelected(new Set());
    router.refresh();
  }

  const openPrint = (type: "invoice" | "slip") => window.open(`/orders/print?ids=${ids.join(",")}&type=${type}&autoprint=1`, "_blank");

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block">
        <Table>
          <THead>
            <TR className="hover:bg-transparent">
              <TH className="w-10 pr-0">
                <Checkbox checked={allSelected} onChange={toggleAll} aria-label="Select all orders on this page" />
              </TH>
              <TH>Order</TH>
              <TH>Customer</TH>
              <TH className="text-right">Total</TH>
              <TH>Payment</TH>
              <TH>Status</TH>
              <TH className="text-right">Items</TH>
              <TH>Delivery</TH>
              <TH>Source</TH>
            </TR>
          </THead>
          <TBody>
            {rows.map((o) => (
              <TR key={o.id} className={cn("cursor-pointer", selected.has(o.id) && "bg-accent/50 hover:bg-accent/60")} onClick={() => router.push(`/orders/${o.id}`)}>
                <TD className="w-10 pr-0" onClick={(e) => e.stopPropagation()}>
                  <Checkbox checked={selected.has(o.id)} onChange={() => toggle(o.id)} aria-label={`Select order #${o.number}`} />
                </TD>
                <TD>
                  <Link href={`/orders/${o.id}`} onClick={(e) => e.stopPropagation()} className="font-semibold hover:underline">
                    #{o.number}
                  </Link>
                  <div className="text-xs text-muted-foreground">
                    <RelativeTime date={o.createdAt} />
                  </div>
                </TD>
                <TD>
                  <div className="max-w-48 truncate font-medium">{o.name}</div>
                  <div className="text-xs tabular-nums text-muted-foreground">{o.phone || "—"}</div>
                </TD>
                <TD className="text-right font-medium tabular-nums">{money(o.total)}</TD>
                <TD>
                  <div className="flex flex-col items-start gap-1">
                    <PaymentBadge status={o.paymentStatus} />
                    <span className="text-xs text-muted-foreground">{METHOD_SHORT[o.paymentMethod] ?? o.paymentMethod}</span>
                  </div>
                </TD>
                <TD>
                  <FulfillmentBadge status={o.fulfillmentStatus} />
                </TD>
                <TD className="text-right tabular-nums text-muted-foreground">{o.items}</TD>
                <TD onClick={(e) => e.stopPropagation()}>
                  <CourierChip courier={o.courier} />
                </TD>
                <TD className="text-xs text-muted-foreground">{SOURCE_SHORT[o.source] ?? o.source}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden">
        <label className="flex items-center gap-2 border-b border-border px-4 py-2 text-xs text-muted-foreground">
          <Checkbox checked={allSelected} onChange={toggleAll} /> Select all
        </label>
        <ul className="divide-y divide-border">
          {rows.map((o) => (
            <li key={o.id} className={cn("flex gap-3 px-4 py-3", selected.has(o.id) && "bg-accent/50")}>
              <Checkbox className="mt-1" checked={selected.has(o.id)} onChange={() => toggle(o.id)} aria-label={`Select order #${o.number}`} />
              <Link href={`/orders/${o.id}`} className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">#{o.number}</span>
                  <span className="font-semibold tabular-nums">{money(o.total)}</span>
                </div>
                <div className="mt-0.5 flex items-center justify-between gap-2 text-sm">
                  <span className="truncate">{o.name}</span>
                  <RelativeTime date={o.createdAt} className="shrink-0 text-xs text-muted-foreground" />
                </div>
                <div className="text-xs tabular-nums text-muted-foreground">
                  {o.phone || "No phone"} · {o.items} item{o.items === 1 ? "" : "s"} · {METHOD_SHORT[o.paymentMethod] ?? o.paymentMethod}
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <FulfillmentBadge status={o.fulfillmentStatus} />
                  <PaymentBadge status={o.paymentStatus} />
                  {o.courier && (
                    <Badge tone="blue">
                      <Truck className="size-3" /> {courierName(o.courier)}
                    </Badge>
                  )}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* Bulk action bar */}
      {ids.length > 0 && (
        <div className="fixed inset-x-0 bottom-20 z-40 flex justify-center px-3 lg:bottom-6">
          <div className="flex max-w-full animate-slide-up flex-wrap items-center justify-center gap-1 rounded-2xl border border-border bg-card p-1.5 shadow-2xl">
            <span className="whitespace-nowrap px-2 text-sm font-medium">{ids.length} selected</span>
            <button onClick={() => setSelected(new Set())} className="rounded-md p-1 text-muted-foreground hover:bg-muted" aria-label="Clear selection">
              <X className="size-4" />
            </button>
            <span className="mx-1 h-6 w-px bg-border" />
            {canManage && (
              <>
                <Button size="sm" variant="ghost" loading={busy === "confirmed"} onClick={() => bulkStatus("confirmed", "confirmed")}>
                  <CircleCheck /> Confirm
                </Button>
                <Dropdown
                  align="start"
                  className="bottom-full mb-2 mt-0"
                  trigger={
                    <Button size="sm" variant="ghost" loading={busy === "processing" || busy === "shipped"}>
                      <Package /> Status
                    </Button>
                  }
                >
                  <DropdownItem onClick={() => bulkStatus("processing", "marked as processing")}>Mark as processing</DropdownItem>
                  <DropdownItem onClick={() => bulkStatus("shipped", "marked as shipped")}>Mark as shipped</DropdownItem>
                </Dropdown>
                <Button size="sm" variant="ghost" onClick={() => setCourierOpen(true)}>
                  <Truck /> Book courier
                </Button>
              </>
            )}
            <Dropdown
              align="end"
              className="bottom-full mb-2 mt-0"
              trigger={
                <Button size="sm" variant="ghost">
                  <Printer /> Print
                </Button>
              }
            >
              <DropdownItem icon={<FileText />} onClick={() => openPrint("invoice")}>
                Invoices
              </DropdownItem>
              <DropdownItem icon={<Package />} onClick={() => openPrint("slip")}>
                Packing slips
              </DropdownItem>
            </Dropdown>
            <a href={`/api/orders/export?ids=${ids.join(",")}`} className={buttonVariants({ size: "sm", variant: "ghost" })}>
              <Download /> CSV
            </a>
          </div>
        </div>
      )}

      <Dialog
        open={courierOpen}
        onClose={() => setCourierOpen(false)}
        title={`Book courier for ${ids.length} order${ids.length === 1 ? "" : "s"}`}
        description="Each parcel is booked with the order's due amount as COD. Orders already booked, cancelled or delivered are skipped."
        footer={
          couriers.length ? (
            <>
              <Button variant="outline" onClick={() => setCourierOpen(false)}>
                Cancel
              </Button>
              <Button onClick={bulkBook} loading={busy === "courier"}>
                <Truck /> Book {ids.length} parcel{ids.length === 1 ? "" : "s"}
              </Button>
            </>
          ) : undefined
        }
      >
        {couriers.length ? (
          <div className="space-y-3">
            <label className="block space-y-1.5">
              <span className="text-sm font-medium">Courier</span>
              <Select value={provider} onChange={(e) => setProvider(e.target.value)}>
                {couriers.map((c) => (
                  <option key={c.provider} value={c.provider}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </label>
            {busy === "courier" && (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader className="size-4 animate-spin" /> Talking to the courier — this can take a few seconds per parcel…
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <p className="text-muted-foreground">Connect Steadfast, Pathao or RedX to book parcels in one click — no more copying addresses into the courier panel.</p>
            <Link href="/settings/couriers" className={buttonVariants()}>
              <Truck /> Connect a courier
            </Link>
          </div>
        )}
      </Dialog>
    </>
  );
}

function CourierChip({ courier }: { courier: OrderRow["courier"] }) {
  if (!courier) return <span className="text-xs text-muted-foreground">—</span>;
  const code = courier.trackingCode || courier.consignmentId;
  const inner = (
    <>
      <Truck className="size-3" /> {courierName(courier)}
      {code && <span className="font-mono text-[11px] opacity-80">{code}</span>}
    </>
  );
  return courier.trackingUrl ? (
    <a href={courier.trackingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/15 hover:underline dark:bg-blue-500/10 dark:text-blue-300">
      {inner}
    </a>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border">{inner}</span>
  );
}
