import type { SocialKey } from "../_lib/schema";

/** Minimal monochrome brand marks (lucide ships no brand icons). */
const PATHS: Record<SocialKey, string> = {
  facebook: "M14 8.5V6.8c0-.8.2-1.3 1.4-1.3H17V2.3c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2H7.5v3.3h2.8V22H14V11.8h2.8l.4-3.3H14Z",
  instagram:
    "M12 2.2c3.2 0 3.6 0 4.8.1 3.2.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 3.9 3.9 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2Zm0 4.9a4.9 4.9 0 1 0 0 9.8 4.9 4.9 0 0 0 0-9.8Zm0 8.1a3.2 3.2 0 1 1 0-6.4 3.2 3.2 0 0 1 0 6.4Zm5.1-9.5a1.1 1.1 0 1 0 0 2.3 1.1 1.1 0 0 0 0-2.3Z",
  youtube:
    "M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.2 3.6-6.2 3.6Z",
  tiktok:
    "M19.6 6.7a4.8 4.8 0 0 1-3.8-4.2V2h-3.4v13.7a2.9 2.9 0 1 1-2-2.8V9.4a6.3 6.3 0 1 0 5.4 6.3V8.7a8.2 8.2 0 0 0 4.8 1.5V6.8l-1-.1Z",
  x: "M17.8 2.5h3.3l-7.2 8.2 8.5 11.3h-6.6l-5.2-6.8-6 6.8H1.3l7.7-8.8L.9 2.5h6.8l4.7 6.2 5.4-6.2Zm-1.2 17.5h1.8L6.6 4.4H4.6L16.6 20Z",
  whatsapp:
    "M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.2l-.9 1.1c-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5.3-.5v-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 2.5 1 3 .8 3.6.8.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4ZM12 21.8a9.8 9.8 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8ZM20.5 3.5A11.8 11.8 0 0 0 1.9 17.7L.2 24l6.4-1.7A11.8 11.8 0 0 0 24 12c0-3.2-1.2-6.1-3.5-8.5Z",
  messenger:
    "M12 2C6.4 2 2 6.1 2 11.7c0 2.9 1.2 5.5 3.2 7.3.2.1.3.4.3.6l.1 1.8c0 .6.6 1 1.1.7l2-.9.6-.1c.9.3 1.8.4 2.7.4 5.6 0 10-4.1 10-9.7S17.6 2 12 2Zm6 7.5-2.9 4.7c-.5.7-1.5.9-2.2.4l-2.3-1.7a.6.6 0 0 0-.7 0l-3.1 2.4c-.4.3-1-.2-.7-.6l2.9-4.7c.5-.7 1.5-.9 2.2-.4l2.3 1.7c.2.2.5.2.7 0l3.1-2.4c.4-.3 1 .2.7.6Z",
};

export const SOCIAL_META: Record<SocialKey, { label: string; placeholder: string; hint: string; color: string }> = {
  facebook: { label: "Facebook page", placeholder: "facebook.com/yourpage or yourpage", hint: "Your Facebook page link or page username.", color: "#1877F2" },
  instagram: { label: "Instagram", placeholder: "@yourshop", hint: "Your Instagram username or profile link.", color: "#E4405F" },
  youtube: { label: "YouTube", placeholder: "@yourchannel", hint: "Channel handle or link.", color: "#FF0000" },
  tiktok: { label: "TikTok", placeholder: "@yourshop", hint: "Your TikTok username or profile link.", color: "" },
  x: { label: "X (Twitter)", placeholder: "@yourshop", hint: "Your X username or profile link.", color: "" },
  whatsapp: { label: "WhatsApp", placeholder: "01XXXXXXXXX or wa.me link", hint: "Phone number for WhatsApp chat — Bangladeshi numbers get +88 automatically.", color: "#25D366" },
  messenger: { label: "Messenger", placeholder: "yourpage or m.me/yourpage", hint: "Lets customers message your Facebook page directly.", color: "#0084FF" },
};

export function BrandIcon({ name, className, color }: { name: SocialKey; className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill={color ?? "currentColor"} aria-hidden className={className}>
      <path d={PATHS[name]} />
    </svg>
  );
}
