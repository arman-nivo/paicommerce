"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export type RoutineTab = { id: string; label: string; hint?: string; image?: string; panel: ReactNode };

/**
 * Skin-concern tiles acting as an accessible tablist (arrow keys move between tiles).
 * Panels are rendered on the server and passed in; only the active one is shown.
 */
export function RoutineTabs({ tabs, label }: { tabs: RoutineTab[]; label: string }) {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const dir = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = (active + dir + tabs.length) % tabs.length;
    setActive(next);
    refs.current[next]?.focus();
  };
  return (
    <div>
      <div role="tablist" aria-label={label} onKeyDown={onKey} className="pai-no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-[repeat(auto-fit,minmax(150px,1fr))] md:px-0">
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
              className={
                "group flex min-w-[150px] snap-start items-center gap-3 rounded-full border p-1.5 pr-5 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pai-accent " +
                (selected ? "border-pai-fg bg-pai-fg text-pai-bg" : "border-pai-border bg-pai-card hover:border-pai-accent")
              }
            >
              <span className="relative size-11 shrink-0 overflow-hidden rounded-full bg-pai-muted">
                {t.image ? <img src={t.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" /> : null}
              </span>
              <span className="flex min-w-0 flex-col leading-tight">
                <span className="truncate text-sm font-semibold">{t.label}</span>
                {t.hint ? <span className="truncate text-xs opacity-65">{t.hint}</span> : null}
              </span>
            </button>
          );
        })}
      </div>
      {tabs.map((t, i) => (
        <div key={t.id} id={`panel-${t.id}`} role="tabpanel" aria-labelledby={`tab-${t.id}`} hidden={i !== active} className="animate-pai-fade mt-10">
          {t.panel}
        </div>
      ))}
    </div>
  );
}
