/**
 * Folio — an editorial theme for bookshops, stationers and digital-product stores.
 *
 * Search-first masthead header with a genres row, 2:3 book-cover cards (spine + shadow, author
 * line, format hint, digital badge) used in every listing, and signature sections: editorial hero
 * with a cover stack, bestseller list, genre tiles, book of the month, author spotlight, reading
 * sample and a digital-downloads callout. Presets: books (default), digital, general.
 */
import { createBaseTheme } from "@pai/theme-kit";
import { manifest } from "./manifest";
import { booksIndex, templates } from "./config";
import { booksGroups, presets } from "./presets";
import { BOOKS_SETTINGS, folioSettingsSchema } from "./settings";
import { listingOverrides } from "./sections/listings";
import { FolioCard } from "./sections/card";
import { collectionIntro } from "./sections/collection-intro";
import { folioHeader } from "./sections/header";
import { folioFooter } from "./sections/footer";
import { folioHero } from "./sections/folio-hero";
import { bestsellerList } from "./sections/bestseller-list";
import { genreTiles } from "./sections/genre-tiles";
import { bookOfTheMonth } from "./sections/book-of-the-month";
import { authorSpotlight } from "./sections/author-spotlight";
import { readingSample } from "./sections/reading-sample";
import { digitalCallout } from "./sections/digital-callout";
import { folioMainProduct } from "./sections/main-product";

/** Theme CSS — nested under `.pai-theme-folio` by the storefront. */
const css = `
  & .pai-h1, & .pai-h2, & .pai-h3, & .pai-h4 { font-weight: 400; letter-spacing: -0.012em; }
  & .pai-h1 { line-height: 1.06; }
  & .pai-eyebrow { font-size: .7rem; letter-spacing: .26em; font-weight: 600; opacity: .72; }
  & .pai-btn { letter-spacing: .03em; font-weight: 600; }
  & .pai-product-card h3, & .folio-card h3 { font-family: var(--pai-font-heading); font-weight: 400; }
  & .folio-rule-eyebrow { display: flex; align-items: center; gap: .8rem; }
  & .folio-rule-eyebrow::before { content: ""; width: 2rem; height: 1px; background: currentColor; opacity: .7; }

  /* Book covers */
  & .folio-cover { border-radius: min(var(--pai-radius), 3px); }
  & .folio-cover--flat { border-radius: var(--pai-radius); overflow: hidden; }
  & .folio-cover--book { border-radius: 2px 4px 4px 2px; box-shadow: 0 1px 1px rgb(0 0 0 / .06), 0 3px 6px rgb(0 0 0 / .06), 10px 16px 26px -14px rgb(0 0 0 / .5); transition: transform .5s cubic-bezier(.2,.8,.2,1), box-shadow .5s; }
  & .folio-cover--book > a::after, & .folio-cover--book > div::after { content: ""; position: absolute; inset: 0; pointer-events: none; background: linear-gradient(180deg, rgb(255 255 255 / .1), transparent 28%), linear-gradient(90deg, transparent 88%, rgb(0 0 0 / .08)); box-shadow: inset 0 0 0 1px rgb(0 0 0 / .07); }
  & .folio-spine { background: linear-gradient(90deg, rgb(0 0 0 / .32) 0, rgb(255 255 255 / .28) 2px, rgb(0 0 0 / .14) 5px, rgb(255 255 255 / .1) 9px, transparent 16px); }
  & .folio-cover-img { transition: transform .8s cubic-bezier(.2,.8,.2,1); }
  & .folio-card:hover .folio-cover--book { transform: translateY(-5px) rotate(-.6deg); box-shadow: 0 1px 1px rgb(0 0 0 / .06), 0 4px 8px rgb(0 0 0 / .07), 16px 26px 36px -16px rgb(0 0 0 / .55); }
  & .folio-card:hover .folio-cover--flat .folio-cover-img { transform: scale(1.04); }
  & .folio-cover--thumb { box-shadow: 0 1px 2px rgb(0 0 0 / .1), 4px 6px 12px -6px rgb(0 0 0 / .45); }
  & .folio-cover--hero { box-shadow: 0 2px 4px rgb(0 0 0 / .08), 22px 34px 50px -22px rgb(0 0 0 / .6); }

  /* Header */
  & .folio-search .pai-input { height: 3rem; background: color-mix(in srgb, var(--pai-muted) 75%, var(--pai-bg)); border-color: transparent; border-radius: var(--pai-button-radius); font-size: .95rem; }
  & .folio-search .pai-input:focus { background: var(--pai-bg); border-color: var(--pai-fg); }
  & .folio-search--hero .pai-input { height: 3.5rem; background: var(--pai-bg); border-color: var(--pai-border); box-shadow: 0 10px 30px -18px rgb(0 0 0 / .35); }
  & .folio-genre-link::after { content: ""; position: absolute; left: 0; right: 0; bottom: 4px; height: 1px; background: currentColor; transform: scaleX(0); transform-origin: left; transition: transform .3s; }
  & .folio-genre-link:hover::after { transform: scaleX(1); }

  /* Hero cover stack */
  & .folio-hero-plate { background: color-mix(in srgb, var(--pai-accent) 18%, var(--pai-bg)); }
  & .folio-stack { transition: transform .6s cubic-bezier(.2,.8,.2,1); }
  & .folio-stack-1 { transform: translateY(2%); }
  & .folio-stack-2 { transform: translate(-64%, -3%) rotate(-7deg); }
  & .folio-stack-3 { transform: translate(64%, 5%) rotate(6deg); }
  & .folio-hero:hover .folio-stack-2 { transform: translate(-70%, -5%) rotate(-9deg); }
  & .folio-hero:hover .folio-stack-3 { transform: translate(70%, 3%) rotate(8deg); }
  & .folio-botm-plate { background: color-mix(in srgb, var(--pai-accent) 22%, var(--pai-bg)); }

  /* Bestseller list */
  & .folio-rank { color: var(--pai-primary); font-variant-numeric: oldstyle-nums; }
  & .folio-rank-xl { font-size: 10rem; }

  /* Genres */
  & .folio-genre-initial { font-size: 11rem; }
  & .folio-spine-tile { background-image: linear-gradient(90deg, rgb(0 0 0 / .2), rgb(255 255 255 / .12) 10%, transparent 30%, transparent 78%, rgb(0 0 0 / .18)); box-shadow: 2px 0 4px -2px rgb(0 0 0 / .3); }
  & .folio-shelf-board { background: color-mix(in srgb, var(--pai-fg) 72%, var(--pai-accent)); box-shadow: 0 10px 14px -8px rgb(0 0 0 / .45); }

  /* Author spotlight */
  & .folio-arch { border-radius: 999px 999px var(--pai-radius) var(--pai-radius); }

  /* Reading sample */
  & .folio-page { background: #fffdf6; color: #2b251f; min-height: 24rem; box-shadow: 0 1px 2px rgb(0 0 0 / .06), 0 26px 50px -30px rgb(0 0 0 / .5); border-radius: 2px; }
  & .folio-dropcap > p:first-child::first-letter { float: left; font-size: 3.7em; line-height: .82; padding: .06em .12em 0 0; color: var(--pai-primary); }
  @media (min-width: 768px) {
    & .folio-book--spread { box-shadow: 0 30px 60px -34px rgb(0 0 0 / .55); }
    & .folio-book--spread .folio-page { box-shadow: none; border-radius: 0; }
    & .folio-page--left { background: linear-gradient(270deg, #e9e0cc 0, #f7f1e3 3%, #fffdf6 14%); border-radius: 3px 0 0 3px !important; }
    & .folio-page--right { background: linear-gradient(90deg, #e9e0cc 0, #f7f1e3 3%, #fffdf6 14%); border-radius: 0 3px 3px 0 !important; }
  }

  /* Digital */
  & .folio-digital .folio-digital-card { background: color-mix(in srgb, var(--pai-fg) 6%, transparent); }

  /* Phones: tighter vertical rhythm */
  @media (max-width: 767px) {
    & .pai-section { padding-block: calc(var(--pai-section-spacing) * var(--pai-section-pad, 1) * .62); }
    & .folio-rank-xl { font-size: 6rem; }
    & .folio-genre-initial { font-size: 7rem; }
  }
`;

