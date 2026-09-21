#!/usr/bin/env node
/**
 * Finds every images.unsplash.com URL in the given directories and checks it returns 200.
 * Usage: node tools/verify-images.mjs themes packages/db/src/seed apps/web/src
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

const dirs = process.argv.slice(2).length ? process.argv.slice(2) : ["."];
const re = /https:\/\/images\.unsplash\.com\/(photo-[\w-]+)/g;
const found = new Map();
function walk(p) {
  if (/node_modules|\.next|\.git/.test(p)) return;
  const st = statSync(p);
  if (st.isDirectory()) return readdirSync(p).forEach((f) => walk(path.join(p, f)));
  if (!/\.(tsx?|mjs|js|json|md|css)$/.test(p)) return;
  for (const m of readFileSync(p, "utf8").matchAll(re)) {
    if (!found.has(m[1])) found.set(m[1], new Set());
    found.get(m[1]).add(p);
  }
}
dirs.forEach(walk);
let bad = 0;
await Promise.all(
  [...found.keys()].map(async (id) => {
    const res = await fetch(`https://images.unsplash.com/${id}?w=64`, { method: "HEAD" }).catch(() => null);
    if (!res || res.status !== 200) {
      bad++;
      console.log(`✗ ${id} (${res?.status ?? "network"}) in ${[...found.get(id)].join(", ")}`);
    }
  }),
);
console.log(`${found.size} unique images checked, ${bad} broken.`);
process.exit(bad ? 1 : 0);
