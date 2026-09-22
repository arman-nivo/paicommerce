"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import type { TrackEventDetail } from "@pai/theme-kit/client";

type W = Window & {
  fbq?: (...a: unknown[]) => void;
  gtag?: (...a: unknown[]) => void;
  ttq?: { track: (...a: unknown[]) => void; page: () => void };
  dataLayer?: unknown[];
};

const FB: Record<string, string> = { ViewContent: "ViewContent", AddToCart: "AddToCart", InitiateCheckout: "InitiateCheckout", Purchase: "Purchase", Search: "Search", AddToWishlist: "AddToWishlist", Lead: "Lead" };
const GA: Record<string, string> = { ViewContent: "view_item", AddToCart: "add_to_cart", InitiateCheckout: "begin_checkout", Purchase: "purchase", Search: "search", AddToWishlist: "add_to_wishlist", Lead: "generate_lead" };
const TT: Record<string, string> = { ViewContent: "ViewContent", AddToCart: "AddToCart", InitiateCheckout: "InitiateCheckout", Purchase: "CompletePayment", Search: "Search", AddToWishlist: "AddToWishlist", Lead: "SubmitForm" };

/** Forwards kit `pai:track` events and SPA page views to the enabled pixels. */
export function TrackingBridge({ fb, ga, tt }: { fb: boolean; ga: boolean; tt: boolean }) {
  const pathname = usePathname();
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false; // initial PageView is sent by the base snippets
      return;
    }
    const w = window as W;
    if (fb) w.fbq?.("track", "PageView");
    if (ga) w.gtag?.("event", "page_view", { page_path: pathname });
    if (tt) w.ttq?.page();
  }, [pathname, fb, ga, tt]);

  useEffect(() => {
    const on = (e: Event) => {
      const d = (e as CustomEvent<TrackEventDetail>).detail;
      if (!d?.event) return;
      const w = window as W;
      const ids = d.contentIds ?? [];
      if (fb && FB[d.event]) {
        const params: Record<string, unknown> = { currency: d.currency, value: d.value, content_ids: ids, content_type: "product", content_name: d.contentName, num_items: d.numItems };
        if (d.event === "Search") params.search_string = d.query;
        w.fbq?.("track", FB[d.event], params, d.orderId ? { eventID: `order-${d.orderId}` } : undefined);
      }
      if (ga && GA[d.event]) {
        const payload = { currency: d.currency, value: d.value, transaction_id: d.orderId, search_term: d.query, items: ids.map((id) => ({ item_id: id, item_name: d.contentName, quantity: d.numItems ?? 1 })) };
        w.gtag?.("event", GA[d.event], payload);
        w.dataLayer = w.dataLayer ?? [];
        w.dataLayer.push({ event: GA[d.event], ecommerce: payload });
      }
      if (tt && TT[d.event]) {
        w.ttq?.track(TT[d.event], { value: d.value, currency: d.currency, content_id: ids[0], content_type: "product", contents: ids.map((id) => ({ content_id: id, quantity: d.numItems ?? 1 })), query: d.query });
      }
    };
    window.addEventListener("pai:track", on);
    return () => window.removeEventListener("pai:track", on);
  }, [fb, ga, tt]);

  return null;
}
