"use client";

import { Children, useEffect, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Cycles through announcement messages one at a time (fade), with previous/next buttons.
 * Pauses on hover/focus and when the user prefers reduced motion.
 */
export function Rotator({ children, interval = 4500 }: { children: ReactNode; interval?: number }) {
  const items = Children.toArray(children);
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  const n = items.length;

  useEffect(() => {
    if (n < 2 || paused) return;
    if (typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % n), interval);
    return () => clearInterval(t);
  }, [n, paused, interval]);

  if (!n) return null;
  return (
    <div
      className="flex items-center justify-center gap-2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      {n > 1 ? (
        <button type="button" aria-label="Previous announcement" onClick={() => setI((x) => (x - 1 + n) % n)} className="grid size-7 place-items-center rounded-full opacity-60 transition hover:opacity-100 focus-visible:outline-2 focus-visible:outline-current">
          <ChevronLeft className="size-3.5" />
        </button>
      ) : null}
      <div className="relative min-w-0 flex-1 text-center sm:flex-none sm:min-w-[22rem]" aria-live="polite">
        <div key={i} className="animate-pai-fade truncate">
          {items[i]}
        </div>
      </div>
      {n > 1 ? (
        <button type="button" aria-label="Next announcement" onClick={() => setI((x) => (x + 1) % n)} className="grid size-7 place-items-center rounded-full opacity-60 transition hover:opacity-100 focus-visible:outline-2 focus-visible:outline-current">
          <ChevronRight className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}
