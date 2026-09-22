"use client";
/**
 * Live "Open now / Closed" indicator. Computed on the client (in the restaurant's time zone) after
 * hydration, so the server HTML never disagrees with the browser clock.
 */
import { useEffect, useState } from "react";
import { openState, type DayHours, type OpenState } from "../lib/hours";

function cx(...c: (string | false | null | undefined)[]) {
  return c.filter(Boolean).join(" ");
}

export function useOpenState(week: DayHours[], timeZone: string): OpenState | null {
  const [state, setState] = useState<OpenState | null>(null);
  useEffect(() => {
    const tick = () => setState(openState(week, timeZone));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(week), timeZone]);
  return state;
}

/**
 * `fallback` renders until the status is known (and when no hours are set), e.g. "Today 11 AM – 11 PM".
 * `showDetail` appends "· Closes 11:00 PM".
 */
export function OpenStatus({
  week,
  timeZone,
  fallback,
  showDetail = true,
  className,
}: {
  week: DayHours[];
  timeZone: string;
  fallback?: string;
  showDetail?: boolean;
  className?: string;
}) {
  const state = useOpenState(week, timeZone);
  return (
    <span className={cx("inline-flex items-center gap-2", className)} aria-live="polite">
      <span
        aria-hidden
        className={cx(
          "savor-dot relative inline-block size-2 shrink-0 rounded-full",
          state ? (state.open ? "bg-[#3f9b54]" : "bg-[#c2410c]") : "bg-current opacity-40",
        )}
      >
        {state?.open ? <span className="absolute inset-0 rounded-full bg-inherit opacity-60 motion-safe:animate-ping" /> : null}
      </span>
      {state ? (
        <span>
          <strong className="font-semibold">{state.label}</strong>
          {showDetail && state.detail ? <span className="opacity-80"> · {state.detail}</span> : null}
          {fallback && !showDetail ? <span className="opacity-80"> · {fallback}</span> : null}
        </span>
      ) : (
        <span>{fallback}</span>
      )}
    </span>
  );
}

/** Weekly hours table that highlights today. Rows are plain data from the server. */
export function HoursTable({
  rows,
  timeZone,
  className,
}: {
  rows: { day: number | null; label: string; hours: string; closed: boolean }[];
  timeZone: string;
  className?: string;
}) {
  const [today, setToday] = useState<number | null>(null);
  useEffect(() => {
    try {
      const wd = new Intl.DateTimeFormat("en-US", { timeZone, weekday: "short" }).format(new Date());
      setToday(["sun", "mon", "tue", "wed", "thu", "fri", "sat"].indexOf(wd.toLowerCase().slice(0, 3)));
    } catch {
      setToday(new Date().getDay());
    }
  }, [timeZone]);
  return (
    <dl className={cx("divide-y divide-dashed divide-pai-border", className)}>
      {rows.map((r, i) => {
        const isToday = r.day !== null && r.day === today;
        return (
          <div key={i} className={cx("flex items-baseline justify-between gap-4 py-2.5", isToday && "savor-today font-semibold")}>
            <dt className="flex items-center gap-2">
              {r.label}
              {isToday ? <span className="rounded-full bg-pai-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-pai-primary-fg">Today</span> : null}
            </dt>
            <dd className={cx("text-right tabular-nums", r.closed ? "opacity-60" : "opacity-90")}>{r.closed ? "Closed" : r.hours}</dd>
          </div>
        );
      })}
    </dl>
  );
}
