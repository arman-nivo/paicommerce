"use client";

import { ShoppingCart, UserRound } from "lucide-react";
import { Link, useCart, useStorefront } from "@pai/theme-kit/client";

/** "Hello, sign in / Account & orders" — shows the customer's first name when logged in. */
export function AccountEntry({ greeting, sub, className }: { greeting: string; sub: string; className?: string }) {
  const sf = useStorefront();
  const first = sf.customer?.name?.split(" ")[0];
  return (
    <Link href={sf.url("/account")} className={"bz-action inline-flex items-center gap-2 " + (className ?? "")} aria-label={first ? `My account (${first})` : "Sign in or create an account"}>
      <UserRound className="size-6 shrink-0" strokeWidth={1.75} aria-hidden />
      <span className="hidden flex-col leading-tight xl:flex">
        <span className="text-[0.7rem] opacity-70">{first ? `Hello, ${first}` : greeting}</span>
        <span className="text-[0.8rem] font-semibold">{sub}</span>
      </span>
    </Link>
  );
}

/** Cart with live count badge and (desktop) label + total; opens the drawer or links to /cart. */
export function CartEntry({ label, className }: { label: string; className?: string }) {
  const { cart, openDrawer } = useCart();
  const sf = useStorefront();
  const count = cart.itemCount;
  const inner = (
    <>
      <span className="relative inline-grid">
        <ShoppingCart className="size-6" strokeWidth={1.75} aria-hidden />
        <span className="bz-cart-count absolute -right-2 -top-2 grid min-w-[1.15rem] place-items-center rounded-full px-1 text-[10px] font-bold leading-[1.15rem]" aria-hidden>
          {count > 99 ? "99+" : count}
        </span>
      </span>
      <span className="hidden flex-col leading-tight xl:flex">
        <span className="text-[0.7rem] opacity-70">{label}</span>
        <span className="text-[0.8rem] font-semibold tabular-nums">{sf.format(cart.subtotal ?? 0)}</span>
      </span>
      <span className="sr-only">
        {label}, {count} {count === 1 ? "item" : "items"}
      </span>
    </>
  );
  const cls = "bz-action inline-flex items-center gap-2.5 " + (className ?? "");
  if (sf.cartType === "page") {
    return (
      <Link href={sf.url("/cart")} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" onClick={openDrawer} className={cls}>
      {inner}
    </button>
  );
}
