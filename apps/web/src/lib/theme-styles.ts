/** Visual identity per theme, used to render stylised previews on the marketing site. */
export type ThemeStyle = { bg: string; fg: string; accent: string; muted: string; font: "serif" | "sans" | "display" | "rounded"; dark?: boolean };

const STYLES: Record<string, ThemeStyle> = {
  aurora: { bg: "#faf7f2", fg: "#1c1917", accent: "#9a3412", muted: "#efe8dd", font: "serif" },
  volt: { bg: "#0b0f19", fg: "#f8fafc", accent: "#22d3ee", muted: "#141b2d", font: "display", dark: true },
  freshmart: { bg: "#f7fdf6", fg: "#14361f", accent: "#16a34a", muted: "#e4f5e1", font: "rounded" },
  bloom: { bg: "#fff7f8", fg: "#3f1d2b", accent: "#db2777", muted: "#fde4ea", font: "serif" },
  nest: { bg: "#f6f3ee", fg: "#2b2620", accent: "#a16207", muted: "#e9e2d6", font: "sans" },
  savor: { bg: "#fff8f1", fg: "#3b1d0e", accent: "#ea580c", muted: "#fde7d2", font: "display" },
  lumiere: { bg: "#0f0d0b", fg: "#f5efe6", accent: "#d4af37", muted: "#1c1915", font: "serif", dark: true },
  playhouse: { bg: "#fffbeb", fg: "#1e1b4b", accent: "#8b5cf6", muted: "#fef3c7", font: "rounded" },
  stride: { bg: "#0a0a0a", fg: "#fafafa", accent: "#facc15", muted: "#171717", font: "display", dark: true },
  folio: { bg: "#fbfaf7", fg: "#1f2937", accent: "#2563eb", muted: "#eef0f3", font: "serif" },
  bazaar: { bg: "#ffffff", fg: "#111827", accent: "#f97316", muted: "#fff1e6", font: "sans" },
  artisan: { bg: "#f5efe6", fg: "#3a2a1c", accent: "#b45309", muted: "#e8dccb", font: "serif" },
  pulse: { bg: "#f5fbff", fg: "#0c2a3f", accent: "#0891b2", muted: "#dff3fb", font: "sans" },
};

const FALLBACK: ThemeStyle[] = [
  { bg: "#ffffff", fg: "#0f172a", accent: "#2545eb", muted: "#eef2ff", font: "sans" },
  { bg: "#fdf4ff", fg: "#3b0764", accent: "#a21caf", muted: "#fae8ff", font: "display" },
  { bg: "#f0fdfa", fg: "#134e4a", accent: "#0d9488", muted: "#ccfbf1", font: "rounded" },
];

export function themeStyle(slug: string): ThemeStyle {
  if (STYLES[slug]) return STYLES[slug];
  const h = [...slug].reduce((a, c) => a + c.charCodeAt(0), 0);
  return FALLBACK[h % FALLBACK.length]!;
}

export const fontFamily = (f: ThemeStyle["font"]) =>
  f === "serif"
    ? '"Playfair Display", Georgia, "Times New Roman", serif'
    : f === "display"
      ? '"Plus Jakarta Sans", Inter, system-ui, sans-serif'
      : f === "rounded"
        ? '"Nunito", "Plus Jakarta Sans", system-ui, sans-serif'
        : "Inter, system-ui, sans-serif";
