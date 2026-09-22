/**
 * Bloom presets — one per manifest category. Each swaps the palette, typography and home page.
 */
import type { ThemePreset } from "@pai/theme-sdk";
import { BEAUTY_SETTINGS, GIFTS_SETTINGS, WELLNESS_SETTINGS } from "./settings";
import { BEAUTY_ABOUT, beautyIndex, footerGroup, giftsIndex, headerGroup, wellnessIndex } from "./config";
import { IMG } from "./images";

export const beautyHeader = () =>
  headerGroup(["Free delivery on orders over ৳2,500", "Cash on delivery all over Bangladesh", "Free samples with every order"], "#f6dde3");
export const beautyFooter = () =>
  footerGroup({ eyebrow: "The Bloom Club", heading: "Glow notes, *first*", text: "Routines from our skin experts, early access to launches and 10% off your first order.", image: IMG.creamHand }, BEAUTY_ABOUT);

export const presets: ThemePreset[] = [
  {
    id: "beauty",
    name: "Beauty & Cosmetics",
    category: "beauty",
    description: "Blush, rose and cocoa with Fraunces headings — arched hero, routine builder, before/after and a reviews wall.",
    thumbnail: IMG.heroPortrait,
    settings: BEAUTY_SETTINGS,
    templates: { index: beautyIndex() },
    groups: { header: beautyHeader(), footer: beautyFooter() },
  },
  {
    id: "health",
    name: "Wellness & Self-care",
    category: "health",
    description: "Sage, cream and eucalyptus — calm, clinical-clean wellness with daily rituals and botanicals.",
    thumbnail: IMG.spaTowels,
    settings: WELLNESS_SETTINGS,
    templates: { index: wellnessIndex() },
    groups: {
      header: headerGroup(["Genuine, sealed & pharmacist-checked", "Free delivery over ৳2,000", "Cash on delivery nationwide"], "#dfe9df", "Pharmacist-checked · Genuine"),
      footer: footerGroup(
        { eyebrow: "Slow living letter", heading: "Rituals, *gently*", text: "Seasonal wellness notes, restock reminders and members-only offers." , image: IMG.oilHands },
        "Everyday wellness, vitamins and body care — genuine, pharmacist-checked and delivered across Bangladesh.",
      ),
    },
  },
  {
    id: "gifts",
    name: "Beauty Gifts",
    category: "gifts",
    description: "Lilac, peony and champagne with DM Serif Display — full-bleed hero, gift sets and a build-a-box look.",
    thumbnail: IMG.heroFlatlay,
    settings: GIFTS_SETTINGS,
    templates: { index: giftsIndex() },
    groups: {
      header: headerGroup(["Complimentary gift wrap on every order", "Add a handwritten note at checkout", "Same-day delivery in Dhaka before 2pm"], "#ecdff4", "Gift wrap included · Send anywhere"),
      footer: footerGroup(
        { eyebrow: "Gift reminders", heading: "Never miss a *moment*", text: "Birthday and anniversary reminders, plus first look at seasonal gift boxes." },
        "Beautiful beauty gifts, wrapped by hand and delivered anywhere in Bangladesh.",
      ),
    },
  },
];
