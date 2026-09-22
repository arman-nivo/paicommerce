/** Plan tiers in ascending order. */
export const PLAN_ORDER = ["free", "growth", "pro", "enterprise"];

/** true when `current` plan code is at least `required`. */
export function planAtLeast(current: string, required: string | undefined | null) {
  if (!required) return true;
  const c = PLAN_ORDER.indexOf(current);
  const r = PLAN_ORDER.indexOf(required);
  return (c < 0 ? 0 : c) >= (r < 0 ? 0 : r);
}
