/**
 * The bestseller list: a numbered chart (1–10) with covers, authors, formats, prices and optional
 * rank movement. Products come from a collection (e.g. "bestsellers"), topped up with the store's
 * best sellers so the chart is always full.
 */
import { defineSection, type BlockInstance, type SfProduct, type StorefrontContext } from "@pai/theme-sdk";
import { ArrowDown, ArrowUp, Minus } from "lucide-react";
import { ButtonLink, Link, PreviewNotice, Price, Rating, SAMPLE_PRODUCTS, Section, bool, cn, moneyOf, num, paddingField, readButton, buttonFields, schemeField, str } from "@pai/theme-kit";
import { QuickAddButton } from "@pai/theme-kit/client";
import { bookMeta } from "../lib/book";
import { slimProduct } from "../lib/slim";
import { AuthorLink, BookCover, DigitalBadge, spineFor } from "./card";

async function loadChart(context: StorefrontContext, collection: string, limit: number): Promise<{ products: SfProduct[]; sample: boolean }> {
  let products: SfProduct[] = [];
  try {
    if (collection) products = (await context.data.getProducts({ collection, sort: "best-selling", limit })).items;
    if (products.length < limit) {
      const more = (await context.data.getProducts({ sort: "best-selling", limit: limit + products.length })).items;
      const seen = new Set(products.map((p) => p.id));
      products = [...products, ...more.filter((p) => !seen.has(p.id))].slice(0, limit);
    }
  } catch {
    products = [];
  }
  if (!products.length && context.isPreview) return { products: SAMPLE_PRODUCTS.slice(0, limit), sample: true };
  return { products, sample: false };
}

type Move = { dir: "up" | "down" | "new" | "same"; by: number };

function movements(blocks: BlockInstance[]): Map<number, Move> {
  const m = new Map<number, Move>();
  for (const b of blocks) {
    if (b.type !== "movement") continue;
    const rank = num(b.settings.rank, 0);
    if (rank < 1) continue;
    m.set(rank, { dir: (str(b.settings.change, "up") as Move["dir"]) ?? "same", by: num(b.settings.by, 1) });
  }
  return m;
}

function MoveTag({ move }: { move?: Move }) {
  if (!move) return null;
  if (move.dir === "new")
    return <span className="rounded-[2px] bg-pai-accent px-1.5 py-0.5 text-[9.5px] font-bold uppercase tracking-[0.14em] text-white">New</span>;
  if (move.dir === "same")
    return (
      <span className="inline-flex items-center text-[11px] opacity-50" aria-label="No change">
        <Minus className="size-3" aria-hidden />
      </span>
    );
  const up = move.dir === "up";
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-[11px] font-semibold", up ? "text-emerald-700" : "text-pai-sale")} aria-label={`${up ? "Up" : "Down"} ${move.by} ${move.by === 1 ? "place" : "places"}`}>
      {up ? <ArrowUp className="size-3" aria-hidden /> : <ArrowDown className="size-3" aria-hidden />}
      {move.by}
    </span>
  );
}

