"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

/**
 * Header dropdown ("Shop by age"). The panel markup is rendered on the server and passed as
 * children; this island only handles open/close: hover with a close delay, click/Enter/Space,
 * ArrowDown focuses the first link, Escape closes and returns focus, focus-out and outside click close.
 */
export function PopoverMenu({
  label,
  icon,
  children,
  className,
  panelClassName,
  style,
  align = "left",
}: {
  label: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
  panelClassName?: string;
  style?: CSSProperties;
  align?: "left" | "center" | "right";
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  const show = () => {
    clear();
    setOpen(true);
  };
  const hide = (delay = 180) => {
    clear();
    timer.current = setTimeout(() => setOpen(false), delay);
  };

  useEffect(() => clear, []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  const pos = align === "right" ? "right-0" : align === "center" ? "left-1/2 -translate-x-1/2" : "left-0";

  return (
    <div
      ref={root}
      className="relative"
      onMouseEnter={show}
      onMouseLeave={() => hide()}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="true"
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            show();
            requestAnimationFrame(() => root.current?.querySelector<HTMLAnchorElement>(`[id="${panelId}"] a`)?.focus());
          }
        }}
        className={className}
        style={style}
      >
        {icon}
        {label}
        <ChevronDown aria-hidden className={"size-4 transition-transform duration-200" + (open ? " rotate-180" : "")} />
      </button>
      <div
        id={panelId}
        hidden={!open}
        onClick={(e) => {
          if ((e.target as HTMLElement).closest("a")) setOpen(false);
        }}
        className={"animate-pai-pop absolute top-full z-50 pt-3 " + pos}
      >
        <div className={panelClassName}>{children}</div>
      </div>
    </div>
  );
}
