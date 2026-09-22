"use client";

import { createContext, useCallback, useContext, useMemo, type ReactNode } from "react";
import { formatMoney, type CurrencyDisplay } from "../lib/utils";

/**
 * Serializable storefront configuration handed from the server to client components.
 * The storefront renders `<StorefrontProvider config={…}>` once at the top of every store page.
 */
export type StorefrontClientConfig = {
  /** Tenant base path: "" (subdomain / custom domain), "/s/{slug}" (path tenancy) or "/preview/{token}". */
  base: string;
  storeId: string;
  storeName: string;
  currency: string;
  currencyDisplay: CurrencyDisplay;
  cartType: "drawer" | "page";
  /** "Buy now" adds the item and jumps straight to checkout. */
  buyNowCheckout: boolean;
  freeShippingOver: number | null;
  showFreeShipping: boolean;
  isPreview: boolean;
  /** Logged-in customer (null for guests). */
  customer: { id: string; name: string } | null;
};

export type StorefrontClient = StorefrontClientConfig & {
  /** Store-relative URL → URL including the tenant base. */
  url: (path: string) => string;
  /** Storefront API URL, e.g. api("/cart") → "/s/demo/api/cart". */
  api: (path: string) => string;
  /** Format minor units using the store currency + theme currency display. */
  format: (amount: number) => string;
};

const DEFAULT_CONFIG: StorefrontClientConfig = {
  base: "",
  storeId: "",
  storeName: "Store",
  currency: "BDT",
  currencyDisplay: "symbol",
  cartType: "drawer",
  buyNowCheckout: true,
  freeShippingOver: null,
  showFreeShipping: true,
  isPreview: false,
  customer: null,
};

const Ctx = createContext<StorefrontClient | null>(null);

export function joinUrl(base: string, path: string): string {
  if (!path) return base || "/";
  if (/^(https?:|mailto:|tel:|#|\/\/)/.test(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  if (!base) return p;
  if (p === "/") return base;
  return `${base}${p}`;
}

/** Provides tenant base path, currency and cart settings to every kit client component. */
export function StorefrontProvider({ config, children }: { config: Partial<StorefrontClientConfig>; children: ReactNode }) {
  const value = useMemo<StorefrontClient>(() => {
    const c = { ...DEFAULT_CONFIG, ...config };
    return {
      ...c,
      url: (path: string) => joinUrl(c.base, path),
      api: (path: string) => joinUrl(c.base, `/api${path.startsWith("/") ? path : `/${path}`}`),
      format: (amount: number) => formatMoney(amount, c.currency, c.currencyDisplay),
    };
  }, [config]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/** Access storefront config (base URL helpers, currency formatting, cart type). Works without a provider (defaults). */
export function useStorefront(): StorefrontClient {
  const v = useContext(Ctx);
  const fallback = useMemo<StorefrontClient>(
    () => ({
      ...DEFAULT_CONFIG,
      url: (p) => joinUrl("", p),
      api: (p) => joinUrl("", `/api${p.startsWith("/") ? p : `/${p}`}`),
      format: (a) => formatMoney(a, DEFAULT_CONFIG.currency),
    }),
    [],
  );
  return v ?? fallback;
}

/** Shorthand for `useStorefront().format`. */
export function useMoney() {
  const { format } = useStorefront();
  return useCallback((amount: number) => format(amount), [format]);
}

/* ─────────────────────────── analytics events ─────────────────────────── */

export type TrackEventName = "ViewContent" | "AddToCart" | "InitiateCheckout" | "Purchase" | "Search" | "AddToWishlist" | "Lead";

export type TrackEventDetail = {
  event: TrackEventName;
  value?: number; // major units
  currency?: string;
  contentIds?: string[];
  contentName?: string;
  numItems?: number;
  query?: string;
  orderId?: string;
};

/**
 * Fire a standard e-commerce event. The storefront's tracking bridge forwards it to Meta Pixel,
 * GA4, GTM (dataLayer) and TikTok when those integrations are enabled.
 */
export function trackEvent(detail: TrackEventDetail) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("pai:track", { detail }));
}