function Row({ p, rank, context, move, s }: { p: SfProduct; rank: number; context: StorefrontContext; move?: Move; s: Record<string, unknown> }) {
  const meta = bookMeta(p, context);
  return (
    <li className="folio-chart-row group relative grid grid-cols-[2.2rem_3.8rem_minmax(0,1fr)] items-start gap-3 border-b border-pai-border py-4 sm:grid-cols-[2.6rem_4.2rem_minmax(0,1fr)] sm:gap-4">
      <div className="flex flex-col items-center gap-1 pt-1">
        <span className="folio-rank font-heading text-[1.9rem] leading-none sm:text-[2.2rem]" aria-label={`Number ${rank}`}>
          {rank}
        </span>
        {bool(s.show_movement, true) ? <MoveTag move={move} /> : null}
      </div>
      <BookCover product={p} spine={spineFor(meta, context)} className="folio-cover--thumb w-full" sizes="72px" />
      <div className="flex min-w-0 flex-col self-stretch">
        <h3 className="font-heading text-[1rem] leading-snug sm:text-[1.06rem]">
          <Link href={p.url} className="pai-line-clamp-2 after:absolute after:inset-0 hover:underline hover:underline-offset-4 focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-pai-primary">
            {meta.title}
          </Link>
        </h3>
        {meta.author ? <p className="mt-0.5 truncate text-sm italic opacity-75">{meta.author}</p> : null}
        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[10.5px]">
          {meta.digital ? <DigitalBadge context={context} className="!px-1.5 !py-0.5 !text-[9px]" /> : null}
          {bool(s.show_format, true) && meta.format && !meta.digital ? <span className="uppercase tracking-[0.12em] opacity-60">{meta.format}</span> : null}
          {bool(s.show_rating, true) && p.rating.count > 0 ? <Rating value={p.rating.average} size={11} /> : null}
        </div>
        <div className="relative z-10 mt-auto flex items-center justify-between gap-3 pt-2">
          {bool(s.show_price, true) ? <Price price={p.price} compareAt={p.compareAtPrice} priceMax={p.priceMax} {...moneyOf(context)} size="sm" /> : <span />}
          {bool(s.show_add, true) && p.available ? <QuickAddButton product={slimProduct(p)} mode="icon" className="!size-8" /> : null}
        </div>
      </div>
    </li>
  );
}

function Featured({ p, context, move, s }: { p: SfProduct; context: StorefrontContext; move?: Move; s: Record<string, unknown> }) {
  const meta = bookMeta(p, context);
  return (
    <div className="folio-chart-top relative grid grid-cols-[38%_minmax(0,1fr)] items-center gap-5 overflow-hidden rounded-pai bg-pai-muted p-5 md:sticky md:top-32 md:flex md:flex-col md:items-center md:px-6 md:pb-8 md:pt-10 md:text-center">
      <span aria-hidden className="folio-rank-xl pointer-events-none absolute right-3 top-0 font-heading leading-none opacity-[0.12] md:left-5 md:right-auto md:top-2">
        1
      </span>
      <div className="w-full md:w-[58%] md:max-w-[240px]">
        <BookCover product={p} spine={spineFor(meta, context)} sizes="(min-width: 768px) 240px, 38vw" />
      </div>
      <div className="relative flex flex-col items-start md:items-center">
        <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-pai-primary md:mt-7">
          Number one {bool(s.show_movement, true) ? <MoveTag move={move} /> : null}
        </p>
        <h3 className="mt-2 font-heading text-xl leading-tight md:text-2xl">
          <Link href={p.url} className="hover:underline hover:underline-offset-4">
            {meta.title}
          </Link>
        </h3>
        {meta.author ? <AuthorLink author={meta.author} context={context} prefix="by " className="mt-1 opacity-75" /> : null}
        {bool(s.show_rating, true) && p.rating.count > 0 ? <Rating value={p.rating.average} count={p.rating.count} size={13} className="mt-3" /> : null}
        <div className="mt-4 flex items-center gap-4">
          {bool(s.show_price, true) ? <Price price={p.price} compareAt={p.compareAtPrice} priceMax={p.priceMax} {...moneyOf(context)} /> : null}
          {p.available ? <QuickAddButton product={slimProduct(p)} mode="icon" className="size-10" /> : null}
        </div>
      </div>
    </div>
  );
}

