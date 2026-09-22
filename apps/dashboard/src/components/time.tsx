"use client";
import { timeAgo } from "@pai/core";

/** Relative time ("3 hours ago") with an absolute tooltip. Client-rendered to avoid hydration drift. */
export function RelativeTime({ date, className }: { date: Date | string; className?: string }) {
  const d = new Date(date);
  return (
    <time dateTime={d.toISOString()} title={d.toLocaleString("en-GB", { timeZone: "Asia/Dhaka" })} className={className} suppressHydrationWarning>
      {timeAgo(d)}
    </time>
  );
}
