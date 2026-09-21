/** Pure-data theme manifests (safe to import from Node scripts, seeds and the marketing site). */
import type { ThemeManifest } from "@pai/theme-sdk";
import { manifest as aurora } from "@pai-theme/aurora/manifest";
import { manifest as volt } from "@pai-theme/volt/manifest";
import { manifest as freshmart } from "@pai-theme/freshmart/manifest";
import { manifest as bloom } from "@pai-theme/bloom/manifest";
import { manifest as nest } from "@pai-theme/nest/manifest";
import { manifest as savor } from "@pai-theme/savor/manifest";
import { manifest as lumiere } from "@pai-theme/lumiere/manifest";
import { manifest as playhouse } from "@pai-theme/playhouse/manifest";
import { manifest as stride } from "@pai-theme/stride/manifest";
import { manifest as folio } from "@pai-theme/folio/manifest";
import { manifest as bazaar } from "@pai-theme/bazaar/manifest";
import { manifest as artisan } from "@pai-theme/artisan/manifest";
import { manifest as pulse } from "@pai-theme/pulse/manifest";

export const manifests: ThemeManifest[] = [aurora, volt, freshmart, bloom, nest, savor, lumiere, playhouse, stride, folio, bazaar, artisan, pulse];

export function getManifest(slug: string): ThemeManifest | undefined {
  return manifests.find((m) => m.slug === slug);
}
