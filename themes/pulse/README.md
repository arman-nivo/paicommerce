# Pulse — pharmacy, health & wellness theme

A clean, trustworthy storefront for online pharmacies, supplement brands and wellness stores. Pulse puts prescriptions, pharmacist help and trust signals first. It's built on `@pai/theme-kit`, so every kit section, template and commerce component (cart drawer, quick add, predictive search, sticky add to cart) works out of the box.

| | |
|---|---|
| Slug | `pulse` |
| Categories | Health (primary), Beauty, Grocery |
| Price | Free |
| Fonts | Plus Jakarta Sans (headings) · Inter (body) |

## Presets

| Preset | Category | Look |
|---|---|---|
| **Pharmacy — Clinic** (default) | `health` | White, deep teal `#0a7c78` and fresh green. Prescription upload, consult banner, trust badges, quick reorder and FAQ. |
| **Beauty & personal care — Derma** | `beauty` | Soft blush and plum, Fraunces headings, pill buttons. Shop-by-concern circles and a skin-expert chat banner. The prescription button is hidden. |
| **Organic & wellness grocery** | `grocery` | Leafy green and honey, Outfit headings. Aisle tiles, a weekly-essentials reorder list and freshness promises. |

## Signature sections

| Type | Name | What it does |
|---|---|---|
| `header` | Header (replaces kit) | **Licence strip** (licence text, hotline, *Order on WhatsApp*, track order) → logo, large predictive medicine search, **Upload prescription** button, account and cart → **Categories** mega menu (collection tiles) and the main menu with pill sub-menus → a **trust strip** with 4 configurable promises. |
| `footer` | Footer (replaces kit) | "Ask a pharmacist" help band (call and WhatsApp), about text with an optional licence line, link columns, contact, health-tips signup, **medical disclaimer**, payment icons. |
| `pulse-hero` | Pharmacy hero | Split hero with badge, headline, medicine search, popular-search chips, *Shop* and *Upload prescription* CTAs, and floating trust cards over a photo. |
| `health-categories` | Health categories | Up to 16 icon tiles or circles in 8 tints. Each links to a collection, a search (e.g. `/search?q=cardiac`) or any URL. |
| `rx-upload` | Prescription upload | Anchored at `#prescription`. Up to 4 steps, a **Send on WhatsApp** button with a pre-filled message, and a second button to your contact page. The number comes from the section setting, then the theme's WhatsApp setting, then the store phone, and is normalised for `wa.me` (01… → 8801…). |
| `consult-banner` | Consult a pharmacist | Live "online" status, *Call now* (store phone), *Chat on WhatsApp*, and an optional **paid consultation** product with its price on the button. |
| `pulse-trust` | Pharmacy trust badges | Seal-style cards or a compact strip: genuine medicines, licensed pharmacy, cold chain, privacy. Each badge has an optional detail line, e.g. a licence number. |
| `quick-reorder` | Quick reorder | A compact one-tap list of essentials (collection, best sellers or hand-picked). It greets signed-in customers by first name and links to order history. |
| `pulse-products` | Product rail | Products in Pulse cards as a carousel or grid, on a plain or soft-tint background. |
| `main-product` | Product page | The kit's main product plus a **Pharmacy info** block: manufacturer and dosage form, a prescription notice with an upload link for Rx items, and a pharmacist WhatsApp link. |

### Prescription-only products

Tag a product `rx`, `prescription` or `prescription-required`. Pulse then shows an **Rx required** badge on its cards, an "Rx" flag in quick reorder, and the prescription notice on its product page.

### Product card

Pulse's card shows a dosage-form pill (from the product type), an Rx flag, the manufacturer (vendor), the price with savings, and a full-width **Add to cart** button. Products with options get **Choose options**, and unavailable products get "Notify me". The kit's cards on collection, search and related-product pages get the same look through the scoped theme CSS.

## Templates

Every template has a default: `index` (12 sections), `product` (pharmacy info, safety and delivery tabs, reviews, "frequently bought together", trust strip), `collection` (sidebar filters), `collections` (+ prescription CTA), `search`, `cart`, `article` and `404` (+ bestsellers), `page`, `blog` ("Health tips"), `account`.

Default content targets the seeded `pulse-demo` collections: `medicines`, `vitamins-supplements`, `personal-care`, `medical-devices` and `consultation`, plus the `online-doctor-consultation-15-min` product. Every product source falls back to best sellers or newest when a collection is missing.

## Settings

Pulse uses the kit's standard settings with tuned defaults, plus `color_card` (card background). Set **Social media → WhatsApp number** once and every WhatsApp button in the theme uses it.

## Notes

- All links go through `context.url()` / `resolveHref()`, so the theme works on subdomains, custom domains, `/s/{slug}` and the customizer preview.
- Accessibility: semantic headings, labelled icon buttons, visible focus rings, `role="note"` on prescription notices, and reduced-motion support for the floating cards and the live-status pulse. WhatsApp buttons use a darker green so white text passes contrast.
- Every default image is a verified Unsplash photo: `node tools/verify-images.mjs themes/pulse`.
- Validate: `node tools/create-theme/validate.mjs pulse` · Typecheck: `npx tsc --noEmit -p themes/pulse`.
