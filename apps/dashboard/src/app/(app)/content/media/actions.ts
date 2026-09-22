"use server";
import { unlink } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DASHBOARD_URL } from "@pai/core";
import { and, db, eq, inArray, media } from "@pai/db";
import { action } from "@/lib/action";
import { audit } from "@/lib/audit";
import { ActionError } from "@/lib/errors";
import { uuid, uuids } from "@/lib/zod";

/**
 * Resolve the on-disk path of a locally stored upload that belongs to this store,
 * or null if the URL is remote / belongs elsewhere / looks like a traversal attempt.
 */
function localUploadPath(url: string, storeId: string): string | null {
  let pathname: string;
  try {
    const dash = new URL(DASHBOARD_URL);
    const u = new URL(url, DASHBOARD_URL);
    if (!url.startsWith("/") && u.origin !== dash.origin) return null;
    pathname = u.pathname;
  } catch {
    return null;
  }
  const prefix = `/uploads/${storeId}/`;
  if (!pathname.startsWith(prefix)) return null;
  let name: string;
  try {
    name = decodeURIComponent(pathname.slice(prefix.length));
  } catch {
    return null;
  }
  if (!name || name.includes("/") || name.includes("\\") || name.includes("\0") || name === "." || name === ".." || name.startsWith(".")) return null;
  const dir = path.resolve(process.cwd(), "public", "uploads", storeId);
  const file = path.resolve(dir, name);
  if (path.dirname(file) !== dir) return null;
  return file;
}

export const deleteMedia = action(z.object({ ids: uuids }), { permission: "content.manage" }, async ({ ids }, ctx) => {
  const rows = await db.delete(media).where(and(eq(media.storeId, ctx.store.id), inArray(media.id, ids))).returning({ id: media.id, url: media.url });
  let filesRemoved = 0;
  for (const r of rows) {
    // Only unlink if no other media row of this store still points at the same file.
    const file = localUploadPath(r.url, ctx.store.id);
    if (!file) continue;
    const still = await db.query.media.findFirst({ where: and(eq(media.storeId, ctx.store.id), eq(media.url, r.url)), columns: { id: true } });
    if (still) continue;
    try {
      await unlink(file);
      filesRemoved++;
    } catch {
      /* already gone */
    }
  }
  if (rows.length) await audit(ctx, "media.deleted", undefined, { count: rows.length, filesRemoved });
  revalidatePath("/content/media");
  return { count: rows.length };
});

export const updateMediaAlt = action(z.object({ id: uuid, alt: z.string().trim().max(200) }), { permission: "content.manage" }, async ({ id, alt }, ctx) => {
  const [row] = await db.update(media).set({ alt: alt || null }).where(and(eq(media.id, id), eq(media.storeId, ctx.store.id))).returning({ id: media.id, alt: media.alt });
  if (!row) throw new ActionError("This file no longer exists.");
  revalidatePath("/content/media");
  return row;
});
