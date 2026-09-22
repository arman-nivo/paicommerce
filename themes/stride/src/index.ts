/**
 * Stride — a bold, high-energy storefront for sports, fitness and activewear, built on the theme
 * kit: transparent uppercase header with a sport mega menu, video hero with giant stacked type,
 * scrolling text bands, shop-by-sport tiles, tabbed product rails, performance feature callouts,
 * athlete stories and a countdown drop. The kit's listings (collection, search, related) are
 * restyled to Stride's "drop card" look via the scoped theme CSS below.
 */

import { categoryPreset, createBaseTheme, extendSettingsSchema, kitCssVariables, luminance } from "@pai/theme-kit";
import type { SettingValues } from "@pai/theme-sdk";
import { manifest } from "./manifest";
import { IMG } from "./images";
import {
  ACTIVEWEAR_SETTINGS,
  FITNESS_SETTINGS,
  SPORTS_SETTINGS,
  activewearFooter,
  activewearHeader,
  activewearIndex,
  fitnessFooter,
  fitnessHeader,
  fitnessIndex,
  sportsFooter,
  sportsHeader,
  sportsIndex,
  templates,
} from "./config";
import { strideHeader } from "./sections/header";
import { strideFooter } from "./sections/footer";
import { strideHero } from "./sections/hero";
import { strideMarquee } from "./sections/marquee";
import { strideSportTiles } from "./sections/sport-tiles";
import { strideProductTabs } from "./sections/product-tabs";
import { strideFeatureCallouts } from "./sections/feature-callouts";
import { strideAthlete } from "./sections/athlete";
import { strideDrop } from "./sections/drop-countdown";
import { strideMainProduct } from "./sections/main-product";

/** Black or white — whichever contrasts more with `hex` (WCAG contrast ratio). */
function contrastText(hex: string): string {
  const l = luminance(hex);
  return (l + 0.05) / 0.05 >= 1.05 / (l + 0.05) ? "#0a0a0a" : "#ffffff";
}

/** Kit variables plus Stride's own: text colour on the accent, and the heading weight. */
function cssVariables(s: SettingValues): Record<string, string> {
  const vars = kitCssVariables(s);
  const accent = vars["--pai-accent"] ?? "#ff4d00";
  vars["--stride-accent-fg"] = /^#[0-9a-f]{6}$/i.test(accent) ? contrastText(accent) : "#ffffff";
  vars["--stride-heading-weight"] = ["400", "500", "600", "700"].includes(String(s.heading_weight)) ? String(s.heading_weight) : "400";
  return vars;
}

