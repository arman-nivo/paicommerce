import type { CSSProperties } from "react";
import { defineSection, type BlockInstance, type SectionProps } from "@pai/theme-sdk";
import { BadgePercent, RotateCcw, ShieldCheck, Sparkles, Truck, type LucideIcon } from "lucide-react";

/**
 * Example custom section: a promotional banner with a heading, CTA, optional image and
 * a row of "perk" blocks. Copy this file to build your own sections:
 *
 *  1. `schema` describes the settings/blocks merchants edit in the customizer.
 *  2. `component` renders them. It receives resolved settings (defaults already applied),
 *     enabled blocks and the storefront `context` (store, theme settings, data API, url()).
 *  3. Register the section in `src/index.ts`.
 *
 * Styling rules of thumb:
 *  - Use the theme CSS variables (`var(--pai-primary)`, `var(--pai-font-heading)` …) so the
 *    merchant's colour/font choices apply everywhere.
 *  - Build every link with `context.url(path)` so it works under path-based store URLs.
 *  - Components are React Server Components by default; put interactivity in a separate
 *    "use client" file.
 */

type Settings = {
  eyebrow: string;
  heading: string;
  text: string;
  button_label: string;
  button_link: string;
  image: string;
  image_position: "left" | "right";
  color_scheme: "accent" | "primary" | "muted" | "background";
  full_width: boolean;
};

const ICONS: Record<string, LucideIcon> = {
  truck: Truck,
  shield: ShieldCheck,
  returns: RotateCcw,
  discount: BadgePercent,
  sparkles: Sparkles,
};

const SCHEMES: Record<Settings["color_scheme"], { bg: string; fg: string; btnBg: string; btnFg: string }> = {
  accent: { bg: "var(--pai-accent)", fg: "#ffffff", btnBg: "#ffffff", btnFg: "var(--pai-fg)" },
  primary: { bg: "var(--pai-primary)", fg: "var(--pai-primary-fg)", btnBg: "var(--pai-primary-fg)", btnFg: "var(--pai-primary)" },
  muted: { bg: "var(--pai-muted)", fg: "var(--pai-fg)", btnBg: "var(--pai-primary)", btnFg: "var(--pai-primary-fg)" },
  background: { bg: "var(--pai-bg)", fg: "var(--pai-fg)", btnBg: "var(--pai-primary)", btnFg: "var(--pai-primary-fg)" },
};

