export type BlogBlock = { h2: string } | { p: string } | { ul: string[] } | { quote: string };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  author: { name: string; role: string };
  date: string; // ISO
  readMinutes: number;
  cover: string;
  body: BlogBlock[];
};

export const POSTS: BlogPost[] = [
  {
    slug: "reduce-cod-returns-bangladesh",
    title: "How to cut COD returns by a third: a playbook for Bangladeshi sellers",
    excerpt: "Failed deliveries quietly eat your margins. Here's the exact process top PaiCommerce merchants use to confirm orders, spot risky customers and ask for advances without losing sales.",
    category: "Operations",
    author: { name: "Rashed Mahmud", role: "Head of Merchant Success" },
    date: "2026-09-10",
    readMinutes: 7,
    cover: "https://images.unsplash.com/photo-1566576721346-d4a3b4eaeb55?auto=format&fit=crop&w=1600&q=80",
    body: [
      { p: "Cash on delivery is how most of Bangladesh buys online — and it's also where most online businesses leak money. Every returned parcel costs you two delivery charges, packaging, and stock that sits in a courier hub for days." },
      { h2: "1. Check the courier success ratio before you confirm" },
      { p: "PaiCommerce shows every customer's delivery success ratio across Steadfast, Pathao and RedX right on the order page. A customer who has received 22 out of 23 parcels is safe to ship. One who has returned 7 of 11 needs a phone call first." },
      { ul: ["Above 80%: confirm and book the courier immediately", "50–80%: call to confirm size, colour and address", "Below 50%: ask for the delivery charge in advance via bKash"] },
      { h2: "2. Ask for advance delivery charge — selectively" },
      { p: "Blanket advance payments hurt conversion. Instead, enable the advance delivery charge only for outside-Dhaka orders or customers below your success-rate threshold. Merchants who do this see returns fall by 30–40% with almost no drop in orders." },
      { h2: "3. Confirm within the hour" },
      { p: "The longer an order sits unconfirmed, the more likely the customer buys elsewhere. Use the incomplete-orders and new-orders queues to call within 60 minutes, and send an SMS confirmation automatically." },
      { quote: "We started calling every order under 70% success rate. Returns dropped from 22% to 13% in six weeks. — Nusrat, Deshi Threads" },
      { h2: "4. Make the product page do the selling" },
      { p: "Many returns are really 'wrong expectation' returns. Add real photos, a size guide, fabric details and delivery times. The AI product writer can draft these in Bangla in seconds." },
    ],
  },
  {
    slug: "meta-conversions-api-setup",
    title: "Meta Conversions API in 5 minutes: why your Facebook ads need server-side tracking",
    excerpt: "iOS privacy changes and ad blockers hide up to 30% of your conversions from Meta. Here's how CAPI fixes it — and how to switch it on in PaiCommerce.",
    category: "Marketing",
    author: { name: "Shreya Das", role: "Developer Relations" },
    date: "2026-08-28",
    readMinutes: 5,
    cover: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1600&q=80",
    body: [
      { p: "If your Ads Manager shows fewer purchases than your dashboard, you're not imagining it. Browser-only pixels miss conversions from iOS users, in-app browsers and ad blockers." },
      { h2: "What the Conversions API does" },
      { p: "CAPI sends the same events — ViewContent, AddToCart, InitiateCheckout, Purchase — directly from our servers to Meta, with a shared event_id so Meta deduplicates them against the browser pixel." },
      { h2: "Setting it up" },
      { ul: ["Open Apps & integrations → Meta Pixel + Conversions API", "Paste your Pixel ID", "Generate an access token in Events Manager and paste it", "Optionally add a test event code and place a test order"] },
      { p: "That's it. Within an hour your Event Match Quality should climb, and campaign optimisation improves with more accurate purchase data." },
    ],
  },
  {
    slug: "choosing-a-theme-for-your-store",
    title: "Choosing the right theme: 13 themes, 17 categories, one decision",
    excerpt: "Your theme is your storefront's first impression. A guide to picking (and customising) the right PaiCommerce theme for your category, catalogue size and brand.",
    category: "Design",
    author: { name: "Nabila Karim", role: "Head of Design" },
    date: "2026-08-12",
    readMinutes: 6,
    cover: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1600&q=80",
    body: [
      { p: "Every PaiCommerce theme shares the same fast checkout and commerce features. What changes is layout, typography and the sections each one is designed around." },
      { h2: "Start from your catalogue" },
      { ul: ["Few hero products (under 50): image-led themes like Aurora, Lumière or Bloom", "Large catalogues (500+): dense, filter-friendly themes like Bazaar, Volt or Freshmart", "Food & made-to-order: Savor with menu-style collections", "Stories & craft: Artisan and Nest put your makers front and centre"] },
      { h2: "Use a preset, then make it yours" },
      { p: "Each theme ships with category presets. Pick one, then change colours, fonts and sections in the customizer. Everything is saved as a draft until you publish." },
      { h2: "Try before you commit" },
      { p: "Every theme has a live demo store. Click through it on your phone — that's where 85% of your customers will see it." },
    ],
  },
  {
    slug: "building-your-first-paicommerce-theme",
    title: "Building your first PaiCommerce theme with the Theme SDK",
    excerpt: "A developer's walkthrough: scaffold with pnpm theme:new, write a custom section with blocks, validate it and submit it to the Theme Store.",
    category: "Developers",
    author: { name: "Imran Hossain", role: "Head of Engineering" },
    date: "2026-07-30",
    readMinutes: 9,
    cover: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=80",
    body: [
      { p: "PaiCommerce themes are ordinary TypeScript packages. If you know React, you already know most of what you need." },
      { h2: "Scaffold" },
      { p: "Run pnpm theme:new my-theme from the repo root. The CLI creates themes/my-theme with a manifest, global settings, presets and an example section, then registers it with the theme registry." },
      { h2: "Sections and blocks" },
      { p: "A section is a React component plus a schema. The schema's settings become form fields in the customizer; blocks let merchants add repeatable items like slides or testimonials. Sections receive a typed context with store data, resolved theme settings and a data API." },
      { h2: "Validate and submit" },
      { p: "Run node tools/create-theme/validate.mjs my-theme to check your manifest, schemas and templates. When it's clean, submit it from the developer dashboard. You keep 70% of every sale." },
      { p: "Read the full guide in the developer documentation under Theme development." },
    ],
  },
];

export function getPost(slug: string) {
  return POSTS.find((p) => p.slug === slug);
}
