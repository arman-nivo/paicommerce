/**
 * Savor's product card: a restaurant-menu row. Small rounded thumbnail, dish name with a dotted
 * leader to the price, a short description, portion hint ("From ৳260 · Half / Full"), dietary
 * tags read from product tags, and a round "+ Add" button (opens options for multi-variant dishes).
 * Used everywhere via `listingOverrides(SavorCard)` and in the theme's own sections.
 */
import type { SfProduct, StorefrontContext } from "@pai/theme-sdk";
import { Link, bool, cn, formatMoney, moneyOf, str, stripHtml, truncate } from "@pai/theme-kit";
import { QuickAddButton } from "@pai/theme-kit/client";
import type { CardProps } from "./listings";

/** Tag → label + tone. Tags are matched case-insensitively. */
const TAGS: { match: RegExp; label: string; tone: "veg" | "spicy" | "star" | "new" | "plain" }[] = [
  { match: /^(bestseller|best-seller|popular|signature|chef'?s?-?pick)$/, label: "Bestseller", tone: "star" },
  { match: /^(veg|vegetarian|vegan|plant-based)$/, label: "Veg", tone: "veg" },
  { match: /^(spicy|hot|extra-spicy)$/, label: "Spicy", tone: "spicy" },
  { match: /^(sharing|family|for-sharing)$/, label: "For sharing", tone: "plain" },
  { match: /^(sugar-free|gluten-free|halal)$/, label: "", tone: "plain" },
  { match: /^(new|new-in)$/, label: "New", tone: "new" },
];

export function dishTags(p: SfProduct): { label: string; tone: string }[] {
  const out: { label: string; tone: string }[] = [];
  for (const raw of p.tags ?? []) {
    const t = raw.toLowerCase().trim();
    const hit = TAGS.find((x) => x.match.test(t));
    if (!hit) continue;
    const label = hit.label || raw.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    if (!out.some((o) => o.label === label)) out.push({ label, tone: hit.tone });
  }
  return out.slice(0, 3);
}

/** "Half / Full / Family" from the first product option (portion, size, weight…). */
export function portionHint(p: SfProduct): string {
  const opt = p.options?.find((o) => o.values.length > 1);
  if (!opt) return "";
  const vals = opt.values.map((v) => v.replace(/\s*\(.*\)\s*/g, "").trim()).filter(Boolean);
  return vals.slice(0, 3).join(" / ") + (vals.length > 3 ? " …" : "");
}

/** The first paragraph of a product description as plain text (lists of bullet points are skipped). */
export function firstParagraph(html: string | null | undefined): string {
  const h = html ?? "";
  const m = h.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  return stripHtml(m ? m[1] : h.split(/<(?:ul|ol)\b/i)[0]).replace(/\s+/g, " ").trim();
}

/** Drop heavy fields before handing a product to a client island. */
export function slim(p: SfProduct): SfProduct {
  return { ...p, description: "", images: p.images.slice(0, 1) };
}

const THUMB: Record<string, string> = {
  small: "size-16 md:size-[4.5rem]",
  medium: "size-20 md:size-24",
  large: "size-24 md:size-32",
};

function TagChip({ label, tone }: { label: string; tone: string }) {
  const icon = tone === "veg" ? "●" : tone === "spicy" ? "🌶" : tone === "star" ? "★" : null;
  return (
    <span className={cn("savor-tag inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4", `savor-tag-${tone}`)}>
      {icon ? (
        <span aria-hidden className={tone === "veg" ? "text-[8px]" : ""}>
          {icon}
        </span>
      ) : null}
      {label}
    </span>
  );
}

export function SavorCard({ product: p, context, priority, variant = "row" }: CardProps & { variant?: "row" | "compact" }) {
  const t = context.theme;
  const money = moneyOf(context);
  const fmt = (n: number) => formatMoney(n, money.currency, money.display);
  const img = p.featuredImage ?? p.images[0] ?? null;
  const thumb = str(t.card_thumb, "medium");
  const showDesc = bool(t.card_show_description, true) && variant === "row";
  const showTags = bool(t.card_show_tags, true);
  const leader = bool(t.card_leader, true);
  const quickAdd = bool(t.card_quick_add, true);
  const from = p.priceMax > p.priceMin;
  const onSale = !!(p.compareAtPrice && p.compareAtPrice > p.price);
  const desc = showDesc ? truncate(firstParagraph(p.description), 110) : "";
  const portions = portionHint(p);
  const tags = showTags ? dishTags(p) : [];
  const rating = bool(t.card_show_rating, true) && p.rating.count > 0 ? p.rating : null;

  return (
    <article className={cn("savor-card group relative flex gap-4 py-4 md:gap-5", !p.available && "opacity-70")}>
      {thumb !== "none" ? (
        <Link
          href={p.url}
          tabIndex={-1}
          aria-hidden
          className={cn("savor-thumb relative shrink-0 overflow-hidden rounded-pai bg-pai-muted", THUMB[thumb] ?? THUMB.medium)}
        >
          {img ? (
            <img src={img.url} alt="" loading={priority ? "eager" : "lazy"} decoding="async" className="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-105" />
          ) : (
            <span className="absolute inset-0 grid place-items-center font-heading text-2xl opacity-30">{p.title.charAt(0)}</span>
          )}
          {onSale && bool(t.card_show_sale_badge, true) && p.available ? (
            <span className="absolute left-1 top-1 rounded-full bg-pai-sale px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">Deal</span>
          ) : null}
        </Link>
      ) : null}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-baseline gap-2">
          <h3 className="savor-card-title min-w-0 font-heading text-[1.05rem] font-semibold leading-snug md:text-lg">
            <Link href={p.url} className="rounded-sm after:absolute after:inset-0 after:content-[''] hover:text-pai-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary focus-visible:ring-offset-2">
              {p.title}
            </Link>
          </h3>
          {leader ? <span aria-hidden className="savor-leader mb-1 hidden min-w-6 flex-1 self-end sm:block" /> : <span className="flex-1" />}
          <p className="ml-auto shrink-0 text-right text-[0.95rem] font-semibold tabular-nums">
            <span className="sr-only">Price: </span>
            {from ? <span className="mr-1 text-xs font-normal opacity-60">from</span> : null}
            <span className={cn(onSale && "text-pai-sale")}>{fmt(p.priceMin || p.price)}</span>
            {onSale ? <s className="ml-1.5 text-xs font-normal opacity-50">{fmt(p.compareAtPrice!)}</s> : null}
          </p>
        </div>

        {desc ? <p className="pai-line-clamp-2 mt-1 text-sm leading-relaxed opacity-70">{desc}</p> : null}

        <div className="mt-auto flex items-end justify-between gap-3 pt-2.5">
          <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5 text-xs">
            {!p.available ? <span className="rounded-full bg-pai-fg/10 px-2 py-0.5 text-[11px] font-semibold">Sold out today</span> : null}
            {portions ? <span className="savor-portions font-medium opacity-75">{portions}</span> : null}
            {tags.map((tag) => (
              <TagChip key={tag.label} {...tag} />
            ))}
            {rating ? (
              <span className="inline-flex items-center gap-1 opacity-75">
                <span aria-hidden className="text-pai-accent">★</span>
                {rating.average.toFixed(1)}
                <span className="sr-only">out of 5 from</span> <span className="opacity-70">({rating.count})</span>
              </span>
            ) : null}
          </div>
          {quickAdd && p.available ? (
            <div className="savor-add relative z-10 shrink-0">
              <QuickAddButton product={slim(p)} mode="icon" className="size-9 shadow-sm md:size-10" />
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/** Menu grid: rows separated by dashed rules, 1 column on phones and up to 2 on desktop. */
export function menuGridClass(columns: number): string {
  return cn("savor-menu-grid grid grid-cols-1 gap-x-12", columns >= 2 && "md:grid-cols-2");
}

export function MenuGrid({ products, context, columns = 2, priority = 0 }: { products: SfProduct[]; context: StorefrontContext; columns?: number; priority?: number }) {
  return (
    <div className={menuGridClass(columns)}>
      {products.map((p, i) => (
        <SavorCard key={p.id} product={p} context={context} priority={i < priority} />
      ))}
    </div>
  );
}
