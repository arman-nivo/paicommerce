"use client";

import { useEffect } from "react";
import { trackEvent, useCart } from "@pai/theme-kit/client";

/** Fires the Purchase pixel event once per order and resets the client cart. */
export function PurchaseEvent({ orderId, value, currency, contentIds, numItems }: { orderId: string; value: number; currency: string; contentIds: string[]; numItems: number }) {
  const { refresh } = useCart();
  useEffect(() => {
    void refresh();
    const key = `pai:purchase:${orderId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      /* storage unavailable — still fire once per mount */
    }
    trackEvent({ event: "Purchase", value: value / 100, currency, contentIds, numItems, orderId });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);
  return null;
}
