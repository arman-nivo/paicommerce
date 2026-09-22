/** Genre chips shown above the product grid on collection pages (via `listingOverrides`). */
import type { StorefrontContext } from "@pai/theme-sdk";
import { SmartLink, cn } from "@pai/theme-kit";

export async function collectionIntro(context: StorefrontContext) {
  const cols = await context.data.getCollections({ limit: 12 }).catch(() => []);
  if (cols.length < 2) return null;
  const current = context.collection?.slug ?? "all";
  const chips = [{ id: "all", title: "All books", url: context.url("/collections/all"), slug: "all" }, ...cols.map((c) => ({ id: c.id, title: c.title, url: c.url, slug: c.slug }))];
  return (
    <nav aria-label="Genres" className="-mt-2 mb-8">
      <ul className="pai-no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
        {chips.map((c) => (
          <li key={c.id} className="shrink-0">
            <SmartLink
              href={c.url}
              ariaLabel={c.slug === current ? `${c.title} (current)` : undefined}
              className={cn(
                "inline-flex rounded-full border px-4 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary focus-visible:ring-offset-2",
                c.slug === current ? "border-pai-fg bg-pai-fg text-pai-bg" : "border-pai-border hover:border-pai-fg",
              )}
            >
              {c.title}
            </SmartLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
