/**
 * Aurora's product page: the kit's "main-product" schema (so every kit block keeps working) plus a
 * `size_guide` block that opens a modal size chart next to the variant picker.
 */
import type { BlockInstance, BlockSchema, SectionDefinition, SfProduct, StorefrontContext } from "@pai/theme-sdk";
import { Breadcrumbs, Icon, Rating, RichText, SAMPLE_PRODUCTS, Section, aspectClass, bool, cn, getStoreUrl, num, str } from "@pai/theme-kit";
import {
  Accordion,
  AddToCartButton,
  BuyNowButton,
  ProductGallery,
  ProductPrice,
  ProductProvider,
  QuantitySelector,
  ShareButtons,
  StickyAddToCart,
  StockIndicator,
  TrackProductView,
  VariantPicker,
} from "@pai/theme-kit/client";
import { Package, Truck } from "lucide-react";
import { SizeGuideDialog } from "../client/size-guide-dialog";
import { DEFAULT_MEASURE_TIPS, DEFAULT_SIZE_TABLE, SizeGuideBody, parseTable } from "./size-guide";

export const sizeGuideBlock: BlockSchema = {
  type: "size_guide",
  name: "Size guide",
  limit: 1,
  settings: [
    { type: "text", id: "label", label: "Link label", default: "Size guide" },
    { type: "text", id: "heading", label: "Pop-up heading", default: "Find your size" },
    { type: "textarea", id: "intro", label: "Intro", default: "Measurements refer to your body. Our pieces are cut for a relaxed fit." },
    {
      type: "textarea",
      id: "table",
      label: "Size chart",
      default: DEFAULT_SIZE_TABLE,
      info: "First line = column headings, one size per line. Separate cells with commas or |.",
    },
    { type: "text", id: "note", label: "Note", default: "All measurements in centimetres." },
    { type: "richtext", id: "tips", label: "How to measure", default: DEFAULT_MEASURE_TIPS },
    {
      type: "text",
      id: "only_option",
      label: "Only show for products with option",
      default: "",
      info: "E.g. “Size”. Leave empty to show on every product.",
    },
  ],
};

function ProductBlock({ block, product, context }: { block: BlockInstance; product: SfProduct; context: StorefrontContext }) {
  const s = block.settings;
  switch (block.type) {
    case "vendor":
      return product.vendor ? <p className="pai-eyebrow">{product.vendor}</p> : null;
    case "title":
      return <h1 className="pai-h2 aurora-product-title [text-wrap:balance]">{product.title}</h1>;
    case "rating":
      return product.rating.count > 0 ? (
        <a href="#reviews" className="inline-flex w-fit items-center gap-2 text-sm hover:underline">
          <Rating value={product.rating.average} size={15} showValue />
          <span className="opacity-70">{product.rating.count} reviews</span>
        </a>
      ) : null;
    case "price":
      return (
        <div>
          <ProductPrice />
          {bool(s.show_tax_note) ? <p className="mt-1 text-xs opacity-60">{str(s.tax_note, "Price includes VAT. Delivery charge calculated at checkout.")}</p> : null}
        </div>
      );
    case "sku":
      return product.variants[0]?.sku ? <p className="text-xs opacity-60">SKU: {product.variants[0].sku}</p> : null;
    case "variant_picker":
      return <VariantPicker style={(str(s.style, "swatch") as "swatch" | "buttons" | "dropdown") ?? "swatch"} />;
    case "size_guide": {
      const only = str(s.only_option).toLowerCase();
      if (only && !product.options.some((o) => o.name.toLowerCase() === only)) return null;
      const { head, rows } = parseTable(str(s.table, DEFAULT_SIZE_TABLE));
      if (!rows.length) return null;
      const heading = str(s.heading, "Find your size");
      return (
        <div className="-mt-2">
          <SizeGuideDialog label={str(s.label, "Size guide")} title={heading}>
            <SizeGuideBody intro={str(s.intro)} head={head} rows={rows} note={str(s.note)} tips={str(s.tips)} caption={`${heading} — ${product.title}`} />
          </SizeGuideDialog>
        </div>
      );
    }
    case "stock":
      return <StockIndicator lowStockThreshold={num(s.threshold, 5)} />;
    case "buy_buttons":
      return (
        <div className="space-y-3" data-pai-main-atc>
          <div className="flex gap-3">
            {bool(s.show_quantity, true) ? <QuantitySelector /> : null}
            <div className="flex-1">
              <AddToCartButton />
            </div>
          </div>
          {bool(s.show_buy_now, true) ? <BuyNowButton label={str(s.buy_now_label, "Buy it now")} variant={s.buy_now_style === "primary" ? "primary" : "secondary"} /> : null}
        </div>
      );
    case "description":
      return product.description ? (
        bool(s.collapsed) ? (
          <Accordion items={[{ id: "desc", title: "Description", content: <RichText html={product.description} />, defaultOpen: false }]} />
        ) : (
          <RichText html={product.description} className="text-[0.95rem] opacity-90" />
        )
      ) : null;
    case "collapsible_tab":
      return (
        <Accordion
          className="border-t-0"
          items={[
            {
              id: block.id,
              title: str(s.heading, "Details"),
              icon: str(s.icon) ? <Icon name={str(s.icon)} className="size-4" /> : undefined,
              content: s.source === "description" ? <RichText html={product.description} /> : <RichText html={str(s.content)} />,
              defaultOpen: bool(s.open),
            },
          ]}
        />
      );
    case "delivery_info":
      return (
        <div className="grid gap-3 rounded-pai bg-pai-muted p-4 text-sm sm:grid-cols-2">
          <div className="flex gap-3">
            <Truck className="mt-0.5 size-5 shrink-0" aria-hidden />
            <div>
              <p className="font-semibold">{str(s.inside_title, "Inside Dhaka")}</p>
              <p className="opacity-70">{str(s.inside_text, "Delivery in 1–2 days")}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Package className="mt-0.5 size-5 shrink-0" aria-hidden />
            <div>
              <p className="font-semibold">{str(s.outside_title, "Outside Dhaka")}</p>
              <p className="opacity-70">{str(s.outside_text, "Delivery in 3–5 days")}</p>
            </div>
          </div>
          {str(s.note) ? <p className="text-xs opacity-70 sm:col-span-2">{str(s.note)}</p> : null}
        </div>
      );
    case "trust":
      return (
        <ul className="grid grid-cols-3 gap-2 text-center text-xs">
          {[
            [str(s.icon_1, "banknote"), str(s.text_1, "Cash on delivery")],
            [str(s.icon_2, "rotate-ccw"), str(s.text_2, "7-day easy returns")],
            [str(s.icon_3, "shield-check"), str(s.text_3, "100% genuine")],
          ].map(([icon, text], i) => (
            <li key={i} className="flex flex-col items-center gap-1.5 border border-pai-border p-3 [border-radius:var(--pai-radius)]">
              <Icon name={icon!} className="size-5" />
              <span className="font-medium">{text}</span>
            </li>
          ))}
        </ul>
      );
    case "text":
      return <RichText html={str(s.text)} className="text-sm" />;
    case "share":
      return <ShareButtons title={product.title} url={getStoreUrl(context) ? `${getStoreUrl(context)}/products/${product.slug}` : undefined} />;
    default:
      return null;
  }
}

