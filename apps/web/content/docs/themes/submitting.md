---
title: Submitting to the Theme Store
description: Become a theme partner — developer accounts, review guidelines, pricing in BDT, the 70/30 revenue share, semantic versioning, review statuses and monthly payouts via bank, bKash, PayPal or Wise.
---

The PaiCommerce Theme Store puts your theme in front of every merchant who signs up — and onboarding recommends themes by business category, so a great grocery or fashion theme gets seen by exactly the right stores. You keep **70% of every sale**.

## 1. Create a developer account

1. Click **Become a theme partner** on the [Theme partners](/developers) page. It opens sign-up with the developer intent — or log in if you already have a PaiCommerce account.
2. Complete your developer profile: display name, public slug (your partner page URL), website, bio and avatar.
3. Choose a payout method and payout email (see [payouts](#revenue-share-and-payouts)). This unlocks the **developer dashboard**, where you manage listings, submissions, sales and payouts.

Your developer profile is stored separately from your merchant stores — you can be a merchant and a theme partner with the same login. New partners start unverified; the **Verified partner** badge is granted after your first approved theme and a completed identity check for payouts.

## 2. Prepare your theme

Before submitting, make sure that:

- `node tools/create-theme/validate.mjs <slug>` reports **no errors** ([Validation](/docs/themes/validation));
- the theme passes the [performance & accessibility checklist](/docs/themes/checklist);
- `manifest.version` is bumped and `README.md` has a changelog entry for it;
- your theme has a **preset for every category** in `manifest.categories`, and each renders well with that category's demo store;
- `manifest.thumbnail` and `screenshots` show the theme with realistic content — no lorem ipsum, no competitor brands, and only images you have the rights to (Unsplash is fine).

## 3. Submit

From your developer dashboard, create a theme listing and submit a version:

- **Repository** — a Git URL reviewers can clone (a private GitHub repo with read access for `paicommerce-review` works). The repo must contain your `themes/<slug>` package.
- **Version** — must match `manifest.version`.
- **Changelog** — what changed, in plain language merchants will understand.
- **Demo content notes** — which demo store / preset best shows each feature.

Submitting creates a row in `theme_versions` with status `in_review` and adds it to the admin review queue.

Alternatively, open a pull request against the PaiCommerce repository titled `feat(theme-<slug>): …` that contains `themes/<slug>` and the registry entries the CLI generated. The review is the same either way.

Theme authors keep their copyright. By submitting, you grant PaiCommerce the right to distribute the theme to merchants through the Theme Store.

## Review statuses

A theme listing (`themes.status`) and each submitted version (`theme_versions.status`) move through the same states:

| Status | Meaning |
| --- | --- |
| `draft` | Listing created, nothing submitted yet. Only you can see it. |
| `in_review` | Submitted and waiting for, or undergoing, review. Typical turnaround: **5 business days** for a new theme, **2 business days** for an update. |
| `approved` | Live on the Theme Store (for a listing) or published to stores (for a version). `approvedAt` is set. |
| `rejected` | Changes required. Reviewer notes (`reviewNotes`) explain what to fix; resubmit a new version. |
| `unlisted` | Hidden from the Theme Store — by you or by the platform — but stores that already installed it keep it and continue to receive fixes. |

## Review guidelines

Reviewers install your theme on the demo store for each category, walk through every template and preset, and run the checklist. The most common reasons for rejection:

**Functionality**
- A template errors or renders empty with the demo data (empty states are required, errors are not acceptable).
- Links that ignore `context.url()` and break under `/s/<slug>` or in the customizer.
- Prices formatted manually instead of with `context.formatMoney()`.
- Sold-out variants that can still be added to the cart.
- The "Powered by PaiCommerce" credit ignores `store.showBranding`.

**Customizer**
- Sections that are invisible or broken right after being added (missing defaults or presets).
- Settings with unclear labels, no `info` for non-obvious behaviour, or ids renamed between versions (which wipes merchants' customisations).

**Performance & accessibility**
- Lighthouse mobile performance below 90, or accessibility below 95, on home, collection or product pages.
- Keyboard traps, missing focus styles, missing labels, insufficient contrast in any preset.

**Code & content policy**
- Third-party runtime dependencies beyond `@pai/theme-sdk`, `@pai/theme-kit`, React and `lucide-react`.
- Any network requests to your own servers, tracking scripts, obfuscated code, or code that reads cookies/storage it doesn't own.
- Licensing: all fonts, icons and images must be licensed for commercial redistribution.
- Misleading listing: screenshots or features the theme doesn't actually have.

## Pricing

Set your price in `manifest.price` in **BDT minor units** (poisha):

| Tier | Typical price | `price` |
| --- | --- | --- |
| Free | ৳0 | `0` |
| Standard | ৳1,900 – ৳3,900 | `190000` – `390000` |
| Premium | ৳4,900 – ৳6,900 | `490000` – `690000` |

We recommend pricing between **৳1,900 and ৳6,900** — the range merchants in Bangladesh buy most readily.

Free themes are a great way to build a reputation (installs and ratings show on your partner page). Premium themes are only available to stores on plans that include premium themes (Growth and above).

A merchant buys a theme **once per store** (recorded in `theme_purchases`) and receives all updates within the same major version. A new major version (`2.0.0`) may be sold as a new purchase only if it is a substantially new theme — otherwise it's an update.

## Revenue share and payouts

For every sale, the split is recorded on the purchase:

- **Developer share: 70%** — added to your developer balance (`developers.revenueSharePct` defaults to `70`).
- **Platform share: 30%** — covers payment processing, hosting of demo stores, review and marketing.

Verified partners with top-rated themes can qualify for an **80%** share; the percentage is stored per developer, so the split on each purchase always reflects your current rate.

Example: a ৳4,900 theme earns you ৳3,430.

| | Amount | Minor units |
| --- | --- | --- |
| Sale price | ৳4,900 | `490000` |
| Your share (70%) | ৳3,430 | `343000` |
| Platform share (30%) | ৳1,470 | `147000` |

Payouts run **monthly**, in the first week of the month, for the previous month's balance:

| Method | Currency | Notes |
| --- | --- | --- |
| Bank transfer (BEFTN) | BDT | Any Bangladeshi bank account in your legal name. |
| bKash | BDT | Personal or merchant wallet; subject to bKash transaction limits. |
| PayPal | USD | For partners outside Bangladesh. Converted at the payout-day rate. |
| Wise | USD / local currency | For partners outside Bangladesh. |

The **minimum payout is ৳5,000** (500000 poisha). Balances below the threshold roll over to the next month. Each payout appears in your developer dashboard with its status (`pending` → `processing` → `paid`, or `failed` with a reason) and a transfer reference.

## Versioning

Themes use **semantic versioning**, and every submission is a new `theme_versions` row:

| Change | Bump | Example |
| --- | --- | --- |
| Bug fixes, performance, copy | PATCH | `1.4.2` → `1.4.3` |
| New sections, settings, blocks or presets (backwards compatible) | MINOR | `1.4.3` → `1.5.0` |
| Removed or renamed section types / setting ids, or redesigned templates | MAJOR | `1.5.0` → `2.0.0` |

Rules that keep merchants safe:

- **Never rename a section `type`, block `type` or setting `id` in a minor or patch release.** Stored configs reference them; renaming silently resets merchants' work. Add new ids and keep reading the old ones until the next major.
- **New settings need defaults**, because existing stores won't have values for them.
- Approved updates roll out to every store using the theme. Merchants' `config` documents are untouched — only your code changes — which is exactly why ids must stay stable.

## After approval

- Your theme appears in the Theme Store with a live demo store at `https://<slug>-demo.paicommerce.com`.
- You can see installs, sales, ratings and reviews in your developer dashboard.
- Merchants contact you through `manifest.supportUrl` for theme-specific questions. Aim to respond within 3 business days — responsiveness is part of how partner quality is assessed.

Questions about the programme? Email **partners@paicommerce.com**.
