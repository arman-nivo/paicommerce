"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Ban, CheckCircle2, MoreHorizontal, Plus, Printer } from "lucide-react";
import { Button, Dialog, Dropdown, DropdownItem, Field, Input, Select, useConfirm } from "@pai/ui";
import { useRunAction } from "@/components/action-client";
import { BulkBar } from "@/components/selection";
import { StorePicker, type PickedStore } from "@/components/store-picker";
import { createInvoice, markInvoicesPaid, markUncollectible, updateSubscription, voidInvoices } from "./actions";

const METHODS = ["bkash", "nagad", "sslcommerz", "stripe", "bank", "cash", "manual"];

function MarkPaidDialog({ ids, open, onClose, onDone }: { ids: string[]; open: boolean; onClose: () => void; onDone?: () => void }) {
  const [method, setMethod] = React.useState("bkash");
  const { run, pending } = useRunAction();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      title={ids.length > 1 ? `Mark ${ids.length} invoices paid` : "Mark invoice paid"}
      description="Record an offline or out-of-band payment."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="success"
            loading={pending}
            onClick={async () => {
              const r = await run(() => markInvoicesPaid({ ids, paymentMethod: method }));
              if (r.ok) {
                onClose();
                onDone?.();
              }
            }}
          >
            Mark paid
          </Button>
        </>
      }
    >
      <Field label="Payment method">
        <Select value={method} onChange={(e) => setMethod(e.target.value)}>
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>
      </Field>
    </Dialog>
  );
}

export function InvoiceRowActions({ id, status, canManage }: { id: string; status: string; canManage: boolean }) {
  const [paidOpen, setPaidOpen] = React.useState(false);
  const { run } = useRunAction();
  const { confirm, dialog } = useConfirm();
  const payable = ["draft", "open", "uncollectible"].includes(status);
  return (
    <>
      <Dropdown
        trigger={
          <Button size="icon-sm" variant="ghost" aria-label="Invoice actions">
            <MoreHorizontal />
          </Button>
        }
      >
        <DropdownItem icon={<Printer />} onClick={() => window.open(`/invoices/${id}`, "_blank")}>
          View / print
        </DropdownItem>
        {canManage && payable && (
          <DropdownItem icon={<CheckCircle2 />} onClick={() => setPaidOpen(true)}>
            Mark paid
          </DropdownItem>
        )}
        {canManage && status === "open" && (
          <DropdownItem icon={<Ban />} onClick={() => run(() => markUncollectible({ id }))}>
            Mark uncollectible
          </DropdownItem>
        )}
        {canManage && payable && (
          <DropdownItem
            icon={<Ban />}
            danger
            onClick={async () => {
              if (await confirm({ title: "Void this invoice?", description: "Voided invoices can't be paid or reopened.", confirmLabel: "Void", danger: true })) run(() => voidInvoices({ ids: [id] }));
            }}
          >
            Void
          </DropdownItem>
        )}
      </Dropdown>
      <MarkPaidDialog ids={[id]} open={paidOpen} onClose={() => setPaidOpen(false)} />
      {dialog}
    </>
  );
}

export function InvoiceBulk() {
  const [state, setState] = React.useState<null | { ids: string[]; clear: () => void }>(null);
  const { run, pending } = useRunAction();
  const { confirm, dialog } = useConfirm();
  return (
    <>
      <BulkBar>
        {(ids, clear) => (
          <>
            <Button size="sm" variant="success" onClick={() => setState({ ids, clear })}>
              <CheckCircle2 /> Mark paid
            </Button>
            <Button
              size="sm"
              variant="destructive"
              loading={pending}
              onClick={async () => {
                if (await confirm({ title: `Void ${ids.length} invoices?`, description: "Only unpaid invoices are affected.", confirmLabel: "Void", danger: true })) {
                  if ((await run(() => voidInvoices({ ids }))).ok) clear();
                }
              }}
            >
              <Ban /> Void
            </Button>
          </>
        )}
      </BulkBar>
      <MarkPaidDialog ids={state?.ids ?? []} open={!!state} onClose={() => setState(null)} onDone={() => state?.clear()} />
      {dialog}
    </>
  );
}

