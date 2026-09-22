import { z } from "zod";

/** Social networks stored in `settings.social`. */
export const SOCIAL_KEYS = ["facebook", "instagram", "youtube", "tiktok", "x", "whatsapp", "messenger"] as const;
export type SocialKey = (typeof SOCIAL_KEYS)[number];

const HOSTS: Record<Exclude<SocialKey, "whatsapp">, (h: string) => string> = {
  facebook: (h) => `https://facebook.com/${h}`,
  instagram: (h) => `https://instagram.com/${h}`,
  youtube: (h) => `https://youtube.com/${h.startsWith("@") ? h : `@${h}`}`,
  tiktok: (h) => `https://tiktok.com/${h.startsWith("@") ? h : `@${h}`}`,
  x: (h) => `https://x.com/${h}`,
  messenger: (h) => `https://m.me/${h}`,
};

/**
 * Turns what a merchant typed (full URL, `@handle`, page name or — for WhatsApp — a phone number)
 * into a canonical link. Returns "" for empty input and `null` when it can't be understood.
 */
export function normalizeSocial(key: SocialKey, raw: string): string | null {
  const v = raw.trim();
  if (!v) return "";
  if (/^https?:\/\//i.test(v)) {
    try {
      const u = new URL(v);
      return u.hostname.includes(".") ? u.toString().replace(/\/$/, "") : null;
    } catch {
      return null;
    }
  }
  if (/^(www\.)?[a-z0-9-]+\.[a-z.]{2,}\//i.test(v)) return normalizeSocial(key, `https://${v}`);
  if (key === "whatsapp") {
    let d = v.replace(/[\s\-()+]/g, "");
    if (!/^\d{8,15}$/.test(d)) return null;
    if (/^01\d{9}$/.test(d)) d = `88${d}`; // Bangladeshi local number → 8801XXXXXXXXX
    return `https://wa.me/${d}`;
  }
  const handle = key === "youtube" || key === "tiktok" ? v : v.replace(/^@/, "");
  if (!/^@?[\w.\-]{1,100}$/.test(handle)) return null;
  return HOSTS[key](handle);
}

export const TRACKING_PATTERNS = {
  facebookPixelId: { re: /^\d{10,20}$/, msg: "A Meta Pixel ID is 10–20 digits, e.g. 1234567890123456" },
  ga4Id: { re: /^G-[A-Z0-9]{4,16}$/i, msg: "Use the GA4 Measurement ID, e.g. G-AB12CD34EF" },
  gtmId: { re: /^GTM-[A-Z0-9]{4,12}$/i, msg: "Use the container ID, e.g. GTM-AB12CD3" },
  tiktokPixelId: { re: /^[A-Z0-9]{10,30}$/i, msg: "A TikTok Pixel ID is letters and numbers, e.g. C4ABCDEF12GHIJ345678" },
} as const;
export type TrackingKey = keyof typeof TRACKING_PATTERNS;

const trackingField = (k: TrackingKey, upper: boolean) =>
  z
    .string()
    .trim()
    .max(40)
    .refine((v) => !v || TRACKING_PATTERNS[k].re.test(v), TRACKING_PATTERNS[k].msg)
    .transform((v) => (upper ? v.toUpperCase() : v));

const socialField = (k: SocialKey) =>
  z
    .string()
    .trim()
    .max(300, "That link is too long")
    .refine((v) => normalizeSocial(k, v) !== null, k === "whatsapp" ? "Enter a phone number with country code or a wa.me link" : "Enter a full link or a username")
    .transform((v) => normalizeSocial(k, v) ?? "");

const optUrl = z
  .string()
  .trim()
  .max(1000)
  .nullable()
  .refine((v) => !v || /^(https?:\/\/|\/)/i.test(v), "Choose an image from the media library");

export const preferencesSchema = z.object({
  seo: z.object({
    title: z.string().trim().max(120, "Keep the title under 120 characters"),
    description: z.string().trim().max(320, "Keep the description under 320 characters"),
    image: optUrl,
  }),
  faviconUrl: optUrl,
  social: z.object(Object.fromEntries(SOCIAL_KEYS.map((k) => [k, socialField(k)])) as { [K in SocialKey]: ReturnType<typeof socialField> }),
  tracking: z.object({
    facebookPixelId: trackingField("facebookPixelId", false),
    ga4Id: trackingField("ga4Id", true),
    gtmId: trackingField("gtmId", true),
    tiktokPixelId: trackingField("tiktokPixelId", true),
  }),
  password: z
    .object({
      enabled: z.boolean(),
      password: z.string().trim().max(100, "Keep the password under 100 characters"),
      message: z.string().trim().max(500, "Keep the message under 500 characters"),
    })
    .superRefine((p, c) => {
      if (p.enabled && p.password.length < 4) c.addIssue({ code: "custom", path: ["password"], message: "Set a password of at least 4 characters" });
    }),
});

export type PreferencesInput = z.input<typeof preferencesSchema>;

/** Shape of the extra (schema-less) `settings.password` key. */
export type StorePassword = { enabled?: boolean; password?: string; message?: string };

/** Flatten zod issues to `{ "seo.title": "…" }`. */
export function fieldErrorsOf(input: PreferencesInput): Record<string, string> {
  const r = preferencesSchema.safeParse(input);
  if (r.success) return {};
  const out: Record<string, string> = {};
  for (const i of r.error.issues) {
    const k = i.path.join(".");
    if (!out[k]) out[k] = i.message;
  }
  return out;
}
