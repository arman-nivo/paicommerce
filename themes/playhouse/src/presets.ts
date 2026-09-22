/**
 * Playhouse presets — one per manifest category (`preset.id` = category id). Each ships its own
 * palette, header/footer copy and home page.
 */
import type { ThemePreset } from "@pai/theme-sdk";
import { categoryPreset } from "@pai/theme-kit";
import { IMG } from "./images";
import { GIFTS_SETTINGS, KIDS_SETTINGS, PETS_SETTINGS } from "./settings";
import { GIFTS_FOOTER, GIFTS_HEADER, KIDS_FOOTER, KIDS_HEADER, PETS_FOOTER, PETS_HEADER, giftsIndex, kidsIndex, petsIndex } from "./config";

export const presets: ThemePreset[] = [
  categoryPreset("kids", {
    name: "Kids, Baby & Toys",
    description: "Sunshine, bubblegum, sky, grape and mint on warm off-white with Fredoka headings — shop by age, gift finder, bundles and a pet corner.",
    thumbnail: IMG.heroKids,
    settings: KIDS_SETTINGS,
    templates: { index: kidsIndex() },
    groups: { header: KIDS_HEADER(), footer: KIDS_FOOTER() },
  }),
  categoryPreset("pets", {
    name: "Pet Supplies",
    description: "Tangerine and teal on cream with Baloo 2 headings and paw-print touches — shop by pet, a dog-of-the-month feature and starter kits.",
    thumbnail: IMG.corgiOrange,
    settings: PETS_SETTINGS,
    templates: { index: petsIndex() },
    groups: { header: PETS_HEADER(), footer: PETS_FOOTER() },
  }),
  categoryPreset("gifts", {
    name: "Gifts & Flowers",
    description: "Raspberry, gold and candy pastels on blush with Fredoka + Quicksand — gift finder up front, gift boxes and gifts by age.",
    thumbnail: IMG.giftPink,
    settings: GIFTS_SETTINGS,
    templates: { index: giftsIndex() },
    groups: { header: GIFTS_HEADER(), footer: GIFTS_FOOTER() },
  }),
];
