"use client";

import * as React from "react";
import { Button, Dialog, Field, Input, Select, Switch, Textarea } from "@pai/ui";
import { useRunAction } from "@/components/action-client";
import { changePlan, extendTrial, setStoreStatus } from "./actions";

export function SuspendDialog({ ids, open, onClose, onDone, mode = "suspended" }: { ids: string[]; open: boolean; onClose: () => void; onDone?: () => void; mode?: "suspended" | "closed" }) {
  const verb = mode === "closed" ? "Close" : "Suspend";
  const [reason, setReason] = React.useState("");
  const { run, pending } = useRunAction();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={ids.length > 1 ? `${verb} ${ids.length} stores` : `${verb} store`}
      description={
        mode === "closed"
          ? "Closing marks the store as permanently shut down. It can be reactivated later if needed. The reason is recorded in the audit log."
          : "Suspended storefronts go offline and merchants lose dashboard access to selling features. The reason is recorded in the audit log."
      }
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            loading={pending}
            onClick={async () => {
              const r = await run(() => setStoreStatus({ ids, status: mode, reason }));
              if (r.ok) {
                setReason("");
                onClose();
                onDone?.();
              }
            }}
          >
            {verb}
          </Button>
        </>
      }
    >
      <Field label="Reason" hint="Visible to the team only.">
        <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Fraudulent orders reported by courier partner" autoFocus />
      </Field>
    </Dialog>
  );
}

export function ExtendTrialDialog({ ids, open, onClose, onDone }: { ids: string[]; open: boolean; onClose: () => void; onDone?: () => void }) {
  const [days, setDays] = React.useState("7");
  const { run, pending } = useRunAction();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="sm"
      title={ids.length > 1 ? `Extend trial for ${ids.length} stores` : "Extend trial"}
      description="Adds days to the later of today or the current trial end."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={pending}
            onClick={async () => {
              const r = await run(() => extendTrial({ ids, days: Number(days) }));
              if (r.ok) {
                onClose();
                onDone?.();
              }
            }}
          >
            Extend
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {[7, 14, 30].map((d) => (
            <Button key={d} size="sm" variant={Number(days) === d ? "default" : "outline"} onClick={() => setDays(String(d))}>
              +{d} days
            </Button>
          ))}
        </div>
        <Field label="Days">
          <Input type="number" min={1} max={365} value={days} onChange={(e) => setDays(e.target.value)} />
        </Field>
      </div>
    </Dialog>
  );
}

export function ChangePlanDialog({
  storeId,
  currentPlanId,
  plans,
  open,
  onClose,
}: {
  storeId: string;
  currentPlanId: string | null;
  plans: { id: string; name: string; priceMonthly: number; priceYearly: number; active: boolean }[];
  open: boolean;
  onClose: () => void;
}) {
  const [planId, setPlanId] = React.useState(currentPlanId ?? plans[0]?.id ?? "");
  const [interval, setInterval] = React.useState<"monthly" | "yearly">("monthly");
  const [activate, setActivate] = React.useState(false);
  const { run, pending } = useRunAction();
  const fmt = (n: number) => "৳" + (n / 100).toLocaleString();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Change plan"
      description="Updates the store's plan and its current subscription. No invoice is generated automatically."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            loading={pending}
            onClick={async () => {
              const r = await run(() => changePlan({ id: storeId, planId, interval, activate }));
              if (r.ok) onClose();
            }}
          >
            Change plan
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Plan">
          <Select value={planId} onChange={(e) => setPlanId(e.target.value)}>
            {plans.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — {fmt(p.priceMonthly)}/mo · {fmt(p.priceYearly)}/yr{p.active ? "" : " (inactive)"}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Billing interval">
          <Select value={interval} onChange={(e) => setInterval(e.target.value as "monthly" | "yearly")}>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </Select>
        </Field>
        <label className="flex items-center justify-between gap-4 rounded-lg border border-border p-3 text-sm">
          <span>
            <span className="block font-medium">Activate subscription now</span>
            <span className="block text-xs text-muted-foreground">Ends the trial and starts a fresh billing period (e.g. after an offline payment).</span>
          </span>
          <Switch checked={activate} onChange={(e) => setActivate(e.target.checked)} />
        </label>
      </div>
    </Dialog>
  );
}
