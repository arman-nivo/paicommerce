/**
 * Access to the code theme registry (@pai/theme-registry). The admin app isn't a declared
 * dependent of the registry package, so it is imported by path through a JS bridge (the registry
 * resolves its own theme packages from packages/theme-registry/node_modules).
 */
import type { ThemeManifest } from "@pai/theme-sdk";
import { manifests } from "./registry-manifests.js";

export function registryManifests(): ThemeManifest[] {
  return manifests;
}

/** Whether a code package is registered for this slug (manifests and loaders are kept in sync by `pnpm theme:new`). */
export function hasCode(slug: string): boolean {
  return manifests.some((m) => m.slug === slug);
}

