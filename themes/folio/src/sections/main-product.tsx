/**
 * Folio's product page: the kit "main-product" section with book-aware blocks.
 *  - `title` (replaces the kit block): the title without the " — Author" suffix, plus a "by Author" link.
 *  - `vendor` (replaces the kit block): an eyebrow with the product type / "Digital edition"
 *    instead of the store name that many bookstores keep in `vendor`.
 *  - `book_details`: a small definition list (author, formats, category, delivery, SKU).
 *  - `digital_delivery`: instant-download panel, shown only for digital products.
 *  - `save_for_later`: add the book to the reading list.
 */
import type { BlockSchema, SectionDefinition } from "@pai/theme-sdk";
import { Download, MonitorSmartphone, Zap } from "lucide-react";
import { ProductBlock, bool, extendMainProduct, str, type ProductBlockProps } from "@pai/theme-kit";
import { SaveBookButton } from "../client/wishlist";
import { bookMeta } from "../lib/book";
import { AuthorLink } from "./card";

const titleBlock: BlockSchema = {
  type: "title",
  name: "Title & author",
  limit: 1,
  settings: [
    { type: "checkbox", id: "show_author", label: "Show author under the title", default: true },
    { type: "text", id: "author_prefix", label: "Author prefix", default: "by " },
  ],
};

function TitleBlock({ block, product, context }: ProductBlockProps) {
  const meta = bookMeta(product, context);
  return (
    <div>
      <h1 className="font-heading text-[calc(clamp(1.9rem,3.2vw,2.6rem)*var(--pai-heading-scale))] leading-[1.1] [text-wrap:balance]">{meta.title}</h1>
      {bool(block.settings.show_author, true) && meta.author ? (
        <p className="mt-2 text-lg">
          <AuthorLink author={meta.author} context={context} prefix={str(block.settings.author_prefix, "by ")} />
        </p>
      ) : null}
    </div>
  );
}

const vendorBlock: BlockSchema = {
  type: "vendor",
  name: "Category eyebrow",
  limit: 1,
  settings: [{ type: "text", id: "digital_label", label: "Label for digital products", default: "Digital edition" }],
};

function VendorBlock({ block, product, context }: ProductBlockProps) {
  const meta = bookMeta(product, context);
  const label = meta.digital ? str(block.settings.digital_label, "Digital edition") : product.productType || null;
  if (!label) return null;
  return <p className="folio-rule-eyebrow text-[11px] font-semibold uppercase tracking-[0.28em] text-pai-primary">{label}</p>;
}

const detailsBlock: BlockSchema = {
  type: "book_details",
  name: "Book details",
  limit: 1,
  settings: [
    { type: "text", id: "heading", label: "Heading", default: "Details" },
    { type: "text", id: "physical_delivery", label: "Delivery (printed books)", default: "Ships in 1–2 days · Cash on delivery" },
    { type: "text", id: "digital_delivery", label: "Delivery (digital)", default: "Instant download after payment" },
    { type: "checkbox", id: "show_sku", label: "Show SKU / ISBN", default: true },
  ],
};

