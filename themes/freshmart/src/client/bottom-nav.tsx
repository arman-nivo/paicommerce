"use client";

import { Home, LayoutGrid, Search, ShoppingBasket, User } from "lucide-react";
import { Link, usePathname, useCart, useStorefront } from "@pai/theme-kit/client";

/**
 * App-style bottom navigation for phones (hidden from md up). The cart tab shows the live item
 * count and total and opens the cart drawer (or the cart page when the store uses a cart page).
 * Hidden on product pages, where the sticky add-to-cart bar takes its place.
 */
export function BottomNav({ labels }: { labels?: { home?: string; categories?: string; search?: string; cart?: string; account?: string } }) {
  const sf = useStorefront();
  const { cart, openDrawer } = useCart();
  const pathname = usePathname() ?? "/";
  const rel = sf.base && pathname.startsWith(sf.base) ? pathname.slice(sf.base.length) || "/" : pathname;
  // Product pages use the kit's sticky add-to-cart bar in the same spot.
  if (/^\/products\//.test(rel)) return null;
  const item = "flex flex-1 flex-col items-center justify-center gap-0.5 py-1.5 text-[10.5px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-pai-primary";
  const on = (active: boolean) => (active ? " text-pai-primary" : " opacity-70");
  const cartInner = (
    <>
      <span className="relative">
        <ShoppingBasket className="size-[22px]" aria-hidden />
        {cart.itemCount ? (
          <span className="absolute -right-2.5 -top-1.5 grid min-w-[18px] place-items-center rounded-full bg-pai-accent px-1 text-[10px] font-bold leading-[18px] text-white">{cart.itemCount}</span>
        ) : null}
      </span>
      <span className="tabular-nums">{cart.itemCount ? sf.format(cart.subtotal) : labels?.cart ?? "Cart"}</span>
    </>
  );
  return (
    <nav aria-label="Quick navigation" className="fm-bottom-nav fixed inset-x-0 bottom-0 z-50 border-t border-pai-border bg-pai-bg/95 pb-[env(safe-area-inset-bottom)] text-pai-fg shadow-[0_-6px_20px_-12px_rgba(0,0,0,.25)] backdrop-blur md:hidden">
      <div className="flex h-[60px] items-stretch">
        <Link href={sf.url("/")} className={item + on(rel === "/")} aria-current={rel === "/" ? "page" : undefined}>
          <Home className="size-[22px]" aria-hidden />
          {labels?.home ?? "Home"}
        </Link>
        <Link href={sf.url("/collections")} className={item + on(rel.startsWith("/collections"))}>
          <LayoutGrid className="size-[22px]" aria-hidden />
          {labels?.categories ?? "Categories"}
        </Link>
        <Link href={sf.url("/search")} className={item + on(rel.startsWith("/search"))}>
          <Search className="size-[22px]" aria-hidden />
          {labels?.search ?? "Search"}
        </Link>
        {sf.cartType === "page" ? (
          <Link href={sf.url("/cart")} className={item + on(rel === "/cart")} aria-label={`Cart, ${cart.itemCount} items`}>
            {cartInner}
          </Link>
        ) : (
          <button type="button" onClick={openDrawer} className={item + on(false)} aria-label={`Open cart, ${cart.itemCount} items`}>
            {cartInner}
          </button>
        )}
        <Link href={sf.url("/account")} className={item + on(rel.startsWith("/account"))}>
          <User className="size-[22px]" aria-hidden />
          {labels?.account ?? "Account"}
        </Link>
      </div>
    </nav>
  );
}
