"use client";

import { useEffect, useId, useRef, type MouseEvent, type ReactNode } from "react";
import { Ruler, X } from "lucide-react";

/**
 * "Size guide" trigger + native modal `<dialog>` (focus handling, Escape and the top layer come
 * from the browser). The table itself is rendered on the server and passed in as children.
 */
export function SizeGuideDialog({ label, title, children, className }: { label: string; title: string; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    const onClose = () => {
      document.documentElement.style.removeProperty("overflow");
    };
    d.addEventListener("close", onClose);
    return () => d.removeEventListener("close", onClose);
  }, []);

  const open = () => {
    const d = ref.current;
    if (!d) return;
    if (typeof d.showModal === "function") d.showModal();
    else d.setAttribute("open", "");
    document.documentElement.style.overflow = "hidden";
  };
  const close = () => ref.current?.close();
  // Click on the backdrop (the dialog element itself, outside the panel) closes it.
  const onDialogClick = (e: MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) close();
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-haspopup="dialog"
        className={
          className ??
          "inline-flex w-fit items-center gap-2 text-sm font-medium underline decoration-pai-fg/30 underline-offset-4 transition hover:decoration-pai-fg"
        }
      >
        <Ruler className="size-4" aria-hidden />
        {label}
      </button>
      <dialog
        ref={ref}
        aria-labelledby={titleId}
        onClick={onDialogClick}
        className="aurora-dialog m-auto max-h-[88vh] w-[min(720px,calc(100vw-2rem))] overflow-hidden rounded-pai bg-pai-bg p-0 text-pai-fg shadow-2xl backdrop:bg-black/50"
      >
        <div className="flex max-h-[88vh] flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-pai-border px-6 py-4">
            <h2 id={titleId} className="pai-h4">
              {title}
            </h2>
            <button type="button" onClick={close} aria-label="Close size guide" className="grid size-9 place-items-center rounded-full transition hover:bg-pai-muted">
              <X className="size-5" />
            </button>
          </div>
          <div className="overflow-y-auto px-6 py-5">{children}</div>
        </div>
      </dialog>
    </>
  );
}