export default createBaseTheme({
  manifest,
  sections: [folioHeader, folioFooter, folioHero, bestsellerList, genreTiles, bookOfTheMonth, authorSpotlight, readingSample, digitalCallout],
  overrideSections: {
    ...listingOverrides(FolioCard, {
      gridClass: (cols, mobile) => {
        const d: Record<number, string> = {
          1: "md:grid-cols-1",
          2: "md:grid-cols-2",
          3: "md:grid-cols-3",
          4: "md:grid-cols-3 lg:grid-cols-4",
          5: "md:grid-cols-4 lg:grid-cols-5",
          6: "md:grid-cols-4 lg:grid-cols-6",
        };
        return ["grid gap-x-4 gap-y-10 md:gap-x-7 md:gap-y-12", mobile === 1 ? "grid-cols-1" : "grid-cols-2", d[Math.min(6, Math.max(1, cols))]].join(" ");
      },
      perView: (c) => ({ base: 2.2, md: Math.min(4, c), lg: c }),
      collectionIntro,
    }),
    "main-product": folioMainProduct,
  },
  settingsDefaults: BOOKS_SETTINGS,
  settingsSchema: folioSettingsSchema,
  css,
  defaultConfig: (base) => ({
    settings: { ...base.settings, ...BOOKS_SETTINGS },
    groups: booksGroups(),
    templates: { ...base.templates, ...templates(), index: booksIndex() },
  }),
  presets,
});
