/**
 * Bloom — soft, elegant theme for beauty & cosmetics, built on the theme kit.
 *
 * Signature sections: arched hero, ingredient highlights, before/after slider, routine builder
 * (skin-concern tiles), reviews wall, shop the look and an Instagram-style gallery. Bloom also
 * ships its own announcement bar, header, footer, product-page blocks and soft-shadow cards.
 */
import { createBaseTheme } from "@pai/theme-kit";
import { manifest } from "./manifest";
import { BEAUTY_SETTINGS, bloomCssVariables, bloomSettingsSchema } from "./settings";
import { presets, beautyFooter, beautyHeader } from "./presets";
import { beautyIndex, templates } from "./config";
import { bloomAnnouncement, bloomHeader } from "./sections/header";
import { bloomFooter } from "./sections/footer";
import { bloomHero } from "./sections/hero";
import { ingredientHighlights } from "./sections/ingredients";
import { beforeAfter } from "./sections/before-after";
import { routineBuilder } from "./sections/routine-builder";
import { reviewsWall } from "./sections/reviews-wall";
import { shopTheLook } from "./sections/shop-the-look";
import { socialGallery } from "./sections/social-gallery";
import { bloomMainProduct } from "./sections/main-product";

/** Theme CSS — nested under `.pai-theme-bloom` by the storefront. */
const css = `
  & .pai-h1, & .pai-h2, & .pai-h3 { font-weight: 400; letter-spacing: -0.02em; }
  & .pai-h1 { line-height: 1.02; }
  & .pai-h2 { line-height: 1.08; }
  & .bloom-display { font-size: calc(clamp(2.6rem, 6vw, 4.9rem) * var(--pai-heading-scale)); }
  & .bloom-em { font-style: var(--bloom-em-style); color: var(--bloom-em-color); font-weight: 400; }
  & .pai-eyebrow { letter-spacing: 0.22em; font-weight: 600; opacity: 1; }
  & .pai-btn { font-weight: 500; letter-spacing: 0.02em; }
  & .pai-btn-primary:hover { background: var(--pai-accent); color: #fff; }
  & .pai-btn-link { text-decoration-color: var(--pai-accent); text-decoration-thickness: 1.5px; }
  & .bloom-blobs { display: var(--bloom-blobs); }
  & .bloom-arch { border-radius: 999px 999px var(--pai-radius) var(--pai-radius); }

  /* Header */
  & .bloom-header .bloom-logo span { font-weight: 400; font-style: italic; letter-spacing: -0.01em; white-space: nowrap; font-size: clamp(1.3rem, 4.5vw, 2.2rem); }
  & .bloom-frosted[data-scrolled="true"][data-transparent="false"] { background: rgb(var(--pai-bg-rgb) / 0.82); backdrop-filter: saturate(1.4) blur(14px); }
  & .bloom-nav-link { opacity: .85; }
  & .bloom-nav-link::after { content: ""; position: absolute; left: 50%; bottom: 2px; width: 4px; height: 4px; border-radius: 99px; background: var(--pai-accent); transform: translateX(-50%) scale(0); transition: transform .25s ease; }
  & .bloom-nav-link:hover, & .bloom-nav-link.is-active { opacity: 1; }
  & .bloom-nav-link:hover::after, & .bloom-nav-link.is-active::after { transform: translateX(-50%) scale(1); }
  & .bloom-nav-dd > button { padding-block: .625rem; opacity: .85; text-transform: inherit; letter-spacing: inherit; }
  & .bloom-nav-dd ul { border-radius: calc(var(--pai-radius) * 1.1); text-transform: none; letter-spacing: normal; box-shadow: 0 24px 48px -28px rgb(var(--pai-fg-rgb) / .45); }
  & .bloom-search-pill input { border-radius: 999px; background: var(--pai-muted); border-color: transparent; min-height: 2.5rem; font-size: .875rem; }

  /* Product cards — soft shadows, pillowy corners */
  & .pai-product-card { background: var(--pai-card); border-radius: calc(var(--pai-radius) * 1.1); padding: .6rem .6rem 1.1rem; box-shadow: var(--bloom-card-shadow); transition: transform .45s cubic-bezier(.2,.8,.2,1), box-shadow .45s; }
  & .pai-product-card:hover { transform: translateY(var(--bloom-card-lift)); box-shadow: var(--bloom-card-shadow-hover); }
  & .pai-product-card .pai-card-media { border-radius: calc(var(--pai-radius) * 0.8); }
  & .pai-product-card > div:last-child { padding-inline: .4rem; }
  & .pai-product-card h3 { font-family: var(--pai-font-heading); font-size: 1.05rem; font-weight: 400; }
  & .pai-product-card .pai-card-media .pai-btn { border-radius: 999px; }

  /* Footer */
  & .bloom-footer-link { background: linear-gradient(currentColor, currentColor) 0 100% / 0 1px no-repeat; transition: background-size .3s, opacity .2s; }
  & .bloom-footer-link:hover { background-size: 100% 1px; }
  & .bloom-wordmark { margin-bottom: -0.12em; }

  /* Hotspots & compare slider */
  & .bloom-spot > summary::-webkit-details-marker { display: none; }
  & .bloom-compare-input:focus-visible + * , & .bloom-compare:focus-within { outline: 2px solid var(--pai-accent); outline-offset: 3px; }
`;

export default createBaseTheme({
  manifest,
  sections: [bloomAnnouncement, bloomHeader, bloomFooter, bloomHero, ingredientHighlights, beforeAfter, routineBuilder, reviewsWall, shopTheLook, socialGallery],
  overrideSections: { "main-product": bloomMainProduct },
  settingsDefaults: BEAUTY_SETTINGS,
  settingsSchema: bloomSettingsSchema,
  cssVariables: bloomCssVariables,
  css,
  defaultConfig: (base) => ({
    settings: { ...base.settings, ...BEAUTY_SETTINGS },
    groups: { header: beautyHeader(), footer: beautyFooter() },
    templates: { ...base.templates, ...templates(), index: beautyIndex() },
  }),
  presets,
});

