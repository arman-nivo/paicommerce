"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Check, CircleCheck, Sparkles, TriangleAlert } from "lucide-react";
import type { PlanLimits } from "@pai/db";
import { Badge, Button, Card, Dialog, cn } from "@pai/ui";
import { run } from "@/lib/client";
import { formatMoney } from "@/lib/format";
import { changePlan } from "../actions";
import { PAY_METHODS, type PayMethod } from "./methods";

export type PlanView = {
  id: string;
  code: string;
  name: string;
  tagline: string | null;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: string[];
  highlighted: boolean;
  limits: PlanLimits;
};

type Usage = { products: number; orders: number; staff: number; storageMb: number };
type Interval = "monthly" | "yearly";

function limitWarnings(l: PlanLimits, u: Usage) {
  const w: string[] = [];
  if (l.products != null && u.products > l.products) w.push(`You have ${u.products} products; this plan allows ${l.products}. Extra products stay saved but you can't add new ones.`);
  if (l.ordersPerMonth != null && u.orders > l.ordersPerMonth) w.push(`You've had ${u.orders} orders this month; this plan allows ${l.ordersPerMonth}/month.`);
  if (l.staff != null && u.staff > l.staff) w.push(`You have ${u.staff} team members; this plan includes ${l.staff} seat${l.staff === 1 ? "" : "s"}.`);
  if (u.storageMb > l.storage) w.push(`You're using ${u.storageMb} MB of storage; this plan includes ${l.storage} MB.`);
  if (!l.customDomain) w.push("Custom domains aren't included — your store will use its PaiCommerce address.");
  if (!l.apiAccess) w.push("API keys and webhooks will stop working.");
  return w;
}

