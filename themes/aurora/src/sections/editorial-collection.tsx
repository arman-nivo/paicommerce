import { defineSection } from "@pai/theme-sdk";
import {
  ButtonLink,
  PreviewNotice,
  ProductGrid,
  RichText,
  Section,
  buttonFields,
  cn,
  loadSectionProducts,
  num,
  paddingField,
  productSourceFields,
  readButton,
  schemeField,
  str,
} from "@pai/theme-kit";
import { IMG } from "../images";

/** Shop-the-look: a tall editorial image next to a compact product grid. */
export const editorialCollection = defineSection({
  schema: {
    type: "editorial-collection",
    name: "Editorial collection",
    category: "products",
    icon: "layout-dashboard",
    description: "A tall campaign image beside a curated product grid — ideal for “shop the look”.",
    settings: [
      { type: "image", id: "image", label: "Image", default: IMG.lifestyle },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "" },
      {
        type: "select",
        id: "image_position",
        label: "Image position",
        default: "left",
        options: [
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ],
      },
      { type: "checkbox", id: "sticky_image", label: "Keep image in view while scrolling", default: true },
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "The edit" },
      { type: "text", id: "heading", label: "Heading", default: "Shop the look" },
      { type: "richtext", id: "text", label: "Text", default: "<p>Easy layers in washed linen and soft cotton — pieces chosen to be worn together.</p>" },
      ...buttonFields("button", { label: "Shop the edit", link: "/collections/all", style: "link" }),
      { type: "header", label: "Products" },
      ...productSourceFields({ source: "best-selling", limit: 4 }),
      {
        type: "select",
        id: "product_columns",
        label: "Product columns (desktop)",
        default: "2",
        options: [
          { value: "2", label: "2" },
          { value: "3", label: "3" },
        ],
      },
      schemeField("default"),
      paddingField("medium"),
    ],
    presets: [
      { name: "Editorial collection" },
      { name: "Shop the look (image right)", settings: { image_position: "right", image: IMG.editorialMan, heading: "Weekend uniform" } },
    ],
  },
  component: async ({ settings: s, context }) => {
    const { products, sample, collectionUrl } = await loadSectionProducts(context, s, 4);
    if (!products.length && !context.isPreview) return null;
    const image = str(s.image) || (context.isPreview ? IMG.lifestyle : "");
    const right = s.image_position === "right";
    const btn = readButton(context, s, "button");
    const href = btn ? (str(s.button_link) ? btn.href : collectionUrl ?? btn.href) : null;
    const columns = num(s.product_columns, 2);
    const heading = str(s.heading);
    return (
      <Section settings={s} ariaLabel={heading || "Editorial collection"}>
        {sample && str(s.source) === "collection" ? <PreviewNotice context={context}>Select a collection to show your products. Showing sample products.</PreviewNotice> : null}
        <div className={cn("grid gap-10 md:grid-cols-2 lg:gap-16", columns === 3 && "lg:grid-cols-[1fr_1.4fr]")}>
          <div className={cn(right && "md:order-2")}>
            <div className={cn("relative aspect-[4/5] overflow-hidden rounded-pai bg-pai-muted md:aspect-[3/4]", s.sticky_image !== false && "md:sticky md:top-28")}>
              {image ? <img src={image} alt={str(s.image_alt)} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" /> : null}
            </div>
          </div>
          <div className="flex flex-col">
            <div className="mb-8 md:mb-10">
              {str(s.eyebrow) ? <p className="pai-eyebrow mb-3">{str(s.eyebrow)}</p> : null}
              {heading ? <h2 className="pai-h2">{heading}</h2> : null}
              <RichText html={str(s.text)} className="mt-4 max-w-lg opacity-80" />
              {btn && href ? (
                <ButtonLink href={href} variant={btn.variant} className={cn("mt-6", btn.variant === "link" && "text-sm font-semibold uppercase tracking-[0.18em]")}>
                  {btn.label}
                </ButtonLink>
              ) : null}
            </div>
            {products.length ? <ProductGrid products={products} context={context} columns={2} mobileColumns={2} className={cn(columns === 3 && "lg:grid-cols-3")} /> : null}
          </div>
        </div>
      </Section>
    );
  },
});
