/**
 * Savor — an appetising theme for restaurants, cloud kitchens, bakeries and food brands.
 *
 * Built on the theme kit: a menu-row product card used everywhere, a menu-style header with live
 * opening hours and an "Order now" button, a warm footer with hours and delivery areas, and
 * signature sections (restaurant hero, menu with category tabs, combo deals, chef's story, guest
 * reviews, delivery areas, opening hours & location) plus food blocks on the product page.
 */
import { createBaseTheme } from "@pai/theme-kit";
import { manifest } from "./manifest";
import { FOOD_SETTINGS, savorSettingsSchema } from "./settings";
import { FOOD_FOOTER, FOOD_HEADER, cartTemplate, foodIndex, productTemplate } from "./config";
import { presets } from "./presets";
import { listingOverrides } from "./sections/listings";
import { SavorCard, menuGridClass } from "./sections/card";
import { collectionChips } from "./sections/collection-intro";
import { savorHeader } from "./sections/header";
import { savorFooter } from "./sections/footer";
import { savorHero } from "./sections/hero";
import { savorMenu } from "./sections/menu";
import { savorCombos } from "./sections/combos";
import { savorStory } from "./sections/story";
import { savorReviews } from "./sections/reviews";
import { savorDelivery } from "./sections/delivery";
import { savorHours } from "./sections/hours";
import { savorMainProduct } from "./sections/main-product";
import { sectionList } from "@pai/theme-kit";

/** Theme CSS — nested under `.pai-theme-savor` by the storefront. */
const css = `
  & { --savor-header-h: 64px; }
  @media (min-width: 768px) { & { --savor-header-h: 76px; } }
  & .pai-h1, & .pai-h2, & .pai-h3 { font-weight: 600; letter-spacing: -0.015em; font-optical-sizing: auto; }
  & .pai-h2 { line-height: 1.08; }
  & .pai-eyebrow, & .savor-eyebrow { font-family: var(--pai-font-heading); font-style: italic; text-transform: none; letter-spacing: 0; font-size: 1.05rem; font-weight: 500; opacity: 1; }
  & .pai-btn { font-weight: 600; letter-spacing: 0.01em; }
  & .savor-btn-accent { background: var(--pai-accent); color: #22150c; }
  & .savor-btn-accent:hover { background: color-mix(in srgb, var(--pai-accent) 85%, #fff); }
  & .savor-cta { box-shadow: 0 6px 18px -8px color-mix(in srgb, var(--pai-primary) 70%, transparent); }
  & .savor-hero-title { font-size: calc(clamp(2.5rem, 5.6vw, 4.6rem) * var(--pai-heading-scale)); line-height: 1.02; font-weight: 600; letter-spacing: -0.025em; }
  & .savor-hero-accent { font-style: italic; font-weight: 400; }
  & .savor-hero-glow { background: radial-gradient(circle, color-mix(in srgb, var(--pai-accent) 22%, transparent), transparent 65%); }
  & .savor-arch { border-radius: 999px 999px var(--pai-radius) var(--pai-radius); }
  & .savor-stamp { transform: rotate(-10deg); outline: 2px dashed color-mix(in srgb, var(--pai-fg) 35%, transparent); outline-offset: -8px; }
  & .savor-flourish { width: 72px; height: 10px; background: radial-gradient(circle, var(--pai-accent) 3px, transparent 3.5px) center/14px 10px repeat-x; }
  & .savor-nav-item { position: relative; }
  & .savor-menu-grid > .savor-card { border-bottom: 1px dashed var(--pai-border); }
  & .savor-leader { height: 0; border-bottom: 2px dotted color-mix(in srgb, var(--pai-fg) 28%, transparent); }
  & .savor-card-title a { transition: color .2s; }
  & .savor-tag-veg { background: color-mix(in srgb, #3f9b54 14%, transparent); color: #2f7a41; }
  & .savor-tag-spicy { background: color-mix(in srgb, #c2410c 13%, transparent); color: #b3380a; }
  & .savor-tag-star { background: color-mix(in srgb, var(--pai-accent) 22%, transparent); color: color-mix(in srgb, var(--pai-accent) 45%, var(--pai-fg)); }
  & .savor-tag-new { background: color-mix(in srgb, var(--pai-primary) 12%, transparent); color: var(--pai-primary); }
  & .savor-tag-plain { background: color-mix(in srgb, var(--pai-fg) 8%, transparent); }
  & .savor-ribbon { clip-path: polygon(0 0, 100% 0, calc(100% - 10px) 50%, 100% 100%, 0 100%); padding-right: 1.4rem; }
  & .savor-signature { font-family: var(--pai-font-heading); font-style: italic; font-weight: 400; letter-spacing: -0.01em; }
  & .savor-source-google { background: #e8f0fe; color: #1a56c4; }
  & .savor-source-foodpanda { background: #fde7f1; color: #c8175d; }
  & .savor-source-facebook { background: #e7eefc; color: #1b4fb8; }
  & .savor-source-pathao { background: #fdecea; color: #c7271b; }
  & .savor-source-tripadvisor { background: #e3f6ee; color: #0b7a4b; }
  & .savor-source-website { background: color-mix(in srgb, var(--pai-primary) 12%, transparent); color: var(--pai-primary); }
  & .savor-footer .savor-band-title { font-weight: 500; letter-spacing: -0.02em; }
  & .savor-today dt, & .savor-today dd { color: var(--pai-accent); }
  & .pai-scheme-inverse .savor-today dt, & .pai-scheme-inverse .savor-today dd { color: var(--pai-accent); }
`;

export default createBaseTheme({
  manifest,
  sections: [savorHeader, savorFooter, savorHero, savorMenu, savorCombos, savorStory, savorReviews, savorDelivery, savorHours],
  overrideSections: {
    ...listingOverrides(SavorCard, {
      gridClass: (columns) => menuGridClass(columns),
      perView: () => ({ base: 1.08, md: 2, lg: 2 }),
      collectionIntro: collectionChips,
    }),
    "main-product": savorMainProduct,
  },
  settingsDefaults: FOOD_SETTINGS,
  settingsSchema: savorSettingsSchema,
  css,
  defaultConfig: (base) => ({
    settings: { ...base.settings, ...FOOD_SETTINGS },
    groups: { header: FOOD_HEADER, footer: FOOD_FOOTER },
    templates: {
      ...base.templates,
      index: foodIndex(),
      product: productTemplate(),
      collection: sectionList([{ type: "main-collection", settings: { filters: "drawer", columns: 2, mobile_columns: "1", show_banner: true } }]),
      collections: sectionList([{ type: "main-collections-list" }]),
      search: sectionList([{ type: "main-search", settings: { columns: 2, mobile_columns: "1" } }]),
      cart: cartTemplate(),
      page: sectionList([{ type: "main-page" }]),
      blog: sectionList([{ type: "main-blog" }]),
      article: sectionList([{ type: "main-article" }, { type: "featured-collection", settings: { heading: "Hungry now?", source: "best-selling", limit: 4, columns: 2, mobile_columns: "1" } }]),
      account: sectionList([{ type: "main-account" }]),
      "404": sectionList([{ type: "main-404", settings: { heading: "This dish isn't on the menu", text: "The page you're looking for has moved or never existed. Try the search, or head back to the menu." } }]),
    },
  }),
  presets,
});
