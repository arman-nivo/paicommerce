"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { cn } from "../lib/utils";

export type ToastType = "success" | "error" | "info";
export type ToastItem = { id: number; message: string; type: ToastType; action?: { label: string; href: string } };

type ToastApi = { show: (message: string, opts?: { type?: ToastType; action?: ToastItem["action"]; duration?: number }) => void };

const Ctx = createContext<ToastApi | null>(null);
let counter = 0;

/** Lightweight toast notifications styled with the theme tokens. Rendered by the storefront root. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const dismiss = useCallback((id: number) => setItems((l) => l.filter((t) => t.id !== id)), []);
  const show = useCallback<ToastApi["show"]>(
    (message, opts = {}) => {
      const id = ++counter;
      setItems((l) => [...l.slice(-3), { id, message, type: opts.type ?? "success", action: opts.action }]);
      setTimeout(() => dismiss(id), opts.duration ?? 3500);
    },
    [dismiss],
  );
  const api = useMemo(() => ({ show }), [show]);

  // Allow non-React code (and themes) to raise toasts: window.dispatchEvent(new CustomEvent("pai:toast", { detail: { message } }))
  useEffect(() => {
    const onEvt = (e: Event) => {
      const d = (e as CustomEvent<{ message: string; type?: ToastType }>).detail;
      if (d?.message) show(d.message, { type: d.type });
    };
    window.addEventListener("pai:toast", onEvt);
    return () => window.removeEventListener("pai:toast", onEvt);
  }, [show]);

  return (
    <Ctx.Provider value={api}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[80] flex flex-col items-center gap-2 px-4 sm:bottom-6">
        {items.map((t) => {
          const Icon = t.type === "error" ? CircleAlert : t.type === "info" ? Info : CircleCheck;
          return (
            <div
              key={t.id}
              role="status"
              className={cn(
                "animate-pai-pop pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-pai border px-4 py-3 text-sm shadow-xl",
                "border-pai-border bg-pai-fg text-pai-bg",
              )}
            >
              <Icon className={cn("size-5 shrink-0", t.type === "error" ? "text-pai-sale" : "opacity-80")} />
              <span className="flex-1">{t.message}</span>
              {t.action ? (
                <a href={t.action.href} className="shrink-0 font-semibold underline underline-offset-4">
                  {t.action.label}
                </a>
              ) : null}
              <button type="button" aria-label="Dismiss" onClick={() => dismiss(t.id)} className="shrink-0 opacity-60 hover:opacity-100">
                <X className="size-4" />
              </button>
            </div>
          );
        })}
      </div>
    </Ctx.Provider>
  );
}

/** Show toasts. Falls back to a window event when no provider is mounted. */
export function useToast(): ToastApi {
  const v = useContext(Ctx);
  return (
    v ?? {
      show: (message, opts) => {
        if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("pai:toast", { detail: { message, type: opts?.type } }));
      },
    }
  );
}
