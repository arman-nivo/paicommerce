import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { trackDaily } from "@pai/core/orders";
import { cookiePath } from "@/lib/cart";
import { siteFromParams, type SiteParams } from "@/lib/http";

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|lighthouse|headless/i;

/** POST {base}/api/track { type: "page" | "product" } — daily page/product views + unique visitors. */
export async function POST(req: Request, { params }: SiteParams) {
  const site = await siteFromParams(params);
  if (site instanceof NextResponse) return new NextResponse(null, { status: 204 });
  if (site.preview || BOT.test(req.headers.get("user-agent") ?? "")) return new NextResponse(null, { status: 204 });
  let type = "page";
  try {
    const b = (await req.json()) as { type?: unknown };
    if (b?.type === "product") type = "product";
  } catch {
    /* sendBeacon bodies may be empty */
  }
  const jar = await cookies();
  const day = new Date().toISOString().slice(0, 10);
  const newVisitor = jar.get("pai_vd")?.value !== day;
  if (newVisitor) jar.set("pai_vd", day, { httpOnly: true, sameSite: "lax", path: cookiePath(site), maxAge: 86400 * 2, secure: process.env.NODE_ENV === "production" });
  await trackDaily(site.store.id, { pageViews: 1, ...(type === "product" ? { productViews: 1 } : {}), ...(newVisitor ? { visitors: 1 } : {}) }).catch(() => {});
  return new NextResponse(null, { status: 204 });
}
