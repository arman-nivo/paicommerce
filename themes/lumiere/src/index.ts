/**
 * Lumière — jewellery & luxury theme, built on the theme kit.
 *
 * Signature sections: cinematic hero (Ken Burns / video), collection storytelling in chapters,
 * heritage timeline on a gold rule, gift guide by recipient & budget, book-an-appointment and
 * "as seen in" press. Lumière also ships its own announcement bar, header, footer, product-page
 * blocks (certification, gift messaging) and minimal gold-price product cards.
 */
import { createBaseTheme } from "@pai/theme-kit";
import { manifest } from "./manifest";
import { JEWELRY_SETTINGS, lumiereCssVariables, lumiereSettingsSchema } from "./settings";
import { jewelryFooter, jewelryHeader, presets } from "./presets";
import { jewelryIndex, templates } from "./config";
import { lumiereAnnouncement, lumiereHeader } from "./sections/header";
import { lumiereFooter } from "./sections/footer";
import { cinematicHero } from "./sections/hero";
import { collectionStory } from "./sections/collection-story";
import { heritageTimeline } from "./sections/heritage-timeline";
import { giftGuide } from "./sections/gift-guide";
import { appointmentCta } from "./sections/appointment";
import { pressLogos } from "./sections/press";
import { lumiereMainProduct } from "./sections/main-product";

