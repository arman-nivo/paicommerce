"use client";

import * as React from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { Button, Dialog, Field, Input, Switch, Textarea } from "@pai/ui";
import type { PlanLimits } from "@pai/db/schema";
import { useRunAction } from "@/components/action-client";
import { savePlan } from "./actions";

export type PlanFormValue = {
  id?: string;
  code: string;
  name: string;
  tagline: string | null;
  priceMonthly: number;
  priceYearly: number;
  limits: PlanLimits;
  features: string[];
  highlighted: boolean;
  active: boolean;
  sort: number;
};

const EMPTY: PlanFormValue = {
  code: "",
  name: "",
  tagline: "",
  priceMonthly: 0,
  priceYearly: 0,
  limits: { products: 100, ordersPerMonth: 500, staff: 2, customDomain: false, premiumThemes: false, transactionFeePct: 0, storage: 1000, apiAccess: false, removeBranding: false },
  features: [],
  highlighted: false,
  active: true,
  sort: 0,
};

function LimitInput({ label, value, onChange, hint }: { label: string; value: number | null; onChange: (v: number | null) => void; hint?: string }) {
  const unlimited = value === null;
  return (
    <Field label={label} hint={hint}>
      <div className="flex items-center gap-2">
        <Input type="number" min={0} disabled={unlimited} value={unlimited ? "" : value} placeholder={unlimited ? "Unlimited" : ""} onChange={(e) => onChange(e.target.value === "" ? 0 : Math.max(0, parseInt(e.target.value, 10) || 0))} />
        <label className="flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground">
          <input type="checkbox" className="size-3.5 accent-[var(--primary)]" checked={unlimited} onChange={(e) => onChange(e.target.checked ? null : 0)} />
          Unlimited
        </label>
      </div>
    </Field>
  );
}

