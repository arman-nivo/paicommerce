"use client";

import { useEffect, useRef, useState } from "react";
import { Heart, X } from "lucide-react";
import { Link, useWishlist } from "@pai/theme-kit/client";

export type WishItem = { id: string; title: string; url: string; image: string | null; price: string };

/**
 * Header heart: shows how many products are saved (kit `useWishlist`, stored per store in
 * localStorage) and opens a slide-over listing them. The server passes a compact catalogue
 * (`items`) to resolve saved ids; saved products outside it are counted but not listed.
 */
export function WishlistPanel({ items, shopUrl, className }: { items: WishItem[]; shopUrl: string; className?: string }) {
  const { ids, toggle } = useWishlist();
  const [open, setOpen] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const saved = items.filter((i) => ids.includes(i.id));
  const hidden = Math.max(0, ids.length - saved.length);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Wishlist${ids.length ? ` (${ids.length} saved)` : ""}`}
        className={"relative inline-grid place-items-center " + (className ?? "")}
      >
        <Heart className={"size-5" + (ids.length ? " fill-current text-[var(--ph-c2)]" : "")} aria-hidden />
        {ids.length ? (
          <span aria-hidden className="absolute -right-1 -top-1 grid min-w-5 place-items-center rounded-full bg-[var(--ph-c2)] px-1 text-[10px] font-bold leading-5 text-pai-fg">
            {ids.length > 99 ? "99+" : ids.length}
          </span>
        ) : null}
      </button>
      {open ? (
        <div className="fixed inset-0 z-[72] text-pai-fg" role="dialog" aria-modal="true" aria-label="Your wishlist">
          <button type="button" aria-label="Close wishlist" tabIndex={-1} className="animate-pai-fade absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="animate-pai-slide-in absolute inset-y-0 right-0 flex w-[92%] max-w-md flex-col rounded-l-[28px] bg-pai-bg shadow-2xl">
            <div className="flex items-center justify-between px-6 pb-4 pt-6">
              <p className="flex items-center gap-2 font-heading text-2xl font-semibold">
                <Heart className="size-6 fill-current text-[var(--ph-c2)]" aria-hidden /> Wishlist
              </p>
              <button ref={closeRef} type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid size-10 place-items-center rounded-full bg-pai-muted outline-none hover:rotate-90 focus-visible:ring-2 focus-visible:ring-pai-primary">
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {saved.length ? (
                <ul className="space-y-3">
                  {saved.map((i) => (
                    <li key={i.id} className="flex items-center gap-3 rounded-[20px] bg-pai-card p-2.5 ring-1 ring-pai-border">
                      <Link href={i.url} onClick={() => setOpen(false)} className="size-16 shrink-0 overflow-hidden rounded-2xl bg-pai-muted">
                        {i.image ? <img src={i.image} alt="" className="size-full object-cover" loading="lazy" /> : null}
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link href={i.url} onClick={() => setOpen(false)} className="pai-line-clamp-2 text-sm font-bold hover:underline">
                          {i.title}
                        </Link>
                        <p className="text-sm opacity-75">{i.price}</p>
                      </div>
                      <button type="button" onClick={() => toggle(i.id)} aria-label={`Remove ${i.title} from wishlist`} className="grid size-9 shrink-0 place-items-center rounded-full hover:bg-pai-muted">
                        <X className="size-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
              {hidden ? <p className="mt-4 text-sm opacity-70">+ {hidden} more saved item{hidden === 1 ? "" : "s"} — find them with the heart on each product.</p> : null}
              {!ids.length ? (
                <div className="mt-10 text-center">
                  <span className="mx-auto grid size-20 place-items-center rounded-full bg-[color-mix(in_srgb,var(--ph-c2)_25%,transparent)]">
                    <Heart className="size-9 text-[var(--ph-c2)]" aria-hidden />
                  </span>
                  <p className="mt-5 font-heading text-xl font-semibold">Nothing saved yet</p>
                  <p className="mx-auto mt-2 max-w-xs text-sm opacity-75">Tap the heart on any toy or treat to keep it here for later — perfect for birthday lists!</p>
                  <Link href={shopUrl} onClick={() => setOpen(false)} className="pai-btn pai-btn-primary mt-6">
                    Start exploring
                  </Link>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
