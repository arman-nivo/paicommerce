"use client";
import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, Download } from "lucide-react";
import { Button, Select, Switch } from "@pai/ui";
import { toCsv } from "@/lib/csv";
import { PRESETS } from "../_lib/range";

export function RangePicker({ preset, from, to, today, compare }: { preset: string; from: string; to: string; today: string; compare: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [custom, setCustom] = React.useState(preset === "custom");
  const [f, setF] = React.useState(from);
  const [t, setT] = React.useState(to);
  const [pending, startTransition] = React.useTransition();

  React.useEffect(() => {
    setF(from);
    setT(to);
    setCustom(preset === "custom");
  }, [from, to, preset]);

  const go = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(sp.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (v == null || v === "") next.delete(k);
      else next.set(k, v);
    }
    const s = next.toString();
    startTransition(() => router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false }));
  };

  const dateInput = "h-9 rounded-lg border border-input bg-card px-2 text-sm shadow-xs focus:border-ring focus:outline-none dark:[color-scheme:dark]";

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative">
        <CalendarDays className="pointer-events-none absolute left-2.5 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
        <Select
          aria-label="Date range"
          value={custom ? "custom" : preset}
          className="w-auto min-w-40 pl-8"
          onChange={(e) => {
            const v = e.target.value;
            if (v === "custom") setCustom(true);
            else {
              setCustom(false);
              go({ range: v === "30d" ? null : v, from: null, to: null });
            }
          }}
        >
          {PRESETS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </Select>
      </div>
      {custom && (
        <form
          className="flex flex-wrap items-center gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            if (f && t) go({ range: "custom", from: f, to: t });
          }}
        >
          <input type="date" aria-label="From" className={dateInput} value={f} max={t || today} onChange={(e) => setF(e.target.value)} />
          <span className="text-sm text-muted-foreground">to</span>
          <input type="date" aria-label="To" className={dateInput} value={t} min={f} max={today} onChange={(e) => setT(e.target.value)} />
          <Button type="submit" size="sm" disabled={!f || !t} loading={pending}>
            Apply
          </Button>
        </form>
      )}
      <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground">
        <Switch checked={compare} onChange={(e) => go({ compare: e.target.checked ? null : "off" })} />
        Compare
      </label>
      {pending && !custom && <span className="text-xs text-muted-foreground">Loading…</span>}
    </div>
  );
}

export function ExportSeriesButton({ rows, filename }: { rows: { date: string; sales: number; orders: number; visitors: number }[]; filename: string }) {
  const download = () => {
    const csv = toCsv([
      ["Date", "Sales", "Orders", "Avg. order value", "Visitors", "Conversion rate %"],
      ...rows.map((r) => [
        r.date,
        (r.sales / 100).toFixed(2),
        r.orders,
        r.orders ? (r.sales / r.orders / 100).toFixed(2) : "0.00",
        r.visitors,
        r.visitors ? ((r.orders / r.visitors) * 100).toFixed(2) : "0.00",
      ]),
    ]);
    const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  return (
    <Button variant="outline" onClick={download}>
      <Download className="size-4" /> Export
    </Button>
  );
}
