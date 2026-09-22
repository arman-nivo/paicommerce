/**
 * Artisan — earthy, story-driven theme for handicrafts & art, built on the theme kit.
 *
 * Signature sections: artisan hero (framed photo, taped polaroid, museum tag), maker story,
 * artisan profiles, made-to-order process, gallery grid, craft regions map and impact numbers.
 * Artisan also ships its own announcement bar, header, footer, product-page blocks (maker,
 * made to order) and framed "gallery" product cards with museum labels.
 */
import { createBaseTheme } from "@pai/theme-kit";
import { manifest } from "./manifest";
import { HANDICRAFT_SETTINGS, artisanCssVariables, artisanSettingsSchema } from "./settings";
import { handicraftFooter, handicraftHeader, presets } from "./presets";
import { handicraftIndex, templates } from "./config";
import { artisanAnnouncement, artisanHeader } from "./sections/header";
import { artisanFooter } from "./sections/footer";
import { artisanHero } from "./sections/hero";
import { makerStory } from "./sections/maker-story";
import { artisanProfiles } from "./sections/artisan-profiles";
import { madeToOrder } from "./sections/made-to-order";
import { galleryGrid } from "./sections/gallery-grid";
import { craftRegions } from "./sections/craft-regions";
import { impactNumbers } from "./sections/impact-numbers";
import { artisanMainProduct } from "./sections/main-product";

const shadow = "0 1px 1px rgb(var(--pai-fg-rgb) / .05), 0 22px 34px -26px rgb(var(--pai-fg-rgb) / .55)";
const paper = "var(--artisan-paper), var(--artisan-fibres)";

