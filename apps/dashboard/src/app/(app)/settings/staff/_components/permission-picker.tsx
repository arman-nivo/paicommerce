"use client";
import { ALL_PERMISSIONS, PERMISSIONS, ROLE_PRESETS, type Permission } from "@pai/core";
import { Checkbox, cn } from "@pai/ui";

const GROUPS: { label: string; perms: Permission[] }[] = [
  { label: "Orders & customers", perms: ["orders.view", "orders.manage", "customers.view", "customers.manage"] },
  { label: "Catalog & marketing", perms: ["products.view", "products.manage", "discounts.manage", "analytics.view", "content.manage", "themes.manage"] },
  { label: "Administration", perms: ["settings.manage", "integrations.manage", "staff.manage", "billing.manage"] },
];

const same = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));

export function PermissionPicker({ value, onChange }: { value: Permission[]; onChange: (v: Permission[]) => void }) {
  const toggle = (p: Permission, on: boolean) => {
    let next = on ? [...value, p] : value.filter((x) => x !== p);
    // "manage" implies "view" for the same area.
    if (on && p.endsWith(".manage")) {
      const view = p.replace(".manage", ".view") as Permission;
      if (ALL_PERMISSIONS.includes(view) && !next.includes(view)) next.push(view);
    }
    next = [...new Set(next)];
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-xs font-medium text-muted-foreground">Quick pick</p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(ROLE_PRESETS).map(([key, preset]) => {
            const active = same(value, preset.permissions);
            return (
              <button
                key={key}
                type="button"
                onClick={() => onChange([...preset.permissions])}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition",
                  active ? "border-primary bg-accent text-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>
      {GROUPS.map((g) => (
        <fieldset key={g.label}>
          <legend className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">{g.label}</legend>
          <div className="grid gap-1 sm:grid-cols-2">
            {g.perms.map((p) => (
              <label key={p} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm hover:bg-muted">
                <Checkbox checked={value.includes(p)} onChange={(e) => toggle(p, e.target.checked)} />
                {PERMISSIONS[p]}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}

/** Short human summary of a staff member's permissions. */
export function permissionSummary(role: string, perms: string[]) {
  if (role === "owner") return "Full access · billing & ownership";
  if (role === "admin") return "Full access";
  if (!perms.length) return "No access";
  const preset = Object.values(ROLE_PRESETS).find((p) => same(perms, p.permissions));
  if (preset) return preset.label;
  const labels = perms.filter((p): p is Permission => p in PERMISSIONS).map((p) => PERMISSIONS[p]);
  return labels.length <= 2 ? labels.join(", ") : `${labels.slice(0, 2).join(", ")} +${labels.length - 2} more`;
}
