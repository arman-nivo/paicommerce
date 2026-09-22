import { cn } from "@pai/ui";

/** Styled text wordmarks for local payment & courier partners (not official logos). */
export const PAYMENT_MARKS = [
  { name: "bKash", color: "#e2136e", style: "font-extrabold italic tracking-tight" },
  { name: "Nagad", color: "#f6921e", style: "font-extrabold tracking-tight" },
  { name: "Rocket", color: "#8c3494", style: "font-bold tracking-tight" },
  { name: "SSLCOMMERZ", color: "#1d4ed8", style: "font-black tracking-tighter text-[0.85em]" },
  { name: "aamarPay", color: "#0ea5e9", style: "font-bold" },
  { name: "Stripe", color: "#635bff", style: "font-bold tracking-tight" },
  { name: "Cash on Delivery", color: "#16a34a", style: "font-bold text-[0.8em] uppercase tracking-wider" },
] as const;

export const COURIER_MARKS = [
  { name: "Steadfast", color: "#0f766e", style: "font-extrabold tracking-tight" },
  { name: "Pathao", color: "#e11d48", style: "font-extrabold lowercase tracking-tight" },
  { name: "RedX", color: "#dc2626", style: "font-black italic" },
  { name: "Paperfly", color: "#7c3aed", style: "font-bold" },
] as const;

export function Wordmark({ name, color, style, className, dark }: { name: string; color: string; style: string; className?: string; dark?: boolean }) {
  return (
    <span
      className={cn("inline-flex h-12 items-center justify-center rounded-xl px-5 font-display text-lg ring-1", dark ? "bg-white/[0.04] ring-white/10" : "bg-white ring-slate-200", style, className)}
      style={{ color }}
    >
      {name}
    </span>
  );
}
