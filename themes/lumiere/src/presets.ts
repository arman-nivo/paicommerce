/**
 * Lumière presets — one per manifest category. Each swaps the palette, typography and home page.
 */
import type { ThemePreset } from "@pai/theme-sdk";
import { FASHION_SETTINGS, GIFTS_SETTINGS, JEWELRY_SETTINGS } from "./settings";
import { fashionIndex, footerGroup, giftsIndex, headerGroup, jewelryIndex } from "./config";
import { IMG } from "./images";

export const jewelryHeader = () => headerGroup(["Complimentary insured delivery · Certified hallmarked gold", "Lifetime exchange on 22K gold at the day's rate", "Private viewings at our Dhanmondi atelier"]);
export const jewelryFooter = () =>
  footerGroup(
    { eyebrow: "The Lumière Letter", heading: "New collections, private previews", text: "A few letters a year — first sight of new pieces, invitations to atelier evenings and the stories behind the stones." },
    "Every piece is hallmarked, certified and delivered fully insured — with complimentary cleaning at our atelier for life.",
  );

export const presets: ThemePreset[] = [
  {
    id: "jewelry",
    name: "Fine Jewellery",
    category: "jewelry",
    description: "Ivory, ink and antique gold with Cormorant Garamond — cinematic hero, collection chapters, gift guide, heritage timeline and private viewings.",
    thumbnail: IMG.templeNecklace,
    settings: JEWELRY_SETTINGS,
    templates: { index: jewelryIndex() },
    groups: { header: jewelryHeader(), footer: jewelryFooter() },
  },
  {
    id: "fashion",
    name: "Couture & Accessories",
    category: "fashion",
    description: "Bone, espresso and champagne with Marcellus capitals — editorial looks, a styling-studio invitation and occasion tiles.",
    thumbnail: IMG.saree,
    settings: FASHION_SETTINGS,
    templates: { index: fashionIndex() },
    groups: {
      header: headerGroup(["Complimentary delivery across Bangladesh", "Free alterations at our Gulshan studio", "bKash, Nagad, cards or cash on delivery"], {
        tagline: "Couture & fine accessories · Dhaka",
        left: "Gulshan studio · Styling by appointment",
        appointment: "Book a styling hour",
      }),
      footer: footerGroup(
        { eyebrow: "The Lumière Letter", heading: "The season, first", text: "Lookbooks before they launch, studio evenings and a note from our stylists each month." },
        "Considered pieces, honest materials and alterations for life at our Gulshan studio.",
        "Couture & accessories · Dhaka",
      ),
    },
  },
  {
    id: "gifts",
    name: "Luxury Gifting",
    category: "gifts",
    description: "Porcelain, ink and warm gold with Bodoni Moda — gold-ribbon hero, gift guide by recipient and budget, occasion chapters and gift consultations.",
    thumbnail: IMG.goldBows,
    settings: GIFTS_SETTINGS,
    templates: { index: giftsIndex() },
    groups: {
      header: headerGroup(["Every piece gift-wrapped by hand", "Handwritten card with your message", "Insured delivery to all 64 districts"], {
        tagline: "The gifting house · Dhaka",
        left: "Gift consultations on WhatsApp",
        appointment: "Ask a gift adviser",
        transparent: true,
      }),
      footer: footerGroup(
        { eyebrow: "Gift reminders", heading: "Never miss a moment", text: "Tell us the dates that matter — birthdays, anniversaries, Eid — and we'll send a gentle reminder with ideas." },
        "Every gift is wrapped by hand in our ivory box with a gold ribbon, and never shows the price.",
        "The gifting house · Dhaka",
      ),
    },
  },
];
