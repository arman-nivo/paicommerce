# FreshMart

A fast, practical theme for **grocery & supermarket** stores (with presets for **pharmacy & wellness** and **general superstores**). It's built around how people fill a basket on their phones: pick a delivery area, search or tap a category, set the weight and tap **Add**, and repeat.

## What's included

### Header (`header`)
- **Delivery bar:** a "Deliver to" area picker (areas are set in the customizer and the shopper's choice is remembered in their browser), the delivery promise ("Delivery in 60 minutes"), the hotline and a "Track order" link. The bar can use the primary, inverse, accent or muted colours.
- **Main bar:** logo, a large predictive search (with a custom placeholder), account, and a "My basket" button that opens the cart drawer.
- **Category row:** icon pills linking to collections. Add **Category** blocks (collection, label, lucide icon, link, highlight), or leave it empty to list your collections automatically with matching icons. A highlighted pill, such as "Today's deals", uses the accent colour.
- **Mobile:** the search sits under the logo, the category row hides on scroll, and an app-style **bottom navigation** (Home, Categories, Search, Cart with live total, Account) is fixed to the bottom. On product pages the sticky add-to-cart bar takes its place.

### Footer (`footer`)
- A **promise strip** of up to 6 **Promise** blocks (icon, title, text).
- **Brand & hotline** (about text, a large tap-to-call card, hours, address, email and social links), up to 4 **Menu** blocks, an **App download** block with App Store and Google Play badges, and an optional **Newsletter** block.
- Payment icons, "Track your order", copyright and the "Powered by PaiCommerce" link on plans that include branding.

### Product card
Every listing uses the FreshMart card: the featured collection, product grid, related products, collection, search and 404 pages, plus the theme's own sections. Each card has:
- a square packshot with a **% off** badge, a fresh-produce badge (by product type) and a delivery-time badge ("60 min"), plus a wishlist heart;
- the product name with the unit parsed from the title (for example "Fresh Carrot (500 g)" shows "500 g"), and "Only N left" for low stock;
- **weight/pack chips** for up to 3 variants (a dropdown for more). The price updates with the selection;
- an **Add** button that adds silently and turns into a **− qty +** stepper for that variant.

### Signature sections
| Type | Name | Highlights |
| --- | --- | --- |
| `fresh-hero` | Grocery hero | Campaign banner with eyebrow, two buttons, a **copyable coupon** and trust tags, plus up to 2 tinted **Promo tile** blocks. |
| `category-icon-grid` | Category icon grid | Photo or icon tiles on soft tints with item counts. **Category** blocks (collection, label, image, icon, tint, link), or automatic from your collections. Has an h1 option for page-level use. |
| `deals-of-the-day` | Deals of the day | hh:mm:ss countdown that **resets at midnight (Dhaka time)** or ends at a fixed date. Products come from any source (default: on sale) with the biggest discounts first, plus an optional promo panel. Falls back to best sellers. |
| `delivery-promise` | Delivery promise banner | Big "60 min" badge, heading, delivery-slot chips, up to 4 **Step** blocks, a button and an image. |
| `category-rails` | Product rails by category | One scrollable row per **Category rail** block, with the collection thumbnail and "See all". Empty or missing collections fall back to best sellers. |
| `offer-banners` | Offer banners | 2–3 tinted promo cards with a round image. Each **Offer** block links to a collection or URL. |
| `app-banner` | App download / offer banner | Highlights, a copyable offer code and store badges. Includes a second preset without app badges for a plain first-order offer. |

Product page: `main-product` is extended with an **`fm_delivery`** block (delivery ETA, payment methods and freshness refund). The kit blocks are still available.

## Global settings
- **Grocery (default):** leafy green `#0b8a43`, citrus orange accent, Plus Jakarta Sans headings with Inter body text, 14px radius, square card images.
- **Health:** clinical teal and mint with Manrope.
- **General:** supermarket navy and red with Outfit.
- The "Product cards" group adds **Delivery time badge on cards** (`fm_card_eta`) and **Fresh-produce badge** (`fm_fresh_badge`). Leave either empty to hide it.

## Templates
All templates are configured. The home page (grocery) has 11 sections: hero, category grid, deals, offer banners, 3 category rails, delivery promise, customer favourites, pantry rails, app banner, testimonials and recipes/blog. The other templates are:
- **Product:** delivery block, frequently bought together, reviews and a favourites rail.
- **Collection:** filters and a delivery banner.
- **Collections list:** category grid and deals.
- **Search:** results and a category icon grid.
- **Cart:** basket and a "Forgot something?" rail.
- **Page, blog, article, account and 404:** each with a relevant add-on section.

## Presets
| Id | Name | Home page |
| --- | --- | --- |
| `grocery` | Grocery & Supermarket | Fresh produce hero, deals, rails for fruit, vegetables and meat, app banner |
| `health` | Pharmacy & Wellness | 2-hour medicine delivery, prescription steps, pharmacy FAQ |
| `general` | General Superstore | Departments grid, weekly deals, same-day delivery |

## Tips
- Give products a **compare-at price** to fill "Deals of the day" with real discounts and show the % off badges.
- Put the pack size in the title, such as "Green Chili (250 g)", or use a **Weight** or **Pack** option for variants. Variants are shown smallest to largest.
- Set delivery areas in **Header → Delivery bar**. The shopper's choice is a convenience only, and the delivery zone is confirmed at checkout.
