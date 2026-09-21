import path from "node:path";
import type { NextConfig } from "next";
// @ts-expect-error — plain ESM helper shared across apps
import { remoteImages, workspaceTranspile } from "../../packages/core/next-config.mjs";

const root = path.resolve(import.meta.dirname, "../..");

const config: NextConfig = {
  transpilePackages: workspaceTranspile(root),
  images: { remotePatterns: remoteImages },
  outputFileTracingRoot: root,
  typedRoutes: false,
};

export default config;
