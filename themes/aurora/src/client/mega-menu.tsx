"use client";

import { useCallback, useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/**
 * One top-level mega-menu item. The panel markup (links, promo card) is rendered on the server and
 * passed as `children`; this island only handles open/close:
 *  - hover with a short close delay (so the pointer can travel from the trigger to the panel)
 *  - click / Enter / Space toggles, Escape closes and returns focus to the trigger
 *  - focus leaving the item or clicking a link inside the panel closes it
 *
 * The panel is positioned against the (sticky, hence positioned) header, so it spans the full
 * header width. The wrapper therefore must stay `position: static`.
 */
export function MegaMenuItem({ label, active, children }: { label: string; active?: boolean; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  const show = useCallback(() => {
    clear();
    setOpen(true);
  }, []);
  const hide = useCallback((delay = 160) => {
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
      setOpen(false);
      trigger.current?.focus();
    }
  };
  const onBlur = (e: FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
  };
  const onPanelClick = (e: MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest("a")) setOpen(false);
  };

  return (
    <div onMouseEnter={show} onMouseLeave={() => hide()} onKeyDown={onKeyDown} onBlur={onBlur}>
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => (open ? setOpen(false) : show())}
        className={
          "aurora-nav-link inline-flex items-center gap-1 py-2 opacity-90 transition hover:opacity-100" + (active ? " underline decoration-1 underline-offset-8" : "")
        }
      >
        {label}
        <ChevronDown aria-hidden className={"size-3.5 transition-transform duration-200" + (open ? " rotate-180" : "")} />
      </button>
      <div
        id={panelId}
        hidden={!open}
        onClick={onPanelClick}
        className="animate-pai-fade absolute inset-x-0 top-full z-50 border-y border-pai-border bg-pai-bg text-pai-fg shadow-[0_24px_48px_-24px_rgba(0,0,0,0.25)]"
      >
        {children}
      </div>
    </div>
  );
}
