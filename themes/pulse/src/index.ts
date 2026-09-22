/**
 * Pulse — a clean, trustworthy storefront for pharmacies, health & wellness, built on the theme kit:
 * licence strip + prescription-upload header with a trust strip, pharmacy hero with medicine search,
 * health-need category icons, WhatsApp prescription orders, consult-a-pharmacist banner, seal-style
 * trust badges, quick reorder and an Rx-aware product page. Kit listings are restyled to Pulse's
 * clinical card via the scoped CSS below.
 */
import { categoryPreset, createBaseTheme, extendSettingsSchema } from "@pai/theme-kit";
import { manifest } from "./manifest";
import { IMG } from "./images";
import {
  BEAUTY_SETTINGS,
  GROCERY_SETTINGS,
  HEALTH_SETTINGS,
  beautyFooter,
  beautyHeader,
  beautyIndex,
  groceryFooter,
  groceryHeader,
  groceryIndex,
  healthFooter,
  healthHeader,
  healthIndex,
  templates,
} from "./config";
import { pulseHeader } from "./sections/header";
import { pulseFooter } from "./sections/footer";
import { pulseHero } from "./sections/hero";
import { pulseHealthCategories } from "./sections/health-categories";
import { pulseRxUpload } from "./sections/rx-upload";
import { pulseConsultBanner } from "./sections/consult-banner";
import { pulseTrust } from "./sections/trust-badges";
import { pulseQuickReorder } from "./sections/quick-reorder";
import { pulseProductRail } from "./sections/product-rail";
import { pulseMainProduct } from "./sections/main-product";

/** Theme CSS — nested under `.pai-theme-pulse` by the storefront. */
const css = `
  & .pai-h1, & .pai-h2 { letter-spacing: -0.025em; font-weight: 800; }
  & .pai-h3 { font-weight: 700; letter-spacing: -0.01em; }
  & .pulse-display { color: color-mix(in srgb, var(--pai-fg) 92%, var(--pai-primary)); }
  & .pai-eyebrow { letter-spacing: .12em; opacity: 1; }
  & .pulse-pill { display: inline-flex; align-items: center; border-radius: 999px; padding: .15rem .55rem; font-size: 10.5px; font-weight: 700; line-height: 1.5; }
  & :where(a, button, input, select, textarea, [tabindex]):focus-visible { outline: 2px solid var(--pai-primary); outline-offset: 2px; }

  /* Header & search */
  & .pulse-search .pai-input { min-height: 2.9rem; border-radius: 999px; background: var(--pai-muted); border-color: transparent; padding-left: 2.75rem; }
  & .pulse-search .pai-input:focus { background: var(--pai-bg); border-color: var(--pai-primary); box-shadow: 0 0 0 4px rgb(var(--pai-primary-rgb) / .12); }
  & .pulse-search-lg .pai-input { min-height: 3.5rem; font-size: 1rem; background: var(--pai-bg); border-color: var(--pai-border); box-shadow: 0 12px 32px -18px rgb(var(--pai-primary-rgb) / .45); }

  /* Cards — Pulse's own card and the kit card used by collection/search/related pages */
  & .pulse-card, & .pai-product-card { transition: box-shadow .25s ease, border-color .25s ease, transform .25s ease; }
  & .pulse-card:hover, & .pai-product-card:hover { border-color: rgb(var(--pai-primary-rgb) / .35); box-shadow: 0 16px 40px -24px rgb(var(--pai-primary-rgb) / .55); }
  & .pai-product-card .pai-card-media { background: var(--pai-muted); }
  & .pai-product-card h3 { font-weight: 600; font-size: .9rem; }
  & .pai-product-card p.text-\\[11px\\] { color: var(--pai-primary); opacity: 1; letter-spacing: .02em; text-transform: none; }
  & .pulse-add { min-height: 2.4rem; font-size: .8125rem; }
  & .pulse-float { animation: pulse-float 6s ease-in-out infinite; }
  & .pulse-float:nth-of-type(3) { animation-delay: -3s; }
  @keyframes pulse-float { 0%, 100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
  @media (prefers-reduced-motion: reduce) { & .pulse-float { animation: none; } }
`;

export default createBaseTheme({
  manifest,
  sections: [pulseHeader, pulseFooter, pulseHero, pulseHealthCategories, pulseRxUpload, pulseConsultBanner, pulseTrust, pulseQuickReorder, pulseProductRail],
  overrideSections: { "main-product": pulseMainProduct },
  settingsDefaults: HEALTH_SETTINGS,
  settingsSchema: (base) =>
    extendSettingsSchema(base, [
      {
        name: "Colors",
        settings: [{ type: "color", id: "color_card", label: "Card background", default: HEALTH_SETTINGS.color_card as string, info: "Product cards and panels." }],
      },
    ]),
  css,
  defaultConfig: (base) => ({
    settings: { ...base.settings, ...HEALTH_SETTINGS },
    groups: { header: healthHeader(), footer: healthFooter() },
    templates: templates(healthIndex()),
  }),
  presets: [
    categoryPreset("health", {
      name: "Pharmacy — Clinic",
      description: "Clean white, deep teal and fresh green with Plus Jakarta Sans — prescription upload, consult banner, trust badges and quick reorder.",
      thumbnail: IMG.pharmacyStore,
      settings: HEALTH_SETTINGS,
      templates: { index: healthIndex() },
      groups: { header: healthHeader(), footer: healthFooter() },
    }),
    categoryPreset("beauty", {
      name: "Beauty & personal care — Derma",
      description: "Soft blush and plum with Fraunces headings and pill buttons — shop by skin concern and expert routine chat.",
      thumbnail: IMG.skincareSet,
      settings: BEAUTY_SETTINGS,
      templates: { index: beautyIndex() },
      groups: { header: beautyHeader(), footer: beautyFooter() },
    }),
    categoryPreset("grocery", {
      name: "Organic & wellness grocery",
      description: "Leafy green and honey with Outfit headings — aisles, weekly essentials reorder and freshness promises.",
      thumbnail: IMG.fruitsMix,
      settings: GROCERY_SETTINGS,
      templates: { index: groceryIndex() },
      groups: { header: groceryHeader(), footer: groceryFooter() },
    }),
  ],
});
