import Link from "next/link";
import { Ban, Lock, ShieldAlert, ShieldCheck, Sparkles, TriangleAlert } from "lucide-react";
import { Badge, Card, CardBody, CardHeader, cn } from "@pai/ui";
import type { FraudStats } from "../../_lib/fraud";

const VERDICT = {
  new: { label: "New customer", text: "No delivery history with your store yet. Call to confirm before shipping big orders.", icon: Sparkles, tone: "blue" as const, bar: "bg-blue-500" },
  trusted: { label: "Trusted", text: "Receives most of their orders. Safe to ship.", icon: ShieldCheck, tone: "green" as const, bar: "bg-emerald-500" },
  caution: { label: "Be careful", text: "Has refused or returned some orders. Call to confirm first.", icon: TriangleAlert, tone: "yellow" as const, bar: "bg-amber-500" },
  risky: { label: "Risky", text: "Often cancels or returns. Ask for an advance delivery charge before shipping.", icon: ShieldAlert, tone: "red" as const, bar: "bg-red-500" },
};

export function FraudPanel({ stats }: { stats: FraudStats | null }) {
  return (
    <>
      <Card>
        <CardHeader title="Fraud check" description="Based on this phone number's orders in your store." />
        <CardBody className="space-y-4">
          {!stats ? (
            <p className="text-sm text-muted-foreground">No phone number on this order — can't check history.</p>
          ) : (
            <>
              {stats.blocked && (
                <div className="flex items-start gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
                  <Ban className="mt-0.5 size-4 shrink-0" />
                  <span>
                    <b>{stats.phone}</b> is on your blocked list.{" "}
                    <Link href="/settings/fraud" className="underline">
                      Manage
                    </Link>
                  </span>
                </div>
              )}
              <Verdict stats={stats} />
              <div className="grid grid-cols-3 gap-2 text-center">
                <Stat label="Orders" value={stats.total} />
                <Stat label="Delivered" value={stats.delivered} className="text-emerald-600 dark:text-emerald-400" />
                <Stat label="Cancel/return" value={stats.failed} className={stats.failed ? "text-red-600 dark:text-red-400" : undefined} />
              </div>
              {stats.inProgress > 0 && <p className="text-xs text-muted-foreground">{stats.inProgress} other order{stats.inProgress === 1 ? " is" : "s are"} still in progress.</p>}
            </>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Courier success rate" description="Across all couriers in Bangladesh" action={<Badge tone="purple">Pro</Badge>} />
        <CardBody className="space-y-3">
          <div className="pointer-events-none select-none space-y-2 opacity-50" aria-hidden>
            {["Steadfast", "Pathao", "RedX"].map((c, i) => (
              <div key={c} className="flex items-center gap-2 text-xs">
                <span className="w-16 text-muted-foreground">{c}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full rounded-full bg-muted-foreground/30" style={{ width: `${[72, 55, 38][i]}%` }} />
                </div>
                <span className="w-8 text-right text-muted-foreground">••%</span>
              </div>
            ))}
          </div>
          <p className="flex items-start gap-2 text-sm text-muted-foreground">
            <Lock className="mt-0.5 size-4 shrink-0" />
            <span>Connect Steadfast/Pathao to see this customer&apos;s delivery success rate across all couriers — spot fake orders before you ship. Coming soon.</span>
          </p>
          <Link href="/settings/couriers" className="text-sm font-medium text-primary hover:underline">
            Connect couriers →
          </Link>
        </CardBody>
      </Card>
    </>
  );
}

function Verdict({ stats }: { stats: FraudStats }) {
  const v = VERDICT[stats.verdict];
  const Icon = v.icon;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-2">
        <Badge tone={v.tone}>
          <Icon className="size-3.5" /> {v.label}
        </Badge>
        <span className="font-display text-xl font-bold tabular-nums">{stats.ratio == null ? "—" : `${stats.ratio}%`}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={stats.ratio ?? 0} aria-label="Delivery success ratio">
        <div className={cn("h-full rounded-full transition-all", v.bar)} style={{ width: `${stats.ratio ?? 0}%` }} />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">{v.text}</p>
    </div>
  );
}

function Stat({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className="rounded-lg bg-muted/60 px-2 py-2">
      <div className={cn("text-lg font-semibold tabular-nums", className)}>{value}</div>
      <div className="text-[11px] text-muted-foreground">{label}</div>
    </div>
  );
}
