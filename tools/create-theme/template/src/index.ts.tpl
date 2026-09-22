import { createBaseTheme, sectionList } from "@pai/theme-kit";
import type { SectionList } from "@pai/theme-sdk";
import { manifest } from "./manifest";
import { settingsDefaults, settingsSchema } from "./settings";
import { presets } from "./presets";
import { promoBanner } from "./sections/promo-banner";

/**
 * __NAME__ = the @pai/theme-kit base theme (header, footer, product, collection, cart, search,
 * account … sections) + this theme's own sections, settings, presets and CSS.
 *
 * createBaseTheme options: manifest, sections, overrideSections, excludeSections, settingsSchema,
 * settingsDefaults, defaultConfig, presets, css, Layout, cssVariables, fontSettings.
 */

/** Insert sections into a template right after `afterId` (or at the end). Ids stay deterministic. */
function insertAfter(list: SectionList | undefined, afterId: string, extra: SectionList): SectionList {
  const base = list ?? { sections: {}, order: [] };
  const at = base.order.indexOf(afterId);
  const order = [...base.order];
  order.splice(at === -1 ? order.length : at + 1, 0, ...extra.order);
  return { sections: { ...base.sections, ...extra.sections }, order };
}

const promo = sectionList([
  {
    id: "promo-banner",
    type: promoBanner.schema.type,
    blocks: [
      { type: "perk", settings: { icon: "truck", title: "Fast delivery", text: "Inside Dhaka in 24 hours" } },
      { type: "perk", settings: { icon: "shield", title: "Cash on delivery", text: "Pay when it arrives" } },
      { type: "perk", settings: { icon: "returns", title: "Easy returns", text: "7-day hassle-free returns" } },
    ],
  },
]);

/** Theme CSS — scoped under `.pai-theme-__SLUG__` by the storefront. Prefer CSS variables. */
const css = `
.pai-promo-cta { transition: opacity .15s ease, transform .15s ease; }
.pai-promo-cta:hover { opacity: .9; }
.pai-promo-cta:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }
@media (prefers-reduced-motion: no-preference) { .pai-promo-cta:active { transform: translateY(1px); } }
`;

export default createBaseTheme({
  manifest,
  // Custom sections. A section whose schema.type matches a kit section replaces it.
  sections: [promoBanner],
  settingsSchema,
  settingsDefaults,
  // Home page: kit default for the primary category + the promo banner after the hero.
  defaultConfig: (base) => ({
    ...base,
    templates: { ...base.templates, index: insertAfter(base.templates.index, "hero-banner", promo) },
  }),
  // Our presets first, then the kit's presets for any secondary categories.
  presets: (kitPresets) => [...presets, ...kitPresets.filter((p) => p.category !== manifest.categories[0])],
  css,
});