/** Theme CSS — nested under `.pai-theme-stride` by the storefront. */
const css = `
  /* Type: condensed display headings */
  & :where(h1, h2, h3, h4), & .pai-h1, & .pai-h2, & .pai-h3, & .pai-h4, & .font-heading { font-weight: var(--stride-heading-weight, 400); }
  & .pai-h1, & .pai-h2 { letter-spacing: 0.005em; line-height: 0.95; }
  & .pai-h1 { font-size: calc(clamp(2.75rem, 6vw, 5.25rem) * var(--pai-heading-scale)); }
  & .pai-h2 { font-size: calc(clamp(2.25rem, 4.2vw, 3.5rem) * var(--pai-heading-scale)); }
  & .pai-h3 { letter-spacing: 0.01em; line-height: 1; }
  & :where(h2, h3, h4):where(.text-xs, .text-sm) { font-family: var(--pai-font-body); font-weight: 800; letter-spacing: .14em; }
  & .pai-eyebrow { font-weight: 700; letter-spacing: 0.2em; opacity: 1; color: var(--pai-accent); }
  & .stride-display { font-family: var(--pai-font-heading); font-weight: var(--stride-heading-weight, 400); text-transform: uppercase; line-height: 0.86; letter-spacing: 0; }
  & .stride-outline { color: transparent !important; -webkit-text-stroke: max(1.5px, 0.022em) var(--stride-stroke, var(--pai-fg)); }
  & .stride-hero, & .stride-tile { --stride-stroke: #fff; }
  & .stride-kicker { font-family: var(--pai-font-body); display: inline-flex; align-items: center; gap: .6rem; font-size: 11px; font-weight: 800; letter-spacing: .24em; text-transform: uppercase; }
  & .stride-kicker-dot { width: .55rem; height: .55rem; border-radius: 999px; background: var(--pai-accent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--pai-accent) 30%, transparent); }
  & .stride-vertical { writing-mode: vertical-rl; transform: rotate(180deg); }
  & .stride-tag { display: inline-flex; align-items: center; padding: .3rem .6rem; font-size: 10px; font-weight: 800; letter-spacing: .14em; text-transform: uppercase; line-height: 1.2; }
  & .stride-tag-accent { background: var(--pai-accent); color: var(--stride-accent-fg); }
  & .stride-link { display: inline-flex; align-items: center; gap: .5rem; font-size: .8rem; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; border-bottom: 2px solid var(--pai-accent); padding-bottom: .2rem; transition: gap .2s ease, color .2s ease; }
  & .stride-link::after { content: "→"; }
  & .stride-link:hover { gap: .85rem; color: var(--pai-accent); }

  /* Buttons: bold uppercase, arrow nudge; accent buttons get readable text */
  & .pai-btn { font-weight: 800; text-transform: uppercase; letter-spacing: .1em; font-size: .8rem; }
  & .pai-btn-lg { font-size: .85rem; padding-inline: 2.1rem; }
  & .pai-btn-accent { color: var(--stride-accent-fg); }
  & .pai-btn-accent:hover { filter: none; background: color-mix(in srgb, var(--pai-accent) 86%, var(--pai-fg)); }
  & .stride-btn-arrow::after { content: "→"; display: inline-block; transition: transform .2s ease; }
  & .stride-btn-arrow:hover::after { transform: translateX(4px); }
  & .pai-scheme-accent { --pai-fg: var(--stride-accent-fg); --pai-primary: var(--stride-accent-fg); --pai-border: color-mix(in srgb, var(--stride-accent-fg) 25%, transparent); color: var(--pai-fg); }
  & :where(a, button, input, select, textarea, summary, [tabindex]):focus-visible { outline: 2px solid var(--pai-accent); outline-offset: 3px; }

  /* Header */
  & .stride-header[data-transparent="true"] { background: linear-gradient(180deg, rgba(0,0,0,.45), transparent); }
  & .stride-nav-link::after { content: ""; position: absolute; left: 0; right: 0; bottom: 2px; height: 2px; background: var(--pai-accent); transform: scaleX(0); transform-origin: left; transition: transform .25s ease; }
  & .stride-nav-link:hover::after, & .stride-nav-link[data-open="true"]::after, & .stride-nav-active::after { transform: scaleX(1); }
  & .stride-icon-btn { border-radius: 999px; transition: background-color .2s ease; }
  & .stride-icon-btn:hover { background: color-mix(in srgb, currentColor 10%, transparent); }
  & .stride-cart > span.rounded-full { background: var(--pai-accent); color: var(--stride-accent-fg); }

  /* Scrolling bands (hero ticker, text marquee) */
  & .stride-marquee { overflow: hidden; }
  & .stride-marquee-track { display: flex; width: max-content; animation: pai-marquee var(--stride-marquee-duration, 40s) linear infinite; }
  & .stride-marquee-reverse .stride-marquee-track { animation-direction: reverse; }
  & .stride-marquee-group { display: flex; flex-shrink: 0; align-items: center; }
  & .stride-marquee:hover .stride-marquee-track { animation-play-state: paused; }

  /* Tiles */
  & .stride-tile-img { transition: transform .9s cubic-bezier(.2,.8,.2,1), filter .5s ease; }
  & .stride-tile:hover .stride-tile-img, & .stride-tile:focus-visible .stride-tile-img { transform: scale(1.06); }
  & .stride-tile-title { transition: transform .35s ease; }
  & .stride-tile:hover .stride-tile-title { transform: translateY(-4px); }
  & .stride-tile-arrow { transition: transform .35s ease; }
  & .stride-tile:hover .stride-tile-arrow { transform: rotate(45deg); }

  /* Stride card + kit cards (collection, search, related) */
  & .stride-card-img, & .stride-card-img-2 { transition: opacity .45s ease, transform .9s cubic-bezier(.2,.8,.2,1); }
  & .stride-card-img-2 { opacity: 0; }
  & .stride-card:hover .stride-card-img-2 { opacity: 1; }
  & .stride-card:hover .stride-card-img { transform: scale(1.04); }
  & .stride-card-media, & .pai-product-card .pai-card-media { background: var(--pai-card); border-radius: var(--pai-radius); }
  & .stride-qa > div, & .pai-product-card .pai-card-media > div.absolute { z-index: 10; }
  & .stride-qa .pai-btn, & .pai-product-card .pai-card-media .pai-btn { min-height: 2.75rem; border-radius: 0; background: var(--pai-fg); color: var(--pai-bg); box-shadow: none; backdrop-filter: none; }
  & .stride-qa .pai-btn:hover, & .pai-product-card .pai-card-media .pai-btn:hover { background: var(--pai-accent); color: var(--stride-accent-fg); }
  & .stride-qa .absolute.inset-x-2\\.5, & .pai-product-card .pai-card-media .absolute.inset-x-2\\.5 { left: 0; right: 0; bottom: 0; }
  & .stride-qa button.rounded-full { border-radius: 0; background: var(--pai-fg); color: var(--pai-bg); }
  & .pai-product-card h3 { font-family: var(--pai-font-heading); font-weight: var(--stride-heading-weight, 400); text-transform: uppercase; font-size: 1.35rem; line-height: 1.05; letter-spacing: .01em; }
  & .pai-product-card h3 a:hover { text-decoration: none; color: var(--pai-accent); }
  & .pai-product-card > div:last-child { padding-top: 1rem; }
  & .pai-product-card [class*="tabular-nums"], & .pai-product-card .font-semibold { font-family: var(--pai-font-heading); font-weight: var(--stride-heading-weight, 400); font-size: 1.25rem; }
  & .pai-product-card .rounded-full:not(button) { border-radius: 0; }
  & .stride-card-title a { transition: color .2s ease; }

  /* Tabs */
  & .stride-tabs [role="tablist"] { gap: .5rem; border: 0; margin-bottom: .75rem; }
  & .stride-tabs [role="tab"] { border: 2px solid var(--pai-fg); border-radius: 999px; padding: .55rem 1.2rem; margin: 0; opacity: 1; font-size: .75rem; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
  & .stride-tabs [role="tab"][aria-selected="true"] { background: var(--pai-fg); color: var(--pai-bg); }
  & .stride-tabs [role="tab"]:not([aria-selected="true"]):hover { background: color-mix(in srgb, var(--pai-fg) 8%, transparent); }

  /* Feature callouts, drop, footer */
  & .stride-disc { background: radial-gradient(circle at 35% 30%, color-mix(in srgb, var(--pai-accent) 70%, #fff), var(--pai-accent) 70%); }
  & .stride-callout-num { border-radius: 999px; }
  & .stride-quote { text-wrap: balance; }
  & .stride-countdown > div { border-color: var(--pai-border); }
  & .stride-newsletter { max-width: 34rem; }
  & .stride-newsletter .pai-input { min-height: 3.5rem; border-radius: 999px; background: transparent; border: 2px solid var(--pai-border); padding-inline: 1.4rem; }
  & .stride-newsletter .pai-input:focus { border-color: var(--pai-accent); box-shadow: none; }
  & .stride-newsletter .pai-btn { min-height: 3.5rem; background: var(--pai-accent); color: var(--stride-accent-fg); border-radius: 999px; padding-inline: 1.75rem; }
  & .stride-footer-link { display: inline-block; transition: transform .2s ease, color .2s ease; }
  & .stride-footer-link:hover { transform: translateX(4px); }
  & .stride-wordmark { white-space: nowrap; margin-bottom: -0.06em; }
  & article h3.font-heading.text-lg { font-size: 1.6rem; line-height: 1; text-transform: uppercase; letter-spacing: .01em; }

  /* Product page */
  & h3:has(> button[aria-controls^="acc-"]) { font-family: var(--pai-font-body); font-weight: 800; text-transform: uppercase; letter-spacing: .14em; font-size: .78rem; }
  & .stride-fit { border-radius: var(--pai-radius); }
  & [data-pai-section] .pai-rte h2, & [data-pai-section] .pai-rte h3 { text-transform: uppercase; }

  @media (prefers-reduced-motion: reduce) {
    & .stride-marquee-track { animation: none; }
    & .stride-tile-img, & .stride-card-img, & .stride-tile-title, & .stride-tile-arrow, & .stride-footer-link { transition: none; transform: none !important; }
  }
`;