/** Internal paths go through context.url(); absolute URLs (https://…) are used as-is. */
function href(link: string, url: (p: string) => string): string {
  if (!link) return url("/collections");
  return /^(https?:|mailto:|tel:|#)/.test(link) ? link : url(link.startsWith("/") ? link : `/${link}`);
}

function Perk({ block }: { block: BlockInstance }) {
  const Icon = ICONS[String(block.settings.icon)] ?? Sparkles;
  const title = String(block.settings.title ?? "");
  const text = String(block.settings.text ?? "");
  if (!title && !text) return null;
  return (
    <li data-pai-block={block.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", minWidth: 0 }}>
      <Icon aria-hidden="true" size={22} strokeWidth={1.75} style={{ flexShrink: 0, marginTop: 2 }} />
      <span>
        {title ? <strong style={{ display: "block", fontWeight: 600 }}>{title}</strong> : null}
        {text ? <span style={{ opacity: 0.8, fontSize: 14 }}>{text}</span> : null}
      </span>
    </li>
  );
}

function PromoBanner({ id, settings: s, blocks, context }: SectionProps<Settings>) {
  const scheme = SCHEMES[s.color_scheme] ?? SCHEMES.accent;
  const hasImage = Boolean(s.image);
  const showBadge = context.theme.show_promo_badge !== false && Boolean(s.eyebrow);
  const headingId = `promo-${id}-heading`;

  const wrap: CSSProperties = {
    maxWidth: s.full_width ? "none" : "var(--pai-container, 1280px)",
    margin: "0 auto",
    padding: s.full_width ? 0 : "0 16px",
  };
  const card: CSSProperties = {
    background: scheme.bg,
    color: scheme.fg,
    borderRadius: s.full_width ? 0 : "var(--pai-radius, 8px)",
    overflow: "hidden",
    display: "grid",
    gridTemplateColumns: hasImage ? "repeat(auto-fit, minmax(min(100%, 320px), 1fr))" : "1fr",
  };

  return (
    <section aria-labelledby={headingId} style={{ paddingBlock: "calc(var(--pai-section-spacing, 64px) / 2)", fontFamily: "var(--pai-font-body)" }}>
      <div style={wrap}>
        <div style={card}>
          {hasImage ? (
            // Plain <img>: merchant images come from arbitrary hosts.
            <img
              src={s.image}
              alt=""
              loading="lazy"
              decoding="async"
              style={{ width: "100%", height: "100%", minHeight: 260, objectFit: "cover", order: s.image_position === "right" ? 2 : 0 }}
            />
          ) : null}
          <div style={{ padding: "clamp(28px, 5vw, 64px)", display: "flex", flexDirection: "column", gap: 16, justifyContent: "center", order: 1 }}>
            {showBadge ? (
              <span style={{ alignSelf: "flex-start", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", padding: "4px 10px", borderRadius: 999, border: "1px solid currentColor" }}>
                {s.eyebrow}
              </span>
            ) : null}
            <h2
              id={headingId}
              style={{ margin: 0, fontFamily: "var(--pai-font-heading)", fontSize: "calc(clamp(1.75rem, 4vw, 2.75rem) * var(--pai-heading-scale, 1))", lineHeight: 1.1, fontWeight: 700 }}
            >
              {s.heading || (context.isPreview ? "Add a heading" : "")}
            </h2>
            {s.text ? <p style={{ margin: 0, fontSize: 17, lineHeight: 1.6, opacity: 0.9, maxWidth: "60ch" }}>{s.text}</p> : null}
            {s.button_label ? (
              <a
                href={href(s.button_link, context.url)}
                className="pai-promo-cta"
                style={{
                  alignSelf: "flex-start",
                  marginTop: 8,
                  display: "inline-flex",
                  alignItems: "center",
                  minHeight: 44, // touch target
                  padding: "0 24px",
                  borderRadius: "var(--pai-button-radius, 8px)",
                  background: scheme.btnBg,
                  color: scheme.btnFg,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                {s.button_label}
              </a>
            ) : null}
            {blocks.length ? (
              <ul style={{ listStyle: "none", margin: "16px 0 0", padding: 0, display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
                {blocks.map((b) => (
                  <Perk key={b.id} block={b} />
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

export const promoBanner = defineSection<Settings>({
  schema: {
    type: "__SLUG__-promo-banner",
    name: "Promo banner",
    description: "Highlight a sale or launch with a call to action and store perks.",
    category: "marketing",
    icon: "BadgePercent",
    settings: [
      { type: "text", id: "eyebrow", label: "Badge", default: "Limited time" },
      { type: "text", id: "heading", label: "Heading", default: "Up to 30% off new arrivals" },
      { type: "textarea", id: "text", label: "Text", default: "Fresh picks for the season — delivered anywhere in Bangladesh with cash on delivery." },
      { type: "text", id: "button_label", label: "Button label", default: "Shop the sale" },
      { type: "url", id: "button_link", label: "Button link", default: "/collections", placeholder: "/collections/sale" },
      { type: "header", label: "Design" },
      { type: "image", id: "image", label: "Image", default: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1400&q=80" },
      {
        type: "radio",
        id: "image_position",
        label: "Image position",
        default: "left",
        options: [
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ],
      },
      {
        type: "select",
        id: "color_scheme",
        label: "Color scheme",
        default: "accent",
        options: [
          { value: "accent", label: "Accent" },
          { value: "primary", label: "Primary" },
          { value: "muted", label: "Muted" },
          { value: "background", label: "Background" },
        ],
      },
      { type: "checkbox", id: "full_width", label: "Full width", default: false },
    ],
    blocks: [
      {
        type: "perk",
        name: "Perk",
        limit: 4,
        settings: [
          {
            type: "select",
            id: "icon",
            label: "Icon",
            default: "truck",
            options: [
              { value: "truck", label: "Delivery" },
              { value: "shield", label: "Secure / genuine" },
              { value: "returns", label: "Returns" },
              { value: "discount", label: "Discount" },
              { value: "sparkles", label: "Sparkles" },
            ],
          },
          { type: "text", id: "title", label: "Title", default: "Fast delivery" },
          { type: "text", id: "text", label: "Text", default: "Inside Dhaka in 24 hours" },
        ],
      },
    ],
    maxBlocks: 4,
    presets: [
      {
        name: "Promo banner",
        blocks: [
          { type: "perk", settings: { icon: "truck", title: "Fast delivery", text: "Inside Dhaka in 24 hours" } },
          { type: "perk", settings: { icon: "shield", title: "Cash on delivery", text: "Pay when it arrives" } },
          { type: "perk", settings: { icon: "returns", title: "Easy returns", text: "7-day hassle-free returns" } },
        ],
      },
      { name: "Promo banner (text only)", settings: { image: "", color_scheme: "primary" } },
    ],
  },
  component: PromoBanner,
});
