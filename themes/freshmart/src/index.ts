/**
 * FreshMart — a fast, practical grocery & supermarket theme built on the theme kit:
 * delivery-area header with a big search, category icon row and an app-style bottom nav on phones;
 * grocery product cards with weight/pack chips and an Add → quantity stepper; deals-of-the-day
 * with a midnight countdown, category rails, a delivery-promise banner and an app/offer banner.
 */
import { createBaseTheme, extendMainProduct } from "@pai/theme-kit";
import { manifest } from "./manifest";
import { GROCERY_SETTINGS, freshSettingsSchema } from "./settings";
import { GROCERY_FOOTER, GROCERY_HEADER, groceryIndex, templates } from "./config";
import { presets } from "./presets";
import { listingOverrides } from "./sections/listings";
import { FreshCard } from "./sections/card";
import { freshHeader } from "./sections/header";
import { freshFooter } from "./sections/footer";
import { freshHero } from "./sections/fresh-hero";
import { categoryGrid } from "./sections/category-grid";
import { dealsOfTheDay } from "./sections/deals";
import { deliveryPromise } from "./sections/delivery-promise";
import { categoryRails } from "./sections/category-rails";
import { appBanner } from "./sections/app-banner";
import { offerBanners } from "./sections/offer-banners";
import { productBlocks } from "./sections/product-blocks";

/** Theme CSS — nested under `.pai-theme-freshmart` by the storefront. */
const css = `
  & .pai-h1, & .pai-h2 { font-weight: 800; letter-spacing: -0.025em; }
  & .pai-h3 { font-weight: 800; letter-spacing: -0.01em; }
  & .pai-eyebrow { letter-spacing: 0.12em; font-weight: 800; opacity: .85; }
  & .pai-btn { font-weight: 700; }
  & .fm-search input { min-height: 3rem; border-radius: 999px; background: var(--pai-muted); border-color: transparent; }
  & .fm-search input:focus { background: var(--pai-bg); border-color: var(--pai-primary); }
  & .fm-utility a, & .fm-utility button { text-underline-offset: 3px; }
  @media (max-width: 767px) {
    & main { padding-bottom: calc(64px + env(safe-area-inset-bottom)); }
  }
`;

export default createBaseTheme({
  manifest,
  sections: [freshHeader, freshFooter, freshHero, categoryGrid, dealsOfTheDay, deliveryPromise, categoryRails, offerBanners, appBanner],
  overrideSections: {
    ...listingOverrides(FreshCard, {
      gridClass: (columns, mobile) => {
        const d: Record<number, string> = { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-3 lg:grid-cols-4", 5: "md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5", 6: "md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6" };
        return `grid gap-2.5 md:gap-4 ${mobile === 1 ? "grid-cols-1" : "grid-cols-2"} ${d[Math.min(6, Math.max(1, columns))]}`;
      },
      perView: (c) => ({ base: 2.15, md: 3.3, lg: Math.max(4, c) }),
    }),
    "main-product": (base) => extendMainProduct(productBlocks, base),
  },
  settingsSchema: freshSettingsSchema,
  settingsDefaults: GROCERY_SETTINGS,
  css,
  defaultConfig: (base) => ({
    settings: { ...base.settings, ...GROCERY_SETTINGS },
    groups: { header: GROCERY_HEADER, footer: GROCERY_FOOTER },
    templates: templates(groceryIndex()),
  }),
  presets,
});
