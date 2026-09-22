"use client";

import { useEffect, useState } from "react";
import { ArrowUp, TextQuote } from "lucide-react";

export type TocItem = { id: string; text: string; depth: number };

/** "On this page" table of contents with scroll-spy. */
export function DocsToc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    if (!items.length) return;
    const els = items.map((i) => document.getElementById(i.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length) return;

    const onScroll = () => {
      // The active heading is the last one whose top has passed ~120px from the viewport top.
      const offset = 120;
      let current = els[0]!.id;
      for (const el of els) {
        if (el.getBoundingClientRect().top - offset <= 0) current = el.id;
        else break;
      }
      // At the very bottom, highlight the last heading.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = els[els.length - 1]!.id;
      setActive(current);
    };
    onScroll();
    let raf = 0;
    const handler = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(onScroll);
    };
    window.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, [items]);

  if (!items.length) return null;

  return (
    <nav aria-label="On this page" className="text-[13px]">
      <p className="flex items-center gap-2 font-semibold text-foreground">
        <TextQuote className="size-3.5 text-muted-foreground" aria-hidden />
        On this page
      </p>
      <ul className="mt-3 space-y-px border-l border-border">
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "location" : undefined}
                className={`-ml-px block border-l py-1 leading-snug transition ${item.depth >= 3 ? "pl-6" : "pl-3"} ${
                  isActive ? "border-brand-600 font-medium text-brand-700" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="mt-5 inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
      >
        <ArrowUp className="size-3.5" aria-hidden /> Back to top
      </button>
    </nav>
  );
}
