import path from "node:path";
import { NextResponse } from "next/server";
import { DASHBOARD_URL } from "@pai/core";
import { storeUpload } from "@pai/core/storage";
import { db, media } from "@pai/db";
import { getActionCtx } from "@/lib/ctx";

/**
 * POST multipart/form-data { file } → stores the file and adds it to the media library.
 * POST application/json { url, alt? } → adds a remote image URL to the media library.
 */
export async function POST(req: Request) {
  let ctx;
  try {
    ctx = await getActionCtx();
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 401 });
  }
  try {
    const type = req.headers.get("content-type") ?? "";
    if (type.includes("application/json")) {
      const body = (await req.json()) as { url?: string; alt?: string };
      const url = String(body.url ?? "").trim();
      if (!/^https?:\/\/\S+$/i.test(url) || url.length > 2000) return NextResponse.json({ error: "Enter a valid http(s) image URL" }, { status: 400 });
      const [row] = await db.insert(media).values({ storeId: ctx.store.id, url, alt: body.alt?.slice(0, 200) ?? null, mime: "image/remote" }).returning();
      return NextResponse.json({ id: row!.id, url: row!.url });
    }
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    const stored = await storeUpload(file, { storeId: ctx.store.id, publicDir: path.join(process.cwd(), "public"), baseUrl: DASHBOARD_URL });
    const [row] = await db.insert(media).values({ storeId: ctx.store.id, url: stored.url, mime: stored.mime, size: stored.size, alt: file.name.replace(/\.[^.]+$/, "").slice(0, 200) }).returning();
    return NextResponse.json({ id: row!.id, url: row!.url, mime: stored.mime, size: stored.size });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || "Upload failed" }, { status: 400 });
  }
}
