"use client";

import { Children, useCallback, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Check, ChevronDown, ChevronLeft, ChevronRight, Heart, Link2, LoaderCircle, Play, Share2 } from "lucide-react";
import { cn } from "../lib/utils";
import { trackEvent, useStorefront } from "./storefront-context";
import { useToast } from "./toast";

/* ─────────────────────────── accordion ─────────────────────────── */

export type AccordionItem = { id: string; title: ReactNode; content: ReactNode; defaultOpen?: boolean; icon?: ReactNode };

/** Accessible accordion. `multiple` lets several panels stay open. */
export function Accordion({ items, multiple = true, className, itemClassName }: { items: AccordionItem[]; multiple?: boolean; className?: string; itemClassName?: string }) {
  const [open, setOpen] = useState<string[]>(() => items.filter((i) => i.defaultOpen).map((i) => i.id));
  const toggle = (id: string) => setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : multiple ? [...o, id] : [id]));
  return (
    <div className={cn("divide-y divide-pai-border border-y border-pai-border", className)}>
      {items.map((it) => {
        const isOpen = open.includes(it.id);
        return (
          <div key={it.id} className={itemClassName}>
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`acc-${it.id}`}
                onClick={() => toggle(it.id)}
                className="flex w-full items-center justify-between gap-4 py-4 text-left font-medium"
              >
                <span className="flex items-center gap-3">
                  {it.icon}
                  {it.title}
                </span>
                <ChevronDown className={cn("size-4 shrink-0 transition-transform duration-200", isOpen && "rotate-180")} />
              </button>
            </h3>
            <div id={`acc-${it.id}`} role="region" hidden={!isOpen} className="pb-5 text-[0.95rem] opacity-85">
              {it.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ─────────────────────────── tabs ─────────────────────────── */

export function Tabs({ tabs, className }: { tabs: { id: string; label: ReactNode; content: ReactNode }[]; className?: string }) {
  const [active, setActive] = useState(tabs[0]?.id);
  if (!tabs.length) return null;
  return (
    <div className={className}>
      <div role="tablist" className="pai-no-scrollbar flex gap-6 overflow-x-auto border-b border-pai-border">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
            className={cn("-mb-px shrink-0 border-b-2 py-3 text-sm font-semibold transition", active === t.id ? "border-pai-fg" : "border-transparent opacity-60 hover:opacity-100")}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.id} role="tabpanel" hidden={active !== t.id} className="pt-5">
          {t.content}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────── carousel ─────────────────────────── */

export type CarouselProps = {
  children: ReactNode;
  /** Items visible per view at each breakpoint. */
  perView?: { base?: number; md?: number; lg?: number };
  gap?: number;
  arrows?: boolean;
  /** Arrow placement: over the slides or in the heading row (`top`). */
  arrowPosition?: "sides" | "top";
  autoplay?: number; // ms, 0 = off
  className?: string;
  ariaLabel?: string;
};

/** Scroll-snap carousel with arrow buttons — zero-dependency, swipe-friendly on mobile. */
export function Carousel({ children, perView = { base: 1.6, md: 3, lg: 4 }, gap = 16, arrows = true, arrowPosition = "sides", autoplay = 0, className, ariaLabel }: CarouselProps) {
  const track = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const items = Children.toArray(children);

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  const scroll = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 4;
    if (dir === 1 && atEnd) el.scrollTo({ left: 0, behavior: "smooth" });
    else el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  useEffect(() => {
    update();
    const el = track.current;
    if (!el) return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [update]);

  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(() => {
      if (document.hidden) return;
      scroll(1);
    }, autoplay);
    return () => clearInterval(id);
  }, [autoplay]);

  const style = {
    "--pv-base": perView.base ?? 1.6,
    "--pv-md": perView.md ?? perView.base ?? 3,
    "--pv-lg": perView.lg ?? perView.md ?? 4,
    "--gap": `${gap}px`,
  } as CSSProperties;

  const btn = "grid size-10 place-items-center rounded-full border border-pai-border bg-pai-bg text-pai-fg shadow-sm transition hover:border-pai-fg disabled:opacity-30";

  return (
    <div className={cn("relative", className)} style={style} aria-roledescription="carousel" aria-label={ariaLabel}>
      {arrows && arrowPosition === "top" ? (
        <div className="-mt-14 mb-4 hidden justify-end gap-2 md:flex">
          <button type="button" aria-label="Previous" className={btn} disabled={!canPrev} onClick={() => scroll(-1)}>
            <ChevronLeft className="size-5" />
          </button>
          <button type="button" aria-label="Next" className={btn} disabled={!canNext} onClick={() => scroll(1)}>
            <ChevronRight className="size-5" />
          </button>
        </div>
      ) : null}
      <div
        ref={track}
        onScroll={update}
        className="pai-no-scrollbar pai-snap-x pai-carousel-track flex overflow-x-auto"
      >
        {items.map((child, i) => (
          <div key={i} className="pai-snap-start pai-carousel-item shrink-0" aria-roledescription="slide">
            {child}
          </div>
        ))}
      </div>
      {arrows && arrowPosition === "sides" ? (
        <>
          <button type="button" aria-label="Previous" disabled={!canPrev} onClick={() => scroll(-1)} className={cn(btn, "absolute -left-4 top-[40%] z-10 hidden -translate-y-1/2 md:grid")}>
            <ChevronLeft className="size-5" />
          </button>
          <button type="button" aria-label="Next" disabled={!canNext} onClick={() => scroll(1)} className={cn(btn, "absolute -right-4 top-[40%] z-10 hidden -translate-y-1/2 md:grid")}>
            <ChevronRight className="size-5" />
          </button>
        </>
      ) : null}
    </div>
  );
}

/* ─────────────────────────── slideshow ─────────────────────────── */

/** Full-width slideshow: one slide per view, autoplay, dots + arrows, pause on hover. */
export function Slideshow({ children, autoplay = 6000, className, showDots = true, showArrows = true }: { children: ReactNode; autoplay?: number; className?: string; showDots?: boolean; showArrows?: boolean }) {
  const slides = Children.toArray(children);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = useCallback((i: number) => setIndex((i + slides.length) % slides.length), [slides.length]);
  useEffect(() => {
    if (!autoplay || paused || slides.length < 2) return;
    const t = setTimeout(() => go(index + 1), autoplay);
    return () => clearTimeout(t);
  }, [autoplay, paused, index, go, slides.length]);
  const touch = useRef<number | null>(null);
  return (
    <div
      className={cn("relative overflow-hidden", className)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={(e) => (touch.current = e.touches[0]!.clientX)}
      onTouchEnd={(e) => {
        if (touch.current == null) return;
        const dx = e.changedTouches[0]!.clientX - touch.current;
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        touch.current = null;
      }}
      aria-roledescription="carousel"
    >
      <div className="flex transition-transform duration-700 ease-[cubic-bezier(.2,.8,.2,1)]" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((s, i) => (
          <div key={i} className="w-full shrink-0" aria-hidden={i !== index} aria-roledescription="slide">
            {s}
          </div>
        ))}
      </div>
      {slides.length > 1 && showArrows ? (
        <>
          <button type="button" aria-label="Previous slide" onClick={() => go(index - 1)} className="absolute left-4 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-neutral-900 shadow-lg backdrop-blur transition hover:bg-white md:grid">
            <ChevronLeft className="size-5" />
          </button>
          <button type="button" aria-label="Next slide" onClick={() => go(index + 1)} className="absolute right-4 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-white/85 text-neutral-900 shadow-lg backdrop-blur transition hover:bg-white md:grid">
            <ChevronRight className="size-5" />
          </button>
        </>
      ) : null}
      {slides.length > 1 && showDots ? (
        <div className="absolute inset-x-0 bottom-5 flex justify-center gap-2">
          {slides.map((_, i) => (
            <button key={i} type="button" aria-label={`Go to slide ${i + 1}`} onClick={() => go(i)} className={cn("h-2 rounded-full bg-white shadow transition-all", i === index ? "w-7" : "w-2 opacity-60")} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

/* ─────────────────────────── countdown ─────────────────────────── */

function parts(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { days: Math.floor(s / 86400), hours: Math.floor((s % 86400) / 3600), minutes: Math.floor((s % 3600) / 60), seconds: s % 60 };
}

/** Live countdown to `to` (ISO date). Renders `expiredLabel` once the time has passed. */
export function Countdown({ to, className, boxClassName, expiredLabel = "This offer has ended", labels = true }: { to: string; className?: string; boxClassName?: string; expiredLabel?: string; labels?: boolean }) {
  const target = new Date(to).getTime();
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  if (!Number.isFinite(target)) return null;
  const p = parts(now == null ? 0 : target - now);
  if (now != null && target - now <= 0) return <p className={cn("font-semibold", className)}>{expiredLabel}</p>;
  const units: [keyof typeof p, string][] = [
    ["days", "Days"],
    ["hours", "Hours"],
    ["minutes", "Min"],
    ["seconds", "Sec"],
  ];
  return (
    <div className={cn("flex gap-2 sm:gap-3", className)} role="timer" aria-live="off" suppressHydrationWarning>
      {units.map(([k, label]) => (
        <div key={k} className={cn("min-w-16 rounded-pai bg-pai-fg px-3 py-2 text-center text-pai-bg", boxClassName)}>
          <span className="block font-heading text-2xl font-bold tabular-nums sm:text-3xl" suppressHydrationWarning>
            {now == null ? "--" : String(p[k]).padStart(2, "0")}
          </span>
          {labels ? <span className="block text-[10px] font-semibold uppercase tracking-wider opacity-70">{label}</span> : null}
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────── newsletter ─────────────────────────── */

/** Email signup posting to `{base}/api/newsletter` (stores the email as a marketing-opted-in customer). */
export function NewsletterForm({ placeholder = "Enter your email", buttonLabel = "Subscribe", className, successMessage = "Thanks for subscribing!" }: { placeholder?: string; buttonLabel?: string; className?: string; successMessage?: string }) {
  const sf = useStorefront();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  if (state === "done") {
    return (
      <p className={cn("flex items-center gap-2 font-medium", className)}>
        <Check className="size-5" /> {successMessage}
      </p>
    );
  }
  return (
    <form
      className={cn("w-full", className)}
      onSubmit={async (e) => {
        e.preventDefault();
        setState("loading");
        try {
          const res = await fetch(sf.api("/newsletter"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          if (!res.ok) throw new Error(data.error ?? "Could not subscribe");
          trackEvent({ event: "Lead" });
          setState("done");
        } catch (err) {
          setError((err as Error).message);
          setState("error");
        }
      }}
    >
      <div className="flex flex-col gap-2 sm:flex-row">
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={placeholder} aria-label="Email address" className="pai-input flex-1" />
        <button type="submit" disabled={state === "loading"} className="pai-btn pai-btn-primary shrink-0">
          {state === "loading" ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {buttonLabel}
        </button>
      </div>
      {state === "error" ? <p className="mt-2 text-sm text-pai-sale">{error}</p> : null}
    </form>
  );
}

/* ─────────────────────────── wishlist ─────────────────────────── */

const WL_KEY = "pai_wishlist";

function readWishlist(storeKey: string): string[] {
  try {
    return JSON.parse(localStorage.getItem(`${WL_KEY}:${storeKey}`) ?? "[]") as string[];
  } catch {
    return [];
  }
}

/** Wishlist ids for the current store (localStorage, synced across components). */
export function useWishlist() {
  const sf = useStorefront();
  const storeKey = sf.storeId || sf.base || "default";
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    setIds(readWishlist(storeKey));
    const onChange = () => setIds(readWishlist(storeKey));
    window.addEventListener("pai:wishlist", onChange);
    window.addEventListener("storage", onChange);
    return () => {
      window.removeEventListener("pai:wishlist", onChange);
      window.removeEventListener("storage", onChange);
    };
  }, [storeKey]);
  const toggle = useCallback(
    (id: string) => {
      const cur = readWishlist(storeKey);
      const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
      localStorage.setItem(`${WL_KEY}:${storeKey}`, JSON.stringify(next));
      window.dispatchEvent(new Event("pai:wishlist"));
      return next.includes(id);
    },
    [storeKey],
  );
  return { ids, has: (id: string) => ids.includes(id), toggle };
}

/** Heart toggle stored in localStorage. */
export function WishlistButton({ productId, productTitle, className }: { productId: string; productTitle?: string; className?: string }) {
  const { has, toggle } = useWishlist();
  const toast = useToast();
  const active = has(productId);
  return (
    <button
      type="button"
      aria-label={active ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const added = toggle(productId);
        if (added) trackEvent({ event: "AddToWishlist", contentIds: [productId], contentName: productTitle });
        toast.show(added ? "Saved to wishlist" : "Removed from wishlist", { type: "info", duration: 1800 });
      }}
      className={cn("grid size-9 place-items-center rounded-full bg-white/90 text-neutral-900 shadow-sm backdrop-blur transition hover:scale-105", className)}
    >
      <Heart className={cn("size-[18px]", active && "fill-current text-rose-500")} />
    </button>
  );
}

/* ─────────────────────────── share ─────────────────────────── */

/** Share buttons (native share sheet on mobile, Facebook/WhatsApp/copy link fallbacks). */
export function ShareButtons({ title, url, className }: { title: string; url?: string; className?: string }) {
  const [copied, setCopied] = useState(false);
  const [href, setHref] = useState(url ?? "");
  useEffect(() => {
    if (!url) setHref(window.location.href.split("?")[0]!);
  }, [url]);
  const enc = encodeURIComponent(href);
  const link = "inline-flex items-center gap-1.5 text-sm opacity-75 hover:opacity-100";
  return (
    <div className={cn("flex flex-wrap items-center gap-4", className)}>
      <span className="inline-flex items-center gap-1.5 text-sm font-medium">
        <Share2 className="size-4" /> Share
      </span>
      <a className={link} href={`https://www.facebook.com/sharer/sharer.php?u=${enc}`} target="_blank" rel="noopener noreferrer">
        Facebook
      </a>
      <a className={link} href={`https://wa.me/?text=${encodeURIComponent(title + " " + href)}`} target="_blank" rel="noopener noreferrer">
        WhatsApp
      </a>
      <button
        type="button"
        className={link}
        onClick={async () => {
          if (navigator.share) {
            try {
              await navigator.share({ title, url: href });
              return;
            } catch {
              /* cancelled */
            }
          }
          await navigator.clipboard?.writeText(href);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied ? <Check className="size-4" /> : <Link2 className="size-4" />}
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}

/* ─────────────────────────── video ─────────────────────────── */

/** Click-to-play video (poster first, iframe/video loaded on demand — keeps pages fast). */
export function VideoPlayer({ src, embed, poster, title = "Video", className, autoplay = false }: { src?: string; embed?: string | null; poster?: string; title?: string; className?: string; autoplay?: boolean }) {
  const [playing, setPlaying] = useState(autoplay);
  if (playing) {
    if (embed) return <iframe src={embed.includes("autoplay") ? embed : `${embed}${embed.includes("?") ? "&" : "?"}autoplay=1`} title={title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen className={cn("size-full border-0", className)} />;
    return <video src={src} poster={poster} controls autoPlay playsInline className={cn("size-full object-cover", className)} />;
  }
  return (
    <button type="button" onClick={() => setPlaying(true)} aria-label={`Play ${title}`} className={cn("group relative block size-full overflow-hidden bg-black", className)}>
      {poster ? <img src={poster} alt="" loading="lazy" className="pai-img-cover opacity-90 transition group-hover:scale-[1.02]" /> : null}
      <span className="absolute inset-0 m-auto grid size-20 place-items-center rounded-full bg-white/90 text-neutral-900 shadow-xl transition group-hover:scale-110">
        <Play className="ml-1 size-8 fill-current" />
      </span>
    </button>
  );
}
