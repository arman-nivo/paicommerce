import Link from "next/link";
import { cn } from "@pai/ui";

/** "18 / 25 products" usage meter with an upgrade link near/at the limit. */
export function PlanUsage({ used, limit, planName }: { used: number; limit: number | null; planName: string }) {
  if (limit == null) return <span>{used.toLocaleString()} products · Unlimited on {planName}</span>;
  const pct = Math.min(100, Math.round((used / Math.max(1, limit)) * 100));
  const full = used >= limit;
  const near = pct >= 80;
  return (
    <span className="flex flex-wrap items-center gap-2">
      <span className={cn("tabular-nums", full && "font-medium text-red-600 dark:text-red-400")}>
        {used.toLocaleString()} / {limit.toLocaleString()} products
      </span>
      <span className="inline-block h-1.5 w-24 overflow-hidden rounded-full bg-muted" aria-hidden>
        <span className={cn("block h-full rounded-full", full ? "bg-red-500" : near ? "bg-amber-500" : "bg-primary")} style={{ width: `${pct}%` }} />
      </span>
      {near && (
        <Link href="/settings/billing" className="font-medium text-primary hover:underline">
          {full ? "Limit reached — upgrade" : "Upgrade for more"}
        </Link>
      )}
    </span>
  );
}
