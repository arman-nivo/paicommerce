/** Admin roles and capability matrix (shared by server + client). */
export type AdminRole = "support" | "admin" | "superadmin";
export const ADMIN_ROLES: AdminRole[] = ["support", "admin", "superadmin"];

export type Capability =
  | "read"
  | "tickets"
  | "stores.manage"
  | "stores.impersonate"
  | "users.manage"
  | "users.roles"
  | "billing.manage"
  | "themes.manage"
  | "developers.manage"
  | "content.manage"
  | "plans.manage"
  | "settings.manage";

const MATRIX: Record<AdminRole, Capability[]> = {
  support: ["read", "tickets"],
  admin: [
    "read",
    "tickets",
    "stores.manage",
    "stores.impersonate",
    "users.manage",
    "billing.manage",
    "themes.manage",
    "developers.manage",
    "content.manage",
  ],
  superadmin: [
    "read",
    "tickets",
    "stores.manage",
    "stores.impersonate",
    "users.manage",
    "users.roles",
    "billing.manage",
    "themes.manage",
    "developers.manage",
    "content.manage",
    "plans.manage",
    "settings.manage",
  ],
};

export function isAdminRole(role: string | null | undefined): role is AdminRole {
  return !!role && (ADMIN_ROLES as string[]).includes(role);
}

export function can(role: string | null | undefined, cap: Capability): boolean {
  return isAdminRole(role) && MATRIX[role].includes(cap);
}

export const ROLE_LABEL: Record<string, string> = {
  user: "User",
  support: "Support",
  admin: "Admin",
  superadmin: "Super admin",
};
