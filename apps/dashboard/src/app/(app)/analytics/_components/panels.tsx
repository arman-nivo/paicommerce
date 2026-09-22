import { cn } from "@pai/ui";
import type { Funnel } from "../_lib/queries";

const STEPS: { key: keyof Funnel; label: string; hint: string }[] = [
  { key: "pageViews", label: "Page views", hint: "Store pages opened" },
  { key: "productViews", label: "Product views", hint: "Product pages opened" },
  { key: "addToCarts", label: "Added to cart", hint: "Add-to-cart clicks" },
  { key: "checkouts", label: "Reached checkout", hint: "Checkout started" },
  { key: "orders", label: "Orders placed", hint: "Completed checkouts" },
];

/** Horizontal conversion funnel with step conversion and drop-off. */
export function FunnelChart({ data }: { data: Funnel }) {
  const top = Math.max(1, data.pageViews);
  return (
    <ol className="space-y-3">
      {STEPS.map((s, i) => {
        const v = data[s.key];
        const prevKey = i > 0 ? STEPS[i - 1]!.key : null;
        const prev = prevKey ? data[prevKey] : null;
        const stepRate = prev ? (v / prev) * 100 : null;
        const drop = prev != null ? Math.max(0, prev - v) : 0;
        const width = Math.max(2, Math.min(100, (v / top) * 100));
        return (
          <li key={s.key}>
            {i > 0 && (
              <div className="mb-1 flex items-center gap-2 pl-1 text-[11px] text-muted-foreground">
                <span className="font-medium text-foreground tabular-nums">{stepRate == null || !Number.isFinite(stepRate) ? "—" : `${stepRate.toFixed(1)}%`}</span>
                continued
                {drop > 0 && <span className="text-red-600 tabular-nums dark:text-red-400">· {drop.toLocaleString()} dropped off</span>}
              </div>
            )}
            <div className="flex items-center gap-3">
              <div className="w-32 shrink-0 sm:w-36">
                <div className="text-sm font-medium">{s.label}</div>
                <div className="text-[11px] text-muted-foreground">{s.hint}</div>
              </div>
              <div className="relative h-8 flex-1 overflow-hidden rounded-md bg-muted">
                <div
                  className={cn("h-full rounded-md transition-all", i === STEPS.length - 1 ? "bg-emerald-500" : "bg-primary")}
                  style={{ width: `${width}%`, opacity: 1 - i * 0.12 }}
                />
              </div>
              <div className="w-16 shrink-0 text-right text-sm font-semibold tabular-nums">{v.toLocaleString()}</div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** Simple ranked horizontal bars (sources, zones, statuses). */
export function BarList({ items, valueLabel }: { items: { label: string; value: number; display: string; sub?: string; tone?: "green" | "red" | "amber" | "default" }[]; valueLabel?: string }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (!items.length) return <p className="py-6 text-center text-sm text-muted-foreground">No data for this period</p>;
  return (
    <div>
      {valueLabel && <div className="mb-2 text-right text-[11px] uppercase tracking-wide text-muted-foreground">{valueLabel}</div>}
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.label} className="relative flex h-9 items-center overflow-hidden rounded-md">
            <div
              className={cn(
                "absolute inset-y-0 left-0 rounded-md",
                it.tone === "green" && "bg-emerald-500/15",
                it.tone === "red" && "bg-red-500/15",
                it.tone === "amber" && "bg-amber-500/15",
                (!it.tone || it.tone === "default") && "bg-primary/12",
              )}
              style={{ width: `${Math.max(2, (it.value / max) * 100)}%` }}
            />
            <span className="relative z-10 min-w-0 flex-1 truncate px-2.5 text-sm">{it.label}</span>
            {it.sub && <span className="relative z-10 px-2 text-xs text-muted-foreground tabular-nums">{it.sub}</span>}
            <span className="relative z-10 px-2.5 text-sm font-medium tabular-nums">{it.display}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
