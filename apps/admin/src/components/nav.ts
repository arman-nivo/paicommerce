import type { Capability } from "@/lib/roles";

export type NavItem = { href: string; label: string; icon: string; cap: Capability; badge?: "tickets" | "review"; shortcut?: string; keywords?: string };

export const NAV: { group: string; items: NavItem[] }[] = [
  {
    group: "Platform",
    items: [
      { href: "/", label: "Overview", icon: "LayoutDashboard", cap: "read", shortcut: "o", keywords: "dashboard metrics mrr gmv" },
      { href: "/stores", label: "Stores", icon: "Store", cap: "read", shortcut: "s", keywords: "merchants shops tenants" },
      { href: "/users", label: "Users", icon: "Users", cap: "read", shortcut: "u", keywords: "accounts people" },
    ],
  },
  {
    group: "Revenue",
    items: [
      { href: "/billing", label: "Billing", icon: "CreditCard", cap: "read", shortcut: "b", keywords: "subscriptions invoices revenue" },
      { href: "/plans", label: "Plans", icon: "Layers", cap: "plans.manage", shortcut: "p", keywords: "pricing tiers limits" },
    ],
  },
  {
    group: "Ecosystem",
    items: [
      { href: "/themes", label: "Theme Store", icon: "Palette", cap: "read", badge: "review", shortcut: "h", keywords: "themes templates review marketplace" },
      { href: "/developers", label: "Developers", icon: "Code2", cap: "read", shortcut: "d", keywords: "partners payouts earnings" },
    ],
  },
  {
    group: "Operations",
    items: [
      { href: "/tickets", label: "Support", icon: "LifeBuoy", cap: "read", badge: "tickets", shortcut: "t", keywords: "tickets help inbox" },
      { href: "/announcements", label: "Announcements", icon: "Megaphone", cap: "read", shortcut: "a", keywords: "news banner broadcast" },
      { href: "/leads", label: "Leads", icon: "Inbox", cap: "read", shortcut: "l", keywords: "contact demo enterprise sales" },
      { href: "/audit", label: "Audit log", icon: "ScrollText", cap: "read", shortcut: "g", keywords: "activity history log" },
      { href: "/settings", label: "Settings", icon: "Settings", cap: "settings.manage", shortcut: ",", keywords: "configuration team admins maintenance" },
    ],
  },
];