export const bestsellerList = defineSection({
  schema: {
    type: "bestseller-list",
    name: "Bestseller list",
    category: "products",
    icon: "list-ordered",
    description: "A numbered 1–10 chart with covers, authors, prices and optional rank movement.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Updated every Friday" },
      { type: "text", id: "heading", label: "Heading", default: "The bestseller list" },
      { type: "textarea", id: "subheading", label: "Subheading", default: "What readers across Bangladesh are buying this week." },
      { type: "collection", id: "collection", label: "Collection", info: "Topped up with your best sellers if it has fewer books than the list length." },
      { type: "range", id: "limit", label: "Books in the list", min: 3, max: 10, step: 1, default: 10 },
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "featured",
        options: [
          { value: "featured", label: "Number one featured + list" },
          { value: "columns", label: "Two-column chart" },
        ],
      },
      { type: "checkbox", id: "show_movement", label: "Show rank movement", default: true, info: "Add “Rank movement” blocks to mark climbers, fallers and new entries." },
      { type: "checkbox", id: "show_format", label: "Show format", default: true },
      { type: "checkbox", id: "show_rating", label: "Show rating", default: true },
      { type: "checkbox", id: "show_price", label: "Show price", default: true },
      { type: "checkbox", id: "show_add", label: "Show add-to-bag button", default: true },
      ...buttonFields("button", { label: "See the full list", link: "", style: "secondary" }),
      schemeField("default"),
      paddingField("medium"),
    ],
    blocks: [
      {
        type: "movement",
        name: "Rank movement",
        limit: 10,
        settings: [
          { type: "range", id: "rank", label: "Position", min: 1, max: 10, step: 1, default: 1 },
          {
            type: "select",
            id: "change",
            label: "Change since last week",
            default: "up",
            options: [
              { value: "up", label: "Climbed" },
              { value: "down", label: "Dropped" },
              { value: "new", label: "New entry" },
              { value: "same", label: "No change" },
            ],
          },
          { type: "range", id: "by", label: "Places", min: 1, max: 9, step: 1, default: 1 },
        ],
      },
    ],
    maxBlocks: 10,
    presets: [
      {
        name: "Bestseller list",
        settings: { collection: "" },
        blocks: [
          { type: "movement", settings: { rank: 1, change: "same" } },
          { type: "movement", settings: { rank: 2, change: "up", by: 2 } },
          { type: "movement", settings: { rank: 3, change: "new" } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const limit = Math.max(3, Math.min(10, num(s.limit, 10)));
    const collection = str(s.collection);
    const { products, sample } = await loadChart(context, collection, limit);
    if (!products.length) return null;
    const moves = movements(blocks);
    const btn = readButton(context, s, "button");
    const href = btn ? (str(s.button_link) ? btn.href : context.url(collection ? `/collections/${collection}` : "/collections/all")) : null;
    const layout = str(s.layout, "featured");
    const heading = str(s.heading);
    const [first, ...rest] = products;
    const half = Math.ceil(products.length / 2);

    return (
      <Section settings={s} ariaLabel={heading || "Bestseller list"} className="folio-chart">
        {sample ? <PreviewNotice context={context}>No products yet — showing sample books.</PreviewNotice> : null}
        <div className="mb-10 grid gap-4 border-b-2 border-pai-fg pb-6 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            {str(s.eyebrow) ? <p className="pai-eyebrow mb-3">{str(s.eyebrow)}</p> : null}
            {heading ? <h2 className="pai-h2">{heading}</h2> : null}
            {str(s.subheading) ? <p className="mt-3 max-w-xl opacity-75">{str(s.subheading)}</p> : null}
          </div>
          {btn && href ? (
            <ButtonLink href={href} variant={btn.variant} className="w-fit">
              {btn.label}
            </ButtonLink>
          ) : null}
        </div>
        {layout === "featured" && first ? (
          <div className="grid gap-10 md:grid-cols-[minmax(260px,0.8fr)_1.6fr] lg:gap-14">
            <div>
              <Featured p={first} context={context} move={moves.get(1)} s={s} />
            </div>
            <ol className="lg:columns-2 lg:gap-x-10 [&>li]:break-inside-avoid" start={2}>
              {rest.map((p, i) => (
                <Row key={p.id} p={p} rank={i + 2} context={context} move={moves.get(i + 2)} s={s} />
              ))}
            </ol>
          </div>
        ) : (
          <div className="grid gap-x-12 md:grid-cols-2">
            <ol>
              {products.slice(0, half).map((p, i) => (
                <Row key={p.id} p={p} rank={i + 1} context={context} move={moves.get(i + 1)} s={s} />
              ))}
            </ol>
            <ol start={half + 1}>
              {products.slice(half).map((p, i) => (
                <Row key={p.id} p={p} rank={half + i + 1} context={context} move={moves.get(half + i + 1)} s={s} />
              ))}
            </ol>
          </div>
        )}
      </Section>
    );
  },
});