const sportsGroups = () => ({ header: sportsHeader(), footer: sportsFooter() });

export default createBaseTheme({
  manifest,
  sections: [strideHeader, strideFooter, strideHero, strideMarquee, strideSportTiles, strideProductTabs, strideFeatureCallouts, strideAthlete, strideDrop],
  overrideSections: { "main-product": strideMainProduct },
  settingsDefaults: SPORTS_SETTINGS,
  settingsSchema: (base) =>
    extendSettingsSchema(base, [
      {
        name: "Colors",
        settings: [{ type: "color", id: "color_card", label: "Card background", default: SPORTS_SETTINGS.color_card as string, info: "Product card image wells and panels." }],
      },
      {
        name: "Typography",
        settings: [
          {
            type: "select",
            id: "heading_weight",
            label: "Heading weight",
            default: "400",
            info: "Bebas Neue only has one weight (Regular) — use 600–700 with Oswald or Archivo.",
            options: [
              { value: "400", label: "Regular" },
              { value: "500", label: "Medium" },
              { value: "600", label: "Semibold" },
              { value: "700", label: "Bold" },
            ],
          },
        ],
      },
    ]),
  cssVariables,
  css,
  defaultConfig: (base) => ({
    settings: { ...base.settings, ...SPORTS_SETTINGS },
    groups: sportsGroups(),
    templates: templates(sportsIndex()),
  }),
  presets: [
    categoryPreset("sports", {
      name: "Sports — Blaze",
      description: "White and near-black with a blaze-orange accent, Bebas Neue headlines — video hero, shop-by-sport tiles, feature callouts, athlete story and countdown drop.",
      thumbnail: IMG.heroRunners,
      settings: SPORTS_SETTINGS,
      templates: { index: sportsIndex() },
      groups: sportsGroups(),
    }),
    categoryPreset("fashion", {
      name: "Activewear — Studio",
      description: "Warm bone, ink black and acid lime with Oswald headlines — an activewear edit with fabric callouts and a community story.",
      thumbnail: IMG.yellowTracksuit,
      settings: ACTIVEWEAR_SETTINGS,
      templates: { index: activewearIndex() },
      groups: { header: activewearHeader(), footer: activewearFooter() },
    }),
    categoryPreset("health", {
      name: "Fitness & nutrition — Power",
      description: "Clean white, deep navy and electric blue — home-gym equipment, recovery gear and a coach's corner.",
      thumbnail: IMG.liftDark,
      settings: FITNESS_SETTINGS,
      templates: { index: fitnessIndex() },
      groups: { header: fitnessHeader(), footer: fitnessFooter() },
    }),
  ],
});
