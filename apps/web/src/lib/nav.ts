export type NavLink = { label: string; href: string; description?: string; icon?: string };
export type NavGroup = { label: string; href?: string; columns?: { title: string; links: NavLink[] }[] };

export const FEATURE_ANCHORS: NavLink[] = [
  { label: "Store builder", href: "/features#store-builder", description: "Launch a store in minutes, no code", icon: "Store" },
  { label: "Themes & customizer", href: "/features#themes", description: "Drag-and-drop sections, live preview", icon: "Palette" },
  { label: "Payments", href: "/features#payments", description: "bKash, Nagad, SSLCommerz, COD", icon: "Wallet" },
  { label: "Couriers", href: "/features#couriers", description: "Steadfast, Pathao, RedX in one click", icon: "Truck" },
  { label: "Orders & fraud check", href: "/features#orders", description: "Courier success ratio before you ship", icon: "ShieldCheck" },
  { label: "Incomplete orders", href: "/features#incomplete-orders", description: "Recover abandoned checkouts", icon: "RotateCcw" },
  { label: "Analytics", href: "/features#analytics", description: "Sales, funnels, top products", icon: "BarChart3" },
  { label: "Marketing pixels", href: "/features#marketing", description: "Meta Pixel + CAPI, GA4, GTM", icon: "Megaphone" },
  { label: "AI product writer", href: "/features#ai", description: "Descriptions & SEO in Bangla/English", icon: "Sparkles" },
  { label: "Staff & permissions", href: "/features#staff", description: "Granular roles for your team", icon: "Users" },
  { label: "Custom domains", href: "/features#domains", description: "Your domain with free SSL", icon: "Globe" },
  { label: "Developer API", href: "/features#api", description: "REST API & signed webhooks", icon: "Code2" },
];

export const NAV: NavGroup[] = [
  {
    label: "Product",
    columns: [
      { title: "Sell", links: FEATURE_ANCHORS.slice(0, 6) },
      { title: "Grow", links: FEATURE_ANCHORS.slice(6) },
    ],
  },
  {
    label: "Themes",
    columns: [
      {
        title: "Theme Store",
        links: [
          { label: "Browse all themes", href: "/themes", description: "13 themes for every business", icon: "LayoutGrid" },
          { label: "Free themes", href: "/themes?price=free", description: "Beautiful and free forever", icon: "Gift" },
          { label: "Premium themes", href: "/themes?price=premium", description: "Advanced, conversion-tuned", icon: "Crown" },
        ],
      },
      {
        title: "Popular categories",
        links: [
          { label: "Fashion & Apparel", href: "/themes?category=fashion" },
          { label: "Electronics & Gadgets", href: "/themes?category=electronics" },
          { label: "Grocery & Supermarket", href: "/themes?category=grocery" },
          { label: "Beauty & Cosmetics", href: "/themes?category=beauty" },
          { label: "Food & Restaurant", href: "/themes?category=food" },
          { label: "Home & Furniture", href: "/themes?category=home" },
        ],
      },
    ],
  },
  {
    label: "Developers",
    columns: [
      {
        title: "Build",
        links: [
          { label: "Documentation", href: "/docs", description: "Guides & references", icon: "BookOpen" },
          { label: "Theme development", href: "/docs/themes", description: "Sections, blocks, settings", icon: "Blocks" },
          { label: "Storefront API", href: "/docs/api", description: "REST API with API keys", icon: "Code2" },
          { label: "Webhooks", href: "/docs/webhooks", description: "HMAC-signed events", icon: "Webhook" },
        ],
      },
      {
        title: "Earn",
        links: [
          { label: "Theme partner program", href: "/developers", description: "Keep 70% of every sale", icon: "HandCoins" },
          { label: "Submission guidelines", href: "/docs/themes/submitting", description: "Review, versioning, payouts", icon: "ClipboardCheck" },
          { label: "Changelog", href: "/changelog", description: "What's new in PaiCommerce", icon: "History" },
        ],
      },
    ],
  },
  { label: "Pricing", href: "/pricing" },
  {
    label: "Resources",
    columns: [
      {
        title: "Learn",
        links: [
          { label: "Blog", href: "/blog", description: "Playbooks for Bangladeshi sellers", icon: "Newspaper" },
          { label: "Changelog", href: "/changelog", description: "Product updates", icon: "History" },
          { label: "System status", href: "/status", description: "Uptime & incidents", icon: "Activity" },
        ],
      },
      {
        title: "Company",
        links: [
          { label: "About us", href: "/about", description: "Our mission & team", icon: "Building2" },
          { label: "Contact sales", href: "/contact", description: "Talk to our team", icon: "MessageSquare" },
          { label: "Partners", href: "/developers", description: "Agencies & theme developers", icon: "Handshake" },
        ],
      },
    ],
  },
];

export const FOOTER: { title: string; links: NavLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Theme Store", href: "/themes" },
      { label: "Payments", href: "/features#payments" },
      { label: "Couriers", href: "/features#couriers" },
      { label: "Fraud check", href: "/features#orders" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Quickstart", href: "/docs/quickstart" },
      { label: "Theme development", href: "/docs/themes" },
      { label: "Storefront API", href: "/docs/api" },
      { label: "Webhooks", href: "/docs/webhooks" },
      { label: "Sell themes", href: "/developers" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Careers", href: "/about#careers" },
      { label: "Contact", href: "/contact" },
      { label: "Status", href: "/status" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of service", href: "/legal/terms" },
      { label: "Privacy policy", href: "/legal/privacy" },
      { label: "Refund policy", href: "/legal/refund" },
    ],
  },
];
