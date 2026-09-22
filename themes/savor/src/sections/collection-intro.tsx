/**
 * Menu-category chips shown above the product grid on collection pages — lets guests hop between
 * "Biryani", "Grills", "Desserts"… like the tabs of a printed menu.
 */
import type { StorefrontContext } from "@pai/theme-sdk";
import { Link, cn } from "@pai/theme-kit";

export async function collectionChips(context: StorefrontContext) {
  const cols = await context.data.getCollections({ limit: 12 }).catch(() => []);
  if (cols.length < 2) return null;
  const current = context.collection?.slug ?? "all";
  const items = [{ slug: "all", title: "Full menu", url: context.url("/collections/all") }, ...cols.map((c) => ({ slug: c.slug, title: c.title, url: c.url }))];
  return (
    <nav aria-label="Menu categories" className="pai-no-scrollbar -mx-4 mb-8 flex gap-2 overflow-x-auto px-4 md:mx-0 md:flex-wrap md:px-0">
      {items.map((c) => {
        const on = c.slug === current;
        return (
          <Link
            key={c.slug}
            href={c.url}
            aria-current={on ? "page" : undefined}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary focus-visible:ring-offset-2",
              on ? "border-pai-primary bg-pai-primary text-pai-primary-fg" : "border-pai-border hover:border-pai-fg/40",
            )}
          >
            {c.title}
          </Link>
        );
      })}
    </nav>
  );
}
