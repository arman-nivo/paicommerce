"use client";

import { useCallback, useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/**
 * A header menu trigger with a dropdown panel. The panel markup is rendered on the server and
 * passed as `children`; this island only handles open/close:
 *  - hover with a short close delay, click / Enter / Space toggles
 *  - Escape closes and returns focus to the trigger, focus leaving closes, choosing a link closes
 * By default the wrapper stays `position: static` so the panel spans the (positioned) header bar;
 * pass `wrapperClassName="relative"` to anchor the panel under the trigger instead.
 */
export function MegaMenu({
  label,
  icon,
  active,
  className,
  wrapperClassName,
  panelClassName,
  chevron = true,
  children,
}: {
  label: ReactNode;
  icon?: ReactNode;
  active?: boolean;
  className?: string;
  wrapperClassName?: string;
  panelClassName?: string;
  chevron?: boolean;
  children: ReactNode;
}) {
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
    <div className={wrapperClassName} onMouseEnter={show} onMouseLeave={() => hide()} onKeyDown={onKeyDown} onBlur={onBlur}>
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        data-open={open}
        data-active={active ? "true" : undefined}
        onClick={() => (open ? setOpen(false) : show())}
        className={className ?? "inline-flex items-center gap-1.5 py-2"}
      >
        {icon}
        {label}
        {chevron ? <ChevronDown aria-hidden className={"size-3.5 transition-transform duration-200" + (open ? " rotate-180" : "")} /> : null}
      </button>
      <div
        id={panelId}
        hidden={!open}
        onClick={onPanelClick}
        className={
          panelClassName ??
          "animate-pai-fade absolute inset-x-0 top-full z-50 border-y border-pai-border bg-pai-card text-pai-fg shadow-[0_24px_48px_-20px_rgba(0,0,0,0.35)]"
        }
      >
        {children}
      </div>
    </div>
  );
}