/** Theme CSS — nested under `.pai-theme-artisan` by the storefront. */
const css = `
  background-image: ${paper};
  & ::selection { background: rgb(var(--pai-accent-rgb) / .22); }
  & a:focus-visible, & button:focus-visible, & summary:focus-visible, & input:focus-visible { outline: 2px solid var(--pai-accent); outline-offset: 3px; }

  /* Type */
  & .pai-h1, & .pai-h2, & .pai-h3, & .pai-h4 { font-weight: 400; letter-spacing: -0.005em; }
  & .pai-h1 { line-height: 1.04; }
  & .pai-h2 { line-height: 1.1; }
  & .artisan-display { font-size: calc(clamp(2.55rem, 5.4vw, 4.5rem) * var(--pai-heading-scale)); }
  & .pai-eyebrow { letter-spacing: .2em; font-weight: 500; opacity: 1; }
  & .artisan-hand { font-family: var(--artisan-font-hand); font-style: var(--artisan-hand-style); font-weight: 400; letter-spacing: 0; text-transform: none; }
  & .artisan-hand-word { color: var(--pai-accent); font-size: calc(1em * var(--artisan-hand-scale)); line-height: .8; padding-inline: .04em; }
  & .artisan-signature { transform: rotate(-3deg); transform-origin: left bottom; display: inline-block; }
  & .artisan-story > p:first-child::first-letter { float: left; font-family: var(--pai-font-heading); font-size: 3.7em; line-height: .82; padding: .06em .14em 0 0; color: var(--pai-accent); }
  & .artisan-story p + p { margin-top: 1.1em; }

  /* Buttons — a kantha stitch runs inside the solid button */
  & .pai-btn { font-weight: 500; letter-spacing: .12em; text-transform: uppercase; font-size: .76rem; }
  & .pai-btn-lg { font-size: .8rem; }
  & .pai-btn-primary, & .pai-btn-accent { outline: var(--artisan-stitch-w) dashed rgb(var(--pai-primary-fg-rgb) / .45); outline-offset: -6px; }
  & .pai-btn-primary:hover { background: var(--pai-accent); color: #fff; }
  & .pai-btn-primary:focus-visible, & .pai-btn-accent:focus-visible { outline: 2px solid var(--pai-accent); outline-offset: 3px; }
  & .pai-btn-link { letter-spacing: .12em; text-decoration-style: dashed; text-decoration-color: var(--pai-accent); text-decoration-thickness: 1.5px; text-underline-offset: 7px; }
  & .pai-btn-link:hover { text-decoration-style: solid; }

  /* Paper, stitches, mats */
  & .artisan-paper, & .pai-scheme-muted, & .pai-scheme-primary, & .pai-scheme-inverse { background-image: ${paper}; }
  & .artisan-paper-card { background-color: var(--pai-bg); background-image: ${paper}; box-shadow: 0 30px 60px -30px rgb(0 0 0 / .5); }
  & .artisan-stitch { display: var(--artisan-stitch); height: 2px; border-radius: 2px; background: repeating-linear-gradient(90deg, var(--pai-accent) 0 9px, transparent 9px 15px); }
  & .artisan-stitch-indigo { background: repeating-linear-gradient(90deg, var(--artisan-indigo) 0 9px, transparent 9px 15px); }
  & .artisan-stitch-current { background: repeating-linear-gradient(90deg, currentColor 0 9px, transparent 9px 15px); }
  & :is(.pai-scheme-primary, .pai-scheme-inverse) :is(.text-pai-accent, .artisan-hand-word) { color: color-mix(in srgb, var(--pai-accent) 58%, #fff); }
  & .artisan-stitch-box { outline: var(--artisan-stitch-w) dashed rgb(var(--pai-accent-rgb) / .55); outline-offset: -7px; }
  & .artisan-mat { background: var(--pai-card); padding: 8px; box-shadow: 0 0 0 1px rgb(var(--pai-fg-rgb) / .09), ${shadow}; }
  & .artisan-frame, & .artisan-maker-photo, & .artisan-map-card { position: relative; background: var(--pai-card); padding: clamp(10px, 1.5vw, 18px); box-shadow: 0 0 0 1px rgb(var(--pai-fg-rgb) / .1), ${shadow}; }
  & .artisan-frame::after, & .artisan-maker-photo::after, & .artisan-map-card::after { content: ""; position: absolute; inset: 5px; pointer-events: none; border: var(--artisan-stitch-w) dashed rgb(var(--pai-accent-rgb) / .45); }
  & .artisan-maker-photo { padding: 10px; }
  & .artisan-maker-photo::after { inset: 4px; }

  /* Hero bits */
  & .artisan-polaroid { z-index: 2; background: #fffdf7; color: #3a2a20; padding: 8px 8px 10px; box-shadow: 0 20px 34px -18px rgb(0 0 0 / .5); }
  & .artisan-tape { position: absolute; z-index: 1; top: -12px; left: 50%; width: 76px; height: 22px; transform: translateX(-50%) rotate(-4deg); background: rgb(230 214 180 / .78); box-shadow: 0 1px 2px rgb(0 0 0 / .1); }
  & .artisan-tag { z-index: 3; background: var(--pai-card); padding-left: 1.9rem; clip-path: polygon(14px 0, 100% 0, 100% 100%, 14px 100%, 0 50%); filter: drop-shadow(0 10px 14px rgb(var(--pai-fg-rgb) / .25)); transform: rotate(3deg); }
  & .artisan-tag-hole { position: absolute; left: 12px; top: 50%; width: 7px; height: 7px; margin-top: -3.5px; border-radius: 99px; background: var(--pai-bg); box-shadow: inset 0 0 0 1px rgb(var(--pai-fg-rgb) / .35); }

  /* Announcement & header */
  & .artisan-announce { background-image: ${paper}; }
  & .artisan-header { background-image: ${paper}; border-bottom-color: transparent; }
  & .artisan-hem::after { content: ""; position: absolute; left: 0; right: 0; bottom: 4px; height: 2px; display: var(--artisan-stitch); background: repeating-linear-gradient(90deg, var(--artisan-indigo) 0 10px, transparent 10px 17px); opacity: .7; }
  & .artisan-header[data-scrolled="true"] { box-shadow: 0 10px 24px -20px rgb(var(--pai-fg-rgb) / .5); }
  & .artisan-logo span { font-weight: 400; font-size: clamp(1.1rem, 2.8vw, 2.15rem); letter-spacing: .12em; text-transform: uppercase; white-space: nowrap; }
  @media (max-width: 639px) { & .artisan-logo span { letter-spacing: .06em; } & .pai-product-card > div:last-child::before { display: none; } & .pai-product-card h3 { padding-right: 0; } }
  & .artisan-nav-rule { border-top: 1px dashed rgb(var(--pai-fg-rgb) / .22); }
  & .artisan-nav-dot { width: 4px; height: 4px; transform: rotate(45deg); background: var(--pai-accent); opacity: .55; }
  & .artisan-nav-link::after { content: ""; position: absolute; left: .25rem; right: .25rem; bottom: .55rem; height: 1.5px; background: repeating-linear-gradient(90deg, var(--pai-accent) 0 5px, transparent 5px 9px); transform: scaleX(0); transform-origin: left; transition: transform .35s ease; }
  & .artisan-nav-link:hover::after, & .artisan-nav-link.is-active::after { transform: scaleX(1); }
  & .artisan-nav-dd > button { padding-block: .75rem; text-transform: inherit; letter-spacing: inherit; font-weight: inherit; }
  & .artisan-nav-dd ul { text-transform: none; letter-spacing: normal; background-color: var(--pai-bg); background-image: ${paper}; border-radius: var(--pai-radius); box-shadow: 0 24px 48px -28px rgb(var(--pai-fg-rgb) / .5); }
  & .artisan-search input { border-width: 0 0 1px; border-color: rgb(var(--pai-fg-rgb) / .35); border-radius: 0; background: transparent; box-shadow: none; font-style: italic; }
  & .artisan-search input:focus { border-color: var(--pai-accent); }

  /* Product cards — framed gallery pieces with museum labels */
  & .pai-section, & main { counter-reset: artisan-work; }
  & .pai-product-card { counter-increment: artisan-work; background: var(--artisan-card-bg); padding: var(--artisan-mat-pad) var(--artisan-mat-pad) calc(var(--artisan-mat-pad) * .85); border: var(--artisan-frame-w) solid color-mix(in srgb, var(--pai-fg) 82%, #8a5a33); box-shadow: 0 0 0 1px var(--artisan-card-line), ${shadow}; transition: transform .45s cubic-bezier(.2,.8,.2,1), box-shadow .45s; }
  & .pai-product-card:hover { transform: translateY(-3px); box-shadow: 0 0 0 1px var(--artisan-card-line), 0 2px 3px rgb(var(--pai-fg-rgb) / .06), 0 34px 48px -30px rgb(var(--pai-fg-rgb) / .6); }
  & .pai-product-card .pai-card-media { border-radius: 0; }
  & .pai-product-card .pai-card-media::after { content: ""; position: absolute; inset: 0; pointer-events: none; box-shadow: inset 0 0 0 1px rgb(0 0 0 / .1), inset 0 2px 8px rgb(0 0 0 / .14); }
  & .pai-product-card > div:last-child { position: relative; gap: .2rem; margin-top: .85rem; padding-top: .8rem; border-top: 1px dashed rgb(var(--pai-fg-rgb) / .25); }
  & .pai-product-card > div:last-child::before { content: "No. " counter(artisan-work, decimal-leading-zero); position: absolute; right: 0; top: .95rem; font-size: 10px; letter-spacing: .16em; opacity: .5; }
  & .pai-product-card h3 { order: 0; padding-right: 3.2rem; font-family: var(--pai-font-heading); font-size: 1.06rem; font-weight: 400; line-height: 1.3; }
  & .pai-product-card h3 a:hover { text-decoration-style: dashed; text-decoration-color: var(--pai-accent); }
  & .pai-product-card > div:last-child > p:first-child { order: 1; font-size: .8rem; font-style: italic; font-weight: 400; letter-spacing: 0; text-transform: none; opacity: .65; }
  & .pai-product-card > div:last-child > p:first-child::before { content: "by "; }
  & .pai-product-card > div:last-child > :not(h3):not(p:first-child) { order: 2; }
  & .pai-product-card > div:last-child > span:last-child { margin-top: .3rem; font-variant-numeric: tabular-nums; letter-spacing: .02em; }
  & .pai-product-card .pai-card-media .pai-btn { border-radius: 0; }

  /* Footer */
  & .artisan-postcard { background: rgb(var(--pai-fg-rgb) / .04); border: 7px solid transparent; border-image: repeating-linear-gradient(45deg, var(--pai-accent) 0 12px, transparent 12px 22px, var(--artisan-indigo) 22px 34px, transparent 34px 44px) 7; }
  & .artisan-postcard-rule { width: 1px; background: repeating-linear-gradient(180deg, currentColor 0 8px, transparent 8px 14px); opacity: .3; }
  & .artisan-postmark { border: 1.5px solid currentColor; outline: 1.5px solid currentColor; outline-offset: 3px; opacity: .5; transform: rotate(-14deg); }
  & .artisan-stamp { background: #fbf6ec; padding: 5px; outline: 3px dotted var(--pai-bg); outline-offset: -2px; transform: rotate(4deg); box-shadow: 0 6px 12px -6px rgb(0 0 0 / .4); }
  & .artisan-letter-form input { background: transparent; color: inherit; border-width: 0 0 1px; border-color: currentColor; border-radius: 0; }
  & .artisan-letter-form input::placeholder { color: inherit; opacity: .55; }
  & .artisan-impact { border: 1px dashed rgb(var(--pai-fg-rgb) / .35); }
  & .artisan-footer-link { background: linear-gradient(currentColor, currentColor) 0 100% / 0 1px no-repeat; transition: background-size .3s, opacity .2s; }
  & .artisan-footer-link:hover { background-size: 100% 1px; }
  & .artisan-footer-base { border-top: 1px dashed rgb(var(--pai-fg-rgb) / .25); }

  /* Maker story & profiles */
  & .artisan-facts { background: rgb(var(--pai-fg-rgb) / .14); border: 1px solid rgb(var(--pai-fg-rgb) / .14); }
  & .artisan-mini-card { background: var(--pai-card); box-shadow: 0 0 0 1px rgb(var(--pai-fg-rgb) / .1), ${shadow}; outline: var(--artisan-stitch-w) dashed rgb(var(--pai-accent-rgb) / .4); outline-offset: -5px; }
  & .artisan-years { z-index: 2; background: var(--pai-accent); color: #fff; box-shadow: 0 0 0 4px var(--pai-card), 0 10px 20px -10px rgb(0 0 0 / .5); outline: 1px dashed rgb(255 255 255 / .7); outline-offset: -6px; }
  & .artisan-arrow-link { text-decoration: underline dashed rgb(var(--pai-accent-rgb) / .8); text-underline-offset: 6px; }
  & .artisan-arrow-link:hover { text-decoration-style: solid; }

  /* Made to order */
  & .artisan-leadtime { background: var(--pai-card); box-shadow: 0 0 0 1px rgb(var(--pai-fg-rgb) / .08), ${shadow}; }
  & .artisan-step-icon { background: var(--pai-card); color: var(--pai-accent); box-shadow: 0 0 0 1px rgb(var(--pai-fg-rgb) / .12); outline: var(--artisan-stitch-w) dashed rgb(var(--pai-accent-rgb) / .6); outline-offset: -7px; }
  & .artisan-step-photo { box-shadow: 0 0 0 5px var(--pai-card), 0 0 0 6px rgb(var(--pai-fg-rgb) / .12); }
  @media (min-width: 1024px) {
    & .artisan-steps::before { content: ""; position: absolute; top: 39px; left: 40px; right: 12%; height: 2px; display: var(--artisan-stitch); background: repeating-linear-gradient(90deg, var(--artisan-indigo) 0 9px, transparent 9px 15px); opacity: .55; }
  }

  /* Gallery */
  & .artisan-label { background: var(--pai-card); color: var(--pai-fg); box-shadow: 0 10px 20px -12px rgb(0 0 0 / .45); }

  /* Craft map */
  & .artisan-map-land { fill: rgb(var(--pai-accent-rgb) / .1); stroke: var(--pai-accent); stroke-width: .7; stroke-dasharray: 2.2 1.4; }
  & .artisan-map-river { stroke: var(--artisan-indigo); stroke-width: .55; opacity: .5; }
  & .artisan-map-compass { fill: currentColor; opacity: .55; font-family: var(--pai-font-heading); }
  & .artisan-pin-dot { background: var(--artisan-indigo); color: #fff; box-shadow: 0 0 0 3px var(--pai-card), 0 6px 12px -4px rgb(0 0 0 / .45); transition: transform .2s ease, background .2s; }
  & .artisan-pin:hover .artisan-pin-dot, & .artisan-pin:focus-visible .artisan-pin-dot { transform: scale(1.15); background: var(--pai-accent); }
  & .artisan-pin:focus-visible { outline: none; }
  & .artisan-pin:focus-visible .artisan-pin-dot { outline: 2px solid var(--pai-accent); outline-offset: 4px; }
  & .artisan-pin-label { z-index: 5; background: var(--pai-fg); color: var(--pai-bg); border-radius: 2px; }
  & .artisan-region + .artisan-region { border-top: 1px dashed rgb(var(--pai-fg-rgb) / .25); }
  & .artisan-region:target { background: rgb(var(--pai-accent-rgb) / .08); box-shadow: -12px 0 0 rgb(var(--pai-accent-rgb) / .08), 12px 0 0 rgb(var(--pai-accent-rgb) / .08); }
  & .artisan-region-num { border: 1.5px solid var(--artisan-indigo); color: var(--artisan-indigo); }

  /* Impact */
  & .artisan-stat { border-left: 1px dashed rgb(var(--pai-fg-rgb) / .3); }
  & .artisan-stat:nth-child(odd) { border-left-color: transparent; }
  @media (min-width: 1024px) {
    & .artisan-stat:nth-child(odd) { border-left-color: rgb(var(--pai-fg-rgb) / .3); }
    & .artisan-stat:first-child { border-left-color: transparent; }
  }

  /* Product page blocks */
  & .artisan-maker-block { background: var(--pai-card); box-shadow: 0 0 0 1px rgb(var(--pai-fg-rgb) / .1); outline: var(--artisan-stitch-w) dashed rgb(var(--pai-accent-rgb) / .45); outline-offset: -5px; }
  & .artisan-maker-avatar { box-shadow: 0 0 0 3px var(--pai-bg), 0 0 0 4px rgb(var(--pai-accent-rgb) / .5); }
`;

export default createBaseTheme({
  manifest,
  sections: [artisanAnnouncement, artisanHeader, artisanFooter, artisanHero, makerStory, artisanProfiles, madeToOrder, galleryGrid, craftRegions, impactNumbers],
  overrideSections: { "main-product": artisanMainProduct },
  settingsDefaults: HANDICRAFT_SETTINGS,
  settingsSchema: artisanSettingsSchema,
  cssVariables: artisanCssVariables,
  fontSettings: ["font_heading", "font_body", "font_accent"],
  css,
  defaultConfig: (base) => ({
    settings: { ...base.settings, ...HANDICRAFT_SETTINGS },
    groups: { header: handicraftHeader(), footer: handicraftFooter() },
    templates: { ...base.templates, ...templates(), index: handicraftIndex() },
  }),
  presets,
});
