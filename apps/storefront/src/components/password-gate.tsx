import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { passwordCookie, passwordDigest, storePassword } from "@/lib/password";
import { resolveSite } from "@/lib/site";

async function unlock(formData: FormData) {
  "use server";
  const key = String(formData.get("site") ?? "");
  const back = String(formData.get("back") ?? "/");
  const site = await resolveSite(key);
  const p = site && storePassword(site.store);
  if (!site || !p) redirect(back);
  const jar = await cookies();
  if (String(formData.get("password") ?? "") !== p.password) {
    jar.set("pai_pw_err", "1", { path: "/", maxAge: 10, httpOnly: true, sameSite: "lax" });
    redirect(back);
  }
  jar.set(passwordCookie(site.store.id), passwordDigest(site.store.id, p.password!), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  redirect(back);
}

/** Full-page gate shown instead of the storefront while password protection is on. */
export function PasswordGate({ siteKey, base, name, logoUrl, message, wrong }: { siteKey: string; base: string; name: string; logoUrl?: string | null; message?: string; wrong?: boolean }) {
  return (
    <div className="grid min-h-screen place-items-center bg-stone-50 px-6 text-center text-stone-900">
      <div className="w-full max-w-sm">
        {logoUrl ? <img src={logoUrl} alt={name} className="mx-auto mb-6 h-12 w-auto object-contain" /> : <p className="mb-6 text-2xl font-bold">{name}</p>}
        <h1 className="text-2xl font-semibold">Opening soon</h1>
        <p className="mt-3 text-stone-600">{message || "We're putting the finishing touches on our store. Enter the password to take a look."}</p>
        <form action={unlock} className="mt-8 space-y-3 text-left">
          <input type="hidden" name="site" value={siteKey} />
          <input type="hidden" name="back" value={base || "/"} />
          <label htmlFor="pw" className="text-sm font-medium">
            Password
          </label>
          <input id="pw" name="password" type="password" required autoFocus className="h-11 w-full rounded-lg border border-stone-300 bg-white px-3 outline-none focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10" />
          {wrong && <p className="text-sm text-red-600">That password is incorrect.</p>}
          <button className="h-11 w-full rounded-lg bg-stone-900 font-medium text-white hover:bg-stone-800">Enter store</button>
        </form>
        <p className="mt-10 text-xs text-stone-400">
          Store owner?{" "}
          <a href={`${process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "http://localhost:3001"}/preferences`} className="font-semibold underline">
            Log in to the dashboard
          </a>
        </p>
      </div>
    </div>
  );
}
