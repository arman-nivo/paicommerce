/**
 * Marketing copy. Testimonials, merchant names and headline stats are illustrative launch copy —
 * replace with real customer data before going live.
 */

export const MERCHANT_BRANDS = [
  { name: "Deshi Threads", style: "font-serif italic" },
  { name: "KACHA BAZAR", style: "font-black tracking-widest" },
  { name: "glow.bd", style: "font-bold lowercase" },
  { name: "TechNest", style: "font-extrabold tracking-tight" },
  { name: "Mishti Ghor", style: "font-serif font-semibold" },
  { name: "ARANYA", style: "font-light tracking-[0.3em]" },
  { name: "Pixel&Co", style: "font-mono font-bold" },
  { name: "Shishu Mela", style: "font-extrabold" },
  { name: "Nokshi", style: "font-serif italic font-bold" },
  { name: "FitBangla", style: "font-black italic uppercase" },
];

export const HEADLINE_STATS = [
  { value: "8,500+", label: "Active stores", detail: "from Teknaf to Tetulia" },
  { value: "৳120 Cr+", label: "GMV processed", detail: "in the last 12 months" },
  { value: "38%", label: "Fewer failed deliveries", detail: "with courier fraud check" },
  { value: "99.98%", label: "Uptime", detail: "on a global edge network" },
];

export const TESTIMONIALS = [
  {
    quote:
      "We moved from a Facebook-page business to a real brand in one weekend. The courier fraud check alone saved us more than the subscription cost in the first month.",
    name: "Nusrat Jahan",
    role: "Founder, Deshi Threads",
    metric: "3.2× revenue in 6 months",
  },
  {
    quote:
      "bKash and Nagad just work, and Steadfast bookings happen straight from the order page. My team processes 400 orders a day without touching a spreadsheet.",
    name: "Tanvir Rahman",
    role: "COO, TechNest",
    metric: "400 orders/day",
  },
  {
    quote:
      "Incomplete-order recovery is magic. We call the customers who dropped at checkout and convert almost a third of them.",
    name: "Farhana Akter",
    role: "Owner, glow.bd",
    metric: "31% carts recovered",
  },
  {
    quote:
      "Freshmart theme + delivery zones = our grocery store was live in two days. The customizer is as good as Shopify's, but it's built for how Bangladesh buys.",
    name: "Mahmud Hasan",
    role: "Founder, Kacha Bazar",
    metric: "Live in 2 days",
  },
  {
    quote:
      "As a theme developer I shipped Lumière in a few weeks with the SDK. The 70% revenue share and monthly bKash payouts make it a real business.",
    name: "Sadia Islam",
    role: "Independent theme developer",
    metric: "70% revenue share",
  },
  {
    quote:
      "Meta Conversions API was a one-field setup. Our ROAS reporting finally matches reality after iOS 14.",
    name: "Arif Chowdhury",
    role: "Growth lead, FitBangla",
    metric: "+42% attributed ROAS",
  },
];

export type CompareValue = boolean | string;
export const COMPARISON: { feature: string; pai: CompareValue; shopify: CompareValue; woo: CompareValue; local: CompareValue }[] = [
  { feature: "Pricing in BDT, pay with bKash", pai: true, shopify: false, woo: "Hosting in USD", local: true },
  { feature: "bKash, Nagad & SSLCommerz built in", pai: true, shopify: "3rd-party apps", woo: "Plugins", local: "Some" },
  { feature: "Cash on delivery with advance charge", pai: true, shopify: "Basic", woo: "Plugins", local: true },
  { feature: "Steadfast / Pathao / RedX one-click booking", pai: true, shopify: false, woo: "Plugins", local: "Some" },
  { feature: "Courier success-ratio fraud check", pai: true, shopify: false, woo: false, local: "Rare" },
  { feature: "Incomplete-order recovery", pai: true, shopify: "Email only", woo: "Plugins", local: "Rare" },
  { feature: "Section-based theme customizer", pai: true, shopify: true, woo: "Page builders", local: false },
  { feature: "Theme marketplace for developers", pai: true, shopify: true, woo: true, local: false },
  { feature: "Meta Pixel + Conversions API", pai: true, shopify: true, woo: "Plugins", local: "Pixel only" },
  { feature: "Developer API & webhooks", pai: true, shopify: true, woo: true, local: false },
  { feature: "AI descriptions in Bangla & English", pai: true, shopify: "English", woo: false, local: false },
  { feature: "Local support in Bangla", pai: true, shopify: false, woo: false, local: true },
  { feature: "No transaction fee on paid plans", pai: true, shopify: "Unless Shopify Payments", woo: true, local: "Varies" },
];

