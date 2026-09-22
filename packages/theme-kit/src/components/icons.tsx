/**
 * Icon helpers. `Icon` resolves lucide icon names (kebab-case "truck", "shield-check" or
 * PascalCase "ShieldCheck") so merchants can pick icons by name in section settings.
 * Server-only in practice: it references the full lucide catalogue, which never ships to the
 * client when used from Server Components.
 */
import { icons, type LucideIcon } from "lucide-react";
import type { StorefrontContext } from "@pai/theme-sdk";
import { cn, str } from "../lib/utils";

function pascal(name: string) {
  return name
    .trim()
    .replace(/[-_\s]+(.)?/g, (_, c: string | undefined) => (c ? c.toUpperCase() : ""))
    .replace(/^(.)/, (c) => c.toUpperCase());
}

/** Resolve a lucide icon component by name (returns null when unknown). */
export function resolveIcon(name: string | null | undefined): LucideIcon | null {
  if (!name) return null;
  const map = icons as unknown as Record<string, LucideIcon>;
  return map[pascal(name)] ?? map[name] ?? null;
}

/** Render a lucide icon by name, e.g. `<Icon name="truck" />`. Unknown names render `fallback`. */
export function Icon({ name, className, strokeWidth = 1.75, fallback = "circle" }: { name: string | null | undefined; className?: string; strokeWidth?: number; fallback?: string }) {
  const C = resolveIcon(name) ?? resolveIcon(fallback);
  if (!C) return null;
  return <C className={cn("size-5", className)} strokeWidth={strokeWidth} aria-hidden />;
}

/** Common icon choices for select settings (value = lucide name). */
export const ICON_OPTIONS = [
  { value: "truck", label: "Truck (delivery)" },
  { value: "banknote", label: "Cash (COD)" },
  { value: "rotate-ccw", label: "Returns" },
  { value: "shield-check", label: "Secure / genuine" },
  { value: "badge-check", label: "Verified" },
  { value: "headset", label: "Support" },
  { value: "package-check", label: "Package" },
  { value: "wallet", label: "Wallet" },
  { value: "credit-card", label: "Card" },
  { value: "gift", label: "Gift" },
  { value: "leaf", label: "Leaf / natural" },
  { value: "sparkles", label: "Sparkles" },
  { value: "heart", label: "Heart" },
  { value: "star", label: "Star" },
  { value: "clock", label: "Clock" },
  { value: "zap", label: "Lightning" },
  { value: "award", label: "Award" },
  { value: "thumbs-up", label: "Thumbs up" },
  { value: "heart-handshake", label: "Care" },
  { value: "map-pin", label: "Location" },
  { value: "phone", label: "Phone" },
  { value: "mail", label: "Mail" },
  { value: "recycle", label: "Recycle" },
  { value: "scissors", label: "Handmade" },
  { value: "shirt", label: "Shirt" },
  { value: "gem", label: "Gem" },
];

/* ─────────────────────────── social ─────────────────────────── */

const SOCIAL_PATHS: Record<string, string> = {
  facebook: "M13.5 21v-7.5h2.5l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3z",
  instagram:
    "M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2zM17 5.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2zM21 8.3c-.1-1.5-.4-2.9-1.5-4-1.1-1.1-2.5-1.4-4-1.5-1.6-.1-6.3-.1-7.9 0-1.5.1-2.9.4-4 1.5S2.1 6.8 2 8.3c-.1 1.6-.1 6.3 0 7.9.1 1.5.4 2.9 1.5 4s2.5 1.4 4 1.5c1.6.1 6.3.1 7.9 0 1.5-.1 2.9-.4 4-1.5 1.1-1.1 1.4-2.5 1.5-4 .1-1.6.1-6.3 0-7.9zm-2 9.6a3.2 3.2 0 0 1-1.8 1.8c-1.3.5-4.2.4-5.2.4s-4 .1-5.2-.4a3.2 3.2 0 0 1-1.8-1.8c-.5-1.3-.4-4.2-.4-5.2s-.1-4 .4-5.2A3.2 3.2 0 0 1 6.8 3.7C8.1 3.2 11 3.3 12 3.3s4-.1 5.2.4A3.2 3.2 0 0 1 19 5.5c.5 1.3.4 4.2.4 5.2s.1 4-.4 5.2z",
  youtube:
    "M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8zM10 15V9l5.2 3L10 15z",
  tiktok:
    "M16.6 5.8A4.3 4.3 0 0 1 15.5 3h-3.1v12.4a2.6 2.6 0 1 1-2.6-2.6c.3 0 .5 0 .8.1V9.7a5.7 5.7 0 1 0 4.9 5.7V9.1a7.3 7.3 0 0 0 4.3 1.4V7.4a4.3 4.3 0 0 1-3.2-1.6z",
  x: "M17.8 3h3.1l-6.8 7.7 8 10.3h-6.2l-4.9-6.3L5.4 21H2.3l7.2-8.3L1.8 3h6.4l4.4 5.8L17.8 3zm-1.1 16.2h1.7L7.3 4.7H5.5l11.2 14.5z",
  whatsapp:
    "M20.5 3.5A11.8 11.8 0 0 0 1.9 17.6L.3 23.5l6-1.6a11.8 11.8 0 0 0 5.7 1.5c6.5 0 11.8-5.3 11.8-11.8 0-3.1-1.2-6.1-3.3-8.1zM12 21.4c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.6.9 1-3.5-.2-.4a9.8 9.8 0 1 1 8.2 4.6zm5.4-7.3c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1l-.9 1.2c-.2.2-.3.2-.6.1a8 8 0 0 1-4-3.5c-.3-.5.3-.5.9-1.6.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4a3.3 3.3 0 0 0-1 2.5c0 1.5 1.1 2.9 1.2 3.1.1.2 2.1 3.2 5.1 4.5 1.9.8 2.6.9 3.6.7.6-.1 1.8-.7 2-1.4.3-.7.3-1.3.2-1.4 0-.2-.2-.3-.5-.4z",
  messenger:
    "M12 2C6.4 2 2 6.1 2 11.7c0 2.9 1.2 5.5 3.2 7.3v3.5l3.3-1.8c.9.3 2 .4 3 .4h.5c5.6 0 10-4.1 10-9.7S17.6 2 12 2zm1 13-2.5-2.7L5.6 15l5.4-5.7 2.6 2.7 4.8-2.7L13 15z",
  linkedin: "M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.5h4V21H3V9.5zm7 0h3.8v1.6h.1c.5-1 1.8-2 3.8-2 4 0 4.8 2.6 4.8 6V21h-4v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V21h-4V9.5z",
};

