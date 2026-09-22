import { defaultCssVariables, hexToRgbTriplet, type SettingValues } from "@pai/theme-sdk";
import { num } from "./utils";

/* ─────────────────────────── CSS variables ─────────────────────────── */

function mix(hexA: string, hexB: string, weightA: number): string {
  const a = hexToRgbTriplet(hexA).split(" ").map(Number);
  const b = hexToRgbTriplet(hexB).split(" ").map(Number);
  const c = a.map((v, i) => Math.round(v * weightA + b[i]! * (1 - weightA)));
  return "#" + c.map((v) => v.toString(16).padStart(2, "0")).join("");
}

/** Relative luminance (0–1) of a hex colour. */
export function luminance(hex: string): number {
  const [r, g, b] = hexToRgbTriplet(hex)
    .split(" ")
    .map((v) => {
      const c = Number(v) / 255;
      return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
    });
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

/** Pick black or white text for a background colour. */
export function readableOn(hex: string): string {
  return luminance(hex) > 0.45 ? "#111111" : "#ffffff";
}

/**
 * The kit's CSS variable mapper (default `cssVariables` for themes built with `createBaseTheme`).
 * Emits everything `defaultCssVariables` does plus pre-computed colour-scheme tokens used by
 * `.pai-scheme-*` classes (muted / inverse / primary / accent sections).
 */
export function kitCssVariables(s: SettingValues): Record<string, string> {
  const vars = defaultCssVariables(s);
  const bg = vars["--pai-bg"]!;
  const fg = vars["--pai-fg"]!;
  const primary = vars["--pai-primary"]!;
  const primaryFg = vars["--pai-primary-fg"]!;
  vars["--pai-scheme-muted-bg"] = vars["--pai-muted"]!;
  vars["--pai-scheme-muted-card"] = bg;
  vars["--pai-scheme-inverse-bg"] = fg;
  vars["--pai-scheme-inverse-fg"] = bg;
  vars["--pai-scheme-inverse-bg-rgb"] = hexToRgbTriplet(fg);
  vars["--pai-scheme-inverse-fg-rgb"] = hexToRgbTriplet(bg);
  vars["--pai-scheme-inverse-muted"] = mix(fg, bg, 0.9);
  vars["--pai-scheme-inverse-border"] = mix(fg, bg, 0.78);
  vars["--pai-scheme-primary-bg"] = primary;
  vars["--pai-scheme-primary-fg"] = primaryFg;
  vars["--pai-scheme-primary-bg-rgb"] = hexToRgbTriplet(primary);
  vars["--pai-scheme-primary-fg-rgb"] = hexToRgbTriplet(primaryFg);
  vars["--pai-scheme-primary-muted"] = mix(primary, primaryFg, 0.88);
  vars["--pai-scheme-primary-border"] = mix(primary, primaryFg, 0.75);
  vars["--pai-scheme-accent-bg"] = vars["--pai-accent"]!;
  vars["--pai-card"] = typeof s.color_card === "string" && s.color_card ? s.color_card : bg;
  vars["--pai-heading-transform"] = s.heading_case === "uppercase" ? "uppercase" : "none";
  vars["--pai-logo-width"] = `${num(s.logo_width, 120)}px`;
  return vars;
}

/** Section colour-scheme class for a `color_scheme` setting value. */
export function schemeClass(scheme: unknown): string {
  switch (scheme) {
    case "muted":
      return "pai-scheme-muted";
    case "inverse":
      return "pai-scheme-inverse";
    case "primary":
      return "pai-scheme-primary";
    case "accent":
      return "pai-scheme-accent";
    default:
      return "";
  }
}