function Toggle({ label, desc, checked, onChange }: { label: string; desc?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        {desc && <span className="block text-xs text-muted-foreground">{desc}</span>}
      </span>
      <Switch checked={checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

export function PlanFormDialog({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: PlanFormValue }) {
  const [v, setV] = React.useState<PlanFormValue>(initial ?? EMPTY);
  const [monthly, setMonthly] = React.useState(String((initial?.priceMonthly ?? 0) / 100));
  const [yearly, setYearly] = React.useState(String((initial?.priceYearly ?? 0) / 100));
  const [newFeature, setNewFeature] = React.useState("");
  const { run, pending } = useRunAction();

  React.useEffect(() => {
    if (open) {
      setV(initial ?? EMPTY);
      setMonthly(String((initial?.priceMonthly ?? 0) / 100));
      setYearly(String((initial?.priceYearly ?? 0) / 100));
    }
  }, [open, initial]);

  const L = <K extends keyof PlanLimits>(k: K, val: PlanLimits[K]) => setV((p) => ({ ...p, limits: { ...p.limits, [k]: val } }));
  const moveFeature = (i: number, d: -1 | 1) =>
    setV((p) => {
      const f = [...p.features];
      const j = i + d;
      if (j < 0 || j >= f.length) return p;
      [f[i], f[j]] = [f[j]!, f[i]!];
      return { ...p, features: f };
    });
  const m = Math.round(parseFloat(monthly || "0") * 100) || 0;
  const y = Math.round(parseFloat(yearly || "0") * 100) || 0;
  const discount = m > 0 && y > 0 ? Math.round((1 - y / (m * 12)) * 100) : 0;

  const submit = async () => {
    const res = await run(() =>
      savePlan({
        id: v.id,
        code: v.code,
        name: v.name,
        tagline: v.tagline ?? "",
        priceMonthly: m,
        priceYearly: y,
        limits: v.limits,
        features: v.features.filter((f) => f.trim()),
        highlighted: v.highlighted,
        active: v.active,
        sort: v.sort,
      }),
    );
    if (res.ok) onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      title={v.id ? `Edit ${initial?.name}` : "New plan"}
      description="Prices are in BDT. Changes apply to new signups and upcoming renewals."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={pending} onClick={submit}>
            {v.id ? "Save changes" : "Create plan"}
          </Button>
        </>
      }
    >
      <form
        className="grid gap-6 lg:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Listing</h3>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Name">
              <Input value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} placeholder="Growth" required />
            </Field>
            <Field label="Code" hint={v.id ? "Changing codes can break integrations" : "Used in URLs & API"}>
              <Input value={v.code} onChange={(e) => setV({ ...v, code: e.target.value.toLowerCase() })} placeholder="growth" className="font-mono" required />
            </Field>
          </div>
          <Field label="Tagline">
            <Input value={v.tagline ?? ""} onChange={(e) => setV({ ...v, tagline: e.target.value })} placeholder="For growing brands ready to scale" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Monthly price (৳)">
              <Input type="number" min={0} step="0.01" value={monthly} onChange={(e) => setMonthly(e.target.value)} />
            </Field>
            <Field label="Yearly price (৳)" hint={discount > 0 ? `${discount}% off vs monthly` : m > 0 ? `12 × monthly = ৳${((m * 12) / 100).toLocaleString()}` : undefined}>
              <Input type="number" min={0} step="0.01" value={yearly} onChange={(e) => setYearly(e.target.value)} />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Sort order">
              <Input type="number" value={v.sort} onChange={(e) => setV({ ...v, sort: parseInt(e.target.value, 10) || 0 })} />
            </Field>
            <div className="col-span-2 space-y-2 pt-6">
              <Toggle label="Highlighted" desc="“Most popular” badge on pricing" checked={v.highlighted} onChange={(x) => setV({ ...v, highlighted: x })} />
              <Toggle label="Active" desc="Available for new subscriptions" checked={v.active} onChange={(x) => setV({ ...v, active: x })} />
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Features ({v.features.length})</h3>
            <ul className="space-y-1.5">
              {v.features.map((f, i) => (
                <li key={i} className="flex items-center gap-1">
                  <Input value={f} onChange={(e) => setV({ ...v, features: v.features.map((x, j) => (j === i ? e.target.value : x)) })} className="h-8" />
                  <Button type="button" size="icon-sm" variant="ghost" onClick={() => moveFeature(i, -1)} aria-label="Move up" disabled={i === 0}>
                    <ArrowUp />
                  </Button>
                  <Button type="button" size="icon-sm" variant="ghost" onClick={() => moveFeature(i, 1)} aria-label="Move down" disabled={i === v.features.length - 1}>
                    <ArrowDown />
                  </Button>
                  <Button type="button" size="icon-sm" variant="ghost" onClick={() => setV({ ...v, features: v.features.filter((_, j) => j !== i) })} aria-label="Remove">
                    <Trash2 />
                  </Button>
                </li>
              ))}
            </ul>
            <div className="mt-2 flex gap-2">
              <Input
                value={newFeature}
                onChange={(e) => setNewFeature(e.target.value)}
                placeholder="Add a feature, e.g. “Courier auto-booking”"
                className="h-8"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    if (newFeature.trim()) {
                      setV({ ...v, features: [...v.features, newFeature.trim()] });
                      setNewFeature("");
                    }
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  if (newFeature.trim()) {
                    setV({ ...v, features: [...v.features, newFeature.trim()] });
                    setNewFeature("");
                  }
                }}
              >
                <Plus /> Add
              </Button>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Limits</h3>
          <div className="grid grid-cols-2 gap-3">
            <LimitInput label="Products" value={v.limits.products} onChange={(x) => L("products", x)} />
            <LimitInput label="Orders / month" value={v.limits.ordersPerMonth} onChange={(x) => L("ordersPerMonth", x)} />
            <LimitInput label="Staff accounts" value={v.limits.staff} onChange={(x) => L("staff", x)} />
            <Field label="Storage (MB)" hint={v.limits.storage >= 1000 ? `≈ ${(v.limits.storage / 1000).toLocaleString()} GB` : undefined}>
              <Input type="number" min={0} value={v.limits.storage} onChange={(e) => L("storage", Math.max(0, parseInt(e.target.value, 10) || 0))} />
            </Field>
            <Field label="Transaction fee (%)" hint="Charged on each order's total">
              <Input type="number" min={0} max={100} step="0.1" value={v.limits.transactionFeePct} onChange={(e) => L("transactionFeePct", Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))} />
            </Field>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Toggle label="Custom domain" checked={v.limits.customDomain} onChange={(x) => L("customDomain", x)} />
            <Toggle label="Premium themes" checked={v.limits.premiumThemes} onChange={(x) => L("premiumThemes", x)} />
            <Toggle label="API access" checked={v.limits.apiAccess} onChange={(x) => L("apiAccess", x)} />
            <Toggle label="Remove branding" checked={v.limits.removeBranding} onChange={(x) => L("removeBranding", x)} />
          </div>
          <Field label="Limits JSON (read-only preview)">
            <Textarea readOnly value={JSON.stringify(v.limits, null, 2)} className="min-h-[180px] font-mono text-xs" />
          </Field>
        </div>
        <button type="submit" hidden />
      </form>
    </Dialog>
  );
}

export function PlanFormButton({ initial, children, variant = "default" }: { initial?: PlanFormValue; children: React.ReactNode; variant?: "default" | "outline" | "ghost" }) {
  const [open, setOpen] = React.useState(false);
  return (
    <>
      <Button size="sm" variant={variant} onClick={() => setOpen(true)}>
        {children}
      </Button>
      {open && <PlanFormDialog open onClose={() => setOpen(false)} initial={initial} />}
    </>
  );
}
