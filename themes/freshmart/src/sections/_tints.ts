/** Soft category tints (decorative backgrounds that sit under packshots). */
export const TINTS: Record<string, string> = {
  green: "#e7f6ea",
  orange: "#fff1dc",
  red: "#fde8e6",
  blue: "#e5f0fb",
  purple: "#f1eafb",
  yellow: "#fff8d6",
  teal: "#e1f5f1",
  pink: "#fce9f1",
};
export const TINT_ORDER = ["green", "orange", "red", "blue", "yellow", "purple", "teal", "pink"];
export const TINT_OPTIONS = [{ value: "auto", label: "Automatic" }, ...TINT_ORDER.map((t) => ({ value: t, label: t[0]!.toUpperCase() + t.slice(1) }))];
export const tintAt = (value: unknown, i: number) => TINTS[typeof value === "string" && value in TINTS ? value : TINT_ORDER[i % TINT_ORDER.length]!]!;
