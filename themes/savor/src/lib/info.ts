/**
 * Restaurant details shared by the header, footer and signature sections: hours, phone, WhatsApp,
 * address and the "Order now" call to action. All read tolerantly from global theme settings,
 * falling back to the store profile.
 */
import type { StorefrontContext } from "@pai/theme-sdk";
import { resolveHref, str } from "@pai/theme-kit";
import { hoursRange, uniformWeek, type DayHours } from "./hours";

/** `store.address` may be plain text or a JSON-ish object string — render it defensively. */
export function formatAddress(raw: unknown): string {
  if (!raw) return "";
  if (typeof raw === "object") return joinAddress(raw as Record<string, unknown>);
  const s = String(raw).trim();
  if (s.startsWith("{")) {
    try {
      return joinAddress(JSON.parse(s) as Record<string, unknown>);
    } catch {
      return "";
    }
  }
  return dedupe(s.split(",").map((x) => x.trim()));
}

function dedupe(parts: string[]): string {
  const out: string[] = [];
  for (const p of parts) if (p && !out.some((o) => o.toLowerCase() === p.toLowerCase())) out.push(p);
  return out.join(", ");
}

function joinAddress(a: Record<string, unknown>): string {
  const parts = [a.line1, a.line2, a.area, a.city, a.postalCode].map((v) => (typeof v === "string" || typeof v === "number" ? String(v).trim() : "")).filter(Boolean);
  return dedupe(parts);
}

/** Digits-only WhatsApp number in international format (Bangladesh default +880). */
export function whatsappHref(raw: unknown, text = ""): string {
  const digits = String(raw ?? "").replace(/\D/g, "");
  if (digits.length < 8) return "";
  const intl = digits.startsWith("880") ? digits : digits.startsWith("0") ? `88${digits}` : digits;
  return `https://wa.me/${intl}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export type RestaurantInfo = {
  week: DayHours[];
  timeZone: string;
  todayRange: string;
  hoursNote: string;
  phone: string;
  phoneHref: string;
  whatsapp: string;
  address: string;
  mapsHref: string;
  cta: { label: string; href: string };
  areasNote: string;
};

export function restaurantInfo(context: StorefrontContext): RestaurantInfo {
  const t = context.theme;
  const phone = str(t.phone_display) || context.store.phone || "";
  const address = str(t.address_display) || formatAddress(context.store.address);
  const wa = str(t.social_whatsapp) || context.store.social?.whatsapp || context.store.phone || "";
  return {
    week: uniformWeek(str(t.open_time, "11:00"), str(t.close_time, "23:00"), str(t.closed_days)),
    timeZone: str(t.hours_timezone, "Asia/Dhaka"),
    todayRange: hoursRange(str(t.open_time, "11:00"), str(t.close_time, "23:00")),
    hoursNote: str(t.hours_note),
    phone,
    phoneHref: phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : "",
    whatsapp: whatsappHref(wa, `Hi ${context.store.name}, I'd like to place an order.`),
    address,
    mapsHref: str(t.maps_link) || (address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${context.store.name}, ${address}`)}` : ""),
    cta: { label: str(t.order_cta_label, "Order now"), href: resolveHref(context, t.order_cta_link, "/collections/all") },
    areasNote: str(t.delivery_areas_note),
  };
}
