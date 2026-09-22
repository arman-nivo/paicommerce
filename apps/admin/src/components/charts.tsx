"use client";

import { AreaTrend, BarSeries, Donut, PALETTE } from "@pai/ui/charts";

const compactBdt = (minor: number) => "৳" + Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(minor / 100);

export function GmvChart({ data }: { data: { day: string; gmv: number; orders: number }[] }) {
  return <AreaTrend data={data} x="day" series={[{ key: "gmv", label: "GMV" }]} format={compactBdt} height={260} />;
}

export function MoneyTrend({ data, keys }: { data: Record<string, string | number>[]; keys: { key: string; label: string }[] }) {
  return <AreaTrend data={data} x="day" series={keys} format={compactBdt} height={240} />;
}

export function SignupsChart({ data }: { data: { day: string; stores: number; users: number }[] }) {
  return (
    <BarSeries
      data={data}
      x="day"
      series={[
        { key: "stores", label: "New stores" },
        { key: "users", label: "New users", color: PALETTE[1] },
      ]}
      height={240}
    />
  );
}

export function DonutWithLegend({ data, format }: { data: { name: string; value: number }[]; format?: "money" | "count" }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  return (
    <div>
      <div className="relative">
        <Donut data={data} height={200} />
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-xl font-bold tabular-nums">{format === "money" ? compactBdt(total) : total.toLocaleString()}</span>
          <span className="text-[11px] text-muted-foreground">total</span>
        </div>
      </div>
      <ul className="mt-3 space-y-1.5 text-sm">
        {data.map((d, i) => (
          <li key={d.name} className="flex items-center gap-2">
            <span className="size-2.5 rounded-sm" style={{ background: PALETTE[i % PALETTE.length] }} />
            <span className="flex-1 truncate text-muted-foreground">{d.name}</span>
            <span className="tabular-nums font-medium">{format === "money" ? compactBdt(d.value) : d.value.toLocaleString()}</span>
            <span className="w-12 text-right text-xs tabular-nums text-muted-foreground">{total ? ((d.value / total) * 100).toFixed(0) : 0}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
