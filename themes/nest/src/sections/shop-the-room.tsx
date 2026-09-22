/**
 * Shop the room: a large room photograph with numbered product hotspots (native <details>, no JS)
 * next to — or above — the list of pieces in the room, a room total and "Add the room to cart".
 * Empty spots fill from a collection, then newest products.
 */
import { defineSection, type SfProduct } from "@pai/theme-sdk";
import { Price, PreviewNotice, SAMPLE_PRODUCTS, Section, SmartLink, bool, cn, moneyOf, num, paddingField, schemeField, str } from "@pai/theme-kit";
import { AddAllButton } from "../client/add-all";
import { Eyebrow, RATIO, ratioOptions } from "./_nest";
import { IMG } from "../images";

export const shopTheRoom = defineSection({
  schema: {
    type: "shop-the-room",
    name: "Shop the room",
    category: "products",
    icon: "sofa",
    description: "Room photograph with product hotspots, the list of pieces, a room total and “Add the room to cart”.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Shop the room" },
      { type: "text", id: "heading", label: "Heading", default: "A living room in sage & rattan" },
      { type: "textarea", id: "text", label: "Text", default: "Everything in this photograph is in stock at our Gulshan showroom — tap a dot to see the piece." },
      { type: "image", id: "image", label: "Room image", default: IMG.livingRattan },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "Sage living room with rattan pendant lights, a grey sofa and a jute rug" },
      { type: "select", id: "image_ratio", label: "Image ratio", default: "landscape", options: ratioOptions(["landscape", "wide", "square", "portrait"]) },
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "side",
        options: [
          { value: "side", label: "Image left, pieces right" },
          { value: "side_reverse", label: "Pieces left, image right" },
          { value: "stacked", label: "Full-width image, pieces below" },
        ],
      },
      { type: "collection", id: "collection", label: "Fill empty spots from collection", info: "Spots without a product use this collection, then the newest products." },
      { type: "checkbox", id: "auto_fill", label: "Fill empty spots automatically", default: true },
      { type: "checkbox", id: "show_add_all", label: "Show “Add the room to cart”", default: true },
      schemeField("default"),
      paddingField("large"),
    ],
    blocks: [
      {
        type: "spot",
        name: "Piece",
        limit: 8,
        settings: [
          { type: "product", id: "product", label: "Product" },
          { type: "range", id: "x", label: "Hotspot horizontal position", min: 0, max: 100, step: 1, unit: "%", default: 50 },
          { type: "range", id: "y", label: "Hotspot vertical position", min: 0, max: 100, step: 1, unit: "%", default: 50 },
          { type: "text", id: "note", label: "Detail", default: "", info: "E.g. “Solid mango wood, oiled finish”." },
        ],
      },
    ],
    maxBlocks: 8,
    presets: [
      {
        name: "Shop the room",
        blocks: [
          { type: "spot", settings: { x: 46, y: 64, note: "Deep seats, feather-wrapped cushions" } },
          { type: "spot", settings: { x: 58, y: 22, note: "Hand-woven cane shade" } },
          { type: "spot", settings: { x: 30, y: 82, note: "Hand-knotted wool & jute" } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const spotBlocks = blocks.filter((b) => b.type === "spot");
    const chosen = await Promise.all(spotBlocks.map((b) => (str(b.settings.product) ? context.data.getProduct(str(b.settings.product)).catch(() => null) : Promise.resolve(null))));
    const missing = chosen.filter((p) => !p).length;
    let fillers: SfProduct[] = [];
    if (missing && bool(s.auto_fill, true)) {
      const used = new Set(chosen.filter(Boolean).map((p) => p!.id));
      const collection = str(s.collection);
      const fromCollection = collection ? await context.data.getProducts({ collection, limit: missing + used.size }).then((r) => r.items).catch(() => []) : [];
      fillers = fromCollection.filter((p) => !used.has(p.id));
      if (fillers.length < missing) {
        const more = await context.data.getProducts({ sort: "newest", limit: missing + used.size + fillers.length }).then((r) => r.items).catch(() => []);
        const have = new Set([...used, ...fillers.map((p) => p.id)]);
        fillers = [...fillers, ...more.filter((p) => !have.has(p.id))];
      }
    }
    let fi = 0;
    let sample = false;
    const spots = spotBlocks
      .map((b, i) => {
        let p = chosen[i] ?? (bool(s.auto_fill, true) ? fillers[fi++] : undefined) ?? null;
        if (!p && context.isPreview) {
          p = SAMPLE_PRODUCTS[i % SAMPLE_PRODUCTS.length]!;
          sample = true;
        }
        return p ? { id: b.id, p, x: num(b.settings.x, 50), y: num(b.settings.y, 50), note: str(b.settings.note) } : null;
      })
      .filter((x): x is NonNullable<typeof x> => !!x);
    if (!spots.length) return null;

    const money = moneyOf(context);
    const heading = str(s.heading);
    const image = str(s.image) || IMG.livingRattan;
    const layout = str(s.layout, "side");
    const stacked = layout === "stacked";
    const ratio = RATIO[str(s.image_ratio, "landscape")] ?? RATIO.landscape;
    const total = spots.reduce((sum, x) => sum + x.p.price, 0);
    const group = `room-${spotBlocks[0]?.id ?? "x"}`;

    const figure = (
      <figure className={cn("nest-room relative overflow-hidden rounded-pai bg-pai-muted", ratio, layout === "side_reverse" && "lg:order-2")}>
        <img src={image} alt={str(s.image_alt)} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
        {spots.map((x, i) => (
          <details key={x.id} name={group} className="nest-spot group absolute z-10 open:z-20" style={{ left: `${Math.max(4, Math.min(96, x.x))}%`, top: `${Math.max(5, Math.min(95, x.y))}%` }}>
            <summary
              aria-label={`${i + 1}. ${x.p.title}`}
              className="relative grid size-9 -translate-x-1/2 -translate-y-1/2 cursor-pointer list-none place-items-center rounded-full border border-white/70 bg-black/35 text-[0.72rem] font-semibold text-white backdrop-blur-sm transition hover:bg-white hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white group-open:bg-white group-open:text-neutral-900 [&::-webkit-details-marker]:hidden"
            >
              <span aria-hidden className="nest-pulse absolute inset-0 rounded-full border border-white/60 motion-safe:animate-ping [animation-duration:2.6s] group-open:hidden" />
              {i + 1}
            </summary>
            <SmartLink
              href={x.p.url}
              className={cn("animate-pai-pop absolute flex w-60 items-center gap-3 rounded-pai bg-white p-2.5 pr-4 text-left text-neutral-900 shadow-2xl", x.x > 55 ? "right-4" : "left-4", x.y < 50 ? "top-5" : "bottom-5")}
            >
              {x.p.featuredImage ? <img src={x.p.featuredImage.url} alt="" className="aspect-[4/3] w-16 shrink-0 rounded-[calc(var(--pai-radius)*0.75)] object-cover" /> : null}
              <span className="min-w-0">
                <span className="pai-line-clamp-2 block text-[0.8rem] font-semibold leading-snug">{x.p.title}</span>
                <Price price={x.p.price} compareAt={x.p.compareAtPrice} size="sm" {...money} />
              </span>
            </SmartLink>
          </details>
        ))}
      </figure>
    );

    const list = (
      <ol className={cn(stacked ? "grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4" : "divide-y divide-pai-border border-y border-pai-border")}>
        {spots.map((x, i) => (
          <li key={x.id} className={cn(stacked && "border-t border-pai-border")}>
            <SmartLink href={x.p.url} className="group flex items-center gap-4 py-4">
              <span className="w-6 shrink-0 font-heading text-lg opacity-50">{String(i + 1).padStart(2, "0")}</span>
              <span className="relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-[calc(var(--pai-radius)*0.75)] bg-pai-muted">
                {x.p.featuredImage ? <img src={x.p.featuredImage.url} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" /> : null}
              </span>
              <span className="min-w-0 flex-1">
                <span className="pai-line-clamp-2 block font-medium leading-snug group-hover:underline group-hover:underline-offset-4">{x.p.title}</span>
                {x.note ? <span className="mt-0.5 block text-xs opacity-60">{x.note}</span> : null}
                {stacked ? <Price price={x.p.price} compareAt={x.p.compareAtPrice} size="sm" className="mt-1" {...money} /> : null}
              </span>
              {stacked ? null : <Price price={x.p.price} compareAt={x.p.compareAtPrice} size="sm" className="shrink-0" {...money} />}
            </SmartLink>
          </li>
        ))}
      </ol>
    );

    const addAll =
      bool(s.show_add_all, true) && !sample ? (
        <div className={cn("mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between", stacked && "border-t border-pai-border pt-6")}>
          <p className="text-sm">
            <span className="opacity-65">The whole room · {spots.length} pieces</span>{" "}
            <Price price={total} size="sm" className="ml-1 inline-flex" {...money} />
          </p>
          <AddAllButton
            className="sm:!w-auto"
            label="Add the room to cart"
            items={spots
              .filter((x) => x.p.available)
              .map((x) => ({ productId: x.p.id, variantId: x.p.variants.find((v) => v.available)?.id ?? x.p.variants[0]?.id ?? null, title: x.p.title, imageUrl: x.p.featuredImage?.url ?? null, price: x.p.price, url: x.p.url }))}
          />
        </div>
      ) : null;

    const head = (
      <div className={cn(stacked ? "mb-10 max-w-2xl" : "mb-8")}>
        {str(s.eyebrow) ? <Eyebrow>{str(s.eyebrow)}</Eyebrow> : null}
        {heading ? <h2 className="pai-h2 nest-title">{heading}</h2> : null}
        {str(s.text) ? <p className="mt-4 max-w-md leading-relaxed opacity-75">{str(s.text)}</p> : null}
      </div>
    );

    return (
      <Section settings={s} ariaLabel={heading || "Shop the room"}>
        {sample ? <PreviewNotice context={context}>Pick a product for each hotspot. Showing sample products.</PreviewNotice> : null}
        {stacked ? (
          <>
            {head}
            {figure}
            <div className="mt-8">{list}</div>
            {addAll}
          </>
        ) : (
          <div className={cn("grid items-center gap-10 lg:gap-16", layout === "side_reverse" ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,1.55fr)]" : "lg:grid-cols-[minmax(0,1.55fr)_minmax(0,1fr)]")}>
            {figure}
            <div className={cn(layout === "side_reverse" && "lg:order-1")}>
              {head}
              {list}
              {addAll}
            </div>
          </div>
        )}
      </Section>
    );
  },
});
