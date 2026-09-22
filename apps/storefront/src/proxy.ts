/**
 * Multi-tenant routing (Next 16 proxy).
 *
 *   {slug}.{STOREFRONT_ROOT_DOMAIN}/…   → /t/h.{slug}/…
 *   {custom-domain}/…                   → /t/d.{domain}/…
 *   {root}/s/{slug}/…                   → /t/s.{slug}/…
 *   {root}/preview/{token}/…            → /t/p.{token}/…   (+ frame-ancestors for the dashboard)
 *   {root}/ , /api/v1/*, /api/revalidate, /api/domains/verify → root app (store directory / public API / TLS ask)
 *
 * Tenant validation happens in the app (the proxy only parses the URL — no DB access here).
 */
import { NextResponse, type NextRequest } from "next/server";

const ROOT = (process.env.STOREFRONT_ROOT_DOMAIN || "localhost:3003").toLowerCase();
const ROOT_HOST = ROOT.split(":")[0]!;
const DASHBOARD = process.env.NEXT_PUBLIC_DASHBOARD_URL || "http://localhost:3001";
/** Extra hostnames that serve the root app (e.g. "store.paicommerce.com"). */
const PLATFORM_HOSTS = (process.env.STOREFRONT_PLATFORM_HOSTS || "").split(",").map((h) => h.trim().toLowerCase()).filter(Boolean);

function isRootHost(hostNoPort: string, host: string) {
  return host === ROOT || hostNoPort === ROOT_HOST || hostNoPort === "localhost" || hostNoPort === "127.0.0.1" || hostNoPort === "0.0.0.0" || PLATFORM_HOSTS.includes(hostNoPort) || PLATFORM_HOSTS.includes(host);
}

/** Paths always served by the root app, whatever the host. */
const GLOBAL_PATHS = /^\/(api\/v1(\/|$)|api\/revalidate$|api\/domains\/verify$|_next\/|favicon\.ico$)/;

export function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;
  const host = (req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "").toLowerCase().split(",")[0]!.trim();
  const hostNoPort = host.split(":")[0]!;

  // Internal tenant tree is never addressable directly.
  if (path === "/t" || path.startsWith("/t/")) return new NextResponse("Not found", { status: 404 });
  if (GLOBAL_PATHS.test(path)) return NextResponse.next();

  let key: string | null = null;
  let base = "";
  let rest = path;
  let preview = false;

  const seg = path.split("/");
  if (seg[1] === "preview" && seg[2]) {
    key = `p.${seg[2]}`;
    base = `/preview/${seg[2]}`;
    rest = "/" + seg.slice(3).join("/");
    preview = true;
  } else if (seg[1] === "s" && seg[2] && /^[a-z0-9][a-z0-9-]*$/i.test(seg[2])) {
    key = `s.${seg[2].toLowerCase()}`;
    base = `/s/${seg[2]}`;
    rest = "/" + seg.slice(3).join("/");
  } else if (isRootHost(hostNoPort, host)) {
    return NextResponse.next();
  } else if (hostNoPort.endsWith(`.${ROOT_HOST}`) && (host.endsWith(`.${ROOT}`) || !ROOT.includes(":"))) {
    const sub = hostNoPort.slice(0, -(ROOT_HOST.length + 1));
    if (!sub || sub === "www" || sub.includes(".")) return NextResponse.next();
    key = `h.${sub}`;
  } else if (hostNoPort) {
    key = `d.${hostNoPort}`;
  }
  if (!key) return NextResponse.next();

  // Trailing slash normalisation for the base itself ("/s/demo/" → "/s/demo").
  if (rest.length > 1 && rest.endsWith("/")) rest = rest.replace(/\/+$/, "");

  const target = url.clone();
  target.pathname = `/t/${encodeURIComponent(key)}${rest === "/" ? "" : rest}`;

  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-pai-site", key);
  requestHeaders.set("x-pai-base", base);
  requestHeaders.set("x-pai-path", rest || "/");

  const res = NextResponse.rewrite(target, { request: { headers: requestHeaders } });
  if (preview) {
    res.headers.set("Content-Security-Policy", `frame-ancestors 'self' ${DASHBOARD}`);
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    res.headers.set("Cache-Control", "no-store");
  } else {
    res.headers.set("Content-Security-Policy", "frame-ancestors 'self'");
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
