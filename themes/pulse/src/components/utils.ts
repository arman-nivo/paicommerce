import type { StorefrontContext } from "@pai/theme-sdk";
import { str } from "@pai/theme-kit";

/** Normalise a phone number for wa.me (Bangladeshi 01XXXXXXXXX → 8801XXXXXXXXX). */
export function waNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (/^01\d{9}$/.test(digits)) return `88${digits}`;
  if (/^1\d{9}$/.test(digits)) return `880${digits}`;
  return digits;
}

/**
 * WhatsApp chat link. Number priority: the section's own setting → the theme's WhatsApp setting →
 * the store phone. Returns "" when no number is available.
 */
export function whatsappHref(context: StorefrontContext, number: unknown, message: string): string {
  const n = waNumber(str(number) || str(context.theme.social_whatsapp) || str(context.store.phone));
  if (!n) return "";
  const text = message.replace("{store}", context.store.name);
  return `https://wa.me/${n}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

/** Section padding multiplier from the kit's `padding` select. */
export function padOf(v: unknown, fallback = "medium"): string {
  return { none: "0", small: "0.5", medium: "1", large: "1.5" }[str(v, fallback)] ?? "1";
}

/** Health icon choices (lucide names) for category & feature blocks. */
export const HEALTH_ICONS = [
  { value: "pill", label: "Pill" },
  { value: "pill-bottle", label: "Pill bottle" },
  { value: "tablets", label: "Tablets" },
  { value: "syringe", label: "Syringe" },
  { value: "heart-pulse", label: "Heart / cardiac" },
  { value: "activity", label: "Activity / vitals" },
  { value: "stethoscope", label: "Stethoscope" },
  { value: "thermometer", label: "Thermometer / fever" },
  { value: "droplet", label: "Droplet / diabetes" },
  { value: "baby", label: "Baby & mother" },
  { value: "apple", label: "Nutrition" },
  { value: "dumbbell", label: "Fitness" },
  { value: "sparkles", label: "Skin care" },
  { value: "hand", label: "Hygiene" },
  { value: "bone", label: "Bones & joints" },
  { value: "brain", label: "Brain / mental health" },
  { value: "eye", label: "Eye care" },
  { value: "shield-plus", label: "Immunity" },
  { value: "leaf", label: "Herbal" },
  { value: "microscope", label: "Lab tests" },
  { value: "file-text", label: "Prescription" },
  { value: "shield-check", label: "Genuine / verified" },
  { value: "badge-check", label: "Licensed" },
  { value: "snowflake", label: "Cold chain" },
  { value: "truck", label: "Delivery" },
  { value: "clock", label: "Clock / 24h" },
  { value: "headset", label: "Support" },
  { value: "banknote", label: "Cash on delivery" },
  { value: "lock", label: "Secure / private" },
  { value: "rotate-ccw", label: "Returns / reorder" },
  { value: "phone", label: "Phone" },
  { value: "message-circle", label: "Chat" },
];
