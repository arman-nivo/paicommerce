"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { LoaderCircle, ShoppingBag, Tag, Trash2, Truck, X } from "lucide-react";
import { cn } from "../lib/utils";
import type { CartLineView } from "../lib/types";
import { useCart } from "./cart";
import { useStorefront } from "./storefront-context";
import { QuantitySelector } from "./product";

/* ─────────────────────────── count & button ─────────────────────────── */

/** Live cart item count (renders nothing when the cart is empty unless `showZero`). */
export function CartCount({ className, showZero = false }: { className?: string; showZero?: boolean }) {
  const { cart } = useCart();
  if (!cart.itemCount && !showZero) return null;
  return (
    <span
      className={cn(
        "grid min-w-5 place-items-center rounded-full bg-pai-primary px-1 text-[11px] font-bold leading-5 text-pai-primary-fg",
        className,
      )}
    >
      {cart.itemCount > 99 ? "99+" : cart.itemCount}
    </span>
  );
}

/** Header cart icon: opens the drawer (cart type "drawer") or links to the cart page. */
export function CartButton({ className, icon, label = "Cart" }: { className?: string; icon?: ReactNode; label?: string }) {
  const { openDrawer } = useCart();
  const sf = useStorefront();
  const inner = (
    <>
      {icon ?? <ShoppingBag className="size-5" />}
      <CartCount className="absolute -right-1.5 -top-1.5" />
      <span className="sr-only">{label}</span>
    </>
  );
  if (sf.cartType === "page") {
    return (
      <Link href={sf.url("/cart")} className={cn("relative inline-grid place-items-center", className)}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={openDrawer} className={cn("relative inline-grid place-items-center", className)} aria-label={label}>
      {inner}
    </button>
  );
}

/* ─────────────────────────── building blocks ─────────────────────────── */

/** Progress towards free delivery (uses the store's `freeShippingOver` delivery setting). */
export function FreeShippingBar({ className }: { className?: string }) {
  const { cart } = useCart();
  const sf = useStorefront();
  const threshold = cart.freeShippingOver ?? sf.freeShippingOver;
  if (!threshold || !sf.showFreeShipping || !cart.itemCount) return null;
  const remaining = Math.max(0, threshold - cart.subtotal);
  const pct = Math.min(100, Math.round((cart.subtotal / threshold) * 100));
  return (
    <div className={cn("space-y-2 text-sm", className)}>
      <p className="flex items-center gap-2">
        <Truck className="size-4 shrink-0" />
        {remaining > 0 ? (
          <span>
            Add <strong>{sf.format(remaining)}</strong> more for <strong>free delivery</strong>
          </span>
        ) : (
          <span className="font-medium">You&apos;ve unlocked free delivery 🎉</span>
        )}
      </p>
      <div className="h-1.5 overflow-hidden rounded-full bg-pai-muted">
        <div className="h-full rounded-full bg-pai-primary transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

/** One cart line with image, variant, quantity stepper and remove. */
export function CartLineItem({ line, compact = false, onNavigate }: { line: CartLineView; compact?: boolean; onNavigate?: () => void }) {
  const { update, remove } = useCart();
  const sf = useStorefront();
  const max = line.available ?? 999;
  return (
    <li className="flex gap-4 py-4">
      <Link href={line.url} onClick={onNavigate} className={cn("shrink-0 overflow-hidden rounded-[min(var(--pai-radius),10px)] bg-pai-muted", compact ? "size-20" : "size-24")}>
        {line.imageUrl ? <img src={line.imageUrl} alt={line.title} loading="lazy" className="pai-img-cover" /> : null}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={line.url} onClick={onNavigate} className="line-clamp-2 text-sm font-medium hover:underline">
              {line.title}
            </Link>
            {line.variantTitle ? <p className="mt-0.5 text-xs opacity-65">{line.variantTitle}</p> : null}
          </div>
          <p className="shrink-0 text-sm font-semibold">{sf.format(line.total)}</p>
        </div>
        <p className="mt-0.5 text-xs opacity-65">
          {sf.format(line.unitPrice)}
          {line.compareAtPrice && line.compareAtPrice > line.unitPrice ? <s className="ml-1.5">{sf.format(line.compareAtPrice)}</s> : null}
        </p>
        {!line.inStock ? <p className="mt-1 text-xs font-medium text-pai-sale">Only {Math.max(0, line.available ?? 0)} available</p> : null}
        <div className="mt-auto flex items-center justify-between pt-2">
          <QuantitySelector size="sm" value={line.quantity} max={Math.max(1, max)} onChange={(q) => update(line.key, q)} />
          <button type="button" onClick={() => remove(line.key)} className="inline-flex items-center gap-1 text-xs opacity-60 hover:text-pai-sale hover:opacity-100">
            <Trash2 className="size-3.5" /> Remove
          </button>
        </div>
      </div>
    </li>
  );
}

/** Discount code input bound to the cart. */
export function DiscountForm({ className }: { className?: string }) {
  const { cart, applyDiscount, removeDiscount } = useCart();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (cart.discount) {
    return (
      <div className={cn("flex items-center justify-between gap-2 rounded-pai bg-pai-muted px-3 py-2 text-sm", className)}>
        <span className="inline-flex items-center gap-2 font-medium">
          <Tag className="size-4" /> {cart.discount.code}
        </span>
        <button type="button" onClick={() => removeDiscount()} className="text-xs underline underline-offset-4 opacity-70 hover:opacity-100">
          Remove
        </button>
      </div>
    );
  }
  return (
    <form
      className={cn("space-y-1.5", className)}
      onSubmit={async (e) => {
        e.preventDefault();
        if (!code.trim()) return;
        setBusy(true);
        setError(null);
        const r = await applyDiscount(code.trim());
        setBusy(false);
        if (!r.ok) setError(r.error ?? "Invalid code");
        else setCode("");
      }}
    >
      <div className="flex gap-2">
        <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Discount code" aria-label="Discount code" className="pai-input min-h-10 flex-1 py-2 text-sm uppercase" />
        <button type="submit" disabled={busy || !code.trim()} className="pai-btn pai-btn-outline pai-btn-sm min-h-10">
          {busy ? <LoaderCircle className="size-4 animate-spin" /> : "Apply"}
        </button>
      </div>
      {error ? <p className="text-xs text-pai-sale">{error}</p> : null}
    </form>
  );
}

/** Subtotal / discount / total rows. */
export function CartTotals({ className, showShipping = false }: { className?: string; showShipping?: boolean }) {
  const { cart } = useCart();
  const sf = useStorefront();
  return (
    <dl className={cn("space-y-1.5 text-sm", className)}>
      <div className="flex justify-between">
        <dt className="opacity-75">Subtotal</dt>
        <dd>{sf.format(cart.subtotal)}</dd>
      </div>
      {cart.discountTotal > 0 ? (
        <div className="flex justify-between text-pai-sale">
          <dt>Discount {cart.discount ? `(${cart.discount.code})` : ""}</dt>
          <dd>−{sf.format(cart.discountTotal)}</dd>
        </div>
      ) : null}
      {showShipping ? (
        <div className="flex justify-between">
          <dt className="opacity-75">Delivery</dt>
          <dd>{cart.deliveryZone ? (cart.shippingTotal ? sf.format(cart.shippingTotal) : "Free") : "Calculated at checkout"}</dd>
        </div>
      ) : null}
      <div className="flex justify-between border-t border-pai-border pt-2 text-base font-semibold">
        <dt>Total</dt>
        <dd>{sf.format(showShipping ? cart.total : cart.subtotal - cart.discountTotal)}</dd>
      </div>
    </dl>
  );
}

function EmptyCart({ onNavigate }: { onNavigate?: () => void }) {
  const sf = useStorefront();
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-pai-muted">
        <ShoppingBag className="size-7 opacity-70" />
      </div>
      <div>
        <p className="font-heading text-lg font-semibold">Your cart is empty</p>
        <p className="mt-1 text-sm opacity-70">Looks like you haven&apos;t added anything yet.</p>
      </div>
      <Link href={sf.url("/collections/all")} onClick={onNavigate} className="pai-btn pai-btn-primary">
        Start shopping
      </Link>
    </div>
  );
}

/* ─────────────────────────── drawer ─────────────────────────── */

/** Slide-over cart. Mounted once by the storefront; opened via `useCart().openDrawer()`. */
export function CartDrawer({ title = "Your cart" }: { title?: string }) {
  const { cart, drawerOpen, closeDrawer, pending } = useCart();
  const sf = useStorefront();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [drawerOpen, closeDrawer]);
  if (!mounted || !drawerOpen) return null;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Close cart" onClick={closeDrawer} className="animate-pai-fade absolute inset-0 bg-black/40" />
      <aside className="animate-pai-slide-in absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-pai-bg text-pai-fg shadow-2xl">
        <header className="flex items-center justify-between border-b border-pai-border px-5 py-4">
          <h2 className="font-heading text-lg font-semibold">
            {title} {cart.itemCount ? <span className="text-sm font-normal opacity-60">({cart.itemCount})</span> : null}
          </h2>
          <div className="flex items-center gap-2">
            {pending ? <LoaderCircle className="size-4 animate-spin opacity-60" /> : null}
            <button type="button" onClick={closeDrawer} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-pai-muted">
              <X className="size-5" />
            </button>
          </div>
        </header>
        {cart.lines.length ? (
          <>
            <FreeShippingBar className="border-b border-pai-border px-5 py-3" />
            <ul className="flex-1 divide-y divide-pai-border overflow-y-auto px-5">
              {cart.lines.map((l) => (
                <CartLineItem key={l.key} line={l} compact onNavigate={closeDrawer} />
              ))}
            </ul>
            <footer className="space-y-3 border-t border-pai-border px-5 py-4">
              <DiscountForm />
              <CartTotals />
              <p className="text-xs opacity-60">Delivery charge calculated at checkout.</p>
              <Link href={sf.url("/checkout")} onClick={closeDrawer} className="pai-btn pai-btn-primary pai-btn-lg pai-btn-block" aria-disabled={pending}>
                Checkout · {sf.format(cart.subtotal - cart.discountTotal)}
              </Link>
              <Link href={sf.url("/cart")} onClick={closeDrawer} className="block text-center text-sm underline underline-offset-4 opacity-75 hover:opacity-100">
                View cart
              </Link>
            </footer>
          </>
        ) : (
          <div className="flex-1 px-5">
            <EmptyCart onNavigate={closeDrawer} />
          </div>
        )}
      </aside>
    </div>
  );
}

