/**
 * Savor presets — one per manifest category (preset.id must equal the category id).
 */
import type { ThemePreset } from "@pai/theme-sdk";
import { categoryPreset } from "@pai/theme-kit";
import { FOOD_SETTINGS, GIFTS_SETTINGS } from "./settings";
import { FOOD_FOOTER, FOOD_HEADER, GIFTS_FOOTER, GIFTS_HEADER, foodIndex, giftsIndex } from "./config";
import { IMG } from "./images";

export const presets: ThemePreset[] = [
  categoryPreset("food", {
    name: "Restaurant & cloud kitchen",
    description: "Cream paper, deep paprika and saffron with Fraunces headings — menu tabs, combo deals, chef's story, delivery zones and live opening hours.",
    thumbnail: IMG.heroBiryani,
    settings: FOOD_SETTINGS,
    templates: { index: foodIndex() },
    groups: { header: FOOD_HEADER, footer: FOOD_FOOTER },
  }),
  categoryPreset("gifts", {
    name: "Bakery & gifting",
    description: "Blush paper, cocoa and rose with Cormorant Garamond headings — gift boxes, a sweet menu, same-day delivery zones and a baker's story.",
    thumbnail: IMG.chocolateCake,
    settings: GIFTS_SETTINGS,
    templates: { index: giftsIndex() },
    groups: { header: GIFTS_HEADER, footer: GIFTS_FOOTER },
  }),
];
