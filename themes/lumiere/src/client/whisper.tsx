"use client";

import { Children, useEffect, useState, type ReactNode } from "react";

/**
 * Cross-fades announcement messages one at a time — slow and quiet, like a jeweller's window card.
 * Pauses on hover/focus; static (first message) for visitors who prefer reduced motion.
 */
export function Whisper({ children, interval = 6000, className }: { children: ReactNode; interval?: number; className?: string }) {
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
      className={className}
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <div key={i} className="lumiere-whisper truncate">
        {items[i]}
      </div>
    </div>
  );
}