export const SOCIAL_LABELS: Record<string, string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  youtube: "YouTube",
  tiktok: "TikTok",
  x: "X",
  whatsapp: "WhatsApp",
  messenger: "Messenger",
  linkedin: "LinkedIn",
};

export function SocialIcon({ network, className }: { network: string; className?: string }) {
  const d = SOCIAL_PATHS[network];
  if (!d) return null;
  return (
    <svg viewBox="0 0 24 24" className={cn("size-5 fill-current", className)} aria-hidden>
      <path d={d} />
    </svg>
  );
}

function socialHref(network: string, value: string): string {
  if (/^https?:\/\//.test(value)) return value;
  const v = value.replace(/^@/, "");
  switch (network) {
    case "whatsapp": {
      const digits = v.replace(/\D/g, "");
      return `https://wa.me/${digits.startsWith("0") ? "88" + digits : digits}`;
    }
    case "facebook":
      return `https://facebook.com/${v}`;
    case "instagram":
      return `https://instagram.com/${v}`;
    case "tiktok":
      return `https://tiktok.com/@${v}`;
    case "x":
      return `https://x.com/${v}`;
    case "youtube":
      return `https://youtube.com/${v}`;
    case "messenger":
      return `https://m.me/${v}`;
    default:
      return value;
  }
}

/** Social links from theme settings (`social_*`) falling back to the store's social profile. */
export function getSocialLinks(context: Pick<StorefrontContext, "theme" | "store">): { network: string; label: string; href: string }[] {
  const out: { network: string; label: string; href: string }[] = [];
  for (const network of ["facebook", "instagram", "youtube", "tiktok", "x", "whatsapp", "messenger", "linkedin"]) {
    const v = str(context.theme[`social_${network}`]) || str(context.store.social?.[network]);
    if (v) out.push({ network, label: SOCIAL_LABELS[network] ?? network, href: socialHref(network, v) });
  }
  return out;
}

export function SocialLinks({ context, className, iconClassName }: { context: Pick<StorefrontContext, "theme" | "store">; className?: string; iconClassName?: string }) {
  const links = getSocialLinks(context);
  if (!links.length) return null;
  return (
    <ul className={cn("flex flex-wrap items-center gap-2", className)}>
      {links.map((l) => (
        <li key={l.network}>
          <a href={l.href} target="_blank" rel="noopener noreferrer" aria-label={l.label} className={cn("grid size-9 place-items-center rounded-full border border-current/20 opacity-80 transition hover:opacity-100", iconClassName)}>
            <SocialIcon network={l.network} className="size-4" />
          </a>
        </li>
      ))}
    </ul>
  );
}

/* ─────────────────────────── payment icons ─────────────────────────── */

const PAYMENT_BADGES: Record<string, { label: string; bg: string; fg: string }> = {
  cod: { label: "COD", bg: "#16a34a", fg: "#fff" },
  bkash: { label: "bKash", bg: "#e2136e", fg: "#fff" },
  nagad: { label: "Nagad", bg: "#f6921e", fg: "#fff" },
  rocket: { label: "Rocket", bg: "#8c3494", fg: "#fff" },
  visa: { label: "VISA", bg: "#1a1f71", fg: "#fff" },
  mastercard: { label: "Mastercard", bg: "#eb001b", fg: "#fff" },
  amex: { label: "AMEX", bg: "#2e77bb", fg: "#fff" },
  upay: { label: "Upay", bg: "#0b4ea2", fg: "#fff" },
};

export const PAYMENT_ICON_IDS = Object.keys(PAYMENT_BADGES);

/** Small payment-method badges (COD, bKash, Nagad, Visa …). */
export function PaymentIcons({ methods = ["cod", "bkash", "nagad", "visa", "mastercard"], className }: { methods?: string[]; className?: string }) {
  return (
    <ul className={cn("flex flex-wrap items-center gap-1.5", className)} aria-label="Accepted payment methods">
      {methods
        .filter((m) => PAYMENT_BADGES[m])
        .map((m) => {
          const b = PAYMENT_BADGES[m]!;
          return (
            <li key={m} className="rounded px-2 py-1 text-[10px] font-extrabold leading-none tracking-wide" style={{ background: b.bg, color: b.fg }}>
              {b.label}
            </li>
          );
        })}
    </ul>
  );
}
