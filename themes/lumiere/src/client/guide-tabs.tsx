"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type GuideTab = { id: string; label: string; hint?: string; panel: ReactNode };

/**
 * Gift-guide tabs: small-caps labels with a gold underline, as an accessible tablist
 * (arrow keys / Home / End move between tabs). Panels are rendered on the server.
 */
export function GuideTabs({ tabs, label }: { tabs: GuideTab[]; label: string }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const go = (i: number) => {
    setActive(i);
    refs.current[i]?.focus();
  };
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const n = tabs.length;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") go((active + 1) % n);
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") go((active - 1 + n) % n);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(n - 1);
    else return;
    e.preventDefault();
  };
  return (
    <div>
      <div role="tablist" aria-label={label} onKeyDown={onKey} className="pai-no-scrollbar -mx-4 flex justify-start gap-8 overflow-x-auto border-b border-[var(--lumiere-rule)] px-4 md:mx-0 md:justify-center md:gap-14 md:px-0">
        {tabs.map((t, i) => {
          const selected = i === active;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              id={`tab-${t.id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(i)}
              className="lumiere-tab group relative flex shrink-0 flex-col items-center gap-1 pb-4 pt-1 text-center focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-[var(--lumiere-gold)]"
              data-selected={selected}
            >
              <span className="font-heading text-xl leading-none md:text-2xl">{t.label}</span>
              {t.hint ? <span className="text-[0.6rem] uppercase tracking-[0.26em] opacity-55">{t.hint}</span> : null}
              <span aria-hidden className="lumiere-tab-bar absolute inset-x-0 -bottom-px h-px" />
            </button>
          );
        })}
      </div>
      {tabs.map((t, i) => (
        <div key={t.id} id={`panel-${t.id}`} role="tabpanel" aria-labelledby={`tab-${t.id}`} tabIndex={0} hidden={i !== active} className="animate-pai-fade mt-12 focus-visible:outline-none">
          {t.panel}
        </div>
      ))}
    </div>
  );
}
