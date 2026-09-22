/**
 * Bazaar — a dense, high-conversion marketplace storefront built on the theme kit:
 * top bar + big category search header, category-sidebar hero with banner slideshow, flash sale
 * with countdown and sold meters, dense product rails, top brands, category icons, promo banners
 * and an endless "Just for you" feed. The kit's listings (collection, search, related) are
 * restyled to Bazaar's compact white card via the scoped theme CSS below.
 */
import { categoryPreset, createBaseTheme, extendSettingsSchema } from "@pai/theme-kit";
import { manifest } from "./manifest";
import { IMG } from "./images";
import {
  ELECTRONICS_SETTINGS,
  GENERAL_SETTINGS,
  GROCERY_SETTINGS,
  electronicsFooter,
  electronicsHeader,
  electronicsIndex,
  generalFooter,
  generalHeader,
  generalIndex,
  groceryFooter,
  groceryHeader,
  groceryIndex,
  templates,
} from "./config";
import { bazaarHeader } from "./sections/header";
import { bazaarFooter } from "./sections/footer";
import { bazaarHero } from "./sections/hero";
import { bazaarFlashSale } from "./sections/flash-sale";
import { bazaarProductRail, bazaarRelated } from "./sections/product-rail";
import { bazaarTopBrands } from "./sections/top-brands";
import { bazaarJustForYou } from "./sections/just-for-you";
import { bazaarCategoryIcons } from "./sections/category-icons";
import { bazaarPromoBanners, bazaarTrustBar } from "./sections/promo-banners";
import { bazaarMainProduct } from "./sections/main-product";

