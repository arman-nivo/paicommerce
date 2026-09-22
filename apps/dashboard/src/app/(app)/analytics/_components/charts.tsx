"use client";
import { AreaTrend, BarSeries, Donut, PALETTE } from "@pai/ui/charts";
import { useMoney } from "@/components/store-context";

type Point = { label: string; current: number; previous?: number };

const PREV_COLOR = "#94a3b8";

export function SalesChart({ data, compare }: { data: Point[]; compare: boolean }) {
  const money = useMoney();
  // Chart values are major units so the axis reads naturally; tooltip formats them back.
  const rows = data.map((d) => ({ label: d.label, current: d.current / 100, ...(compare ? { previous: (d.previous ?? 0) / 100 } : {}) }));
  return (
    <AreaTrend
      data={rows}
      x="label"
      height={280}
      format={(v) => money(Math.round(v * 100))}
      series={[{ key: "current", label: "This period", color: PALETTE[0] }, ...(compare ? [{ key: "previous", label: "Previous period", color: PREV_COLOR }] : [])]}
    />
  );
}

export function OrdersChart({ data, compare }: { data: Point[]; compare: boolean }) {
  const rows = data.map((d) => ({ label: d.label, current: d.current, ...(compare ? { previous: d.previous ?? 0 } : {}) }));
  return (
    <BarSeries
      data={rows}
      x="label"
      height={240}
      series={[{ key: "current", label: "Orders", color: PALETTE[1] }, ...(compare ? [{ key: "previous", label: "Previous period", color: PREV_COLOR }] : [])]}
    />
  );
}

/** Donut + legend with share and money value. */
export function DonutWithLegend({ data }: { data: { name: string; value: number; count: number }[] }) {
  const money = useMoney();
  const total = data.reduce((a, d) => a + d.value, 0);
  const colored = data.map((d, i) => ({ ...d, color: PALETTE[i % PALETTE.length]! }));
  return (
    <div className="grid items-center gap-4 sm:grid-cols-[180px_1fr]">
      <div className="relative mx-auto w-full max-w-[180px]">
        <Donut data={colored.map((d) => ({ name: d.name, value: d.value / 100, color: d.color }))} height={180} />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] text-muted-foreground">Total</span>
          <span className="text-sm font-semibold tabular-nums">{money(total)}</span>
        </div>
      </div>
      <ul className="space-y-2 text-sm">
        {colored.map((d) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="size-2.5 shrink-0 rounded-sm" style={{ background: d.color }} />
            <span className="min-w-0 flex-1 truncate">{d.name}</span>
            <span className="text-xs text-muted-foreground tabular-nums">{d.count}</span>
            <span className="w-24 text-right font-medium tabular-nums">{money(d.value)}</span>
            <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">{total ? Math.round((d.value / total) * 100) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
