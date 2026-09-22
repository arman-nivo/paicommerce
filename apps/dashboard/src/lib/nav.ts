import type { Permission } from "@pai/core";

export type NavItem = {
  href: string;
  label: string;
  icon: string; // key into ICONS (components/shell/icons.tsx)
  permission?: Permission;
  countKey?: "unfulfilled" | "incomplete" | "pendingReviews";
  children?: { href: string; label: string; permission?: Permission; countKey?: NavItem["countKey"] }[];
  keywords?: string;
};

export type NavGroup = { label?: string; items: NavItem[] };

export const NAV: NavGroup[] = [
  {
    items: [
      { href: "/", label: "Home", icon: "home", keywords: "dashboard overview checklist" },
      {
        href: "/orders",
        label: "Orders",
        icon: "orders",
        permission: "orders.view",
        countKey: "unfulfilled",
        children: [
          { href: "/orders", label: "All orders" },
          { href: "/orders/new", label: "Create order", permission: "orders.manage" },
          { href: "/orders/incomplete", label: "Incomplete orders", countKey: "incomplete" },
        ],
      },
      {
        href: "/products",
        label: "Products",
        icon: "products",
        permission: "products.view",
        children: [
          { href: "/products", label: "All products" },
          { href: "/products/inventory", label: "Inventory" },
          { href: "/products/collections", label: "Collections" },
          { href: "/products/reviews", label: "Reviews", countKey: "pendingReviews" },
        ],
      },
      { href: "/customers", label: "Customers", icon: "customers", permission: "customers.view" },
      { href: "/discounts", label: "Discounts", icon: "discounts", permission: "discounts.manage", keywords: "coupon promo code" },
      { href: "/analytics", label: "Analytics", icon: "analytics", permission: "analytics.view", keywords: "reports sales stats" },
    ],
  },
  {
    label: "Online store",
    items: [
      { href: "/themes", label: "Themes", icon: "themes", permission: "themes.manage", keywords: "design customize theme store" },
      { href: "/content/pages", label: "Pages", icon: "pages", permission: "content.manage" },
      { href: "/content/blog", label: "Blog posts", icon: "blog", permission: "content.manage" },
      { href: "/content/navigation", label: "Navigation", icon: "navigation", permission: "content.manage", keywords: "menu links" },
      { href: "/content/media", label: "Media library", icon: "media", permission: "content.manage", keywords: "images files uploads" },
      { href: "/domains", label: "Domains", icon: "domains", permission: "settings.manage", keywords: "custom domain dns" },
      { href: "/preferences", label: "Preferences", icon: "preferences", permission: "settings.manage", keywords: "seo pixel tracking password" },
    ],
  },
];

export const SETTINGS_NAV: { href: string; label: string; description: string; icon: string; permission?: Permission }[] = [
  { href: "/settings/general", label: "General", description: "Store name, logo, contact & address", icon: "store", permission: "settings.manage" },
  { href: "/settings/checkout", label: "Checkout", description: "Guest checkout, minimum order, incomplete orders", icon: "checkout", permission: "settings.manage" },
  { href: "/settings/delivery", label: "Delivery", description: "Delivery zones, charges & free shipping", icon: "delivery", permission: "settings.manage" },
  { href: "/settings/payments", label: "Payments", description: "COD, bKash, Nagad, SSLCommerz & more", icon: "payments", permission: "integrations.manage" },
  { href: "/settings/couriers", label: "Couriers", description: "Steadfast, Pathao, RedX booking", icon: "delivery", permission: "integrations.manage" },
  { href: "/settings/apps", label: "Apps & integrations", description: "Pixels, analytics, chat & SMS", icon: "apps", permission: "integrations.manage" },
  { href: "/settings/notifications", label: "Notifications", description: "Order emails, SMS & stock alerts", icon: "bell", permission: "settings.manage" },
  { href: "/settings/staff", label: "Staff & permissions", description: "Invite your team and control access", icon: "customers", permission: "staff.manage" },
  { href: "/settings/billing", label: "Plan & billing", description: "Your plan, usage and invoices", icon: "billing", permission: "billing.manage" },
  { href: "/settings/policies", label: "Policies", description: "Refund, privacy, terms & shipping", icon: "pages", permission: "settings.manage" },
  { href: "/settings/fraud", label: "Fraud prevention", description: "Block phone numbers, courier ratio", icon: "shield", permission: "settings.manage" },
  { href: "/settings/developers", label: "Developers", description: "API keys & webhooks", icon: "code", permission: "settings.manage" },
  { href: "/settings/danger", label: "Danger zone", description: "Close your store", icon: "danger" },
];
