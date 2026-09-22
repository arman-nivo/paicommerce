# Savor

An appetising, menu-first PaiCommerce theme for restaurants, cloud kitchens, bakeries, cafés and food brands. It uses warm serif headings on cream paper, a deep paprika primary colour and a saffron accent. Every product listing is shown as a restaurant-menu row.

- **Categories:** food (default), gifts
- **Demo store:** `savor-demo` (Savor Kitchen, Banani, Dhaka)

## What's included

| Area | Details |
| --- | --- |
| Header (`header`) | A service strip shows the live **Open now / Closed** status, which is computed in the browser in the store's time zone. The strip also has today's hours, the phone number (tap to call), WhatsApp and a short message. Below it sits the main bar: logo, a menu-card navigation set in the heading serif with `·` separators, search, account, cart and a prominent **Order now** button. On mobile you get a hamburger drawer with hours, phone, WhatsApp and Order now, plus a full-width "Order now" row under the bar. |
| Footer (`footer`) | An "order band" with a big serif line, Order now, Call and WhatsApp. Below it are block columns: **Brand & address** (with a Google Maps link), **Opening hours** (weekly table with today highlighted), **Delivery areas** (chips), **Menu**, **Text** and **Newsletter**. The bottom bar has the copyright, "Powered by PaiCommerce" (shown when `store.showBranding` is set) and payment icons. It is warm dark by default. |
| Product card | A menu row: rounded thumbnail, dish name, dotted leader and price (`from ৳260` for multi-portion dishes), first paragraph of the description, portion hint (`Half / Full / Family`), dietary tags from product tags (`veg`, `vegan`, `spicy`, `bestseller`, `new`, `sharing`, `halal`…), rating, and a round **+** quick-add button. Multi-variant dishes open the quick-view options pop-up. The card is used everywhere through `listingOverrides`: featured collection, product grid, related products, collection, search and 404. Grids show 1 column on phones and 2 on desktop. |
| Collection pages | Menu-category chips ("Full menu", "Biryani & Rice", …) above the grid. |
| Product page | Kit `main-product` plus two blocks: `dish_facts` (serves, ready-in time, spice level, dietary tags) and `order_hours` (live kitchen status and "Ask on WhatsApp"). |

### Signature sections

| Type | Name | Settings / blocks |
| --- | --- | --- |
| `savor-hero` | Restaurant hero | Settings: split layout (arched photo, round inset photo, "Cooked to order" stamp, floating featured-dish card from a product picker) or full-bleed layout. Headline plus an italic accent line, Order now and View menu buttons, live opening-hours badge, rating badge and height. |
| `savor-menu` | Menu | Blocks: **Menu category**, each with a collection, heading, description, banner image and a small note. Collections become sticky scroll-spy tabs, and each category's dishes render as menu rows with quick add. Settings: anchor id (`#menu`), dishes per category, 1–2 columns, tabs on/off, sticky tabs, banners and "See all" links. With no blocks it uses the first N collections; if those are empty it shows best sellers. |
| `savor-combos` | Combo deals | Blocks: **Combo**, with image, ribbon, title, serves, what's included (one item per line), price, was-price and link, or a linked **product**, which supplies the live price, link and quick add. Layout is "first featured" or equal cards. |
| `savor-story` | Chef's story | Settings: arched portrait with inset photo, eyebrow, heading, pull quote, a signature name in italic serif, role, rich text and a button. Blocks: up to 4 **Stat** blocks. |
| `savor-reviews` | Guest reviews | Settings: overall rating summary. Blocks: **Review**, with stars, text, name, area, photo, dish ordered, date, and a source badge (Google, Foodpanda, Facebook, Pathao Food, Tripadvisor or verified order). |
| `savor-delivery` | Delivery areas | Settings: minimum order, free-delivery threshold, payment note, image, CTA and footnote. Blocks: **Delivery area**, with time, fee and note. |
| `savor-hours` | Opening hours & location | Settings: live status badge, weekly hours table, address, phone and WhatsApp buttons, and a map or storefront image with a "Get directions" card that links to Google Maps. Blocks: **Day / hours row**. Without blocks, the global hours are used. |

Kit sections (multicolumn, FAQ, newsletter, rich text, testimonials, blog posts…) all work, and the listing sections use the Savor card.

## Global settings: "Restaurant" group

The header, footer, hero, hours section and product page all share these settings.

- `open_time`, `close_time` (24-hour, e.g. `11:00` and `23:00`; a closing time earlier than the opening time means you close after midnight)
- `closed_days` (e.g. `Fri`), `hours_timezone` (default Asia/Dhaka), `hours_note`
- `phone_display`, `address_display` and `maps_link`. These fall back to the store profile. The store address may be a JSON string; it is formatted safely.
- `order_cta_label` and `order_cta_link` (the "Order now" button everywhere)
- `delivery_areas_note`
- Menu cards: `card_show_description`, `card_show_tags`, `card_leader` (dotted leader), `card_thumb` (none, small, medium or large). The kit settings `card_show_rating`, `card_quick_add` and `card_show_sale_badge` are also respected.

WhatsApp links use Theme settings › Social › WhatsApp number. If that is empty, they fall back to the store phone.

## Presets

| id | Name | Look | Home page |
| --- | --- | --- | --- |
| `food` (default) | Restaurant & cloud kitchen | Cream `#fbf6ee`, paprika `#b8361e`, saffron `#d99a1e`; Fraunces with DM Sans | Hero, trust strip, menu (5 categories), combo deals, chef's story, chef's picks, reviews, delivery areas, hours & location, FAQ, newsletter (11 sections) |
| `gifts` | Bakery & gifting | Blush `#fdf6f3`, cocoa `#5a2e22`, rose `#d9807a`; Cormorant Garamond with DM Sans | Cake hero, gift boxes (combos), sweet menu, baker's story, bakery favourites, reviews, same-day delivery zones, hours, FAQ, newsletter |

Each preset also ships its own header (announcement messages and strip text) and footer (order band copy and delivery areas).

## Templates

`index`, `product` (main-product with dish facts and kitchen hours, reviews, "Goes well with"), `collection` (filter drawer, 2-column menu grid, category chips), `collections`, `search`, `cart` ("Add a drink or dessert?"), `page`, `blog`, `article`, `account` and `404`.

## Customisation tips

- Point the hero's second button at `#menu` to jump to the menu section. Change the menu's *Anchor id* if you use more than one menu section.
- Tag products `veg`, `spicy`, `bestseller` or `sharing` to get the coloured chips on menu rows and product pages.
- Give dishes a portion or size option (`Half / Full / Family`, `10 inch / 12 inch`, `1 lb / 2 lb`). The card shows the choices and "from" pricing, and **+** opens the options pop-up.
- Link a combo block to a real product so its price stays in sync and guests can add it directly.
- All imagery lives in `src/images.ts`. Check it with `node tools/verify-images.mjs themes/savor`.

## Files

```
src/manifest.ts   src/index.ts (sections, overrides, CSS)   src/settings.ts (palettes + Restaurant group)
src/config.ts     (header/footer groups, food & gifts home pages, product/cart templates)
src/presets.ts    src/images.ts   src/lib/hours.ts (time parsing, open state)   src/lib/info.ts (restaurant info)
src/sections/     header, footer, card, listings, collection-intro, hero, menu, combos, story, reviews, delivery, hours, main-product
src/client/       open-status (OpenStatus, HoursTable), menu-tabs (scroll-spy tabs)
```
