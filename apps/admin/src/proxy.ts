import { NextResponse, type NextRequest } from "next/server";

/**
 * Cheap pre-render gate: requests without a session cookie go straight to /login.
 * Role checks happen server-side in the (panel) layout and in every server action.
 */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (req.cookies.get("pai_session")?.value) {
    const res = NextResponse.next();
    res.headers.set("X-Robots-Tag", "noindex, nofollow");
    return res;
  }
  if (pathname.startsWith("/api/")) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = pathname !== "/" ? `?next=${encodeURIComponent(pathname + search)}` : "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!login|_next/static|_next/image|favicon.ico|robots.txt).*)"],
};
