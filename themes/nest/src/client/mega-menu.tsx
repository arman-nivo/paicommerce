"use client";

import { useCallback, useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/**
 * One top-level mega-menu trigger with a full-width panel. The panel markup (room cards, link
 * columns) is rendered on the server and passed as `children`; this island only handles
 * opening and closing:
 *  - hover with a short open/close delay (so the pointer can travel from the trigger to the panel)
 *  - click / Enter / Space toggles, Escape closes and returns focus to the trigger
 *  - focus leaving the item, scrolling, or clicking a link inside the panel closes it
 *
 * The panel is positioned against the header (sticky or relative, so positioned) and spans its
 * full width — every wrapper between the header and this item must stay `position: static`.
 */
export function NestMegaItem({ label, active, children }: { label: string; active?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  const show = useCallback((delay = 60) => {
    clear();
    timer.current = setTimeout(() => setOpen(true), delay);
  }, []);
  const hide = useCallback((delay = 180) => {
    clear();
    timer.current = setTimeout(() => setOpen(false), delay);
  }, []);

  useEffect(() => clear, []);
  useEffect(() => {
    if (!open) return;
    const onScroll = () => setOpen(false);
    window.addEventListener("scroll", onScroll, { passive: true, once: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [open]);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape" && open) {
      e.stopPropagation();
      clear();
      setOpen(false);
      trigger.current?.focus();
    }
  };
  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
      clear();
      setOpen(false);
    }
  };
  const onPanelClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("a")) setOpen(false);
  };

  return (
    <div onMouseEnter={() => show()} onMouseLeave={() => hide()} onKeyDown={onKeyDown} onBlur={onBlur}>
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => {
          clear();
          setOpen((o) => !o);
        }}
        className={"nest-nav-link inline-flex items-center gap-1.5 py-3" + (active || open ? " is-active" : "")}
      >
        {label}
        <ChevronDown aria-hidden className={"size-3.5 opacity-60 transition-transform duration-300" + (open ? " rotate-180" : "")} />
      </button>
      <div
        id={panelId}
        hidden={!open}
        onClick={onPanelClick}
        className="nest-mega animate-pai-fade absolute inset-x-0 top-full z-50 border-y border-pai-border bg-pai-bg text-pai-fg"
      >
        {children}
      </div>
    </div>
  );
}
