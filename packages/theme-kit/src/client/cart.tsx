"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { EMPTY_CART, type CartLineView, type CartView } from "../lib/types";
import { trackEvent, useStorefront } from "./storefront-context";
import { useToast } from "./toast";

export type AddToCartInput = {
  productId: string;
  variantId?: string | null;
  quantity?: number;
  /** Optional display data for an instant optimistic line while the request is in flight. */
  optimistic?: { title: string; imageUrl?: string | null; price: number; variantTitle?: string | null; url?: string };
};

export type CartApi = {
  cart: CartView;
  /** True until the first server response (when no initial cart was provided). */
  loading: boolean;
  /** True while any mutation is in flight. */
  pending: boolean;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  add: (input: AddToCartInput, opts?: { openDrawer?: boolean; silent?: boolean }) => Promise<boolean>;
  update: (key: string, quantity: number) => Promise<void>;
  remove: (key: string) => Promise<void>;
  applyDiscount: (code: string) => Promise<{ ok: boolean; error?: string }>;
  removeDiscount: () => Promise<void>;
  refresh: () => Promise<void>;
  /** Replace local state with a cart returned by another endpoint (e.g. checkout). */
  setCart: (cart: CartView) => void;
};

const Ctx = createContext<CartApi | null>(null);

type ApiResult = { cart?: CartView; error?: string };

async function call(url: string, init?: RequestInit): Promise<ApiResult & { ok: boolean }> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      credentials: "same-origin",
      cache: "no-store",
    });
    const data = (await res.json().catch(() => ({}))) as ApiResult;
    return { ok: res.ok, ...data };
  } catch {
    return { ok: false, error: "Network error — please try again." };
  }
}

function recompute(cart: CartView, lines: CartLineView[]): CartView {
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  return {
    ...cart,
    lines,
    itemCount: lines.reduce((s, l) => s + l.quantity, 0),
    subtotal,
    total: Math.max(0, subtotal - cart.discountTotal + cart.shippingTotal),
  };
}

/**
 * Cart state for the whole storefront. Talks to `{base}/api/cart/*` (cookie `pai_cart`),
 * applies optimistic updates and reconciles with the server response.
 */
