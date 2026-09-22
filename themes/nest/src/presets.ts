/**
 * Nest presets — one per manifest category. Each swaps the palette, typography, home page and
 * header/footer copy.
 */
import type { ThemePreset } from "@pai/theme-sdk";
import { GENERAL_SETTINGS, HANDICRAFT_SETTINGS, HOME_SETTINGS } from "./settings";
import { footerGroup, generalIndex, handicraftIndex, headerGroup, homeIndex } from "./config";
import { IMG } from "./images";

const HOURS = "Sat – Thu · 10am – 9pm\nFriday · 3pm – 9pm";

export const homeHeader = () =>
  headerGroup({
    left: "Showroom · Gulshan 1, Dhaka",
    messages: ["Free delivery & white-glove assembly inside Dhaka", "0% EMI up to 12 months on partner bank cards", "7-day returns · 5-year frame warranty"],
  });

export const homeFooter = () =>
  footerGroup({
    promises: [
      ["truck", "Free delivery in Dhaka", "On orders over ৳20,000"],
      ["wrench", "White-glove assembly", "Built in your room, packaging removed"],
      ["percent", "0% EMI", "Up to 12 months on partner bank cards"],
      ["shield-check", "5-year warranty", "On frames and solid wood"],
    ],
    showroom: { heading: "Visit the Gulshan showroom", hours: HOURS, image: IMG.livingGreen, alt: "Showroom living room display with a sage wall and rattan sideboard" },
    newsletter: { heading: "Letters from home", text: "New collections, styling notes and showroom events — once a month, never more." },
  });

export const presets: ThemePreset[] = [
  {
    id: "home",
    name: "Home & Furniture",
    category: "home",
    description: "Linen, oat and walnut with a terracotta accent, Lora + Manrope — room mega menu, shop the room, materials, EMI banner and delivery promise.",
    thumbnail: IMG.livingWarm,
    settings: HOME_SETTINGS,
    templates: { index: homeIndex() },
    groups: { header: homeHeader(), footer: homeFooter() },
  },
  {
    id: "handicraft",
    name: "Handicrafts & Artisan Decor",
    category: "handicraft",
    description: "Clay, jute and deep olive with Marcellus headings — maker stories, craft materials and nationwide cash on delivery.",
    thumbnail: IMG.potteryWheel,
    settings: HANDICRAFT_SETTINGS,
    templates: { index: handicraftIndex() },
    groups: {
      header: headerGroup({
        left: "Handmade in Bangladesh · 310 artisans",
        background: "#4a4a2c",
        messages: ["Cash on delivery in all 64 districts", "Artisans paid before we sell", "Gift wrapping in hand-printed paper"],
        roomLabel: "Shop by craft",
        note: "Every piece handmade in Bangladesh · Cash on delivery nationwide",
        placeholder: "Search jute, brass, pottery…",
      }),
      footer: footerGroup({
        promises: [
          ["scissors", "Handmade", "By named artisans in 11 districts"],
          ["heart", "Fair pay", "Makers paid on delivery to our studio"],
          ["banknote", "Cash on delivery", "Nationwide, or bKash / Nagad"],
          ["package-check", "Packed with care", "Plastic-free, double-boxed"],
        ],
        showroom: { heading: "Visit our studio shop", hours: HOURS, image: IMG.juteLiving, alt: "Corner styled with a jute rug, wooden stools and a knitted pouf" },
        newsletter: { heading: "Notes from the workshops", text: "Maker stories and first look at small-batch pieces." },
      }),
    },
  },
  {
    id: "general",
    name: "Home & Lifestyle Store",
    category: "general",
    description: "Chalk, charcoal and olive with Playfair Display — departments row, bestsellers, get-the-look and easy COD messaging.",
    thumbnail: IMG.livingBeige,
    settings: GENERAL_SETTINGS,
    templates: { index: generalIndex() },
    groups: {
      header: headerGroup({
        left: "Customer care · 10am – 9pm, every day",
        background: "#23221f",
        messages: ["Cash on delivery in all 64 districts", "Easy 7-day returns", "0% EMI on orders over ৳10,000"],
        roomLabel: "Departments",
        note: "Cash on delivery nationwide · Easy 7-day returns",
        placeholder: "Search the store…",
      }),
      footer: footerGroup({
        promises: [
          ["banknote", "Cash on delivery", "All 64 districts"],
          ["truck", "Fast delivery", "Dhaka in 1–3 days"],
          ["rotate-ccw", "7-day returns", "Free pick-up"],
          ["headset", "Here to help", "Call or WhatsApp, every day"],
        ],
        showroom: { heading: "Visit our store", hours: HOURS, image: IMG.livingBeige, alt: "Calm living room with a cream sofa" },
        newsletter: { heading: "Get the good deals first", text: "New arrivals and members-only offers, twice a month." },
      }),
    },
  },
];
