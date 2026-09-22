# Folio

An editorial, search-first PaiCommerce theme for bookshops, stationers and digital-product stores
(eBooks, online courses). Paper-and-ink design, serif headlines, thin rules, small-caps eyebrows and
2:3 book-cover cards with a subtle spine and shadow.

- **Categories / presets:** `books` (default), `digital`, `general`
- **Built on:** `@pai/theme-kit` (`createBaseTheme`), reference structure from `themes/aurora`
- **Demo store:** `folio-demo` ("Folio Books", Banani, Dhaka)

## What's included

| Area | File | Notes |
| --- | --- | --- |
| Header | `src/sections/header.tsx` | Masthead logo + small-caps tagline; a large predictive search is the main nav element; account, **reading list** and cart. A **genres row** below comes from *Genre* blocks (label, collection, link, highlight) or a menu (items with children open a dropdown). On phones: menu · logo · icons, then an always-visible search field and swipeable genre chips. |
| Footer | `src/sections/footer.tsx` | Literary quote (with ❦ ornament), **The Folio Letter** newsletter band, blocks: *About the shop*, *Genre links* (live collections), *Menu*, *Contact* (address parsed from the store, phone, email, opening hours, order tracking), *Text*, *Newsletter*. Bottom bar: copyright, colophon line, "Powered by PaiCommerce" (when branding is on) and payment icons. |
| Product card | `src/sections/card.tsx` | 2:3 cover, spine + shadow (books only by default), format hint (`Paperback · Hardcover`, `eBook · Instant download` …), serif title without the author suffix, *by Author* line (links to a search), rating, price, sale/sold-out/bestseller badges, **Digital** badge, reading-list bookmark and kit quick add. Used everywhere through `listingOverrides(FolioCard)`. |
| Product page | `src/sections/main-product.tsx` | Kit `main-product` + book blocks: `title` (title + author), `vendor` (category / "Digital edition" eyebrow), `book_details`, `digital_delivery` (digital only), `save_for_later`; kit `delivery_info` is hidden and `stock` reads "Available instantly" for digital products. |
| Collection page | `src/sections/collection-intro.tsx` | Genre chips above the grid (via `listingOverrides(…, { collectionIntro })`). |

### Author & format detection (`src/lib/book.ts`)

Many bookshops keep the store name in `vendor` and the author in the title
("Atomic Habits — James Clear"). `bookMeta()` uses the vendor as the author when it isn't the store
name, otherwise the part after " — " (em or en dash), and shows the title without it. Formats come from
an option named *Format / Edition / Binding*. A product is **digital** when its type is listed in the
*Digital product types* setting (default: eBook, Online Course, Course, Audiobook, Digital) or it is
tagged `digital` / `ebook` / `course`.

## Signature sections

| Section (type) | What it does | Settings / blocks |
| --- | --- | --- |
| **Editorial hero** (`folio-hero`) | Headline, text, search field and buttons beside a fanned stack of three book covers (collection, hand-picked or best sellers) or a photograph. | media (covers/image), collection, products (3), caption, image + alt, media position, height, scheme. Blocks: eyebrow, heading (with italic ending, h1/h2), text, search (placeholder, hint, hide on phones), buttons (2), note. |
| **Bestseller list** (`bestseller-list`) | Numbered 1–10 chart with covers, authors, formats, ratings, prices and add-to-bag. "Number one featured" or two-column layout. Collection topped up with store best sellers. | eyebrow, heading, subheading, collection, limit (3–10), layout, show movement/format/rating/price/add, button, scheme, padding. Blocks: **Rank movement** (position, climbed/dropped/new/no change, places) ×10. |
| **Genre tiles** (`genre-tiles`) | Colour-blocked typographic tiles with a big initial, № numbering and live title counts — or **book spines on a shelf**. | heading fields, style (tiles/spines), columns, show count, scheme, padding. Blocks: **Genre** (name, description, collection, link, colour, count label) ×12. |
| **Book of the month** (`book-of-the-month`) | Large cover on a coloured plate, editorial blurb, pull quote with reviewer photo, **format picker + Add to bag**, secondary link and "Save for later". | product (falls back to featured → best-selling), eyebrow, heading, blurb, quote, reviewer, reviewer title/photo, button label, format picker, secondary link, cover position, plate colour, scheme, padding. |
| **Author spotlight** (`author-spotlight`) | Arched portrait, name, dates, signature quote, biography, button and the author's books (catalogue search by name, a collection or hand-picked). | eyebrow, author, dates, portrait + alt, bio, quote, source, collection, products, limit, button, portrait position, scheme, padding. |
| **Reading sample** (`reading-sample`) | An excerpt set like a printed page (or an open two-page spread) with drop cap, running head and folio numbers, the book's cover, price and a link. | eyebrow, heading, intro, running head, excerpt, attribution, product, style (page/spread), drop cap, page number, link, scheme, padding. Anchor: `#folio-<section id>`. |
| **Digital downloads** (`digital-callout`) | Instant-delivery pitch with feature list, formats line and a row of digital products (or an image). | eyebrow, heading, text, formats, image + alt, button, product source (collection etc.), layout, scheme, padding. Blocks: **Feature** (icon, title, text) ×6. |

