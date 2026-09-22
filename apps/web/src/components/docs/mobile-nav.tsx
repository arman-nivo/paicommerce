"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronRight, Menu, X } from "lucide-react";
import type { DocsNavGroup } from "@/lib/docs";
import { DocsNavTree, useActiveSlug } from "./sidebar";
import { SearchTrigger } from "./search";

/** Sticky bar + slide-over drawer with the docs navigation for < lg screens. */
export function DocsMobileNav({ nav }: { nav: DocsNavGroup[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const active = useActiveSlug();
  const current = nav.flatMap((g) => g.items.map((i) => ({ ...i, group: g.title }))).find((i) => i.slug === active);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <div className="sticky top-16 z-30 -mx-4 flex items-center gap-2 border-b border-border bg-white/90 px-4 py-2.5 backdrop-blur-md sm:-mx-6 sm:px-6 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-lg px-1 py-1 text-left text-sm"
          aria-expanded={open}
          aria-controls="docs-mobile-drawer"
        >
          <Menu className="size-4.5 shrink-0 text-foreground" aria-hidden />
          <span className="truncate text-muted-foreground">{current?.group ?? "Docs"}</span>
          <ChevronRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
          <span className="truncate font-medium text-foreground">{current?.title ?? "Documentation"}</span>
        </button>
        <SearchTrigger compact />
      </div>

      {open && (
        <div className="fixed inset-0 z-[70] lg:hidden" id="docs-mobile-drawer">
          <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] animate-fade-in" onClick={() => setOpen(false)} aria-hidden />
          <div role="dialog" aria-modal="true" aria-label="Documentation navigation" className="absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col bg-white shadow-2xl animate-slide-up">
            <div className="flex h-14 items-center justify-between border-b border-border px-4">
              <span className="font-display text-sm font-bold">Developer docs</span>
              <button type="button" onClick={() => setOpen(false)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Close navigation">
                <X className="size-4.5" aria-hidden />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-3 py-5">
              <DocsNavTree nav={nav} onNavigate={() => setOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