export function NewInvoiceButton() {
  const sp = useSearchParams();
  const router = useRouter();
  const [open, setOpen] = React.useState(sp.get("new") === "1");
  const [store, setStore] = React.useState<PickedStore | null>(null);
  const [description, setDescription] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [dueAt, setDueAt] = React.useState(() => new Date(Date.now() + 7 * 86400_000).toISOString().slice(0, 10));
  const [status, setStatus] = React.useState<"open" | "draft" | "paid">("open");
  const [method, setMethod] = React.useState("bkash");
  const { run, pending } = useRunAction();
  const close = () => {
    setOpen(false);
    if (sp.get("new")) {
      const q = new URLSearchParams(sp.toString());
      q.delete("new");
      router.replace(`/billing?${q.toString()}`, { scroll: false });
    }
  };
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus /> New invoice
      </Button>
      <Dialog
        open={open}
        onClose={close}
        title="Create manual invoice"
        description="For custom deals, setup fees, enterprise contracts or offline renewals."
        footer={
          <>
            <Button variant="outline" onClick={close}>
              Cancel
            </Button>
            <Button
              loading={pending}
              onClick={async () => {
                const r = await run(() =>
                  createInvoice({
                    storeId: store?.id ?? "",
                    description,
                    amount: Math.round(parseFloat(amount || "0") * 100),
                    dueAt: dueAt || undefined,
                    status,
                    paymentMethod: status === "paid" ? method : undefined,
                  }),
                );
                if (r.ok) {
                  setStore(null);
                  setDescription("");
                  setAmount("");
                  close();
                }
              }}
            >
              Create invoice
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Store">
            <StorePicker value={store} onChange={setStore} />
          </Field>
          <Field label="Description">
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. Growth plan — annual renewal (2026–27)" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Amount (৳)">
              <Input type="number" min={0} step="0.01" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="9990" />
            </Field>
            <Field label="Due date">
              <Input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Status">
              <Select value={status} onChange={(e) => setStatus(e.target.value as "open")}>
                <option value="open">Open (awaiting payment)</option>
                <option value="draft">Draft</option>
                <option value="paid">Already paid</option>
              </Select>
            </Field>
            {status === "paid" && (
              <Field label="Payment method">
                <Select value={method} onChange={(e) => setMethod(e.target.value)}>
                  {METHODS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </Select>
              </Field>
            )}
          </div>
        </div>
      </Dialog>
    </>
  );
}

export function SubscriptionRowActions({ id, status, cancelAtPeriodEnd }: { id: string; status: string; cancelAtPeriodEnd: boolean }) {
  const { run } = useRunAction();
  const { confirm, dialog } = useConfirm();
  return (
    <>
      <Dropdown
        trigger={
          <Button size="icon-sm" variant="ghost" aria-label="Subscription actions">
            <MoreHorizontal />
          </Button>
        }
      >
        {status !== "active" && <DropdownItem onClick={() => run(() => updateSubscription({ id, status: "active" }))}>Mark active</DropdownItem>}
        {status === "active" && <DropdownItem onClick={() => run(() => updateSubscription({ id, status: "past_due" }))}>Mark past due</DropdownItem>}
        <DropdownItem onClick={() => run(() => updateSubscription({ id, extendDays: 30 }))}>Extend period +30 days</DropdownItem>
        {status !== "cancelled" && (
          <DropdownItem onClick={() => run(() => updateSubscription({ id, cancelAtPeriodEnd: !cancelAtPeriodEnd }))}>{cancelAtPeriodEnd ? "Resume auto-renew" : "Cancel at period end"}</DropdownItem>
        )}
        {status !== "cancelled" && (
          <DropdownItem
            danger
            onClick={async () => {
              if (await confirm({ title: "Cancel subscription now?", description: "The subscription ends immediately and counts towards churn.", confirmLabel: "Cancel subscription", danger: true }))
                run(() => updateSubscription({ id, status: "cancelled" }));
            }}
          >
            Cancel immediately
          </DropdownItem>
        )}
      </Dropdown>
      {dialog}
    </>
  );
}
