import { NextResponse, type NextRequest } from "next/server";

const PUBLIC = ["/login", "/signup", "/forgot-password", "/reset-password", "/logout", "/uploads", "/api"];

/** Cheap auth gate: bounce visitors without a session cookie to /login?next=… (full verification happens in pages). */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"))) return NextResponse.next();
  if (req.cookies.get("pai_session")?.value) return NextResponse.next();
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = pathname === "/" ? "" : `?next=${encodeURIComponent(pathname + search)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|woff2?)$).*)"],
};
