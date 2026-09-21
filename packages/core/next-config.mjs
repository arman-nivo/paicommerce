/**
 * Shared Next.js config pieces. Workspace packages ship TypeScript source, so every app
 * transpiles them. Theme packages under /themes are discovered automatically.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";

export function workspaceTranspile(root) {
  const names = ["@pai/core", "@pai/db", "@pai/ui", "@pai/theme-sdk", "@pai/theme-kit", "@pai/theme-registry"];
  const themesDir = path.join(root, "themes");
  if (existsSync(themesDir)) {
    for (const d of readdirSync(themesDir)) {
      const pj = path.join(themesDir, d, "package.json");
      if (existsSync(pj)) names.push(JSON.parse(readFileSync(pj, "utf8")).name);
    }
  }
  return names;
}

export const remoteImages = [
  { protocol: "https", hostname: "images.unsplash.com" },
  { protocol: "https", hostname: "plus.unsplash.com" },
  { protocol: "http", hostname: "localhost" },
  { protocol: "http", hostname: "*.localhost" },
];
