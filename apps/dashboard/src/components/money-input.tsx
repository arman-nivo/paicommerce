"use client";
import * as React from "react";
import { cn } from "@pai/ui";

/**
 * Money input in MAJOR units (what merchants type) — value/onChange use minor units.
 * <MoneyInput value={price} onChange={setPrice} />  // price = 125000 → shows 1250
 */
export function MoneyInput({ value, onChange, symbol = "৳", placeholder = "0", className, allowEmpty, ...rest }: { value: number | null; onChange: (minor: number | null) => void; symbol?: string; placeholder?: string; className?: string; allowEmpty?: boolean } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "value" | "onChange">) {
  const [text, setText] = React.useState(value == null ? "" : String(value / 100));
  React.useEffect(() => {
    const cur = text === "" ? null : Math.round(parseFloat(text) * 100);
    if (cur !== value) setText(value == null ? "" : String(value / 100));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);
  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{symbol}</span>
      <input
        inputMode="decimal"
        value={text}
        placeholder={placeholder}
        onChange={(e) => {
          const t = e.target.value.replace(/[^0-9.]/g, "");
          setText(t);
          if (t === "") onChange(allowEmpty ? null : 0);
          else if (!Number.isNaN(parseFloat(t))) onChange(Math.round(parseFloat(t) * 100));
        }}
        className="h-9 w-full rounded-lg border border-input bg-card pl-7 pr-3 text-sm tabular-nums shadow-xs placeholder:text-muted-foreground/70 focus:border-ring focus:outline-none focus:ring-3 focus:ring-ring/15"
        {...rest}
      />
    </div>
  );
}
