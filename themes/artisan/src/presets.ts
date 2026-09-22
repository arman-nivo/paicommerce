/**
 * Artisan presets — one per manifest category (`preset.id` = category id). Each swaps the palette,
 * typography and home page.
 */
import type { ThemePreset } from "@pai/theme-sdk";
import { GIFTS_SETTINGS, HANDICRAFT_SETTINGS, HOME_SETTINGS } from "./settings";
import { HANDICRAFT_ABOUT, footerGroup, giftsIndex, handicraftIndex, headerGroup, homeIndex } from "./config";
import { IMG } from "./images";

export const handicraftHeader = () =>
  headerGroup(["Every piece is made by hand in Bangladesh", "Cash on delivery · bKash · Nagad", "Delivered to all 64 districts"]);
export const handicraftFooter = () =>
  footerGroup(
    { eyebrow: "Letters from the workshop", heading: "News from the *loom & kiln*", text: "One slow letter a month: new pieces before they're listed, maker stories and the occasional workshop visit in Dhaka.", stamp: IMG.handmadeCups },
    HANDICRAFT_ABOUT,
  );

export const presets: ThemePreset[] = [
  {
    id: "handicraft",
    name: "Handicrafts & Art",
    category: "handicraft",
    description: "Unbleached paper, bark and terracotta with Marcellus + a handwritten accent — framed hero, maker story, craft map, made-to-order process and artisan profiles.",
    thumbnail: IMG.potteryWheel,
    settings: HANDICRAFT_SETTINGS,
    templates: { index: handicraftIndex() },
    groups: { header: handicraftHeader(), footer: handicraftFooter() },
  },
  {
    id: "home",
    name: "Handmade Home",
    category: "home",
    description: "Linen, clay and leaf green with Fraunces — full-bleed room hero, home gallery, kantha maker story and custom-size process.",
    thumbnail: IMG.macrameRoom,
    settings: HOME_SETTINGS,
    templates: { index: homeIndex() },
    groups: {
      header: headerGroup(["Made to order for your space — 3–4 weeks", "Free delivery on home pieces over ৳5,000", "Cash on delivery nationwide"], {
        background: "#3f4f36",
        note: "made for your home",
        tagline: "handmade home, Bangladesh",
      }),
      footer: footerGroup(
        { eyebrow: "Letters from the workshop", heading: "Notes on *slow living*", text: "Room ideas, care guides for handmade pieces and first look at new kantha and pottery.", stamp: IMG.rustBedspread },
        "Handmade homeware — kantha, shataranji, copper and clay — made to order by named makers across Bangladesh.",
      ),
    },
  },
  {
    id: "gifts",
    name: "Handmade Gifts",
    category: "gifts",
    description: "Madder red, turmeric and kraft with Cormorant Garamond — gift hero, personalisation process, maker profiles and a gifting FAQ.",
    thumbnail: IMG.giftHands,
    settings: GIFTS_SETTINGS,
    templates: { index: giftsIndex() },
    groups: {
      header: headerGroup(["Free kraft gift wrap & a handwritten card", "Send a gift to any of the 64 districts", "Personalised pieces ready in 10–14 days"], {
        background: "#7a2f2b",
        note: "wrapped by hand",
        tagline: "handmade gifts, Bangladesh",
      }),
      footer: footerGroup(
        { eyebrow: "Gift reminders", heading: "Never miss *an Eid*", text: "Gentle reminders before Eid, Pohela Boishakh and the birthdays you tell us about — plus first look at new gifts.", stamp: IMG.giftHands },
        "Handmade gifts with a maker's name on every one — wrapped in kraft paper and delivered anywhere in Bangladesh.",
        "Every gift pays a maker fairly — 62% of the price goes to them",
      ),
    },
  },
];