/** Theme CSS — nested under `.pai-theme-bazaar` by the storefront. */
const css = `
  & :where(a, button, input, select, textarea, summary, [tabindex]):focus-visible { outline: 2px solid var(--pai-primary); outline-offset: 2px; }
  & .bz-catbar :focus-visible, & .bz-header-bold .bz-mainrow :focus-visible, & .bz-footer :focus-visible { outline-color: var(--pai-accent); }
  & .pai-btn { font-weight: 600; }
  & .pai-h1, & .pai-h2, & .pai-h3 { letter-spacing: -0.015em; }
  & h1.pai-h2 { font-size: clamp(1.3rem, 1.1rem + 0.8vw, 1.75rem); line-height: 1.25; font-weight: 600; }

  /* ── micro UI ── */
  & .bz-pill { display: inline-flex; width: fit-content; align-items: center; border-radius: 999px; padding: .15rem .55rem; font-size: 10.5px; font-weight: 700; letter-spacing: .04em; text-transform: uppercase; line-height: 1.35; }
  & .bz-badge { display: inline-flex; align-items: center; padding: .15rem .45rem .15rem .4rem; font-size: 11px; font-weight: 700; line-height: 1.25; border-radius: 0 4px 4px 0; }
  & .bz-chip { display: inline-flex; align-items: center; border: 1px solid var(--pai-border); border-radius: 3px; padding: 0 .3rem; font-size: 9.5px; font-weight: 600; line-height: 1.5; color: color-mix(in srgb, var(--pai-fg) 70%, transparent); white-space: nowrap; }
  & .bz-chip-free { color: #0b8043; border-color: color-mix(in srgb, #0b8043 35%, transparent); background: color-mix(in srgb, #0b8043 7%, transparent); }
  & .bz-meter { background: color-mix(in srgb, var(--pai-sale) 14%, transparent); }
  & .bz-meter > span { background: linear-gradient(90deg, var(--pai-accent), var(--pai-sale)); }
  & .bz-outline-link { border: 1px solid var(--pai-primary); color: var(--pai-primary); transition: background-color .2s, color .2s; }
  & .bz-outline-link:hover { background: var(--pai-primary); color: var(--pai-primary-fg); }
  & .bz-slide-btn { background: var(--pai-accent); color: #1a1a1a; transition: filter .2s, transform .2s; }
  & a:hover .bz-slide-btn { filter: brightness(1.05); transform: translateX(2px); }
  & .bz-head-bar { border-bottom: 1px solid var(--pai-border); }
  & .bz-flash-bar { border-bottom: 1px solid var(--pai-border); background: linear-gradient(90deg, color-mix(in srgb, var(--pai-sale) 9%, var(--pai-card)), var(--pai-card) 70%); }
  & .bz-voucher { border: 1px dashed color-mix(in srgb, var(--pai-primary) 45%, transparent); background: color-mix(in srgb, var(--pai-primary) 6%, var(--pai-card)); }

  /* ── cards: Bazaar's card + the kit card used by collection / search / related pages ── */
  & .bz-card, & .pai-product-card { border: 1px solid transparent; transition: box-shadow .2s ease, border-color .2s ease; }
  & .bz-card:hover, & .pai-product-card:hover { box-shadow: 0 8px 24px -10px rgba(15, 23, 42, .22); border-color: var(--pai-border); }
  & .bz-card-flat:hover { box-shadow: 0 6px 18px -10px rgba(15, 23, 42, .25); border-color: color-mix(in srgb, var(--pai-primary) 40%, transparent); }
  & .bz-card-title { color: color-mix(in srgb, var(--pai-fg) 88%, transparent); }
  & .pai-product-card { background: var(--pai-card); border-radius: var(--pai-radius); overflow: hidden; }
  & .pai-product-card.border-pai-border { border-color: transparent; }
  & .pai-product-card .pai-card-media { background: #fff; border-radius: 0; }
  & .pai-product-card > div:last-child:not(.pai-card-media) { padding: .5rem .6rem .7rem; gap: .2rem; }
  & .pai-product-card h3 { font-size: .82rem; font-weight: 400; line-height: 1.3; min-height: 2.6em; }
  & .pai-product-card h3 a:hover { text-decoration: none; color: var(--pai-primary); }
  & .pai-product-card > div:not(.pai-card-media) > span.inline-flex > span.font-semibold { color: var(--pai-primary); font-weight: 700; font-size: 1rem; font-family: var(--pai-font-heading); }
  & .pai-product-card > div:not(.pai-card-media) > span.inline-flex > s { font-size: .72rem; }
  & .grid:has(> .pai-product-card) { column-gap: .5rem; row-gap: .5rem; }

  /* ── header ── */
  & .bazaar-header { box-shadow: 0 1px 0 var(--pai-border); }
  & .bz-topbar { background: var(--pai-muted); color: color-mix(in srgb, var(--pai-fg) 72%, transparent); }
  & .bz-mainrow { background: var(--pai-card); }
  & .bz-catbar { background: var(--pai-primary); color: var(--pai-primary-fg); }
  & .bz-allcats { background: rgb(0 0 0 / .14); }
  & .bz-allcats:hover, & .bz-allcats[data-open="true"] { background: rgb(0 0 0 / .24); }
  & .bz-quick { opacity: .95; }
  & .bz-quick:hover, & .bz-quick-active { background: rgb(255 255 255 / .14); opacity: 1; }
  & .bz-barnote { opacity: .85; }
  & .bz-deals { background: var(--pai-accent); color: #1a1a1a; box-shadow: 0 2px 10px -4px rgb(0 0 0 / .35); transition: transform .2s; }
  & .bz-deals:hover { transform: translateY(-1px); }
  & .bz-trending { color: color-mix(in srgb, var(--pai-fg) 60%, transparent); }
  & .bz-action { transition: background-color .2s; }
  & .bz-action:hover { background: color-mix(in srgb, var(--pai-fg) 6%, transparent); }
  & .bz-cart-count { background: var(--pai-primary); color: var(--pai-primary-fg); }

  & .bz-header-bold .bz-topbar { background: color-mix(in srgb, var(--pai-primary) 78%, #000); color: rgb(255 255 255 / .85); }
  & .bz-header-bold .bz-toplink:hover { color: var(--pai-accent); }
  & .bz-header-bold .bz-mainrow { background: var(--pai-primary); color: var(--pai-primary-fg); }
  & .bz-header-bold .bz-trending { color: color-mix(in srgb, var(--pai-primary-fg) 80%, transparent); }
  & .bz-header-bold .bz-trending a:hover { color: var(--pai-accent); }
  & .bz-header-bold .bz-action:hover { background: rgb(255 255 255 / .12); }
  & .bz-header-bold .bz-cart-count { background: var(--pai-accent); color: #1a1a1a; }
  & .bz-header-bold .bz-catbar { background: var(--pai-fg); color: var(--pai-bg); }
  & .bz-header-bold .bz-allcats { background: var(--pai-primary); color: var(--pai-primary-fg); }
  & .bz-header-bold .bz-quick:hover, & .bz-header-bold .bz-quick-active { background: rgb(255 255 255 / .1); }
  & .bz-header-bold .bz-search { border-color: var(--pai-accent); }
  & .bz-header-bold .bz-search-btn { background: var(--pai-accent); color: #1a1a1a; }

  /* ── marketplace search ── */
  & .bz-search { position: relative; background: #fff; color: #1a1d23; border: 2px solid var(--pai-primary); }
  & .bz-search:focus-within { box-shadow: 0 0 0 3px rgb(var(--pai-primary-rgb) / .18); }
  & .bz-search-cat { background: var(--pai-muted); color: var(--pai-fg); border-right: 1px solid var(--pai-border); border-radius: max(0px, calc(var(--pai-button-radius) - 2px)) 0 0 max(0px, calc(var(--pai-button-radius) - 2px)); }
  & .bz-search-box .pai-input { min-height: 2.6rem; border: 0; border-radius: 0; background: transparent; box-shadow: none; padding-left: 1rem; color: #1a1d23; }
  & .bz-search-box .pai-input:focus { outline: none; box-shadow: none; }
  & .bz-search-box form label > svg:first-of-type { display: none; }
  & .bz-search-btn { background: var(--pai-primary); color: var(--pai-primary-fg); border-radius: 0 max(0px, calc(var(--pai-button-radius) - 2px)) max(0px, calc(var(--pai-button-radius) - 2px)) 0; }
  & .bz-search-btn:hover { filter: brightness(1.08); }
  & .bz-search-btn:focus-visible { outline-offset: -4px; outline-color: #fff; }
  @media (min-width: 768px) { & .bz-search-box .pai-input { min-height: 2.75rem; } }

  /* ── hero, categories, brands ── */
  & .bz-side-link:hover { background: color-mix(in srgb, var(--pai-primary) 8%, transparent); color: var(--pai-primary); }
  & .bz-cat-icon { box-shadow: inset 0 0 0 1px var(--pai-border); }
  & .bz-cat:hover .bz-cat-icon { box-shadow: 0 0 0 2px var(--pai-primary); }
  & .bz-brand:hover { border-color: color-mix(in srgb, var(--pai-primary) 50%, transparent); box-shadow: 0 8px 22px -12px rgba(15, 23, 42, .3); }
  & .bz-monogram { background: color-mix(in srgb, var(--pai-primary) 12%, #fff); color: var(--pai-primary); }
  & .bz-hero .bz-slide { min-width: 100%; }

  /* ── footer ── */
  & .bz-footer-main { background: color-mix(in srgb, var(--pai-fg) 96%, var(--pai-primary)); color: color-mix(in srgb, var(--pai-bg) 92%, transparent); }
  & .bz-footer-bottom { background: color-mix(in srgb, var(--pai-fg) 85%, #000); color: var(--pai-bg); }
  & .bz-appbtn { border: 1px solid rgb(255 255 255 / .22); background: rgb(255 255 255 / .04); transition: background-color .2s, border-color .2s; }
  & .bz-appbtn:hover { background: rgb(255 255 255 / .1); border-color: var(--pai-accent); }
  & .bz-badge-trust { background: rgb(255 255 255 / .06); border: 1px solid rgb(255 255 255 / .12); }
  & .bz-footer-main .bz-social a { color: inherit; }

  @media (prefers-reduced-motion: reduce) {
    & .bz-card img, & .bz-brand img, & .bz-slide img, & .bz-banner img, & .bz-promo img, & .bz-cat img { transition: none; transform: none !important; }
  }
`;

