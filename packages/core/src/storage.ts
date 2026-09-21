/**
 * File storage abstraction. `local` writes to <app>/public/uploads (dev);
 * `s3` targets any S3-compatible bucket (AWS S3, Cloudflare R2, DigitalOcean Spaces) —
 * wire it with @aws-sdk/client-s3 in production (see docs/deployment.md).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { randomToken, slugify } from "./text";

export type StoredFile = { url: string; size: number; mime: string };

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = /^(image\/(png|jpe?g|webp|gif|svg\+xml|avif)|video\/(mp4|webm)|application\/pdf)$/;

export async function storeUpload(file: File, opts: { storeId: string; publicDir?: string; baseUrl?: string }): Promise<StoredFile> {
  if (file.size > MAX_BYTES) throw new Error("File too large (max 10MB)");
  if (!ALLOWED.test(file.type)) throw new Error(`Unsupported file type: ${file.type}`);
  const ext = path.extname(file.name) || "." + (file.type.split("/")[1] ?? "bin").replace("+xml", "");
  const name = `${slugify(path.basename(file.name, ext)).slice(0, 40)}-${randomToken(4)}${ext.toLowerCase()}`;
  const driver = process.env.STORAGE_DRIVER ?? "local";

  if (driver === "local") {
    const dir = path.join(opts.publicDir ?? path.join(process.cwd(), "public"), "uploads", opts.storeId);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
    return { url: `${opts.baseUrl ?? ""}/uploads/${opts.storeId}/${name}`, size: file.size, mime: file.type };
  }
  throw new Error(`Storage driver "${driver}" not configured. Install @aws-sdk/client-s3 and implement the s3 branch.`);
}