export function CartProvider({ initialCart, children }: { initialCart?: CartView | null; children: ReactNode }) {
  const sf = useStorefront();
  const toast = useToast();
  const [cart, setCart] = useState<CartView>(initialCart ?? { ...EMPTY_CART, currency: sf.currency });
  const [loading, setLoading] = useState(!initialCart);
  const [pendingCount, setPendingCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const seq = useRef(0);

  const run = useCallback(
    async (url: string, init: RequestInit | undefined, optimistic?: (c: CartView) => CartView) => {
      const mySeq = ++seq.current;
      if (optimistic) setCart((c) => optimistic(c));
      setPendingCount((n) => n + 1);
      const res = await call(url, init);
      setPendingCount((n) => n - 1);
      // Only the latest request may overwrite state (prevents out-of-order flicker).
      if (res.cart && mySeq === seq.current) setCart(res.cart);
      else if (!res.ok && mySeq === seq.current) {
        const fresh = await call(sf.api("/cart"));
        if (fresh.cart) setCart(fresh.cart);
      }
      return res;
    },
    [sf],
  );

  const refresh = useCallback(async () => {
    const res = await call(sf.api("/cart"));
    if (res.cart) setCart(res.cart);
    setLoading(false);
  }, [sf]);

  useEffect(() => {
    if (!initialCart) void refresh();
    // Keep tabs in sync.
    const onFocus = () => void refresh();
    const onVis = () => document.visibilityState === "visible" && onFocus();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const add = useCallback<CartApi["add"]>(
    async (input, opts = {}) => {
      const quantity = Math.max(1, input.quantity ?? 1);
      const key = `${input.productId}:${input.variantId ?? ""}`;
      const res = await run(
        sf.api("/cart/add"),
        { method: "POST", body: JSON.stringify({ productId: input.productId, variantId: input.variantId ?? null, quantity }) },
        input.optimistic
          ? (c) => {
              const existing = c.lines.find((l) => l.key === key);
              const lines = existing
                ? c.lines.map((l) => (l.key === key ? { ...l, quantity: l.quantity + quantity, total: l.unitPrice * (l.quantity + quantity) } : l))
                : [
                    ...c.lines,
                    {
                      key,
                      productId: input.productId,
                      variantId: input.variantId ?? null,
                      title: input.optimistic!.title,
                      variantTitle: input.optimistic!.variantTitle ?? null,
                      slug: "",
                      url: input.optimistic!.url ?? "#",
                      imageUrl: input.optimistic!.imageUrl ?? null,
                      unitPrice: input.optimistic!.price,
                      compareAtPrice: null,
                      quantity,
                      total: input.optimistic!.price * quantity,
                      available: null,
                      inStock: true,
                    },
                  ];
              return recompute(c, lines);
            }
          : undefined,
      );
      if (!res.ok) {
        toast.show(res.error ?? "Could not add to cart", { type: "error" });
        return false;
      }
      const line = res.cart?.lines.find((l) => l.key === key);
      trackEvent({
        event: "AddToCart",
        value: ((line?.unitPrice ?? input.optimistic?.price ?? 0) * quantity) / 100,
        currency: res.cart?.currency ?? sf.currency,
        contentIds: [input.variantId || input.productId],
        contentName: line?.title ?? input.optimistic?.title,
        numItems: quantity,
      });
      if (!opts.silent) {
        const openDrawer = opts.openDrawer ?? sf.cartType === "drawer";
        if (openDrawer) setDrawerOpen(true);
        else toast.show(`Added to cart${line ? ` — ${line.title}` : ""}`, { action: { label: "View cart", href: sf.url("/cart") } });
      }
      return true;
    },
    [run, sf, toast],
  );

  const update = useCallback<CartApi["update"]>(
    async (key, quantity) => {
      if (quantity <= 0) {
        await run(sf.api("/cart/remove"), { method: "POST", body: JSON.stringify({ key }) }, (c) => recompute(c, c.lines.filter((l) => l.key !== key)));
        return;
      }
      const res = await run(sf.api("/cart/update"), { method: "POST", body: JSON.stringify({ key, quantity }) }, (c) =>
        recompute(
          c,
          c.lines.map((l) => (l.key === key ? { ...l, quantity, total: l.unitPrice * quantity } : l)),
        ),
      );
      if (!res.ok && res.error) toast.show(res.error, { type: "error" });
    },
    [run, sf, toast],
  );

  const remove = useCallback<CartApi["remove"]>((key) => update(key, 0), [update]);

  const applyDiscount = useCallback<CartApi["applyDiscount"]>(
    async (code) => {
      const res = await run(sf.api("/cart/discount"), { method: "POST", body: JSON.stringify({ code }) });
      if (!res.ok) return { ok: false, error: res.error ?? "Invalid discount code" };
      return { ok: true };
    },
    [run, sf],
  );

  const removeDiscount = useCallback(async () => {
    await run(sf.api("/cart/discount"), { method: "DELETE" }, (c) => ({ ...c, discount: null, discountTotal: 0, total: c.subtotal + c.shippingTotal }));
  }, [run, sf]);

  const api = useMemo<CartApi>(
    () => ({
      cart,
      loading,
      pending: pendingCount > 0,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      add,
      update,
      remove,
      applyDiscount,
      removeDiscount,
      refresh,
      setCart,
    }),
    [cart, loading, pendingCount, drawerOpen, add, update, remove, applyDiscount, removeDiscount, refresh],
  );

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

/** Access the cart. Must be used inside `<CartProvider>` (the storefront mounts it for every page). */
export function useCart(): CartApi {
  const v = useContext(Ctx);
  if (!v) {
    // Allow rendering outside the storefront (theme previews / tests) without crashing.
    return {
      cart: EMPTY_CART,
      loading: false,
      pending: false,
      drawerOpen: false,
      openDrawer() {},
      closeDrawer() {},
      add: async () => false,
      update: async () => {},
      remove: async () => {},
      applyDiscount: async () => ({ ok: false, error: "Cart unavailable" }),
      removeDiscount: async () => {},
      refresh: async () => {},
      setCart() {},
    };
  }
  return v;
}
