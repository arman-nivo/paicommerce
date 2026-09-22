import { readFile } from "node:fs/promises";
import path from "node:path";

const TYPES: Record<string, string> = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".gif": "image/gif", ".svg": "image/svg+xml", ".avif": "image/avif", ".mp4": "video/mp4", ".webm": "video/webm", ".pdf": "application/pdf" };

/** Serves files uploaded at runtime (public/ is only snapshotted at build time in production). */
export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path;
  if (parts.some((p) => p.includes("..") || p.includes("\0"))) return new Response("Not found", { status: 404 });
  const file = path.join(process.cwd(), "public", "uploads", ...parts);
  try {
    const buf = await readFile(file);
    return new Response(new Uint8Array(buf), {
      headers: { "Content-Type": TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream", "Cache-Control": "public, max-age=31536000, immutable", "Access-Control-Allow-Origin": "*" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