All sections have presets (addable in the customizer), use `color_scheme` / `padding`, show
placeholders or sample products in the customizer preview, and fall back gracefully (or render
nothing) on a live store with missing data.

## Global settings

Kit settings (colours, fonts, layout, cards, cart …) plus a **Folio — books & digital** group:
`card_show_author`, `card_show_format`, `card_book_effect` (auto / spine / flat),
`digital_badge_label`, `digital_product_types`, `digital_tag`. The card also honours the kit's
`card_show_rating`, `card_quick_add`, `card_show_wishlist` and `card_show_sale_badge`.

## Presets

| Preset | Palette & type | Home page |
| --- | --- | --- |
| **Bookshop** (`books`, default) | Paper `#f8f4eb`, ink `#211c18`, oxblood `#6e1f2b`, gilt `#a8792f`; Libre Baskerville + Work Sans; 2px radius. | Hero with cover stack → trust strip → genre tiles → bestseller list → book of the month (*Pather Panchali*) → Bangla literature → author spotlight (Humayun Ahmed) → reading sample (*Gitanjali*) → digital shelf → fiction & poetry → reader quotes → journal. |
| **Digital products & courses** (`digital`) | White, navy ink, indigo `#4338ca`, cyan accent; Sora + Inter; 12px radius; flat covers. | Image hero → access strip → courses → how downloads work → top downloads → topics → learner quotes → downloads FAQ → guides. |
| **General store** (`general`) | Ivory, bottle green `#1f4d3a`, brass; Fraunces + DM Sans. | Image hero → trust strip → shelf spines → new arrivals → staff pick → stationery → best sellers → quotes → journal. |

Each preset has its own header (announcements, genres, tagline, search placeholder) and footer
(quote, letter copy, colophon).

## Customisation tips

- **Genres row:** add *Genre* blocks to the header, or remove them all to use your main menu (dropdowns supported).
- **Author line:** set `vendor` to the author, or name products "Title — Author".
- **Digital products:** give them the product type *eBook* / *Online Course* (or tag `digital`); they get the badge, instant-download copy on cards and the product page, and no courier info.
- **Portraits:** the default author image is an atmospheric reading photo — upload an author photo you have the rights to.
- **Reading samples:** only publish text you have the rights to (the default is Tagore's public-domain *Gitanjali*).
- Images live in `src/images.ts`; verify with `node tools/verify-images.mjs themes/folio`.

## Known limitations (kit)

- The kit wishlist stores only product ids, so Folio's reading list keeps its own small snapshot (title, author, cover, price) of books saved with Folio's bookmark; items saved elsewhere show as "+ N more".
- `SfCollection.productsCount` can come back as `0` from the data layer, so genre tiles confirm counts with a one-item product query.
- The kit gallery offers square / portrait / landscape ratios only (no 2:3), so the product page uses portrait.