export const HOME_FAQ = [
  {
    q: "Do I need technical skills to use PaiCommerce?",
    a: "No. You pick a theme, add products and connect payments from a guided dashboard. Everything — sections, colours, menus, delivery zones — is point-and-click. Developers can go further with the Theme SDK and API.",
  },
  {
    q: "Which payment methods can my customers use?",
    a: "Cash on delivery (with optional advance delivery charge), bKash tokenized checkout, Nagad, SSLCommerz (cards, mobile banking, net banking), aamarPay, manual bKash/Nagad/Rocket Send Money with TrxID, and Stripe or PayPal for international customers.",
  },
  {
    q: "How does the courier fraud check work?",
    a: "Before you confirm an order we look up the customer's phone number across courier delivery history and show a success ratio. Low-ratio orders are flagged so you can call, ask for an advance, or cancel — cutting failed deliveries dramatically.",
  },
  {
    q: "Can I use my own domain?",
    a: "Yes. Every store gets a free yourstore.paicommerce.com subdomain. On Growth and above you can connect your own domain with a CNAME record and we issue SSL automatically.",
  },
  {
    q: "Is there a transaction fee?",
    a: "The free Starter plan has a 2% transaction fee. Growth, Pro and Enterprise have 0% platform fees — you only pay your payment gateway's own charges.",
  },
  {
    q: "Can I move from Shopify, WooCommerce or a local builder?",
    a: "Yes. Import products via CSV, and our team helps Growth and Pro merchants migrate products, customers and redirects for free.",
  },
  {
    q: "Can I build and sell my own themes?",
    a: "Absolutely. Themes are React packages built with our open Theme SDK. Scaffold one with `pnpm theme:new`, submit it for review, and keep 70% of every sale on the Theme Store.",
  },
];

export const PRICING_FAQ = [
  { q: "Is there really a free plan?", a: "Yes — Starter is free forever for up to 25 products and 50 orders a month, with COD and bKash, a paicommerce.com subdomain and all free themes. A 2% transaction fee applies." },
  { q: "How does the free trial work?", a: "Paid plans start with a 14-day free trial with every feature unlocked. No card needed. At the end of the trial choose a plan or drop to Starter — your store stays online." },
  { q: "How do I pay for my subscription?", a: "Pay in BDT with bKash, Nagad, local cards via SSLCommerz, or international cards. Yearly billing gets you roughly two months free." },
  { q: "Can I switch plans at any time?", a: "Upgrade instantly with prorated billing; downgrades apply at the end of your current billing period." },
  { q: "Do premium themes cost extra?", a: "Premium themes are a one-time purchase per store from the Theme Store (70% goes to the developer). Growth and above can install premium themes; free themes are available on every plan." },
  { q: "What counts as an order for the monthly limit?", a: "Every order created (storefront, manual or API) in a calendar month. If you exceed your limit we never block checkout — we'll email you to upgrade." },
  { q: "Do you offer discounts for NGOs or students?", a: "Yes — registered non-profits, SME Foundation members and university entrepreneurship clubs get 30% off. Contact sales with your documents." },
];

export const STEPS = [
  { title: "Create your store", body: "Sign up with your phone or email, name your store and pick your business category. We pre-fill delivery zones for Dhaka and outside Dhaka.", time: "2 minutes" },
  { title: "Pick a theme & add products", body: "Choose from 13 themes, customise with drag-and-drop sections, and import products by CSV or with the AI product writer.", time: "20 minutes" },
  { title: "Connect payments & couriers", body: "Enable COD in one click, paste your bKash / SSLCommerz keys and Steadfast / Pathao API, then publish. You're taking orders.", time: "10 minutes" },
];
