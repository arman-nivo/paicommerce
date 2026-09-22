"use client";
import { useRouter } from "next/navigation";
import * as React from "react";
import { Banknote, CreditCard, Wallet } from "lucide-react";
import { Button, Card, CardBody, CardHeader, CopyButton, Field, Input, Select } from "@pai/ui";
import { PaymentBadge } from "@/components/status";
import { useMoney } from "@/components/store-context";
import { run } from "@/lib/client";
import { updatePayment } from "../../actions";

const STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "authorized", label: "Authorized" },
  { value: "partially_refunded", label: "Partially refunded" },
  { value: "refunded", label: "Refunded" },
  { value: "failed", label: "Failed" },
] as const;
type PStatus = (typeof STATUSES)[number]["value"];

export function PaymentCard({ orderId, canManage, method, methodLabel, status, reference, total }: { orderId: string; canManage: boolean; method: string; methodLabel: string; status: string; reference: string | null; total: number }) {
  const router = useRouter();
  const money = useMoney();
  const [editing, setEditing] = React.useState(false);
  const [s, setS] = React.useState<PStatus>(status as PStatus);
  const [ref, setRef] = React.useState(reference ?? "");
  const [saving, setSaving] = React.useState(false);
  const manualMfs = method === "bkash_manual";
  const Icon = method === "cod" ? Banknote : manualMfs || method === "bkash" || method === "nagad" ? Wallet : CreditCard;

  React.useEffect(() => {
    setS(status as PStatus);
    setRef(reference ?? "");
  }, [status, reference]);

  async function save(next?: PStatus) {
    setSaving(true);
    const res = await run(updatePayment({ id: orderId, status: next ?? s, reference: ref.trim() || null }), { success: "Payment updated" });
    setSaving(false);
    if (res) {
      setEditing(false);
      router.refresh();
    }
  }

  return (
    <Card>
      <CardHeader
        title="Payment"
        action={
          canManage && !editing ? (
            <button className="text-xs font-medium text-primary hover:underline" onClick={() => setEditing(true)}>
              Edit
            </button>
          ) : undefined
        }
      />
      <CardBody className="space-y-3">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Icon className="size-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{methodLabel}</p>
            <p className="text-xs text-muted-foreground">{money(total)}</p>
          </div>
          <PaymentBadge status={status} />
        </div>

        {manualMfs && (
          <div className="rounded-lg border border-amber-300/60 bg-amber-50 p-3 dark:border-amber-500/30 dark:bg-amber-500/10">
            <p className="text-xs font-medium text-amber-800 dark:text-amber-300">bKash / Nagad TrxID from customer</p>
            {reference ? (
              <div className="mt-1 flex items-center justify-between gap-2">
                <span className="font-mono text-lg font-bold tracking-wider">{reference}</span>
                <CopyButton value={reference} />
              </div>
            ) : (
              <p className="mt-1 text-sm text-amber-800 dark:text-amber-300">No TrxID entered yet.</p>
            )}
            {status !== "paid" && <p className="mt-1.5 text-xs text-amber-800/80 dark:text-amber-300/80">Check this TrxID in your bKash/Nagad app, then mark the payment as paid.</p>}
          </div>
        )}
        {!manualMfs && reference && !editing && (
          <div className="flex items-center justify-between gap-2 rounded-lg bg-muted/60 px-3 py-2 text-sm">
            <span className="text-muted-foreground">Reference</span>
            <span className="flex items-center gap-1 font-mono">
              {reference}
              <CopyButton value={reference} />
            </span>
          </div>
        )}

        {canManage && !editing && status !== "paid" && (
          <Button variant="outline" className="w-full" loading={saving} onClick={() => save("paid")}>
            <Banknote /> Mark as paid
          </Button>
        )}

        {editing && (
          <div className="space-y-3 border-t border-border pt-3">
            <Field label="Payment status">
              <Select value={s} onChange={(e) => setS(e.target.value as PStatus)}>
                {STATUSES.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={manualMfs ? "TrxID" : "Reference / transaction ID"} hint="Optional — e.g. bKash TrxID or bank reference.">
              <Input value={ref} onChange={(e) => setRef(e.target.value)} placeholder={manualMfs ? "e.g. 9K7D6XY2AB" : "Optional"} className="font-mono" />
            </Field>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Cancel
              </Button>
              <Button loading={saving} onClick={() => save()}>
                Save
              </Button>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
