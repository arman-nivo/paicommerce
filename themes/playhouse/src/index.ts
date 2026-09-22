/**
 * Playhouse — a playful, colourful theme for kids, toys and pets. Built on the theme kit with its
 * own floating header (Shop by age, wishlist), wavy footer (Playhouse club), "toy box" product card
 * everywhere, and signature sections: playful hero, shop by age, category bubbles, gift finder,
 * bundle deals, parent testimonials and pet corner. Presets: kids (default), pets, gifts.
 */
import { createBaseTheme, cn } from "@pai/theme-kit";
import { manifest } from "./manifest";
import { KIDS_SETTINGS, playhouseCssVariables, playhouseSettingsSchema } from "./settings";
import { KIDS_FOOTER, KIDS_HEADER, kidsIndex, templates } from "./config";
import { presets } from "./presets";
import { listingOverrides } from "./sections/listings";
import { PlayhouseCard } from "./sections/card";
import { playhouseAnnouncement, playhouseHeader } from "./sections/header";
import { playhouseFooter } from "./sections/footer";
import { playhouseHero } from "./sections/hero";
import { shopByAge } from "./sections/shop-by-age";
import { categoryBubbles } from "./sections/category-bubbles";
import { giftFinder } from "./sections/gift-finder";
import { bundleDeals } from "./sections/bundle-deals";
import { parentTestimonials } from "./sections/parent-testimonials";
import { petCorner } from "./sections/pet-corner";
import { playhouseMainProduct } from "./sections/main-product";
import { collectionChips } from "./sections/collection-chips";

/** Theme CSS — nested under `.pai-theme-playhouse`. Keyframes live in `PlayhouseStyles` (see _playhouse.tsx). */
const css = `
  & .pai-h1, & .pai-h2, & .pai-h3 { font-weight: 700; letter-spacing: -0.01em; }
  & .pai-eyebrow { display: inline-block; letter-spacing: .14em; font-weight: 800; opacity: 1; color: color-mix(in srgb, var(--pai-primary) 85%, var(--pai-fg)); }
  & .pai-btn { font-weight: 800; font-family: var(--pai-font-heading); letter-spacing: .01em; }
  & .pai-btn-primary { box-shadow: 0 4px 0 color-mix(in srgb, var(--pai-primary) 55%, black); }
  & .pai-btn-primary:hover, & .ph-btn-pop:hover { transform: translateY(-2px); }
  & .pai-btn-primary:active { transform: translateY(2px); box-shadow: none; }
  & .pai-btn-light { box-shadow: 0 4px 0 rgba(0,0,0,.12); }
  & .pai-input { border-radius: 999px; border-width: 2px; }
  & textarea.pai-input { border-radius: 18px; }
  & .ph-search .pai-input, & .ph-search input { background: var(--pai-muted); border-color: transparent; }
  & .ph-badge { display: inline-flex; align-items: center; gap: .3rem; border-radius: 999px; padding: .2rem .6rem; font-size: 11px; font-weight: 800; line-height: 1.3; letter-spacing: .02em; box-shadow: 0 2px 0 rgba(0,0,0,.1); }
  & .ph-card:hover .pai-card-img-2 { opacity: 1; }
  & .ph-lift { transition: transform .3s cubic-bezier(.2,.8,.2,1), box-shadow .3s; }
  & .ph-lift:hover { transform: translateY(var(--ph-lift, -4px)); }
  & .ph-hover-wiggle:hover .ph-wiggle, & .ph-hover-wiggle:focus-visible .ph-wiggle { animation: var(--ph-wiggle, none) .6s ease-in-out; }
  & .ph-float { animation: var(--ph-float, none) 6s ease-in-out infinite; }
  & .group:hover .ph-orbit { animation: var(--ph-spin, none) 10s linear infinite; }
  & .pai-product-card, & .ph-card { --tw-ring-color: var(--pai-border); }
  & .ph-club-form .pai-input { background: #fff; border-color: transparent; }
  & .ph-club-form .pai-btn-primary { box-shadow: 0 4px 0 rgba(0,0,0,.35); }
  & .ph-footer a:focus-visible, & .ph-footer button:focus-visible { outline: 2px solid var(--ph-c1); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) {
    & * { --ph-wiggle: none; --ph-float: none; --ph-spin: none; --ph-lift: 0px; }
    & .pai-btn-primary:hover, & .ph-btn-pop:hover { transform: none; }
  }
`;

export default createBaseTheme({
  manifest,
  sections: [playhouseHeader, playhouseFooter, playhouseHero, shopByAge, categoryBubbles, giftFinder, bundleDeals, parentTestimonials, petCorner],
  overrideSections: {
    ...listingOverrides(PlayhouseCard, {
      gridClass: (columns, mobile) => {
        const d: Record<number, string> = {
          1: "md:grid-cols-1",
          2: "md:grid-cols-2",
          3: "md:grid-cols-3",
          4: "md:grid-cols-3 lg:grid-cols-4",
          5: "md:grid-cols-3 lg:grid-cols-5",
          6: "md:grid-cols-4 lg:grid-cols-6",
        };
        return cn("grid gap-3 sm:gap-4 md:gap-5", mobile === 1 ? "grid-cols-1" : "grid-cols-2", d[Math.min(6, Math.max(1, columns))]);
      },
      perView: (c) => ({ base: 1.7, md: Math.min(3, c), lg: c }),
      collectionIntro: collectionChips,
    }),
    "announcement-bar": playhouseAnnouncement,
    "main-product": playhouseMainProduct,
  },
  settingsDefaults: KIDS_SETTINGS,
  settingsSchema: playhouseSettingsSchema,
  cssVariables: playhouseCssVariables,
  css,
  defaultConfig: (base) => ({
    settings: { ...base.settings, ...KIDS_SETTINGS },
    groups: { header: KIDS_HEADER(), footer: KIDS_FOOTER() },
    templates: templates(kidsIndex()),
  }),
  presets,
});
