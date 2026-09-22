"use client";

import { useEffect, useState } from "react";

/** Next midnight in a fixed UTC offset (minutes), e.g. Dhaka = +360. */
function nextMidnight(offsetMin: number, now: number): number {
  const local = now + offsetMin * 60_000;
  const d = new Date(local);
  const midnightLocal = Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() + 1);
  return midnightLocal - offsetMin * 60_000;
}

/**
 * Compact hh:mm:ss countdown. `to` = fixed end (ISO); without it the timer counts down to the
 * next local midnight (daily deals), which resets automatically every day.
 */
export function DealTimer({ to, offsetMinutes = 360, endedLabel = "Deal ended", className }: { to?: string; offsetMinutes?: number; endedLabel?: string; className?: string }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  const fixed = to ? new Date(to).getTime() : NaN;
  const target = now == null ? 0 : Number.isFinite(fixed) ? fixed : nextMidnight(offsetMinutes, now);
  const left = now == null ? -1 : Math.max(0, target - now);
  if (left === 0) return <span className={"font-bold " + (className ?? "")}>{endedLabel}</span>;
  const h = Math.floor(left / 3_600_000);
  const m = Math.floor((left % 3_600_000) / 60_000);
  const s = Math.floor((left % 60_000) / 1000);
  const cell = (n: number, label: string) => (
    <span className="inline-flex flex-col items-center">
      <span className="fm-timer-cell grid min-w-9 place-items-center rounded-md bg-pai-fg px-1.5 py-1 font-heading text-base font-bold tabular-nums text-pai-bg md:min-w-11 md:text-xl" suppressHydrationWarning>
        {left < 0 ? "--" : String(n).padStart(2, "0")}
      </span>
      <span className="sr-only">{label}</span>
    </span>
  );
  return (
    <span role="timer" aria-live="off" className={"inline-flex items-center gap-1 " + (className ?? "")}>
      {cell(h, "hours")}
      <span aria-hidden className="font-bold">:</span>
      {cell(m, "minutes")}
      <span aria-hidden className="font-bold">:</span>
      {cell(s, "seconds")}
    </span>
  );
}
