import { ShieldAlert, ShieldCheck } from "lucide-react";
import { Card, CardBody, CardHeader, cn } from "@pai/ui";

/** Delivery success ratio (delivered vs cancelled/returned) — a quick fraud signal for COD merchants. */
export function DeliveryPanel({ delivered, cancelled, returned, inTransit, minRate }: { delivered: number; cancelled: number; returned: number; inTransit: number; minRate: number | null }) {
  const settled = delivered + cancelled + returned;
  const rate = settled ? Math.round((delivered / settled) * 100) : null;
  const threshold = minRate ?? 70;
  const risky = rate != null && settled >= 2 && rate < threshold;
  const tone = rate == null ? "muted" : risky ? "bad" : rate >= 90 ? "good" : "ok";

  return (
    <Card>
      <CardHeader title="Delivery success" description="Delivered vs. cancelled or returned orders" />
      <CardBody className="space-y-4">
        {rate == null ? (
          <p className="text-sm text-muted-foreground">No completed deliveries yet{inTransit ? ` — ${inTransit} order${inTransit === 1 ? " is" : "s are"} on the way.` : "."}</p>
        ) : (
          <>
            <div className="flex items-end justify-between">
              <span
                className={cn(
                  "font-display text-3xl font-bold tabular-nums",
                  tone === "good" && "text-emerald-600 dark:text-emerald-400",
                  tone === "ok" && "text-amber-600 dark:text-amber-400",
                  tone === "bad" && "text-red-600 dark:text-red-400",
                )}
              >
                {rate}%
              </span>
              <span className="text-xs text-muted-foreground">{settled} settled orders</span>
            </div>
            <div className="flex h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden>
              <div className="bg-emerald-500" style={{ width: `${(delivered / settled) * 100}%` }} />
              <div className="bg-amber-500" style={{ width: `${(returned / settled) * 100}%` }} />
              <div className="bg-red-500" style={{ width: `${(cancelled / settled) * 100}%` }} />
            </div>
            <dl className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="rounded-lg bg-muted/60 p-2">
                <dt className="flex items-center justify-center gap-1 text-muted-foreground">
                  <span className="size-2 rounded-full bg-emerald-500" /> Delivered
                </dt>
                <dd className="mt-0.5 text-sm font-semibold tabular-nums">{delivered}</dd>
              </div>
              <div className="rounded-lg bg-muted/60 p-2">
                <dt className="flex items-center justify-center gap-1 text-muted-foreground">
                  <span className="size-2 rounded-full bg-amber-500" /> Returned
                </dt>
                <dd className="mt-0.5 text-sm font-semibold tabular-nums">{returned}</dd>
              </div>
              <div className="rounded-lg bg-muted/60 p-2">
                <dt className="flex items-center justify-center gap-1 text-muted-foreground">
                  <span className="size-2 rounded-full bg-red-500" /> Cancelled
                </dt>
                <dd className="mt-0.5 text-sm font-semibold tabular-nums">{cancelled}</dd>
              </div>
            </dl>
            {risky ? (
              <p className="flex gap-2 rounded-lg bg-red-50 p-2.5 text-xs text-red-800 dark:bg-red-500/10 dark:text-red-300">
                <ShieldAlert className="size-4 shrink-0" /> Below your {threshold}% threshold. Consider asking for an advance delivery charge before shipping COD orders.
              </p>
            ) : (
              <p className="flex gap-2 text-xs text-muted-foreground">
                <ShieldCheck className="size-4 shrink-0 text-emerald-600" /> Looks like a trustworthy customer.
              </p>
            )}
          </>
        )}
      </CardBody>
    </Card>
  );
}
