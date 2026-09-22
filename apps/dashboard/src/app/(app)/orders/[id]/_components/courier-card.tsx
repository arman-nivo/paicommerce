"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";
import { ExternalLink, Package, PenLine, Trash2, Truck } from "lucide-react";
import { Badge, Button, buttonVariants, Card, CardBody, CardHeader, Checkbox, CopyButton, Dialog, Field, Input, Select, Textarea, toast, useConfirm } from "@pai/ui";
import { MoneyInput } from "@/components/money-input";
import { run } from "@/lib/client";
import { formatDateTime } from "@/lib/format";
import { bookCourier, clearCourier, saveManualShipment } from "../../actions";
import { courierName } from "../../_lib/labels";

type Courier = { provider: string; consignmentId?: string; trackingCode?: string; trackingUrl?: string; status?: string; bookedAt?: string } | null;

const MANUAL_SUGGESTIONS = ["Sundarban Courier", "SA Paribahan", "Steadfast", "Pathao", "RedX", "Paperfly", "eCourier", "Own delivery"];

export function CourierCard({
  orderId,
  number,
  fulfillmentStatus,
  courier,
  defaultCod,
  note,
  couriers,
  hasAddress,
  canManage,
}: {
  orderId: string;
  number: number;
  fulfillmentStatus: string;
  courier: Courier;
  defaultCod: number;
  note: string | null;
  couriers: { provider: string; name: string }[];
  hasAddress: boolean;
  canManage: boolean;
}) {
  const router = useRouter();
  const { confirm, dialog } = useConfirm();
  const [bookOpen, setBookOpen] = React.useState(false);
  const [manualOpen, setManualOpen] = React.useState(false);
  const closed = ["cancelled", "returned"].includes(fulfillmentStatus);

  async function remove() {
    const ok = await confirm({
      title: "Remove shipment info?",
      description: "This only removes the tracking details from this order. If the parcel was booked with a courier, cancel it in the courier's panel too.",
      confirmLabel: "Remove",
      danger: true,
    });
    if (!ok) return;
    if (await run(clearCourier({ id: orderId }), { success: "Shipment info removed" })) router.refresh();
  }

  if (courier) {
    const code = courier.trackingCode || courier.consignmentId;
    return (
      <Card>
        <CardHeader
          title="Delivery"
          description={courier.bookedAt ? `Booked ${formatDateTime(courier.bookedAt)}` : undefined}
          action={
            canManage ? (
              <button onClick={remove} className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-red-600" aria-label="Remove shipment info">
                <Trash2 className="size-4" />
              </button>
            ) : undefined
          }
        />
        <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
              <Truck className="size-5" />
            </span>
            <div>
              <p className="flex items-center gap-2 font-medium">
                {courierName(courier)}
                {courier.provider !== "manual" && courier.status && <Badge tone="blue">{courier.status.replace(/_/g, " ")}</Badge>}
              </p>
              {courier.consignmentId && courier.provider !== "manual" && <p className="text-xs text-muted-foreground">Consignment {courier.consignmentId}</p>}
              {code && (
                <p className="flex items-center gap-1 text-sm">
                  Tracking <span className="font-mono font-semibold">{code}</span>
                  <CopyButton value={code} />
                </p>
              )}
            </div>
          </div>
          {courier.trackingUrl && (
            <a href={courier.trackingUrl} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline" })}>
              <ExternalLink /> Track parcel
            </a>
          )}
        </CardBody>
        {dialog}
      </Card>
    );
  }

  if (closed || fulfillmentStatus === "delivered" || !canManage) {
    return (
      <Card>
        <CardHeader title="Delivery" />
        <CardBody className="text-sm text-muted-foreground">No courier booking for this order.</CardBody>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader title="Delivery" description="Book a courier and the order moves to Shipped automatically." />
      <CardBody>
        {!hasAddress && <p className="mb-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:bg-amber-500/10 dark:text-amber-300">This order has no shipping address — add one before booking a courier.</p>}
        {couriers.length ? (
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={() => setBookOpen(true)} disabled={!hasAddress}>
              <Truck /> Book courier
            </Button>
            <Button variant="ghost" onClick={() => setManualOpen(true)}>
              <PenLine /> Enter tracking manually
            </Button>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-4">
            <div className="flex items-start gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
                <Package className="size-4" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-medium">Book Steadfast, Pathao or RedX in one click</p>
                <p className="mt-0.5 text-xs text-muted-foreground">Connect your courier account once — then book parcels, get tracking codes and COD amounts filled in automatically.</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Link href="/settings/couriers" className={buttonVariants({ size: "sm" })}>
                    <Truck /> Connect a courier
                  </Link>
                  <Button size="sm" variant="outline" onClick={() => setManualOpen(true)}>
                    <PenLine /> Manual shipment
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardBody>
      <BookDialog open={bookOpen} onClose={() => setBookOpen(false)} orderId={orderId} number={number} couriers={couriers} defaultCod={defaultCod} note={note} />
      <ManualDialog open={manualOpen} onClose={() => setManualOpen(false)} orderId={orderId} fulfillmentStatus={fulfillmentStatus} />
    </Card>
  );
}

function BookDialog({ open, onClose, orderId, number, couriers, defaultCod, note }: { open: boolean; onClose: () => void; orderId: string; number: number; couriers: { provider: string; name: string }[]; defaultCod: number; note: string | null }) {
  const router = useRouter();
  const [provider, setProvider] = React.useState(couriers[0]?.provider ?? "");
  const [cod, setCod] = React.useState<number | null>(defaultCod);
  const [text, setText] = React.useState(note ?? "");
  const [weight, setWeight] = React.useState("0.5");
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function submit() {
    setSaving(true);
    setError(null);
    const w = parseFloat(weight);
    const res = await bookCourier({ id: orderId, provider, codAmount: cod ?? 0, note: text.trim() || null, weightKg: Number.isFinite(w) && w > 0 ? w : null });
    setSaving(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    toast.success(`Booked · CN ${res.data.consignmentId ?? ""}`.trim());
    onClose();
    router.refresh();
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={`Book courier for #${number}`}
      description="We send the customer's name, phone and address to the courier."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} loading={saving} disabled={!provider}>
            <Truck /> Book parcel
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Courier">
          <Select value={provider} onChange={(e) => setProvider(e.target.value)}>
            {couriers.map((c) => (
              <option key={c.provider} value={c.provider}>
                {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Cash to collect (COD)" hint={defaultCod ? "Defaults to the unpaid order total." : "Order is paid — nothing to collect."}>
            <MoneyInput value={cod} onChange={setCod} />
          </Field>
          <Field label="Weight (kg)">
            <Input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value.replace(/[^0-9.]/g, ""))} />
          </Field>
        </div>
        <Field label="Note for rider" hint="Optional — e.g. “Call before delivery”.">
          <Textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={300} className="min-h-16" />
        </Field>
        {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">{error}</p>}
      </div>
    </Dialog>
  );
}

function ManualDialog({ open, onClose, orderId, fulfillmentStatus }: { open: boolean; onClose: () => void; orderId: string; fulfillmentStatus: string }) {
  const router = useRouter();
  const [provider, setProvider] = React.useState("");
  const [code, setCode] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [markShipped, setMarkShipped] = React.useState(fulfillmentStatus !== "shipped");
  const [saving, setSaving] = React.useState(false);
  const listId = React.useId();

  async function submit() {
    setSaving(true);
    const res = await run(saveManualShipment({ id: orderId, provider, trackingCode: code.trim() || null, trackingUrl: url.trim() || null, markShipped }), { success: "Shipment saved" });
    setSaving(false);
    if (res) {
      onClose();
      router.refresh();
    }
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Manual shipment"
      description="Sent the parcel yourself or through another courier? Save the tracking details here."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={submit} loading={saving} disabled={!provider.trim()}>
            Save shipment
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Courier / delivery method">
          <Input list={listId} value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="e.g. Sundarban Courier" autoFocus />
          <datalist id={listId}>
            {MANUAL_SUGGESTIONS.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </Field>
        <Field label="Tracking code" hint="Optional">
          <Input value={code} onChange={(e) => setCode(e.target.value)} className="font-mono" />
        </Field>
        <Field label="Tracking link" hint="Optional — must start with https://">
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" inputMode="url" />
        </Field>
        {fulfillmentStatus !== "shipped" && (
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={markShipped} onChange={(e) => setMarkShipped(e.target.checked)} /> Mark order as shipped
          </label>
        )}
      </div>
    </Dialog>
  );
}
