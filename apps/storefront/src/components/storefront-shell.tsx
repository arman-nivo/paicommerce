"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { CartDrawer, CartProvider, StorefrontProvider, ToastProvider, type StorefrontClientConfig } from "@pai/theme-kit/client";
import type { CartView } from "@pai/theme-kit";

/** Client providers for every store page + the lightweight analytics beacon. */
export function StorefrontShell({ config, initialCart, children }: { config: StorefrontClientConfig; initialCart: CartView | null; children: ReactNode }) {
  return (
    <StorefrontProvider config={config}>
      <ToastProvider>
        <CartProvider initialCart={initialCart}>
          {children}
          <CartDrawer />
          {config.isPreview ? null : <AnalyticsBeacon base={config.base} />}
        </CartProvider>
      </ToastProvider>
    </StorefrontProvider>
  );
}

/** Fire-and-forget page/product view counter (`{base}/api/track`). */
function AnalyticsBeacon({ base }: { base: string }) {
  const pathname = usePathname();
  useEffect(() => {
    const rel = base && pathname.startsWith(base) ? pathname.slice(base.length) || "/" : pathname;
    const type = rel.startsWith("/products/") ? "product" : "page";
    const body = JSON.stringify({ type, path: rel });
    const url = `${base}/api/track`;
    try {
      if (!navigator.sendBeacon?.(url, new Blob([body], { type: "application/json" }))) {
        void fetch(url, { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
      }
    } catch {
      /* ignore */
    }
  }, [pathname, base]);
  return null;
}
