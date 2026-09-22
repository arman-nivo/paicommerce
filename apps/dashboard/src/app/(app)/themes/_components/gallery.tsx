"use client";
import * as React from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { cn } from "@pai/ui";
import { ThemeThumb } from "./theme-thumb";

/** Screenshot gallery with thumbnails and a keyboard-friendly lightbox. */
export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [index, setIndex] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const count = images.length;
  const go = React.useCallback((d: number) => setIndex((i) => (i + d + count) % count), [count]);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") go(-1);
      if (e.key === "ArrowRight") go(1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, go]);

  if (!count) return <ThemeThumb src={null} alt={name} className="aspect-[16/10] rounded-xl border border-border" />;

  return (
    <div className="space-y-3">
      <button type="button" onClick={() => setOpen(true)} className="group relative block w-full overflow-hidden rounded-xl border border-border" aria-label="Open full-size screenshots">
        <ThemeThumb src={images[index]} alt={`${name} screenshot ${index + 1}`} className="aspect-[16/10]" />
        <span className="absolute bottom-3 right-3 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 text-xs text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
          <Maximize2 className="size-3.5" /> View full size
        </span>
      </button>
      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setIndex(i)}
              className={cn("relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition", i === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100")}
              aria-label={`Show screenshot ${i + 1}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" loading="lazy" className="size-full object-cover object-top" />
            </button>
          ))}
        </div>
      )}
      {open &&
        createPortal(
          <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 p-4" onClick={() => setOpen(false)} role="dialog" aria-modal aria-label={`${name} screenshots`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[index]} alt={`${name} screenshot ${index + 1}`} className="max-h-full max-w-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
            <button className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20" onClick={() => setOpen(false)} aria-label="Close">
              <X className="size-5" />
            </button>
            {count > 1 && (
              <>
                <button
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(-1);
                  }}
                  aria-label="Previous"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    go(1);
                  }}
                  aria-label="Next"
                >
                  <ChevronRight className="size-6" />
                </button>
                <span className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
                  {index + 1} / {count}
                </span>
              </>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
