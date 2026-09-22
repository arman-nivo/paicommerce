"use client";

import { Children, useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@pai/ui";

/** Horizontal scroll-snap carousel with prev/next buttons (touch & keyboard friendly). */
export function Carousel({ children, className, itemClassName, label }: { children: ReactNode; className?: string; itemClassName?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [edge, setEdge] = useState({ start: true, end: false });

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setEdge({ start: el.scrollLeft < 8, end: el.scrollLeft + el.clientWidth >= el.scrollWidth - 8 });
  }, []);

  useEffect(() => {
    update();
    const el = ref.current;
    el?.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el?.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [update]);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(el.clientWidth * 0.8, 300), behavior: "smooth" });
  };

  return (
    <div className={cn("relative", className)} role="region" aria-roledescription="carousel" aria-label={label}>
      <div ref={ref} className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-4 pb-6 pt-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        {Children.map(children, (child) => (
          <div className={cn("shrink-0 snap-start", itemClassName)}>{child}</div>
        ))}
      </div>
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => scroll(-1)}
          disabled={edge.start}
          aria-label="Previous"
          className="inline-flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronLeft className="size-5" />
        </button>
        <button
          type="button"
          onClick={() => scroll(1)}
          disabled={edge.end}
          aria-label="Next"
          className="inline-flex size-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-40"
        >
          <ChevronRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
