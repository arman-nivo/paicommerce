/**
 * Nest — warm, spacious theme for home & furniture, built on the theme kit.
 *
 * Signature sections: Nest hero (room photo + caption card), shop the room (hotspots), shop by room
 * tiles (live counts), materials & craftsmanship, editorial split, delivery & assembly promise and a
 * financing / EMI banner. Nest also ships its own utility bar, room mega-menu header, showroom
 * footer, landscape product cards and furniture product-page blocks (dimensions, EMI, delivery).
 */
import { createBaseTheme } from "@pai/theme-kit";
import { manifest } from "./manifest";
import { HOME_SETTINGS, nestCssVariables, nestSettingsSchema } from "./settings";
import { homeFooter, homeHeader, presets } from "./presets";
import { homeIndex, templates } from "./config";
import { nestAnnouncement, nestHeader } from "./sections/header";
import { nestFooter } from "./sections/footer";
import { nestHero } from "./sections/hero";
import { shopTheRoom } from "./sections/shop-the-room";
import { roomTiles } from "./sections/room-tiles";
import { materials } from "./sections/materials";
import { editorialSplit } from "./sections/editorial-split";
import { deliveryPromise } from "./sections/delivery-promise";
import { emiBanner } from "./sections/emi-banner";
import { nestMainProduct } from "./sections/main-product";

/** Theme CSS — nested under `.pai-theme-nest` by the storefront. */
const css = `
  & .pai-h1, & .pai-h2 { font-weight: 400; letter-spacing: -0.018em; }
  & .pai-h1 { line-height: 1.04; }
  & .pai-h2 { line-height: 1.1; }
  & .pai-h3, & .pai-h4 { font-weight: 500; }
  & .nest-display { font-size: calc(clamp(2.5rem, 4.8vw, 4.4rem) * var(--pai-heading-scale)); }
  & .nest-title { text-wrap: balance; }
  & .pai-eyebrow { letter-spacing: 0.24em; font-size: 0.7rem; opacity: 1; color: var(--pai-accent); }
  & .pai-btn { font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; font-size: 0.74rem; }
  & .pai-btn-lg { padding-inline: 2rem; min-height: 3.25rem; }
  & .pai-btn-primary:hover { background: var(--pai-accent); border-color: var(--pai-accent); color: #fff; }
  & .pai-btn-link { text-decoration-thickness: 1px; text-underline-offset: 6px; }
  & .nest-link { background: linear-gradient(currentColor, currentColor) 0 100% / 0 1px no-repeat; transition: background-size .35s ease, opacity .2s; }
  & .nest-link:hover { background-size: 100% 1px; }
  & .nest-zoom { transition: transform 1.2s cubic-bezier(.2,.7,.2,1); }
  & a:hover .nest-zoom, & .group:hover .nest-zoom { transform: scale(var(--nest-zoom)); }

  /* Header & mega menu */
  & .nest-header .nest-logo span { font-weight: 500; letter-spacing: 0.02em; font-size: clamp(1.45rem, 2.4vw, 1.9rem); }
  & .nest-nav-link { position: relative; opacity: .82; transition: opacity .2s; }
  & .nest-nav-link::after { content: ""; position: absolute; left: 0; right: 0; bottom: .55rem; height: 1px; background: currentColor; transform: scaleX(0); transform-origin: left; transition: transform .35s ease; }
  & .nest-nav-link:hover, & .nest-nav-link.is-active { opacity: 1; }
  & .nest-nav-link:hover::after, & .nest-nav-link.is-active::after { transform: scaleX(1); }
  & .nest-nav-link:focus-visible { outline: 2px solid var(--pai-accent); outline-offset: 2px; }
  & .nest-mega { box-shadow: 0 40px 60px -40px rgb(var(--pai-fg-rgb) / .35); }
  & .nest-search input { border-radius: var(--pai-radius); background: var(--pai-muted); border-color: transparent; min-height: 2.6rem; font-size: .875rem; }
  & .nest-search input:focus { border-color: var(--pai-fg); background: var(--pai-bg); }

  /* Product cards — big landscape images, calm serif titles, a thin rule and a service note */
  & .pai-product-card { background: var(--nest-card-surface); border: var(--nest-card-border); border-radius: calc(var(--pai-radius) * 1.5); padding: var(--nest-card-pad); }
  & .pai-product-card .pai-card-media { border-radius: var(--pai-radius); }
  & .pai-product-card .pai-card-media > a > img:first-child { transition: transform 1.2s cubic-bezier(.2,.7,.2,1), opacity .5s; }
  & .pai-product-card:hover .pai-card-media > a > img:first-child { transform: scale(var(--nest-zoom)); }
  & .pai-product-card > div:last-child { padding-top: 1rem; gap: .3rem; }
  & .pai-product-card > div:last-child::after { content: var(--nest-card-note); display: var(--nest-card-note-display); margin-top: .55rem; padding-top: .6rem; border-top: 1px solid var(--pai-border); font-size: .72rem; letter-spacing: .04em; opacity: .62; }
  & .pai-product-card h3 { font-family: var(--pai-font-heading); font-size: 1.12rem; font-weight: 400; letter-spacing: -0.005em; }
  & .pai-product-card .pai-card-media .pai-btn { border-radius: var(--pai-button-radius); }

  /* Sections */
  & .nest-steps > li:last-child .nest-step-line { visibility: hidden; }
  & .nest-spot > summary::-webkit-details-marker, & .nest-care > summary::-webkit-details-marker { display: none; }
  & .nest-newsletter input { background: transparent; border-color: currentColor; color: inherit; border-radius: var(--pai-radius); }
  & .nest-newsletter input::placeholder { color: inherit; opacity: .55; }
  & .nest-footer .pai-btn-primary { background: var(--pai-fg); color: var(--pai-bg); border-color: var(--pai-fg); }
`;

export default createBaseTheme({
  manifest,
  sections: [nestAnnouncement, nestHeader, nestFooter, nestHero, shopTheRoom, roomTiles, materials, editorialSplit, deliveryPromise, emiBanner],
  overrideSections: { "main-product": nestMainProduct },
  settingsDefaults: HOME_SETTINGS,
  settingsSchema: nestSettingsSchema,
  cssVariables: nestCssVariables,
  css,
  defaultConfig: (base) => ({
    settings: { ...base.settings, ...HOME_SETTINGS },
    groups: { header: homeHeader(), footer: homeFooter() },
    templates: { ...base.templates, ...templates(), index: homeIndex() },
  }),
  presets,
});
