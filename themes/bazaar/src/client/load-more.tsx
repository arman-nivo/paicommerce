"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Link } from "@pai/theme-kit/client";

/**
 * "Just for you" feed: the server renders every card; this island reveals them `step` at a time
 * (button, or automatically when the sentinel scrolls into view if `auto`), then links to the full
 * catalogue once everything is shown.
 */
export function LoadMoreGrid({
  children,
  initial,
  step,
  auto = false,
  className,
  buttonLabel = "Load more",
  moreLabel = "Browse all products",
  moreHref,
}: {
  children: ReactNode;
  initial: number;
  step: number;
  auto?: boolean;
  className?: string;
  buttonLabel?: string;
  moreLabel?: string;
  moreHref: string;
}) {
  const items = Children.toArray(children);
  const [shown, setShown] = useState(Math.min(initial, items.length));
  const sentinel = useRef<HTMLDivElement>(null);
  const grid = useRef<HTMLUListElement>(null);
  const remaining = items.length - shown;

  const more = () => {
    const before = shown;
    setShown((n) => Math.min(items.length, n + step));
    // Move focus to the first newly revealed card for keyboard / screen-reader users.
    requestAnimationFrame(() => {
      const el = grid.current?.children[before]?.querySelector<HTMLElement>("a[href]:not([tabindex='-1'])");
      el?.focus({ preventScroll: true });
    });
  };

  useEffect(() => {
    if (!auto || remaining <= 0 || !sentinel.current) return;
    const io = new IntersectionObserver((entries) => entries.some((e) => e.isIntersecting) && setShown((n) => Math.min(items.length, n + step)), { rootMargin: "400px" });
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [auto, remaining, step, items.length]);

  return (
    <div>
      <ul ref={grid} className={className}>
        {items.map((child, i) => (
          <li key={i} hidden={i >= shown} className="bz-feed-item">
            {child}
          </li>
        ))}
      </ul>
      <div ref={sentinel} className="mt-5 flex flex-col items-center gap-2">
        {remaining > 0 ? (
          <>
            <button type="button" onClick={more} className="bz-load-more pai-btn pai-btn-secondary min-w-64">
              {buttonLabel} <ChevronDown className="size-4" aria-hidden />
            </button>
            <p className="text-xs opacity-60" aria-live="polite">
              Showing {shown} of {items.length}
            </p>
          </>
        ) : (
          <Link href={moreHref} className="bz-load-more pai-btn pai-btn-primary min-w-64">
            {moreLabel} <ArrowRight className="size-4" aria-hidden />
          </Link>
        )}
      </div>
    </div>
  );
}
