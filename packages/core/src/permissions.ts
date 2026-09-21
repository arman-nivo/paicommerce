export const PERMISSIONS = {
  "orders.view": "View orders",
  "orders.manage": "Edit & fulfil orders",
  "products.view": "View products",
  "products.manage": "Create & edit products",
  "customers.view": "View customers",
  "customers.manage": "Edit customers",
  "discounts.manage": "Manage discounts",
  "analytics.view": "View analytics",
  "content.manage": "Manage pages, blog & navigation",
  "themes.manage": "Customize & publish themes",
  "settings.manage": "Manage store settings",
  "integrations.manage": "Manage payments, couriers & apps",
  "staff.manage": "Manage staff",
  "billing.manage": "Manage plan & billing",
} as const;

export type Permission = keyof typeof PERMISSIONS;
export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as Permission[];

export const ROLE_PRESETS: Record<string, { label: string; permissions: Permission[] }> = {
  manager: { label: "Store manager", permissions: ALL_PERMISSIONS.filter((p) => p !== "billing.manage" && p !== "staff.manage") },
  orders: { label: "Order processor", permissions: ["orders.view", "orders.manage", "customers.view", "products.view"] },
  catalog: { label: "Catalog editor", permissions: ["products.view", "products.manage", "content.manage"] },
  marketing: { label: "Marketer", permissions: ["discounts.manage", "analytics.view", "content.manage", "customers.view"] },
};

export function hasPermission(
  member: { role: "owner" | "admin" | "staff"; permissions: string[] } | null | undefined,
  perm: Permission,
): boolean {
  if (!member) return false;
  if (member.role === "owner" || member.role === "admin") return true;
  return member.permissions.includes(perm);
}
