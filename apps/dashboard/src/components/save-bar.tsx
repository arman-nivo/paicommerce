"use client";
import * as React from "react";
import { CircleAlert } from "lucide-react";
import { Button, cn } from "@pai/ui";

/**
 * Sticky "Unsaved changes — Discard / Save" bar. Shows when `dirty`.
 * Also warns before leaving the page with unsaved changes and binds ⌘S / Ctrl+S to save.
 */
export function SaveBar({ dirty, saving, onSave, onDiscard, saveLabel = "Save", className }: { dirty: boolean; saving?: boolean; onSave: () => void; onDiscard?: () => void; saveLabel?: string; className?: string }) {
  const saveRef = React.useRef(onSave);
  saveRef.current = onSave;
  React.useEffect(() => {
    if (!dirty) return;
    const before = (e: BeforeUnloadEvent) => {
      e.preventDefault();
    };
    const key = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        saveRef.current();
      }
    };
    window.addEventListener("beforeunload", before);
    window.addEventListener("keydown", key);
    return () => {
      window.removeEventListener("beforeunload", before);
      window.removeEventListener("keydown", key);
    };
  }, [dirty]);
  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-16 z-40 flex justify-center px-3 transition-all duration-200 lg:bottom-5 no-print",
        dirty ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
        className,
      )}
    >
      <div className="flex w-full max-w-xl items-center gap-3 rounded-xl border border-border bg-foreground px-4 py-2.5 text-background shadow-2xl lg:ml-64">
        <CircleAlert className="size-4 shrink-0 opacity-80" />
        <span className="flex-1 text-sm font-medium">Unsaved changes</span>
        {onDiscard && (
          <Button size="sm" variant="ghost" className="text-background hover:bg-background/10" onClick={onDiscard} disabled={saving}>
            Discard
          </Button>
        )}
        <Button size="sm" onClick={onSave} loading={saving} className="bg-background text-foreground hover:bg-background/90">
          {saveLabel}
        </Button>
      </div>
    </div>
  );
}

/** Tracks a form object and whether it differs from its initial value. */
export function useDirtyState<T>(initial: T) {
  const [base, setBase] = React.useState(initial);
  const [value, setValue] = React.useState(initial);
  const dirty = React.useMemo(() => JSON.stringify(base) !== JSON.stringify(value), [base, value]);
  const set = React.useCallback(<K extends keyof T>(k: K, v: T[K]) => setValue((s) => ({ ...s, [k]: v })), []);
  return { value, setValue, set, dirty, reset: () => setValue(base), commit: (v?: T) => setBase(v ?? value) };
}
