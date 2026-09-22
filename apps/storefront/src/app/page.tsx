import { redirect } from "next/navigation";
import { asc, db, inArray, stores } from "@pai/db";
import { storeUrl, WEB_URL } from "@pai/core";

export const dynamic = "force-dynamic";

/**
 * Bare storefront host. In development (or with STOREFRONT_DIRECTORY=1) it lists active stores
 * with links for every tenancy mode; in production it redirects to the marketing site.
 */
export default async function Directory() {
  if (process.env.NODE_ENV === "production" && process.env.STOREFRONT_DIRECTORY !== "1") redirect(WEB_URL);
  const rows = await db
    .select({ name: stores.name, slug: stores.slug, category: stores.category, status: stores.status, customDomain: stores.customDomain, domainVerified: stores.domainVerified, logoUrl: stores.logoUrl })
    .from(stores)
    .where(inArray(stores.status, ["trial", "active", "past_due"]))
    .orderBy(asc(stores.name))
    .limit(500);
  return (
    <main className="min-h-screen bg-stone-50 font-sans text-stone-900">
      <div className="mx-auto max-w-5xl px-6 py-16">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-500">PaiCommerce · Storefront</p>
        <h1 className="mt-2 text-3xl font-bold">Store directory</h1>
        <p className="mt-2 text-stone-600">Development helper — every active store, reachable by subdomain or path.</p>
        {rows.length ? (
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((s) => (
              <li key={s.slug} className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  {s.logoUrl ? <img src={s.logoUrl} alt="" className="size-10 rounded-lg object-contain" /> : <span className="grid size-10 place-items-center rounded-lg bg-stone-900 text-sm font-bold text-white">{s.name.charAt(0)}</span>}
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{s.name}</p>
                    <p className="text-xs capitalize text-stone-500">
                      {s.category} · {s.status}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-sm">
                  <a href={storeUrl(s)} className="rounded-lg bg-stone-900 px-3 py-1.5 font-medium text-white">
                    Open store
                  </a>
                  <a href={`/s/${s.slug}`} className="rounded-lg border border-stone-300 px-3 py-1.5 font-medium">
                    /s/{s.slug}
                  </a>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-10 rounded-xl border border-dashed border-stone-300 p-8 text-center text-stone-500">No stores yet. Run `pnpm db:seed` or create one in the dashboard.</p>
        )}
      </div>
    </main>
  );
}
