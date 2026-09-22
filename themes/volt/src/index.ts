/**
 * Volt — a dark, high-contrast storefront for electronics & gadgets, built on the theme kit:
 * search-first header with a category mega menu, launch hero, flash deals with countdown,
 * spec comparison table, tech-spec spotlight, brand marquee, bento feature grid and tabbed
 * product rails. The kit's listings (collection, search, related) are restyled to Volt's
 * "spec card" look via the scoped theme CSS below.
 */

import { categoryPreset, createBaseTheme, extendSettingsSchema } from "@pai/theme-kit";
import { manifest } from "./manifest";
import { IMG } from "./images";
import {
  AUTOMOTIVE_SETTINGS,
  DAYLIGHT_SETTINGS,
  ELECTRONICS_SETTINGS,
  automotiveFooter,
  automotiveHeader,
  automotiveIndex,
  electronicsFooter,
  electronicsHeader,
  electronicsIndex,
  templates,
} from "./config";
import { voltHeader } from "./sections/header";
import { voltFooter } from "./sections/footer";
import { voltHero } from "./sections/hero";
import { voltFlashDeals } from "./sections/flash-deals";
import { voltSpecCompare } from "./sections/spec-compare";
import { voltSpecHighlight } from "./sections/spec-highlight";
import { voltBrandCarousel } from "./sections/brand-carousel";
import { voltBento } from "./sections/bento-grid";
import { voltProductTabs } from "./sections/product-tabs";
import { voltMainProduct } from "./sections/main-product";

/** Theme CSS — nested under `.pai-theme-volt` by the storefront. */
const css = `
  & .pai-h1, & .pai-h2, & .pai-h3 { letter-spacing: -0.03em; }
  & .volt-display { background: linear-gradient(180deg, var(--pai-fg) 30%, color-mix(in srgb, var(--pai-fg) 55%, transparent)); -webkit-background-clip: text; background-clip: text; color: transparent; }
  & .volt-chip { display: inline-flex; align-items: center; border-radius: 999px; padding: 0.2rem 0.6rem; font-size: 10px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; line-height: 1.4; }
  & .volt-meter { background: linear-gradient(90deg, var(--pai-sale), var(--pai-primary)); }
  & .volt-btn-glow.pai-btn-primary { box-shadow: 0 0 0 0 rgb(var(--pai-primary-rgb) / 0), 0 10px 40px -10px rgb(var(--pai-primary-rgb) / 0.7); }
  & .volt-btn-glow.pai-btn-primary:hover { box-shadow: 0 0 0 4px rgb(var(--pai-primary-rgb) / 0.18), 0 10px 40px -8px rgb(var(--pai-primary-rgb) / 0.8); }
  & .pai-btn { font-weight: 600; letter-spacing: 0.01em; }
  & :where(a, button, input, select, textarea, [tabindex]):focus-visible { outline: 2px solid var(--pai-primary); outline-offset: 2px; }

  /* Search-first header */
  & .volt-header { background: color-mix(in srgb, var(--pai-bg) 88%, transparent); backdrop-filter: saturate(1.4) blur(14px); }
  & .volt-search .pai-input { min-height: 3rem; border-radius: 999px; background: var(--pai-muted); border-color: var(--pai-border); padding-left: 2.75rem; }
  & .volt-search .pai-input:focus { border-color: var(--pai-primary); box-shadow: 0 0 0 4px rgb(var(--pai-primary-rgb) / 0.15); }
  & .volt-newsletter .pai-input { background: var(--pai-bg); }

  /* Cards — Volt's own card and the kit card used by collection/search/related pages */
  & .volt-card, & .pai-product-card { background: var(--pai-card); }
  & .volt-card:hover, & .pai-product-card:hover { border-color: rgb(var(--pai-primary-rgb) / 0.45); box-shadow: 0 18px 50px -24px rgb(var(--pai-primary-rgb) / 0.45); transform: translateY(-2px); }
  & .volt-card, & .pai-product-card { transition: transform .3s ease, box-shadow .3s ease, border-color .3s ease; }
  & .volt-card-media, & .pai-product-card .pai-card-media { background: radial-gradient(90% 90% at 50% 40%, color-mix(in srgb, var(--pai-muted) 70%, var(--pai-fg) 6%), var(--pai-muted)); }
  & .pai-product-card h3 { font-weight: 500; }
  & .pai-product-card .text-pai-sale { color: var(--pai-primary); }

  /* Tabs & comparison */
  & .volt-tabs [role="tablist"] { gap: .5rem; border: 0; margin-bottom: .5rem; }
  & .volt-tabs [role="tab"] { border: 1px solid var(--pai-border); border-radius: 999px; padding: .5rem 1rem; margin: 0; opacity: .75; }
  & .volt-tabs [role="tab"][aria-selected="true"] { background: var(--pai-primary); color: var(--pai-primary-fg); border-color: var(--pai-primary); opacity: 1; }
  & .volt-compare-hl { box-shadow: inset 0 2px 0 var(--pai-primary); }
  & .volt-stat { text-shadow: 0 0 40px rgb(var(--pai-primary-rgb) / 0.55); }
  @media (prefers-reduced-motion: reduce) { & .volt-card:hover, & .pai-product-card:hover { transform: none; } }
`;

export default createBaseTheme({
  manifest,
  sections: [voltHeader, voltFooter, voltHero, voltFlashDeals, voltSpecCompare, voltSpecHighlight, voltBrandCarousel, voltBento, voltProductTabs],
  overrideSections: { "main-product": voltMainProduct },
  settingsDefaults: ELECTRONICS_SETTINGS,
  settingsSchema: (base) =>
    extendSettingsSchema(base, [
      {
        name: "Colors",
        settings: [{ type: "color", id: "color_card", label: "Card background", default: ELECTRONICS_SETTINGS.color_card as string, info: "Product cards and panels." }],
      },
    ]),
  css,
  defaultConfig: (base) => ({
    settings: { ...base.settings, ...ELECTRONICS_SETTINGS },
    groups: { header: electronicsHeader(), footer: electronicsFooter() },
    templates: templates(electronicsIndex()),
  }),
  presets: [
    categoryPreset("electronics", {
      name: "Electronics — Midnight",
      description: "Near-black with volt-lime and cyan, Space Grotesk headings — launch hero, flash deals, spec comparison and brand marquee.",
      thumbnail: IMG.phoneDark,
      settings: ELECTRONICS_SETTINGS,
      templates: { index: electronicsIndex() },
      groups: { header: electronicsHeader(), footer: electronicsFooter() },
    }),
    categoryPreset("automotive", {
      name: "Automotive — Garage",
      description: "Graphite, racing red and amber with uppercase Archivo headings — parts, oils and car-care with a fitment promise.",
      thumbnail: IMG.autoGarage,
      settings: AUTOMOTIVE_SETTINGS,
      templates: { index: automotiveIndex() },
      groups: { header: automotiveHeader(), footer: automotiveFooter() },
    }),
    categoryPreset("general", {
      name: "Tech store — Daylight",
      description: "A bright, clean tech store in electric blue — same layouts as Midnight in a light colour scheme.",
      thumbnail: IMG.deskTech,
      settings: DAYLIGHT_SETTINGS,
      templates: { index: electronicsIndex() },
      groups: { header: electronicsHeader(), footer: electronicsFooter() },
    }),
  ],
});
