/**
 * Colourful collection chips shown above the product grid on collection pages
 * (`listingOverrides(..., { collectionIntro })`): quick hops between categories.
 */
import type { SfCollection, StorefrontContext } from "@pai/theme-sdk";
import { Link, cn } from "@pai/theme-kit";
import { FOCUS, funAt, tint } from "./_playhouse";

export async function collectionChips(context: StorefrontContext) {
  const cols = await context.data.getCollections({ limit: 12 }).catch(() => [] as SfCollection[]);
  if (cols.length < 2) return null;
  const current = context.collection?.slug ?? "all";
  const items = [{ slug: "all", title: "Everything", url: context.url("/collections/all"), image: null as string | null }, ...cols.map((c) => ({ slug: c.slug, title: c.title, url: c.url, image: c.image?.url ?? null }))];
  return (
    <nav aria-label="Categories" className="pai-no-scrollbar -mx-4 mb-8 overflow-x-auto px-4 md:mx-0 md:px-0">
      <ul className="flex w-max gap-2 md:w-auto md:flex-wrap">
        {items.map((c, i) => {
          const active = c.slug === current;
          return (
            <li key={c.slug}>
              <Link
                href={c.url}
                aria-current={active ? "page" : undefined}
                className={cn("inline-flex items-center gap-2 rounded-full py-1 pl-1 pr-4 text-sm font-bold ring-2 transition hover:-translate-y-0.5", active ? "ring-pai-fg" : "ring-transparent", !c.image && "pl-4", FOCUS)}
                style={{ background: tint(funAt(i), active ? 60 : 32) }}
              >
                {c.image ? <img src={c.image} alt="" className="size-8 rounded-full object-cover ring-2 ring-white" loading="lazy" /> : null}
                {c.title}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
