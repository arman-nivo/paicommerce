/**
 * Savor global settings: palettes per preset plus a "Restaurant" settings group (opening hours,
 * phone, order button, menu-card options) shared by the header, footer, cards and sections.
 */
import type { SettingValues, SettingsGroup } from "@pai/theme-sdk";
import { extendSettingsSchema } from "@pai/theme-kit";

const shared: SettingValues = {
  heading_case: "normal",
  container_width: 1280,
  section_spacing: 72,
  header_style: "logo_left",
  logo_width: 140,
  card_image_ratio: "square",
  card_style: "standard",
  card_text_align: "left",
  card_show_vendor: false,
  card_show_rating: true,
  card_quick_add: true,
  card_hover_swap: false,
  card_show_sale_badge: true,
  card_show_wishlist: false,
  cart_type: "drawer",
  cart_show_free_shipping: true,
  cart_show_note: true,
  // Restaurant group
  open_time: "11:00",
  close_time: "23:00",
  closed_days: "",
  hours_timezone: "Asia/Dhaka",
  order_cta_label: "Order now",
  order_cta_link: "/collections/all",
  card_show_description: true,
  card_show_tags: true,
  card_leader: true,
  card_thumb: "medium",
};

/** Default look — cream paper, deep paprika and saffron, Fraunces headings. */
export const FOOD_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#fbf6ee",
  color_foreground: "#2b1b12",
  color_primary: "#b8361e",
  color_primary_foreground: "#fff8ef",
  color_accent: "#d99a1e",
  color_muted: "#f3e9d9",
  color_border: "#e6d7c0",
  color_sale: "#b8361e",
  font_heading: "Fraunces",
  font_body: "DM Sans",
  heading_scale: 105,
  radius: 14,
  button_radius: 999,
  announcement_text: "Hot delivery across Banani, Gulshan & Mohakhali · Cash on delivery · bKash & Nagad",
  hours_note: "Kitchen takes last orders 30 minutes before closing.",
  delivery_areas_note: "Banani · Gulshan · Baridhara · Mohakhali · Niketan",
};

/** Bakery & gifting — blush paper, cocoa and rose-gold, Cormorant Garamond headings. */
export const GIFTS_SETTINGS: SettingValues = {
  ...shared,
  color_background: "#fdf6f3",
  color_foreground: "#3b2420",
  color_primary: "#5a2e22",
  color_primary_foreground: "#fdf1ec",
  color_accent: "#d9807a",
  color_muted: "#f7e6e1",
  color_border: "#ecd5ce",
  color_sale: "#b83b4f",
  font_heading: "Cormorant Garamond",
  font_body: "DM Sans",
  heading_scale: 118,
  radius: 18,
  button_radius: 999,
  open_time: "10:00",
  close_time: "22:00",
  order_cta_label: "Send a treat",
  order_cta_link: "/collections/desserts-bakery",
  announcement_text: "Same-day cake delivery in Dhaka · Order by 4 PM · Handwritten gift notes",
  hours_note: "Custom cakes need 24 hours' notice.",
  delivery_areas_note: "Same-day delivery across Dhaka city",
};

/** The "Restaurant" settings group added to the kit's global settings. */
export function savorSettingsSchema(base: SettingsGroup[]): SettingsGroup[] {
  return extendSettingsSchema(base, [
    {
      name: "Restaurant",
      settings: [
        { type: "header", label: "Opening hours", info: "Used by the header, footer, hero badge and opening-hours section. 24-hour times, e.g. 11:00 and 23:00." },
        { type: "text", id: "open_time", label: "Opens at", default: "11:00", placeholder: "11:00" },
        { type: "text", id: "close_time", label: "Closes at", default: "23:00", placeholder: "23:00", info: "A time before the opening time means you close after midnight." },
        { type: "text", id: "closed_days", label: "Closed on", default: "", placeholder: "Fri", info: "Comma separated day names. Leave empty if you open every day." },
        {
          type: "select",
          id: "hours_timezone",
          label: "Time zone",
          default: "Asia/Dhaka",
          options: [
            { value: "Asia/Dhaka", label: "Dhaka (GMT+6)" },
            { value: "Asia/Kolkata", label: "Kolkata (GMT+5:30)" },
            { value: "Asia/Dubai", label: "Dubai (GMT+4)" },
            { value: "Europe/London", label: "London" },
          ],
        },
        { type: "text", id: "hours_note", label: "Hours note", default: "" },
        { type: "header", label: "Contact & ordering" },
        { type: "text", id: "phone_display", label: "Phone number", info: "Defaults to your store phone." },
        { type: "text", id: "address_display", label: "Address", info: "Defaults to your store address." },
        { type: "url", id: "maps_link", label: "Google Maps link", info: "Defaults to a map search for your address." },
        { type: "text", id: "order_cta_label", label: "“Order now” label", default: "Order now" },
        { type: "url", id: "order_cta_link", label: "“Order now” link", default: "/collections/all" },
        { type: "text", id: "delivery_areas_note", label: "Delivery areas (short)", default: "" },
        { type: "header", label: "Menu cards", info: "Products are shown as menu rows everywhere in Savor." },
        { type: "checkbox", id: "card_show_description", label: "Show short description", default: true },
        { type: "checkbox", id: "card_show_tags", label: "Show dietary tags (veg, spicy, bestseller…)", default: true, info: "Read from product tags: veg, vegan, spicy, bestseller, new, sharing, sugar-free." },
        { type: "checkbox", id: "card_leader", label: "Dotted leader between name and price", default: true },
        {
          type: "select",
          id: "card_thumb",
          label: "Thumbnail size",
          default: "medium",
          options: [
            { value: "none", label: "No image" },
            { value: "small", label: "Small" },
            { value: "medium", label: "Medium" },
            { value: "large", label: "Large" },
          ],
        },
      ],
    },
  ]);
}
