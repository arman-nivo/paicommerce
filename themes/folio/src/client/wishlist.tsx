"use client";
/**
 * Folio's reading list: a heart on each book card and a header popover listing saved titles.
 *
 * The kit wishlist (`useWishlist`) only stores product ids in localStorage, so there's nothing to
 * render a list from. Folio's heart toggles the kit wishlist (so every other kit widget stays in
 * sync) and also keeps a small snapshot (title, author, cover, url) per saved book under its own key.
 */
import { useEffect, useId, useRef, useState } from "react";
import { Bookmark, BookmarkCheck, X } from "lucide-react";
import { Link, trackEvent, useStorefront, useToast, useWishlist } from "@pai/theme-kit/client";

export type SavedBook = { id: string; title: string; author?: string | null; url: string; image?: string | null; price?: number };

const KEY = "folio_reading_list";

function readSnapshots(storeKey: string): Record<string, SavedBook> {
  try {
    return JSON.parse(localStorage.getItem(`${KEY}:${storeKey}`) ?? "{}") as Record<string, SavedBook>;
  } catch {
    return {};
  }
}

function writeSnapshot(storeKey: string, book: SavedBook, keep: boolean) {
  try {
    const all = readSnapshots(storeKey);
    if (keep) all[book.id] = book;
    else delete all[book.id];
    localStorage.setItem(`${KEY}:${storeKey}`, JSON.stringify(all));
  } catch {
    /* storage unavailable */
  }
}

function useStoreKey() {
  const sf = useStorefront();
  return sf.storeId || sf.base || "default";
}

/** Bookmark toggle for a book card / product page. */
export function SaveBookButton({ book, className, withLabel = false }: { book: SavedBook; className?: string; withLabel?: boolean }) {
  const { has, toggle } = useWishlist();
  const toast = useToast();
  const storeKey = useStoreKey();
  const saved = has(book.id);
  const Icon = saved ? BookmarkCheck : Bookmark;
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${book.title} from your reading list` : `Save ${book.title} to your reading list`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggle(book.id);
        writeSnapshot(storeKey, book, added);
        if (added) trackEvent({ event: "AddToWishlist", contentIds: [book.id], contentName: book.title });
        toast.show(added ? "Saved to your reading list" : "Removed from your reading list", { type: "info", duration: 1800 });
      }}
      className={className}
    >
      <Icon className="size-[17px]" aria-hidden />
      {withLabel ? <span>{saved ? "Saved" : "Save for later"}</span> : null}
    </button>
  );
}

/** Header "Reading list" button with a count and a popover of saved books. */
export function ReadingListMenu({ className, label = "Reading list" }: { className?: string; label?: string }) {
  const { ids, toggle } = useWishlist();
  const sf = useStorefront();
  const storeKey = useStoreKey();
  const [open, setOpen] = useState(false);
  const [snaps, setSnaps] = useState<Record<string, SavedBook>>({});
  const root = useRef<HTMLDivElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (open) setSnaps(readSnapshots(storeKey));
  }, [open, ids, storeKey]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onDown = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  const books = ids.map((id) => snaps[id]).filter((b): b is SavedBook => !!b);
  const unknown = ids.length - books.length;

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={`${label} (${ids.length})`}
        onClick={() => setOpen((o) => !o)}
        className={className}
      >
        <Bookmark className="size-5" aria-hidden />
        {ids.length ? (
          <span className="absolute right-0.5 top-0.5 grid min-w-4 place-items-center rounded-full bg-pai-primary px-1 text-[10px] font-semibold leading-4 text-pai-primary-fg">{ids.length}</span>
        ) : null}
      </button>
      {open ? (
        <div id={panelId} role="dialog" aria-label={label} className="animate-pai-pop absolute right-0 top-full z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-pai border border-pai-border bg-pai-bg p-4 text-pai-fg shadow-2xl">
          <div className="mb-3 flex items-center justify-between">
            <p className="font-heading text-lg">{label}</p>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close reading list" className="grid size-8 place-items-center rounded-full hover:bg-pai-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary">
              <X className="size-4" />
            </button>
          </div>
          {books.length ? (
            <ul className="max-h-80 space-y-3 overflow-y-auto">
              {books.map((b) => (
                <li key={b.id} className="flex items-center gap-3">
                  <Link href={b.url} onClick={() => setOpen(false)} className="relative block aspect-[2/3] w-11 shrink-0 overflow-hidden rounded-[2px] bg-pai-muted shadow-sm">
                    {b.image ? <img src={b.image} alt="" className="absolute inset-0 size-full object-cover" loading="lazy" /> : null}
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link href={b.url} onClick={() => setOpen(false)} className="block truncate font-heading text-[0.95rem] hover:underline">
                      {b.title}
                    </Link>
                    {b.author ? <p className="truncate text-xs italic opacity-70">{b.author}</p> : null}
                    {typeof b.price === "number" ? <p className="text-xs font-semibold">{sf.format(b.price)}</p> : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      toggle(b.id);
                      writeSnapshot(storeKey, b, false);
                    }}
                    aria-label={`Remove ${b.title}`}
                    className="grid size-8 shrink-0 place-items-center rounded-full opacity-60 hover:bg-pai-muted hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary"
                  >
                    <X className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
          {unknown > 0 ? <p className="mt-3 text-xs opacity-70">+ {unknown} more saved {unknown === 1 ? "item" : "items"}.</p> : null}
          {!ids.length ? <p className="text-sm opacity-75">Tap the bookmark on any book to keep it here for later. Your list is saved on this device.</p> : null}
          <Link href={sf.url("/collections/all")} onClick={() => setOpen(false)} className="mt-4 block text-center text-sm font-semibold underline underline-offset-4">
            Browse the shelves
          </Link>
        </div>
      ) : null}
    </div>
  );
}
