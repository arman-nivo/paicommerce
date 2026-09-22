---
title: Performance & accessibility checklist
description: The checklist Theme Store reviewers use — Core Web Vitals on mid-range Android over 4G, JavaScript budgets, images, fonts, semantics, keyboard support, contrast and Bangla readiness.
---

Most PaiCommerce shoppers arrive from a Facebook or Instagram ad, on a mid-range Android phone, over a 4G connection that is often congested. A theme that feels instant there converts; one that doesn't burns the merchant's ad budget. Reviewers test every submission against this checklist.

## Performance targets

Measured with Lighthouse (mobile, simulated throttling) and field data from demo stores:

| Metric | Target |
| --- | --- |
| Largest Contentful Paint (LCP) | **< 2.5 s** |
| Interaction to Next Paint (INP) | **< 200 ms** |
| Cumulative Layout Shift (CLS) | **< 0.1** |
| Lighthouse Performance, mobile (home, collection, product) | **≥ 90** |
| Lighthouse Accessibility, mobile (home, collection, product) | **≥ 95** |
| Client JavaScript added by the theme (gzip) | **≤ 60 KB** on the home page |

## Performance

- [ ] **Server Components by default.** Only interactive leaves (`"use client"`) ship JavaScript: cart drawer, variant picker, image gallery, countdown. Never mark a whole section as a client component just to use one hook.
- [ ] **Pass minimal props to client components.** Send `{ id, title, price }`, not the full `SfProduct` with every image and variant, across the server/client boundary.
- [ ] **Hero image is prioritised.** The first above-the-fold image uses `fetchPriority="high"` and no `loading="lazy"`; every other image uses `loading="lazy"`.
- [ ] **Images have dimensions.** Use `width`/`height` attributes or an aspect-ratio box (`aspect-square`, `aspect-[4/5]`) so nothing shifts while images load.
- [ ] **Sensible image sizes.** Merchant images come from the media library and Unsplash-style CDNs; request appropriate widths where the host supports it, and use `sizes`/`srcSet` for grids.
- [ ] **Fetch only what you render.** Pass `limit` to `getProducts`; never load a whole collection to show four products.
- [ ] **At most two font families**, loaded through `fontSettings` (which uses `display=swap`). No `@import` of extra font CSS.
- [ ] **No layout shift from late content.** Announcement bars, cookie notices and cart counts reserve their space.
- [ ] **No third-party runtime scripts.** Chat widgets, pixels and analytics are platform integrations the merchant configures — themes must not embed their own.
- [ ] **Carousels don't autoplay by default**, and never autoplay video with sound.
- [ ] **Theme CSS stays small** (≤ 15 KB). Prefer utilities.

## Accessibility (WCAG 2.1 AA)

- [ ] **Landmarks:** one `<header>`, one `<main id="main">`, one `<footer>`; sections use `<section aria-labelledby>`.
- [ ] **Skip link:** the first focusable element is "Skip to content" targeting `#main`.
- [ ] **One `<h1>` per page** (product title, collection title, page title; the store name or hero heading on the home page) and no skipped heading levels.
- [ ] **Keyboard:** every interactive element is reachable and operable with the keyboard; focus order follows visual order; no keyboard traps (drawers and modals trap focus *while open* and restore it on close).
- [ ] **Visible focus:** focus rings are clearly visible on every background preset — don't remove outlines without a replacement.
- [ ] **Buttons vs links:** navigation uses `<a href>`, actions use `<button type="button">`.
- [ ] **Labels:** every form field has a `<label>`; icon-only buttons have `aria-label` ("Open cart", "Remove Jamdani Saree from cart").
- [ ] **Alt text:** product images use `image.alt ?? product.title`; decorative images use `alt=""`.
- [ ] **Contrast:** text meets 4.5:1 (3:1 for large text) in **every preset**, including text over images (use an overlay).
- [ ] **Motion:** respect `prefers-reduced-motion` for parallax, marquees and animated transitions.
- [ ] **Live regions:** cart updates and "Added to cart" confirmations are announced (`aria-live="polite"`).
- [ ] **Touch targets** are at least 44 × 44 px on mobile.
- [ ] **Zoom & small screens:** the layout works from 360 px to wide desktop, and at 200% zoom, without horizontal scrolling.
- [ ] **Variant pickers** expose state: selected options use `aria-pressed` or radio semantics; unavailable options are announced as such.

## Commerce correctness

- [ ] Prices always use `context.formatMoney()` — no manual division by 100.
- [ ] Sale prices show the compare-at price struck through and are not conveyed by colour alone.
- [ ] Variant selection updates price, availability, SKU and image.
- [ ] Sold-out products and variants can't be added to the cart and are clearly labelled.
- [ ] Every internal link uses `context.url()` (or a resource's `url`) and works under `/s/<slug>` and in the customizer preview.
- [ ] The footer shows "Powered by PaiCommerce" exactly when `context.store.showBranding` is `true`.
- [ ] Empty states exist for empty collections, no search results, an empty cart and a blog with no posts.
- [ ] Account pages work for customers with a phone number and **no email**.

## Bangla & localisation

- [ ] Long Bangla product titles wrap cleanly (no `truncate` on product-card titles without `title` attribute).
- [ ] At least one preset uses a Bangla-capable body font (e.g. *Hind Siliguri*), and line-height is ≥ 1.5 for body text.
- [ ] No text is baked into images; all copy is editable through settings.
- [ ] Demo and preset images are verified: `node tools/verify-images.mjs themes/<slug>`.
- [ ] Phone numbers and prices render correctly with the `৳` symbol and Bangladeshi number formats from the formatter.

## Customizer experience

- [ ] Every section has an `icon`, a `description` and at least one preset (except template sections).
- [ ] Settings have defaults that look finished; related settings are grouped with `header` fields.
- [ ] `info` text explains non-obvious settings (image sizes, what an empty value does).
- [ ] Empty required settings render a helpful placeholder in preview and nothing broken in production.
- [ ] Every preset renders all templates without errors, with the seeded demo store for its category.

## Tools

- Lighthouse in Chrome DevTools (mobile) or `npx lighthouse http://aurora-demo.localhost:3003 --preset=perf --form-factor=mobile`.
- Chrome DevTools → Performance → CPU 4× slowdown + "Fast 4G" network.
- axe DevTools or the Accessibility pane in Chrome for automated a11y checks — then test with the keyboard and a screen reader (TalkBack on Android, VoiceOver on macOS/iOS).