/* ─────────────────────────── cart page ─────────────────────────── */

/** Full cart page body (used by the `main-cart` section). */
export function CartPageView({ heading = "Shopping cart", showNote = false, continueUrl = "/collections/all" }: { heading?: string; showNote?: boolean; continueUrl?: string }) {
  const { cart, loading } = useCart();
  const sf = useStorefront();
  const [note, setNote] = useState("");
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="pai-skeleton h-10 w-60 rounded-pai" />
        <div className="pai-skeleton h-28 rounded-pai" />
        <div className="pai-skeleton h-28 rounded-pai" />
      </div>
    );
  }
  if (!cart.lines.length) {
    return (
      <div>
        <h1 className="pai-h2 mb-4">{heading}</h1>
        <EmptyCart />
      </div>
    );
  }
  return (
    <div>
      <div className="mb-6 flex items-end justify-between gap-4">
        <h1 className="pai-h2">{heading}</h1>
        <Link href={sf.url(continueUrl)} className="text-sm underline underline-offset-4 opacity-75 hover:opacity-100">
          Continue shopping
        </Link>
      </div>
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <FreeShippingBar className="mb-4 rounded-pai bg-pai-muted p-4" />
          <ul className="divide-y divide-pai-border border-y border-pai-border">
            {cart.lines.map((l) => (
              <CartLineItem key={l.key} line={l} />
            ))}
          </ul>
          {cart.errors.length ? (
            <div className="mt-4 rounded-pai border border-pai-sale/30 bg-pai-sale/5 p-3 text-sm text-pai-sale">
              {cart.errors.map((e) => (
                <p key={e}>{e}</p>
              ))}
            </div>
          ) : null}
        </div>
        <aside className="h-fit space-y-4 rounded-pai bg-pai-muted p-6 lg:sticky lg:top-24">
          <h2 className="font-heading text-lg font-semibold">Order summary</h2>
          <DiscountForm />
          <CartTotals />
          {showNote ? (
            <label className="block">
              <span className="pai-label">Order note</span>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} className="pai-input" placeholder="Special instructions for your order" />
            </label>
          ) : null}
          <Link href={sf.url(note ? `/checkout?note=${encodeURIComponent(note)}` : "/checkout")} className="pai-btn pai-btn-primary pai-btn-lg pai-btn-block">
            Proceed to checkout
          </Link>
          <p className="text-center text-xs opacity-65">Cash on delivery available · Secure checkout</p>
        </aside>
      </div>
    </div>
  );
}
