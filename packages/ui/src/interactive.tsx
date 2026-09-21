"use client";

import { X } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "./cn";

/* ─────────────────────────── Dialog ─────────────────────────── */

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!mounted || !open) return null;
  const w = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" }[size];
  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-end justify-center p-0 sm:items-center sm:p-4">
      <div className="absolute inset-0 animate-fade-in bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div role="dialog" aria-modal className={cn("relative flex max-h-[90vh] w-full animate-slide-up flex-col rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl", w)}>
        {(title || description) && (
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              {title && <h2 className="text-base font-semibold">{title}</h2>}
              {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
            </div>
            <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted" aria-label="Close">
              <X className="size-4" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-5 py-4 scrollbar-thin">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-border px-5 py-3">{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

/* ─────────────────────────── Sheet (side drawer) ─────────────────────────── */

export function Sheet({ open, onClose, title, children, footer, side = "right", width = 420 }: { open: boolean; onClose: () => void; title?: React.ReactNode; children?: React.ReactNode; footer?: React.ReactNode; side?: "left" | "right"; width?: number }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!mounted || !open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 animate-fade-in bg-black/40" onClick={onClose} />
      <aside className={cn("absolute top-0 flex h-full max-w-full flex-col border-border bg-card shadow-2xl animate-fade-in", side === "right" ? "right-0 border-l" : "left-0 border-r")} style={{ width }}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-base font-semibold">{title}</h2>
          <button onClick={onClose} className="rounded-md p-1 text-muted-foreground hover:bg-muted" aria-label="Close">
            <X className="size-4" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-border px-5 py-3">{footer}</div>}
      </aside>
    </div>,
    document.body,
  );
}

/* ─────────────────────────── Dropdown ─────────────────────────── */

export function Dropdown({ trigger, children, align = "end", className }: { trigger: React.ReactNode; children: React.ReactNode; align?: "start" | "end"; className?: string }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      {open && (
        <div
          onClick={() => setOpen(false)}
          className={cn("absolute z-50 mt-1.5 min-w-48 animate-fade-in rounded-xl border border-border bg-card p-1 shadow-xl", align === "end" ? "right-0" : "left-0", className)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownItem({ className, danger, icon, children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { danger?: boolean; icon?: React.ReactNode }) {
  return (
    <button
      className={cn("flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm hover:bg-muted [&_svg]:size-4", danger && "text-red-600", className)}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

export function DropdownLabel({ children }: { children: React.ReactNode }) {
  return <div className="px-2.5 pb-1 pt-2 text-xs font-medium text-muted-foreground">{children}</div>;
}

/* ─────────────────────────── Tabs ─────────────────────────── */

export function Tabs({ tabs, value, onChange, className }: { tabs: { value: string; label: React.ReactNode; count?: number }[]; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <div className={cn("flex gap-1 overflow-x-auto border-b border-border scrollbar-thin", className)}>
      {tabs.map((t) => (
        <button
          key={t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            "-mb-px flex items-center gap-2 whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition",
            value === t.value ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground",
          )}
        >
          {t.label}
          {t.count != null && <span className="rounded-full bg-muted px-1.5 text-xs text-muted-foreground">{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ─────────────────────────── Confirm ─────────────────────────── */

export function useConfirm() {
  const [state, setState] = React.useState<{ title: string; description?: string; confirmLabel?: string; danger?: boolean; resolve: (v: boolean) => void } | null>(null);
  const confirm = React.useCallback(
    (opts: { title: string; description?: string; confirmLabel?: string; danger?: boolean }) => new Promise<boolean>((resolve) => setState({ ...opts, resolve })),
    [],
  );
  const close = (v: boolean) => {
    state?.resolve(v);
    setState(null);
  };
  const dialog = (
    <Dialog
      open={!!state}
      onClose={() => close(false)}
      size="sm"
      title={state?.title}
      description={state?.description}
      footer={
        <>
          <button className="h-9 rounded-lg border border-input px-4 text-sm hover:bg-muted" onClick={() => close(false)}>
            Cancel
          </button>
          <button className={cn("h-9 rounded-lg px-4 text-sm font-medium text-white", state?.danger ? "bg-red-600 hover:bg-red-600/90" : "bg-primary hover:bg-primary/90")} onClick={() => close(true)}>
            {state?.confirmLabel ?? "Confirm"}
          </button>
        </>
      }
    />
  );
  return { confirm, dialog };
}

/* ─────────────────────────── Tooltip (CSS) ─────────────────────────── */

export function Tooltip({ label, children, side = "top" }: { label: string; children: React.ReactNode; side?: "top" | "bottom" | "right" }) {
  const pos = { top: "bottom-full left-1/2 -translate-x-1/2 mb-1.5", bottom: "top-full left-1/2 -translate-x-1/2 mt-1.5", right: "left-full top-1/2 -translate-y-1/2 ml-1.5" }[side];
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span className={cn("pointer-events-none absolute z-50 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs text-background opacity-0 shadow transition group-hover/tt:opacity-100", pos)}>{label}</span>
    </span>
  );
}

/* ─────────────────────────── Copy button ─────────────────────────── */

export function CopyButton({ value, className, children }: { value: string; className?: string; children?: React.ReactNode }) {
  const [done, setDone] = React.useState(false);
  return (
    <button
      type="button"
      className={cn("inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground", className)}
      onClick={async () => {
        await navigator.clipboard.writeText(value);
        setDone(true);
        setTimeout(() => setDone(false), 1500);
      }}
    >
      {done ? "Copied!" : (children ?? "Copy")}
    </button>
  );
}

export { Toaster, toast } from "sonner";
