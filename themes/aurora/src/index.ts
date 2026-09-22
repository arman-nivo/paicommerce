/**
 * Aurora — PaiCommerce's default theme. An editorial, image-first storefront built on the theme kit:
 * editorial hero, shoppable lookbooks, a size guide on the product page, split collection banners,
 * a shop-the-look product row and a mega-menu header. Quick view (quick add on cards) and the
 * sticky add-to-cart bar come from the kit and are enabled by default.
 */
import { categoryPreset, createBaseTheme } from "@pai/theme-kit";
import { manifest } from "./manifest";
import { IMG } from "./images";
import {
  FASHION_SETTINGS,
  GENERAL_SETTINGS,
  JEWELRY_SETTINGS,
  fashionIndex,
  footerGroup,
  generalIndex,
  headerGroup,
  jewelryIndex,
  productTemplate,
} from "./config";
import { auroraHero } from "./sections/aurora-hero";
import { lookbook } from "./sections/lookbook";
import { sizeGuide } from "./sections/size-guide";
import { editorialCollection } from "./sections/editorial-collection";
import { splitBanner } from "./sections/split-banner";
import { auroraHeader } from "./sections/header";
import { auroraMainProduct } from "./sections/main-product";

/** Theme CSS — nested under `.pai-theme-aurora` by the storefront. Kept deliberately small. */
const css = `
  & .pai-h1, & .pai-h2, & .pai-h3 { font-weight: 500; letter-spacing: -0.01em; }
  & .pai-h1 { line-height: 1.02; }
  & .pai-eyebrow { letter-spacing: 0.24em; font-weight: 500; opacity: .7; }
  & .pai-btn { text-transform: uppercase; letter-spacing: 0.14em; font-size: 0.78rem; font-weight: 600; }
  & .pai-btn-lg { font-size: 0.8rem; padding-inline: 2.25rem; }
  & .pai-btn-link { letter-spacing: 0.16em; text-decoration-thickness: 1px; }
  & .pai-product-card h3 { font-size: 0.9rem; font-weight: 400; letter-spacing: 0.01em; }
  & .aurora-product-title { font-size: calc(clamp(1.9rem, 3vw, 2.75rem) * var(--pai-heading-scale)); }
  & .aurora-header .aurora-logo span { font-weight: 500; letter-spacing: 0.06em; }
  & .aurora-dialog[open] { animation: pai-pop .2s ease-out; }
  & .aurora-dialog::backdrop { background: rgb(0 0 0 / .5); }
  & .aurora-hotspot > summary::-webkit-details-marker { display: none; }
`;

const ABOUT = "Considered clothing and objects for everyday life — designed in small runs, delivered nationwide.";

const fashionHeader = headerGroup(["Complimentary delivery on orders over ৳3,000", "Cash on delivery nationwide · Easy 7-day exchanges"], {
  image: IMG.editorialWoman,
  heading: "The new season edit",
  text: "Considered pieces for every day.",
});

export default createBaseTheme({
  manifest,
  sections: [auroraHero, lookbook, editorialCollection, splitBanner, sizeGuide, auroraHeader],
  overrideSections: { "main-product": auroraMainProduct },
  settingsDefaults: FASHION_SETTINGS,
  css,
  defaultConfig: (base) => ({
    settings: { ...base.settings, ...FASHION_SETTINGS },
    groups: { header: fashionHeader, footer: footerGroup(ABOUT) },
    templates: {
      ...base.templates,
      index: fashionIndex(),
      product: productTemplate(),
    },
  }),
  presets: [
    categoryPreset("fashion", {
      name: "Fashion & Apparel",
      description: "Warm ivory, ink and camel with Cormorant Garamond headings — full-bleed hero, lookbook and shop-the-look.",
      thumbnail: IMG.heroFashion,
      settings: FASHION_SETTINGS,
      templates: { index: fashionIndex() },
      groups: { header: fashionHeader, footer: footerGroup(ABOUT) },
    }),
    categoryPreset("jewelry", {
      name: "Jewelry & Accessories",
      description: "Porcelain white with antique gold accents, square product imagery and a split editorial hero.",
      thumbnail: IMG.heroJewelry,
      settings: JEWELRY_SETTINGS,
      templates: { index: jewelryIndex() },
      groups: {
        header: headerGroup(["Insured, tracked delivery on every order", "Complimentary gift wrapping · Certified purity"], {
          image: IMG.jewelryEarrings,
          heading: "Everyday gold",
          text: "Delicate pieces made to layer.",
        }),
        footer: footerGroup("Fine jewellery, hand-finished in small batches and certified for purity — delivered insured, nationwide."),
      },
    }),
    categoryPreset("general", {
      name: "General Store",
      description: "Crisp white and charcoal with Playfair Display headings — a refined, editorial multi-category store.",
      thumbnail: IMG.heroGeneral,
      settings: GENERAL_SETTINGS,
      templates: { index: generalIndex() },
      groups: {
        header: headerGroup(["Free delivery on orders over ৳2,000", "Cash on delivery available nationwide"], {
          image: IMG.store,
          heading: "This month's edit",
          text: "Our favourite finds, all in one place.",
        }),
        footer: footerGroup("Quality products, honest prices and fast delivery across Bangladesh — with cash on delivery."),
      },
    }),
  ],
});
