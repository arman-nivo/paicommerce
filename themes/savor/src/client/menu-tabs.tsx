"use client";
/**
 * Category tabs for the menu section: anchor links that highlight the category in view
 * (scroll-spy) and keep the active tab scrolled into view on small screens.
 */
import { useEffect, useRef, useState } from "react";

export function MenuTabs({ tabs, sticky = true, label = "Menu categories" }: { tabs: { id: string; label: string; count?: number }[]; sticky?: boolean; label?: string }) {
  const [active, setActive] = useState(tabs[0]?.id ?? "");
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const els = tabs.map((t) => document.getElementById(t.id)).filter((e): e is HTMLElement => !!e);
    if (!els.length || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [tabs]);

  useEffect(() => {
    const el = bar.current?.querySelector<HTMLElement>(`[data-tab="${CSS.escape(active)}"]`);
    const parent = bar.current;
    if (el && parent) parent.scrollTo({ left: el.offsetLeft - parent.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  return (
    <nav aria-label={label} className={sticky ? "savor-menu-tabs sticky top-[var(--savor-header-h,72px)] z-20" : "savor-menu-tabs"}>
      <div ref={bar} className="pai-no-scrollbar -mx-4 flex gap-2 overflow-x-auto bg-pai-bg/95 px-4 py-3 backdrop-blur md:mx-0 md:justify-center md:px-0">
        {tabs.map((t) => {
          const on = t.id === active;
          return (
            <a
              key={t.id}
              href={`#${t.id}`}
              data-tab={t.id}
              aria-current={on ? "true" : undefined}
              onClick={() => setActive(t.id)}
              className={
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary focus-visible:ring-offset-2 " +
                (on ? "border-pai-primary bg-pai-primary text-pai-primary-fg" : "border-pai-border bg-pai-bg hover:border-pai-fg/40")
              }
            >
              {t.label}
              {t.count ? <span className={"text-xs " + (on ? "opacity-80" : "opacity-50")}>{t.count}</span> : null}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
