"use client";

import * as React from "react";
import { CheckCircle2, Loader, MoreHorizontal, Send, XCircle } from "lucide-react";
import { Button, Dialog, Dropdown, DropdownItem, Field, Input, Select } from "@pai/ui";
import { useRunAction } from "@/components/action-client";
import { createPayout, setPayoutStatus, updateDeveloper } from "./actions";

export function DeveloperSettingsForm({ dev }: { dev: { id: string; revenueSharePct: number; payoutMethod: string | null; payoutEmail: string | null } }) {
  const [share, setShare] = React.useState(String(dev.revenueSharePct));
  const [method, setMethod] = React.useState(dev.payoutMethod ?? "bank");
  const [email, setEmail] = React.useState(dev.payoutEmail ?? "");
  const { run, pending } = useRunAction();
  const n = Math.min(100, Math.max(0, parseInt(share, 10) || 0));
  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        await run(() => updateDeveloper({ id: dev.id, revenueSharePct: n, payoutMethod: method as "bank", payoutEmail: email }));
      }}
    >
      <Field label="Revenue share (%)" hint={`Developer keeps ${n}% of each sale · PaiCommerce keeps ${100 - n}%`}>
        <div className="flex items-center gap-3">
          <input type="range" min={0} max={100} value={n} onChange={(e) => setShare(e.target.value)} className="flex-1 accent-[var(--primary)]" />
          <Input type="number" min={0} max={100} value={share} onChange={(e) => setShare(e.target.value)} className="w-20" />
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Payout method">
          <Select value={method} onChange={(e) => setMethod(e.target.value)}>
            {["bank", "bkash", "nagad", "paypal", "wise"].map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Payout email">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
      </div>
      <div className="flex justify-end">
        <Button size="sm" type="submit" loading={pending}>
          Save
        </Button>
      </div>
    </form>
  );
}

export function CreatePayoutButton({ developerId, balance, defaultMethod }: { developerId: string; balance: number; defaultMethod: string }) {
  const [open, setOpen] = React.useState(false);
  const [amount, setAmount] = React.useState(String(balance / 100));
  const [method, setMethod] = React.useState(defaultMethod);
  const [reference, setReference] = React.useState("");
  const { run, pending } = useRunAction();
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)} disabled={balance < 100}>
        <Send /> Create payout
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        size="sm"
        title="Create payout"
        description={`Available balance: ৳${(balance / 100).toLocaleString()}. The amount is reserved immediately.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              loading={pending}
              onClick={async () => {
                const r = await run(() => createPayout({ developerId, amount: Math.round(parseFloat(amount || "0") * 100), method, reference }));
                if (r.ok) setOpen(false);
              }}
            >
              Create payout
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <Field label="Amount (৳)">
            <div className="flex gap-2">
              <Input type="number" min={1} step="0.01" max={balance / 100} value={amount} onChange={(e) => setAmount(e.target.value)} />
              <Button type="button" variant="outline" size="sm" className="h-9" onClick={() => setAmount(String(balance / 100))}>
                Max
              </Button>
            </div>
          </Field>
          <Field label="Method">
            <Select value={method} onChange={(e) => setMethod(e.target.value)}>
              {["bank", "bkash", "nagad", "paypal", "wise"].map((m) => (
                <option key={m}>{m}</option>
              ))}
            </Select>
          </Field>
          <Field label="Reference (optional)" hint="Bank transfer ID, bKash TrxID…">
            <Input value={reference} onChange={(e) => setReference(e.target.value)} />
          </Field>
        </div>
      </Dialog>
    </>
  );
}

export function PayoutActions({ id, status }: { id: string; status: string }) {
  const { run } = useRunAction();
  if (status === "paid" || status === "failed") return null;
  return (
    <Dropdown
      trigger={
        <Button size="icon-sm" variant="ghost" aria-label="Payout actions">
          <MoreHorizontal />
        </Button>
      }
    >
      {status === "pending" && (
        <DropdownItem icon={<Loader />} onClick={() => run(() => setPayoutStatus({ id, status: "processing" }))}>
          Mark processing
        </DropdownItem>
      )}
      <DropdownItem
        icon={<CheckCircle2 />}
        onClick={() => {
          const reference = window.prompt("Transfer reference (optional)") ?? undefined;
          run(() => setPayoutStatus({ id, status: "paid", reference: reference || undefined }));
        }}
      >
        Mark paid
      </DropdownItem>
      <DropdownItem icon={<XCircle />} danger onClick={() => run(() => setPayoutStatus({ id, status: "failed" }))}>
        Mark failed (refund balance)
      </DropdownItem>
    </Dropdown>
  );
}

