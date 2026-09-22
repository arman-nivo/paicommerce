/** FreshMart presets — one per manifest category (`id` = category id). */
import type { ThemePreset } from "@pai/theme-sdk";
import { categoryPreset } from "@pai/theme-kit";
import { IMG } from "./images";
import { GENERAL_SETTINGS, GROCERY_SETTINGS, HEALTH_SETTINGS } from "./settings";
import { GENERAL_FOOTER, GENERAL_HEADER, GROCERY_FOOTER, GROCERY_HEADER, HEALTH_FOOTER, HEALTH_HEADER, generalIndex, groceryIndex, healthIndex } from "./config";

export const presets: ThemePreset[] = [
  categoryPreset("grocery", {
    name: "Grocery & Supermarket",
    description: "Leafy green and citrus orange with Plus Jakarta Sans — delivery-area bar, 60-minute promise, deals timer and category rails.",
    thumbnail: IMG.heroProduce,
    settings: GROCERY_SETTINGS,
    templates: { index: groceryIndex() },
    groups: { header: GROCERY_HEADER, footer: GROCERY_FOOTER },
  }),
  categoryPreset("health", {
    name: "Pharmacy & Wellness",
    description: "Clinical teal and mint with Manrope — 2-hour medicine delivery, prescription upload steps, health FAQ.",
    thumbnail: IMG.pharmacyStore,
    settings: HEALTH_SETTINGS,
    templates: { index: healthIndex() },
    groups: { header: HEALTH_HEADER, footer: HEALTH_FOOTER },
  }),
  categoryPreset("general", {
    name: "General Superstore",
    description: "Supermarket navy and red with Outfit — department grid, weekly deals and same-day delivery.",
    thumbnail: IMG.supermarket,
    settings: GENERAL_SETTINGS,
    templates: { index: generalIndex() },
    groups: { header: GENERAL_HEADER, footer: GENERAL_FOOTER },
  }),
];