export function PlanGrid({ plans, currentPlanId, currentInterval, isTrial, usage }: { plans: PlanView[]; currentPlanId: string | null; currentInterval: Interval; isTrial: boolean; usage: Usage }) {
  const [interval, setInterval] = React.useState<Interval>(currentInterval);
  const [selected, setSelected] = React.useState<PlanView | null>(null);
  const current = plans.find((p) => p.id === currentPlanId);
  const maxSaving = Math.max(0, ...plans.filter((p) => p.priceMonthly > 0).map((p) => Math.round((1 - p.priceYearly / (p.priceMonthly * 12)) * 100)));

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Compare plans</h2>
          <p className="text-sm text-muted-foreground">Upgrade or downgrade any time. Changes apply immediately.</p>
        </div>
        <div className="inline-flex rounded-lg border border-border bg-muted p-0.5 text-sm" role="radiogroup" aria-label="Billing interval">
          {(["monthly", "yearly"] as const).map((i) => (
            <button
              key={i}
              role="radio"
              aria-checked={interval === i}
              onClick={() => setInterval(i)}
              className={cn("rounded-md px-3 py-1.5 font-medium transition", interval === i ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground")}
            >
              {i === "monthly" ? "Monthly" : "Yearly"}
              {i === "yearly" && maxSaving > 0 && <span className="ml-1.5 text-xs text-emerald-600 dark:text-emerald-400">save up to {maxSaving}%</span>}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((p) => {
          const isCurrent = p.id === currentPlanId;
          const price = interval === "yearly" ? p.priceYearly : p.priceMonthly;
          const saving = p.priceMonthly > 0 ? p.priceMonthly * 12 - p.priceYearly : 0;
          const exact = isCurrent && !isTrial && (p.priceMonthly === 0 || interval === currentInterval);
          const isDowngrade = !!current && p.priceMonthly < current.priceMonthly;
          return (
            <Card key={p.id} className={cn("relative flex flex-col p-5", p.highlighted && "border-primary ring-1 ring-primary", isCurrent && "bg-accent/40")}>
              <div className="flex items-center justify-between gap-2">
                <p className="font-display text-lg font-semibold">{p.name}</p>
                {isCurrent ? (
                  <Badge tone="green" dot>
                    Current
                  </Badge>
                ) : p.highlighted ? (
                  <Badge tone="brand">
                    <Sparkles className="size-3" /> Most popular
                  </Badge>
                ) : null}
              </div>
              {p.tagline && <p className="mt-1 text-xs text-muted-foreground">{p.tagline}</p>}
              <p className="mt-4 font-display text-2xl font-semibold">
                {price ? formatMoney(price, p.currency) : "Free"}
                {price > 0 && <span className="text-sm font-normal text-muted-foreground"> / {interval === "yearly" ? "year" : "month"}</span>}
              </p>
              <p className="h-5 text-xs text-emerald-600 dark:text-emerald-400">
                {interval === "yearly" && saving > 0 ? `Save ${formatMoney(saving, p.currency)} a year` : interval === "monthly" && saving > 0 ? `or ${formatMoney(p.priceYearly, p.currency)}/year` : ""}
              </p>
              <ul className="mt-4 flex-1 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button className="mt-5 w-full" variant={exact ? "outline" : p.highlighted ? "default" : isDowngrade ? "outline" : "secondary"} disabled={exact} onClick={() => setSelected(p)}>
                {exact ? "Your plan" : isCurrent ? (isTrial ? "Activate plan" : `Switch to ${interval}`) : isDowngrade ? "Downgrade" : "Upgrade"}
              </Button>
            </Card>
          );
        })}
      </div>
      <ChangePlanDialog plan={selected} interval={interval} current={current ?? null} usage={usage} onClose={() => setSelected(null)} />
    </section>
  );
}

function ChangePlanDialog({ plan, interval, current, usage, onClose }: { plan: PlanView | null; interval: Interval; current: PlanView | null; usage: Usage; onClose: () => void }) {
  const router = useRouter();
  const [method, setMethod] = React.useState<PayMethod>("bkash");
  const [saving, setSaving] = React.useState(false);
  const [done, setDone] = React.useState<{ planName: string; invoice: string | null } | null>(null);
  if (!plan && !done) return null;

  const close = () => {
    onClose();
    setDone(null);
  };

  if (done) {
    return (
      <Dialog open onClose={close} title="Plan updated" footer={<Button onClick={close}>Done</Button>}>
        <div className="flex items-start gap-3">
          <CircleCheck className="mt-0.5 size-5 shrink-0 text-emerald-600" />
          <p className="text-sm">
            You&apos;re now on the <span className="font-medium">{done.planName}</span> plan.
            {done.invoice && ` Invoice ${done.invoice} has been paid and added to your billing history.`}
          </p>
        </div>
      </Dialog>
    );
  }
  const p = plan!;
  const amount = interval === "yearly" ? p.priceYearly : p.priceMonthly;
  const free = amount === 0;
  const downgrade = !!current && p.priceMonthly < current.priceMonthly;
  const warnings = downgrade ? limitWarnings(p.limits, usage).filter((w) => (current ? !limitWarnings(current.limits, usage).includes(w) : true)) : [];

  async function confirm() {
    setSaving(true);
    const res = await run(changePlan({ planId: p.id, interval, method }));
    setSaving(false);
    if (res) {
      setDone(res);
      router.refresh();
    }
  }

  return (
    <Dialog
      open
      onClose={close}
      title={downgrade ? `Downgrade to ${p.name}` : `Switch to ${p.name}`}
      description={free ? "No payment needed." : "Review and pay to activate immediately."}
      footer={
        <>
          <Button variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button variant={downgrade ? "destructive" : "default"} onClick={confirm} loading={saving}>
            {free ? `Switch to ${p.name}` : `Pay ${formatMoney(amount, p.currency)}`}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-border p-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Plan</span>
            <span className="font-medium">{p.name}</span>
          </div>
          <div className="mt-2 flex justify-between">
            <span className="text-muted-foreground">Billing</span>
            <span className="font-medium capitalize">{free ? "—" : interval}</span>
          </div>
          <div className="mt-2 flex justify-between border-t border-border pt-2">
            <span className="text-muted-foreground">Due today</span>
            <span className="font-display text-base font-semibold">{free ? "৳0" : formatMoney(amount, p.currency)}</span>
          </div>
        </div>
        {warnings.length > 0 && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
            <p className="flex items-center gap-2 font-medium">
              <TriangleAlert className="size-4" /> Before you downgrade
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-[13px]">
              {warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        )}
        {!free && (
          <div>
            <p className="mb-2 text-sm font-medium">Pay with</p>
            <div className="grid grid-cols-3 gap-2">
              {PAY_METHODS.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setMethod(m.value)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-sm font-medium transition",
                    method === m.value ? "border-primary bg-accent ring-1 ring-primary" : "border-border hover:border-primary/40",
                  )}
                >
                  <span className="size-3 rounded-full" style={{ background: m.color }} />
                  {m.label}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Payments are processed securely. You&apos;ll receive an invoice for your records.</p>
          </div>
        )}
      </div>
    </Dialog>
  );
}
