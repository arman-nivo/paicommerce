"use client";

import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, User, X } from "lucide-react";
import type { SfMenuItem } from "@pai/theme-sdk";
import { cn } from "../lib/utils";
import { useStorefront } from "./storefront-context";
import { SearchBox } from "./search";

/**
 * Header wrapper handling sticky + transparent-over-hero behaviour.
 * Adds `data-scrolled` / `data-transparent` attributes so themes can style states with
 * Tailwind `data-[scrolled=true]:` variants.
 */
export function HeaderShell({
  sticky = true,
  transparent = false,
  className,
  children,
}: {
  sticky?: boolean;
  transparent?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const isTransparent = transparent && !scrolled;
  return (
    <header
      data-scrolled={scrolled}
      data-transparent={isTransparent}
      className={cn(
        "z-40 w-full transition-[background-color,color,box-shadow,border-color] duration-300",
        sticky ? "sticky top-0" : "relative",
        transparent && "-mb-[var(--pai-header-h,72px)]",
        isTransparent ? "border-transparent bg-transparent text-white" : "border-b border-pai-border bg-pai-bg text-pai-fg",
        scrolled && sticky && "shadow-[0_1px_12px_rgba(0,0,0,0.06)]",
        className,
      )}
    >
      {children}
    </header>
  );
}

/** Mobile navigation drawer (hamburger button + slide-in panel with nested menu). */
export function MobileMenu({
  items,
  storeName,
  logoUrl,
  showSearch = true,
  showAccount = true,
  className,
  footer,
}: {
  items: SfMenuItem[];
  storeName?: string;
  logoUrl?: string | null;
  showSearch?: boolean;
  showAccount?: boolean;
  className?: string;
  footer?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const pathname = usePathname();
  const sf = useStorefront();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <button type="button" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(true)} className={cn("inline-grid size-10 place-items-center", className)}>
        <Menu className="size-6" />
      </button>
      {open ? (
        <div className="fixed inset-0 z-[70] text-pai-fg" role="dialog" aria-modal="true" aria-label="Menu">
          <button type="button" aria-label="Close menu" className="animate-pai-fade absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <nav className="animate-pai-slide-in-left absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-pai-bg shadow-2xl">
            <div className="flex items-center justify-between border-b border-pai-border px-5 py-4">
              {logoUrl ? <img src={logoUrl} alt={storeName} className="h-8 w-auto max-w-[160px] object-contain" /> : <span className="font-heading text-lg font-bold">{storeName}</span>}
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-pai-muted">
                <X className="size-5" />
              </button>
            </div>
            {showSearch ? (
              <div className="border-b border-pai-border p-4">
                <SearchBox predictive={false} onNavigate={() => setOpen(false)} />
              </div>
            ) : null}
            <ul className="flex-1 overflow-y-auto py-2">
              {items.map((item) => (
                <li key={item.id}>
                  {item.children?.length ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setExpanded((e) => (e === item.id ? null : item.id))}
                        aria-expanded={expanded === item.id}
                        className="flex w-full items-center justify-between px-5 py-3.5 text-left text-base font-medium"
                      >
                        {item.label}
                        <ChevronDown className={cn("size-4 transition-transform", expanded === item.id && "rotate-180")} />
                      </button>
                      {expanded === item.id ? (
                        <ul className="bg-pai-muted/60 pb-2">
                          <li>
                            <Link href={item.url} className="block px-8 py-2.5 text-sm font-semibold">
                              View all
                            </Link>
                          </li>
                          {item.children.map((c) => (
                            <li key={c.id}>
                              <Link href={c.url} className="block px-8 py-2.5 text-sm opacity-85">
                                {c.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </>
                  ) : (
                    <Link href={item.url} className={cn("block px-5 py-3.5 text-base font-medium", item.active && "underline underline-offset-4")}>
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
            <div className="space-y-3 border-t border-pai-border p-5">
              {showAccount ? (
                <Link href={sf.url("/account")} className="flex items-center gap-2 text-sm font-medium">
                  <User className="size-4" /> {sf.customer ? `Hi, ${sf.customer.name.split(" ")[0]}` : "Log in / Register"}
                </Link>
              ) : null}
              <Link href={sf.url("/track-order")} className="block text-sm opacity-75">
                Track your order
              </Link>
              {footer}
            </div>
          </nav>
        </div>
      ) : null}
    </>
  );
}

/** Account icon link that shows the customer's first name when logged in. */
export function AccountLink({ className, showName = false }: { className?: string; showName?: boolean }) {
  const sf = useStorefront();
  return (
    <Link href={sf.url("/account")} className={cn("inline-flex items-center gap-2", className)} aria-label={sf.customer ? "My account" : "Log in"}>
      <User className="size-5" />
      {showName && sf.customer ? <span className="hidden text-sm lg:inline">{sf.customer.name.split(" ")[0]}</span> : null}
    </Link>
  );
}

/** Desktop dropdown for a menu item with children (hover + keyboard accessible). */
/**
 * Dropdown for a menu item with children. Opens on hover (with a short close delay so the pointer
 * can travel to the panel), on click and via keyboard; closes on Escape (focus returns to the
 * trigger), when focus leaves the item, on outside click and when a link is chosen.
 */
export function MenuDropdown({ item, className, closeDelay = 180 }: { item: SfMenuItem; className?: string; closeDelay?: number }) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelId = useId();

  const cancelClose = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };
  const openNow = () => {
    cancelClose();
    setOpen(true);
  };
  const closeSoon = () => {
    cancelClose();
    timer.current = setTimeout(() => setOpen(false), closeDelay);
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        trigger.current?.focus();
      }
    };
    const onPointer = (e: PointerEvent) => {
      if (root.current && !root.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

  useEffect(() => cancelClose, []);

  return (
    <div
      ref={root}
      className={cn("relative", className)}
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        className="inline-flex items-center gap-1 py-2"
        aria-expanded={open}
        aria-controls={panelId}
        aria-haspopup="true"
        onClick={() => (open ? setOpen(false) : openNow())}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") {
            e.preventDefault();
            openNow();
            requestAnimationFrame(() => root.current?.querySelector<HTMLAnchorElement>(`#${CSS.escape(panelId)} a`)?.focus());
          }
        }}
      >
        {item.label}
        <ChevronDown className={cn("size-3.5 transition-transform", open && "rotate-180")} aria-hidden />
      </button>
      {open ? (
        <div id={panelId} className="animate-pai-pop absolute left-1/2 top-full z-50 min-w-56 -translate-x-1/2 pt-2">
          <ul className="rounded-pai border border-pai-border bg-pai-bg p-2 text-pai-fg shadow-xl">
            <li>
              <Link href={item.url} className="block rounded-[min(var(--pai-radius),8px)] px-3 py-2 text-sm font-semibold hover:bg-pai-muted" onClick={() => setOpen(false)}>
                All {item.label}
              </Link>
            </li>
            {item.children!.map((c) => (
              <li key={c.id}>
                <Link href={c.url} className="block rounded-[min(var(--pai-radius),8px)] px-3 py-2 text-sm hover:bg-pai-muted" onClick={() => setOpen(false)}>
                  {c.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
