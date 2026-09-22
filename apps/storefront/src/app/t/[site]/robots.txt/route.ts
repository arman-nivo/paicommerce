import { resolveSite, storeBaseUrl } from "@/lib/site";

/** Per-store robots.txt (preview links are never indexed). */
export async function GET(_req: Request, { params }: { params: Promise<{ site: string }> }) {
  const site = await resolveSite((await params).site);
  if (!site || site.preview) return new Response("User-agent: *\nDisallow: /\n", { headers: { "Content-Type": "text/plain" } });
  const base = await storeBaseUrl(site);
  const p = site.base;
  const body = [
    "User-agent: *",
    `Disallow: ${p}/cart`,
    `Disallow: ${p}/checkout`,
    `Disallow: ${p}/account`,
    `Disallow: ${p}/api/`,
    `Disallow: ${p}/search`,
    "",
    `Sitemap: ${base}/sitemap.xml`,
    "",
  ].join("\n");
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
