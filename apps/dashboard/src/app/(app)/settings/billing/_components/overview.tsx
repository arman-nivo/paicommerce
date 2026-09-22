import { Check, CreditCard, Globe, HardDrive, Code, Package, Palette, ShoppingBag, Users, X } from "lucide-react";
import type { PlanLimits } from "@pai/db";
import { Badge, Card, CardHeader, cn } from "@pai/ui";
import { formatDate, formatMoney, formatNumber } from "@/lib/format";

const STATUS: Record<string, { tone: "green" | "blue" | "yellow" | "red" | "gray"; label: string }> = {
  trial: { tone: "blue", label: "Free trial" },
  active: { tone: "green", label: "Active" },
  past_due: { tone: "red", label: "Payment overdue" },
  suspended: { tone: "red", label: "Suspended" },
  closed: { tone: "gray", label: "Closed" },
};

export function CurrentPlanCard(p: {
  name: string;
  price: number;
  currency: string;
  interval: "monthly" | "yearly";
  status: string;
  trialDaysLeft: number | null;
  trialEndsAt: string | null;
  renewsAt: string | null;
  transactionFeePct: number;
}) {
  const st = STATUS[p.status] ?? STATUS.active!;
  return (
    <Card className="flex flex-col p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary">
            <CreditCard className="size-5" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">Current plan</p>
            <p className="font-display text-lg font-semibold">{p.name}</p>
          </div>
        </div>
        <Badge tone={st.tone} dot>
          {st.label}
        </Badge>
      </div>
      <p className="mt-4 font-display text-3xl font-semibold">
        {p.price ? formatMoney(p.price, p.currency) : "Free"}
        {p.price > 0 && <span className="text-sm font-normal text-muted-foreground"> / {p.interval === "yearly" ? "year" : "month"}</span>}
      </p>
      <div className="mt-3 space-y-1 text-sm text-muted-foreground">
        {p.status === "trial" && p.trialDaysLeft != null && (
          <p className={cn(p.trialDaysLeft <= 3 && "font-medium text-amber-700 dark:text-amber-400")}>
            {p.trialDaysLeft === 0 ? "Your trial ends today" : `${p.trialDaysLeft} day${p.trialDaysLeft === 1 ? "" : "s"} left in your trial`} · ends {formatDate(p.trialEndsAt)}
          </p>
        )}
        {p.status === "active" && p.renewsAt && p.price > 0 && <p>Renews on {formatDate(p.renewsAt)}</p>}
        {p.status === "past_due" && <p className="font-medium text-red-600 dark:text-red-400">Please pay your open invoice below to keep your store online.</p>}
        <p>{p.transactionFeePct > 0 ? `${p.transactionFeePct}% transaction fee on online payments` : "No transaction fees"}</p>
      </div>
      {p.status === "trial" && p.trialDaysLeft != null && (
        <div className="mt-auto pt-4">
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, Math.min(100, (p.trialDaysLeft / 14) * 100))}%` }} />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">Pick a plan below any time — your trial settings and data carry over.</p>
        </div>
      )}
    </Card>
  );
}

function Meter({ icon, label, used, limit, unit = "" }: { icon: React.ReactNode; label: string; used: number; limit: number | null; unit?: string }) {
  const ratio = limit ? used / limit : 0;
  const tone = limit == null ? "bg-primary" : ratio >= 1 ? "bg-red-500" : ratio >= 0.8 ? "bg-amber-500" : "bg-primary";
  return (
    <div>
      <div className="flex items-center justify-between gap-2 text-sm">
        <span className="flex items-center gap-2 font-medium [&_svg]:size-4 [&_svg]:text-muted-foreground">
          {icon}
          {label}
        </span>
        <span className="tabular-nums text-muted-foreground">
          <span className="font-medium text-foreground">
            {formatNumber(used)}
            {unit}
          </span>{" "}
          / {limit == null ? "Unlimited" : `${formatNumber(limit)}${unit}`}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
        <div className={cn("h-full rounded-full transition-all", tone)} style={{ width: limit == null ? "100%" : `${Math.min(100, Math.max(used > 0 ? 2 : 0, ratio * 100))}%`, opacity: limit == null ? 0.25 : 1 }} />
      </div>
      {limit != null && ratio >= 1 && <p className="mt-1 text-xs text-red-600 dark:text-red-400">Limit reached — upgrade to add more.</p>}
    </div>
  );
}

function Feature({ icon, label, on }: { icon: React.ReactNode; label: string; on: boolean }) {
  return (
    <div className={cn("flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm [&>svg:first-child]:size-4", !on && "text-muted-foreground")}>
      {icon}
      <span className="flex-1">{label}</span>
      {on ? <Check className="size-4 text-emerald-600" /> : <X className="size-4 text-muted-foreground" />}
    </div>
  );
}

export function UsageCard({ usage, limits, className }: { usage: { products: number; orders: number; staff: number; storageMb: number }; limits: PlanLimits; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader title="Usage" description="What you're using this month vs. your plan's limits" />
      <div className="grid gap-5 p-5 sm:grid-cols-2">
        <Meter icon={<Package />} label="Products" used={usage.products} limit={limits.products} />
        <Meter icon={<ShoppingBag />} label="Orders this month" used={usage.orders} limit={limits.ordersPerMonth} />
        <Meter icon={<Users />} label="Staff seats" used={usage.staff} limit={limits.staff} />
        <Meter icon={<HardDrive />} label="Storage" used={usage.storageMb} limit={limits.storage} unit=" MB" />
      </div>
      <div className="grid gap-2 border-t border-border p-5 sm:grid-cols-3">
        <Feature icon={<Globe />} label="Custom domain" on={limits.customDomain} />
        <Feature icon={<Palette />} label="Premium themes" on={limits.premiumThemes} />
        <Feature icon={<Code />} label="API access" on={limits.apiAccess} />
      </div>
    </Card>
  );
}
