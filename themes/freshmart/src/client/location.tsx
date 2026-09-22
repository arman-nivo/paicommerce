"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, MapPin } from "lucide-react";

const KEY = "fm:delivery-area";

/**
 * "Deliver to" area picker. The choice is remembered per browser (localStorage) and shown in the
 * header; it's a shopper convenience — the real delivery zone is confirmed at checkout.
 */
export function DeliveryLocation({ areas, label = "Deliver to", note, tone = "light" }: { areas: string[]; label?: string; note?: string; tone?: "light" | "dark" }) {
  const [area, setArea] = useState(areas[0] ?? "");
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const listId = useId();

  useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved && areas.includes(saved)) setArea(saved);
    } catch {}
  }, [areas]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!areas.length) return null;
  const choose = (a: string) => {
    setArea(a);
    setOpen(false);
    try {
      localStorage.setItem(KEY, a);
    } catch {}
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex max-w-[62vw] items-center gap-1.5 rounded-md text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
      >
        <MapPin className="size-4 shrink-0" aria-hidden />
        <span className="truncate">
          <span className="opacity-75">{label}: </span>
          <span className="font-bold">{area}</span>
        </span>
        <ChevronDown className={"size-3.5 shrink-0 transition-transform" + (open ? " rotate-180" : "")} aria-hidden />
      </button>
      {open ? (
        <div id={listId} className={"animate-pai-pop absolute left-0 top-full z-[60] mt-2 w-72 rounded-pai border border-pai-border bg-pai-bg p-2 text-pai-fg shadow-xl" + (tone === "dark" ? "" : "")}>
          <p className="px-2 pb-2 pt-1 text-xs font-semibold uppercase tracking-wide opacity-60">Choose your delivery area</p>
          <ul role="listbox" aria-label="Delivery area" className="max-h-72 overflow-y-auto">
            {areas.map((a) => (
              <li key={a} role="option" aria-selected={a === area}>
                <button type="button" onClick={() => choose(a)} className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm hover:bg-pai-muted focus-visible:bg-pai-muted focus-visible:outline-none">
                  {a}
                  {a === area ? <Check className="size-4 text-pai-primary" aria-hidden /> : null}
                </button>
              </li>
            ))}
          </ul>
          {note ? <p className="mt-1 border-t border-pai-border px-2 pt-2 text-xs opacity-65">{note}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
