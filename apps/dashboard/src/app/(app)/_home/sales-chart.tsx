"use client";
import { AreaTrend } from "@pai/ui/charts";
import { useMoney } from "@/components/store-context";

export function SalesChart({ data }: { data: { label: string; sales: number; previous: number }[] }) {
  const money = useMoney();
  return (
    <AreaTrend
      data={data}
      x="label"
      height={260}
      format={(v) => money(Math.round(v * 100))}
      series={[
        { key: "sales", label: "This period", color: "#2545eb" },
        { key: "previous", label: "Previous period", color: "#94a3b8" },
      ]}
    />
  );
}