export default createBaseTheme({
  manifest,
  sections: [bazaarHeader, bazaarFooter, bazaarHero, bazaarFlashSale, bazaarProductRail, bazaarTopBrands, bazaarJustForYou, bazaarCategoryIcons, bazaarPromoBanners, bazaarTrustBar],
  overrideSections: { "main-product": bazaarMainProduct, "related-products": bazaarRelated },
  settingsDefaults: GENERAL_SETTINGS,
  settingsSchema: (base) =>
    extendSettingsSchema(base, [
      {
        name: "Colors",
        settings: [{ type: "color", id: "color_card", label: "Card background", default: GENERAL_SETTINGS.color_card as string, info: "Product cards, panels and the header's white row." }],
      },
      {
        name: "Product cards",
        settings: [
          { type: "header", label: "Marketplace chips" },
          { type: "number", id: "card_free_delivery_over", label: "Show “Free delivery” chip from (৳)", default: 999, min: 0, info: "Products priced at or above this get the chip. 0 hides it." },
          { type: "text", id: "card_free_label", label: "Free delivery chip text", default: "Free delivery" },
          { type: "checkbox", id: "card_show_cod", label: "Show “Cash on delivery” chip", default: true },
          { type: "text", id: "card_cod_label", label: "COD chip text", default: "COD" },
        ],
      },
    ]),
  css,
  defaultConfig: (base) => ({
    settings: { ...base.settings, ...GENERAL_SETTINGS },
    groups: { header: generalHeader(), footer: generalFooter() },
    templates: templates(generalIndex()),
  }),
  presets: [
    categoryPreset("general", {
      name: "Marketplace — Orange",
      description: "Light grey page, white cards and marketplace orange — category sidebar hero, flash sale, dense rails for every category, top brands and a “Just for you” feed.",
      thumbnail: IMG.shoppingBags,
      settings: GENERAL_SETTINGS,
      templates: { index: generalIndex() },
      groups: { header: generalHeader(), footer: generalFooter() },
    }),
    categoryPreset("grocery", {
      name: "Grocery — Fresh market",
      description: "Fresh green with sunshine yellow — aisle icons, today's fresh deals, 60-minute delivery promises and basket-friendly rails.",
      thumbnail: IMG.fruitBasket,
      settings: GROCERY_SETTINGS,
      templates: { index: groceryIndex() },
      groups: { header: groceryHeader(), footer: groceryFooter() },
    }),
    categoryPreset("electronics", {
      name: "Electronics — Tech mall",
      description: "Electric blue with a bold header — lightning deals, official brand stores, EMI & warranty promises and spec-hungry rails.",
      thumbnail: IMG.gamingSetup,
      settings: ELECTRONICS_SETTINGS,
      templates: { index: electronicsIndex() },
      groups: { header: electronicsHeader(), footer: electronicsFooter() },
    }),
  ],
});