function DetailsBlock({ block, product, context }: ProductBlockProps) {
  const meta = bookMeta(product, context);
  const s = block.settings;
  const formats = product.options.find((o) => /format|edition|binding/i.test(o.name))?.values.join(", ");
  const sku = bool(s.show_sku, true) ? product.variants[0]?.sku : null;
  const rows: [string, string][] = [
    ...(meta.author ? ([["Author", meta.author]] as [string, string][]) : []),
    ...(formats ? ([["Formats", formats]] as [string, string][]) : []),
    ...(product.productType ? ([["Category", product.productType]] as [string, string][]) : []),
    ["Delivery", meta.digital ? str(s.digital_delivery, "Instant download after payment") : str(s.physical_delivery, "Ships in 1–2 days")],
    ...(sku ? ([["SKU / ISBN", sku]] as [string, string][]) : []),
  ];
  return (
    <div className="border-y border-pai-border py-4">
      {str(s.heading) ? <p className="pai-eyebrow mb-3">{str(s.heading)}</p> : null}
      <dl className="grid grid-cols-[7.5rem_1fr] gap-x-4 gap-y-2 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="opacity-60">{k}</dt>
            <dd className={k === "Author" ? "font-heading italic" : ""}>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const digitalBlock: BlockSchema = {
  type: "digital_delivery",
  name: "Digital delivery (digital products only)",
  limit: 1,
  settings: [
    { type: "text", id: "heading", label: "Heading", default: "Instant digital delivery" },
    { type: "text", id: "line_1", label: "Line 1", default: "Download link by email and in your account right after payment" },
    { type: "text", id: "line_2", label: "Line 2", default: "Read or watch on phone, tablet, laptop or Kindle" },
    { type: "text", id: "line_3", label: "Line 3", default: "Lifetime access — re-download any time" },
  ],
};

function DigitalBlock({ block, product, context }: ProductBlockProps) {
  if (!bookMeta(product, context).digital) return null;
  const s = block.settings;
  const lines = [
    [Zap, str(s.line_1)],
    [MonitorSmartphone, str(s.line_2)],
    [Download, str(s.line_3)],
  ] as const;
  return (
    <div className="rounded-pai border border-pai-primary/30 bg-[color-mix(in_srgb,var(--pai-primary)_6%,transparent)] p-4">
      <p className="mb-2.5 flex items-center gap-2 text-sm font-semibold text-pai-primary">
        <Download className="size-4" aria-hidden />
        {str(s.heading, "Instant digital delivery")}
      </p>
      <ul className="space-y-1.5 text-sm">
        {lines
          .filter(([, t]) => t)
          .map(([I, t]) => (
            <li key={t} className="flex gap-2.5">
              <I className="mt-0.5 size-4 shrink-0 opacity-60" aria-hidden />
              <span className="opacity-85">{t}</span>
            </li>
          ))}
      </ul>
    </div>
  );
}

const saveBlock: BlockSchema = { type: "save_for_later", name: "Save to reading list", limit: 1, settings: [] };

function SaveBlock({ product, context }: ProductBlockProps) {
  const meta = bookMeta(product, context);
  return (
    <SaveBookButton
      book={{ id: product.id, title: meta.title, author: meta.author, url: product.url, image: product.featuredImage?.url ?? product.images[0]?.url ?? null, price: product.price }}
      withLabel
      className="inline-flex w-fit items-center gap-2 text-sm font-medium opacity-80 hover:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary aria-pressed:text-pai-primary"
    />
  );
}

/** Kit courier-zone delivery info — hidden for digital products (nothing ships). */
function DeliveryInfoBlock(props: ProductBlockProps) {
  return bookMeta(props.product, props.context).digital ? null : <ProductBlock {...props} />;
}

/** Kit stock indicator — digital products show "available instantly" instead of "ready to ship". */
function StockBlock(props: ProductBlockProps) {
  if (!bookMeta(props.product, props.context).digital) return <ProductBlock {...props} />;
  return (
    <p className="flex items-center gap-2 text-sm">
      <span className="size-2 rounded-full bg-emerald-500" aria-hidden />
      Available instantly — no shipping needed
    </p>
  );
}

/** Used as `overrideSections: { "main-product": folioMainProduct }`. */
export function folioMainProduct(base: SectionDefinition<any>): SectionDefinition<any> {
  const kitBlock = (type: string, name: string): BlockSchema => base.schema.blocks?.find((b) => b.type === type) ?? { type, name, settings: [] };
  return extendMainProduct(
    [
      { schema: kitBlock("delivery_info", "Delivery info"), component: DeliveryInfoBlock },
      { schema: kitBlock("stock", "Stock indicator"), component: StockBlock },
      { schema: vendorBlock, component: VendorBlock },
      { schema: titleBlock, component: TitleBlock },
      { schema: detailsBlock, component: DetailsBlock },
      { schema: digitalBlock, component: DigitalBlock },
      { schema: saveBlock, component: SaveBlock },
    ],
    base,
  );
}
