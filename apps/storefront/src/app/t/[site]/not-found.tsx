import { headers } from "next/headers";
import { renderThemePage } from "@/lib/render";
import { resolveSite } from "@/lib/site";

/** Store-level 404: rendered with the store's theme (header, footer and its `404` template). */
export default async function StoreNotFound() {
  const h = await headers();
  const key = h.get("x-pai-site");
  const site = key ? await resolveSite(key) : null;
  if (!site) {
    return (
      <div className="grid min-h-[60vh] place-items-center px-6 text-center">
        <div>
          <p className="text-5xl font-bold opacity-30">404</p>
          <h1 className="mt-3 text-2xl font-semibold">Page not found</h1>
        </div>
      </div>
    );
  }
  return renderThemePage(site, "404", { path: h.get("x-pai-path") ?? "/404" });
}