/** Wrap the kit's main-product definition: same settings, extra block, Aurora rendering. */
export function auroraMainProduct(base: SectionDefinition<any>): SectionDefinition<any> {
  const blocks = base.schema.blocks ?? [];
  return {
    schema: {
      ...base.schema,
      blocks: [...blocks.filter((b) => b.type !== "size_guide"), sizeGuideBlock],
    },
    component: ({ settings: s, blocks: instances, context }) => {
      const product = context.product ?? (context.isPreview ? SAMPLE_PRODUCTS[0]! : null);
      if (!product) return null;
      const ratio = aspectClass(str(s.image_ratio, "portrait"));
      const media = str(s.media_width, "medium");
      const cols = media === "small" ? "md:grid-cols-[5fr_6fr]" : media === "large" ? "md:grid-cols-[3fr_2fr]" : "md:grid-cols-[1.2fr_1fr]";
      const off = product.compareAtPrice && product.compareAtPrice > product.price;
      const crumbs = [
        { label: "Home", href: context.url("/") },
        ...(context.collection ? [{ label: context.collection.title, href: context.collection.url }] : [{ label: "Shop", href: context.url("/collections/all") }]),
        { label: product.title },
      ];
      return (
        <Section settings={s}>
          <ProductProvider product={product} initialVariantId={context.searchParams.variant}>
            {bool(s.show_breadcrumbs, true) ? <Breadcrumbs items={crumbs} className="mb-6" /> : null}
            <div className={cn("grid gap-8 lg:gap-16", cols)}>
              <div className="min-w-0">
                <ProductGallery
                  layout={(str(s.gallery_layout, "grid") as "thumbnails-bottom" | "thumbnails-left" | "grid" | "stacked") ?? "grid"}
                  ratio={ratio}
                  zoom={bool(s.zoom, true)}
                  badge={
                    !product.available ? (
                      <span className="absolute left-3 top-3 bg-pai-fg px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-pai-bg">Sold out</span>
                    ) : off ? (
                      <span className="absolute left-3 top-3 bg-pai-sale px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white">Sale</span>
                    ) : null
                  }
                />
              </div>
              <div className={cn("flex min-w-0 flex-col gap-5 lg:max-w-[520px]", bool(s.sticky_info, true) && "md:sticky md:top-28 md:self-start")}>
                {instances.map((b) => (
                  <ProductBlock key={b.id} block={b} product={product} context={context} />
                ))}
              </div>
            </div>
            {bool(s.sticky_atc, true) ? <StickyAddToCart /> : null}
            {context.product ? <TrackProductView product={{ id: product.id, title: product.title, price: product.price }} /> : null}
          </ProductProvider>
        </Section>
      );
    },
  };
}