/** Theme CSS — nested under `.pai-theme-lumiere` by the storefront. */
const css = `
  /* Type */
  & .pai-h1, & .pai-h2, & .pai-h3, & .pai-h4 { font-weight: 400; letter-spacing: var(--lumiere-tracking); }
  & .pai-h1 { line-height: 1.04; }
  & .pai-h2 { line-height: 1.12; }
  & .font-heading.font-semibold, & .font-heading.font-bold { font-weight: 500; }
  & .lumiere-display { font-size: calc(clamp(2.8rem, 7vw, 6.4rem) * var(--pai-heading-scale)); line-height: 1; font-weight: 300; }
  & .lumiere-display-2 { font-size: calc(clamp(2rem, 3.6vw, 3.2rem) * var(--pai-heading-scale)); font-weight: 400; }
  & .pai-eyebrow, & .lumiere-eyebrow { font-size: .64rem; letter-spacing: .32em; text-transform: uppercase; font-weight: 500; opacity: 1; color: var(--lumiere-gold); }
  & .lumiere-eyebrow-rule { display: var(--lumiere-rule-display); width: 2.25rem; height: 1px; background: currentColor; opacity: .7; }
  & .lumiere-label { font-size: .62rem; letter-spacing: .28em; text-transform: uppercase; color: var(--lumiere-gold); }
  & .lumiere-gold { color: var(--lumiere-gold); }
  & .lumiere-price { color: var(--lumiere-gold); letter-spacing: .12em; }
  & .lumiere-numeral { color: transparent; -webkit-text-stroke: 1px var(--lumiere-gold); font-weight: 300; }
  & .lumiere-year { color: var(--lumiere-gold); font-weight: 300; }
  & .lumiere-rule-short { width: 3rem; height: 1px; background: var(--lumiere-rule-strong); }
  & .pai-rte blockquote { border-left-color: var(--lumiere-gold); font-family: var(--pai-font-heading); font-size: 1.3em; }

  /* Buttons — square, uppercase, letter-spaced */
  & .pai-btn { border-radius: 0; text-transform: var(--lumiere-btn-transform); letter-spacing: var(--lumiere-btn-tracking); font-size: var(--lumiere-btn-size); font-weight: 500; transition: background-color .5s ease, color .5s ease, border-color .5s ease; }
  & .pai-btn-lg { padding: 1rem 2.4rem; }
  & .pai-btn-primary:hover { background: var(--lumiere-gold); color: #fff; }
  & .pai-btn-secondary { border-width: 1px; }
  & .pai-btn-link { text-decoration: none; padding-bottom: .35rem; border-bottom: 1px solid var(--lumiere-gold); }
  & .pai-btn-link:hover { color: var(--lumiere-gold); }
  & .lumiere-textlink { font-size: .64rem; letter-spacing: .28em; text-transform: uppercase; padding-bottom: .4rem; border-bottom: 1px solid var(--lumiere-gold); transition: color .4s; }
  & .lumiere-textlink:hover { color: var(--lumiere-gold); }
  & .lumiere-underline { background: linear-gradient(var(--lumiere-gold), var(--lumiere-gold)) 0 100% / 100% 1px no-repeat; padding-bottom: 2px; }
  & .pai-input { border-radius: 0; }

  /* Announcement & header */
  & .lumiere-whisper { animation: lumiere-fade 1.2s ease both; }
  & .lumiere-header { --pai-header-h: 154px; border-bottom-color: transparent; }
  & .lumiere-wordmark { font-size: clamp(1.35rem, 3.4vw, 2.35rem); font-weight: 400; }
  & .lumiere-icon svg { stroke-width: 1.1; }
  & .lumiere-navbar-ruled { border-top: 1px solid var(--lumiere-rule); border-bottom: 1px solid var(--lumiere-rule); }
  & .lumiere-header[data-transparent="true"] .lumiere-navbar-ruled { border-color: rgb(255 255 255 / .28); }
  & .lumiere-header[data-scrolled="true"][data-transparent="false"] { box-shadow: none; border-bottom: 1px solid var(--lumiere-rule); }
  & .lumiere-nav-link { transition: color .35s; }
  & .lumiere-nav-link::after { content: ""; position: absolute; left: 0; right: 0; bottom: .7rem; height: 1px; background: var(--lumiere-gold); transform: scaleX(0); transition: transform .45s ease; }
  & .lumiere-nav-link:hover, & .lumiere-nav-link.is-active { color: var(--lumiere-gold); }
  & .lumiere-header[data-transparent="true"] .lumiere-nav-link:hover { color: #fff; }
  & .lumiere-nav-link:hover::after, & .lumiere-nav-link.is-active::after { transform: scaleX(1); }
  & .lumiere-nav-dd > button { padding-block: .875rem; text-transform: inherit; letter-spacing: inherit; font-size: inherit; }
  & .lumiere-nav-dd ul { border-radius: 0; text-transform: none; letter-spacing: .02em; font-size: .9rem; border-color: var(--lumiere-rule); box-shadow: 0 30px 60px -40px rgb(0 0 0 / .35); }
  @media (max-width: 767px) { & .lumiere-header { --pai-header-h: 72px; } & .lumiere-wordmark { font-size: 1.15rem; letter-spacing: .18em; margin-right: -.18em; white-space: nowrap; } }

  /* Cinematic hero */
  & .lumiere-kenburns { animation: var(--lumiere-kb) 26s ease-out both; transform-origin: 50% 40%; }
  & .lumiere-letterbox { box-shadow: 0 1px 0 color-mix(in srgb, var(--lumiere-gold) 60%, transparent); }
  & .lumiere-letterbox-bottom { box-shadow: 0 -1px 0 color-mix(in srgb, var(--lumiere-gold) 60%, transparent); }
  & .lumiere-hero .lumiere-eyebrow { color: #e3cc9f; }
  & .lumiere-hero .pai-btn-light { background: transparent; color: #fff; border: 1px solid rgb(255 255 255 / .75); }
  & .lumiere-hero .pai-btn-light:hover { background: #fff; color: #111; }
  & .lumiere-hero .pai-btn-link { color: #fff; }
  & .lumiere-hero-copy > * { animation: lumiere-rise 1.6s cubic-bezier(.2,.7,.1,1) both; }
  & .lumiere-hero-copy > *:nth-child(2) { animation-delay: .15s; }
  & .lumiere-hero-copy > *:nth-child(3) { animation-delay: .3s; }
  & .lumiere-hero-copy > *:nth-child(4) { animation-delay: .45s; }
  & .lumiere-scroll-line { position: relative; overflow: hidden; }
  & .lumiere-scroll-line::after { content: ""; position: absolute; inset: 0; background: var(--lumiere-gold); animation: lumiere-drip 2.6s ease-in-out infinite; }

  /* Imagery */
  & .lumiere-frame { outline: 1px solid var(--lumiere-rule); outline-offset: 10px; }
  & .lumiere-slowzoom { transition: transform 1.6s cubic-bezier(.2,.7,.1,1); }
  & .lumiere-frame:hover .lumiere-slowzoom, & a:hover > .lumiere-slowzoom, & .group:hover .lumiere-slowzoom { transform: scale(var(--lumiere-zoom)); }
  & .lumiere-double-frame { border: 1px solid var(--lumiere-rule-strong); outline: 1px solid var(--lumiere-rule); outline-offset: -7px; }

  /* Timeline */
  & .lumiere-tl-rule { background: linear-gradient(to bottom, transparent, var(--lumiere-rule-strong) 6%, var(--lumiere-rule-strong) 94%, transparent); }
  & .lumiere-tl-dot { background: var(--pai-bg); border: 1px solid var(--lumiere-gold); }
  & .lumiere-tl-dot::after { content: ""; position: absolute; inset: 3px; background: var(--lumiere-gold); }

  /* Gift guide tabs */
  & .lumiere-tab { opacity: .5; transition: opacity .35s; }
  & .lumiere-tab:hover, & .lumiere-tab[data-selected="true"] { opacity: 1; }
  & .lumiere-tab-bar { background: var(--lumiere-gold); transform: scaleX(0); transition: transform .5s ease; }
  & .lumiere-tab[data-selected="true"] .lumiere-tab-bar { transform: scaleX(1); }

  /* Product cards — minimal, serif title, gold price, ivory tile */
  & .pai-product-card .pai-card-media { background: var(--pai-card); border-radius: 0; }
  & .pai-product-card .pai-card-media img:first-child { transition: transform 1.4s cubic-bezier(.2,.7,.1,1); }
  & .pai-product-card[data-zoom="true"]:hover .pai-card-media img:first-child, & .pai-product-card:hover .pai-card-media img:first-child { transform: scale(var(--lumiere-zoom)); }
  & .pai-product-card .pai-card-img-2 { transition: opacity .9s ease; }
  & .pai-product-card > div:last-child { padding-top: 1.1rem; gap: .45rem; }
  & .pai-product-card h3 { font-family: var(--pai-font-heading); font-size: 1.14rem; font-weight: 400; letter-spacing: .01em; line-height: 1.3; }
  & .pai-product-card h3 a:hover { text-decoration: none; color: var(--lumiere-gold); }
  & .pai-product-card h3 ~ span > span:first-child { font-weight: 400; color: var(--lumiere-gold); letter-spacing: .12em; font-size: .78rem; }
  & .pai-product-card h3 ~ span s { font-size: .72rem; }
  & .pai-product-card .pai-card-media > .pointer-events-none span { border-radius: 0; background: var(--pai-bg); color: var(--pai-fg); font-weight: 500; letter-spacing: .2em; font-size: .56rem; padding: .3rem .55rem; }
  & .pai-product-card .pai-card-media .pai-btn { border-radius: 0; box-shadow: none; }

  /* Footer */
  & .lumiere-footer-link { background: linear-gradient(var(--lumiere-gold), var(--lumiere-gold)) 0 100% / 0 1px no-repeat; transition: background-size .45s, opacity .3s; padding-bottom: 1px; }
  & .lumiere-footer-link:hover { background-size: 100% 1px; }
  & .lumiere-letter-form input { background: transparent; border-width: 0 0 1px; border-color: color-mix(in srgb, currentColor 35%, transparent); color: inherit; }
  & .lumiere-social { border-color: color-mix(in srgb, currentColor 25%, transparent); border-radius: 0; }

  & details.lumiere-details[open] summary span { display: inline-block; transform: rotate(45deg); }

  @media (prefers-reduced-motion: reduce) {
    & .lumiere-kenburns, & .lumiere-hero-copy > *, & .lumiere-scroll-line::after, & .lumiere-whisper { animation: none !important; }
    & .lumiere-slowzoom, & .pai-product-card .pai-card-media img { transition: none !important; transform: none !important; }
    & .lumiere-hero-video { display: none; }
  }
`;

export default createBaseTheme({
  manifest,
  sections: [lumiereAnnouncement, lumiereHeader, lumiereFooter, cinematicHero, collectionStory, heritageTimeline, giftGuide, appointmentCta, pressLogos],
  overrideSections: { "main-product": lumiereMainProduct },
  settingsDefaults: JEWELRY_SETTINGS,
  settingsSchema: lumiereSettingsSchema,
  cssVariables: lumiereCssVariables,
  css,
  defaultConfig: (base) => ({
    settings: { ...base.settings, ...JEWELRY_SETTINGS },
    groups: { header: jewelryHeader(), footer: jewelryFooter() },
    templates: { ...base.templates, ...templates(), index: jewelryIndex() },
  }),
  presets,
});
