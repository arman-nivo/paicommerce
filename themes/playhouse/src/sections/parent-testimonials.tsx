/**
 * Parent testimonials: colourful quote cards with a star rating, the parent's photo and name, the
 * child's (or pet's) age and a chip linking to the product they bought.
 */
import type { CSSProperties } from "react";
import { Quote, ShoppingBag } from "lucide-react";
import { defineSection, type SfProduct } from "@pai/theme-sdk";
import { Rating, Section, SectionHeading, SmartLink, cn, headingFields, num, paddingField, str } from "@pai/theme-kit";
import { Carousel } from "@pai/theme-kit/client";
import { IMG } from "../images";
import { FOCUS, backgroundField, backgroundStyle, funAt, tint } from "./_playhouse";

export const parentTestimonials = defineSection({
  schema: {
    type: "parent-testimonials",
    name: "Parent testimonials",
    category: "social-proof",
    icon: "message-square-heart",
    description: "Reviews from parents with their child's age and the product they bought.",
    settings: [
      ...headingFields({ eyebrow: "Parents love us", heading: "Happy kids, happy parents", subheading: "", align: "center" }),
      { type: "text", id: "summary", label: "Rating summary", default: "4.9/5 from 2,300+ parents across Bangladesh" },
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "grid",
        options: [
          { value: "grid", label: "Grid" },
          { value: "carousel", label: "Carousel" },
        ],
      },
      backgroundField("muted"),
      paddingField(),
    ],
    blocks: [
      {
        type: "review",
        name: "Review",
        limit: 12,
        settings: [
          { type: "textarea", id: "quote", label: "Quote", default: "My daughter hasn't put it down since it arrived. Beautifully made and delivered the next day!" },
          { type: "text", id: "name", label: "Parent's name", default: "Nusrat J." },
          { type: "text", id: "location", label: "Location", default: "Dhanmondi, Dhaka" },
          { type: "image", id: "avatar", label: "Photo" },
          { type: "text", id: "child", label: "Child / pet", default: "Mum of Aria, 4", info: "E.g. “Dad of twins, 2” or “Pet parent to Bruno”." },
          { type: "product", id: "product", label: "Product bought" },
          { type: "text", id: "product_label", label: "Product name", info: "Shown when no product is picked." },
          { type: "range", id: "rating", label: "Rating", min: 1, max: 5, step: 1, default: 5 },
        ],
      },
    ],
    maxBlocks: 12,
    presets: [
      {
        name: "Parent testimonials",
        blocks: [
          { type: "review", settings: { quote: "The wooden train set is pure magic — my son builds a new track every morning before school.", name: "Farhana R.", location: "Uttara, Dhaka", child: "Mum of Ayaan, 4", product_label: "Wooden Train Set", avatar: IMG.avatarMum1 } },
          { type: "review", settings: { quote: "Soft, safe and so well stitched. The teddy is now officially a member of the family.", name: "Tanvir A.", location: "Chattogram", child: "Dad of Inaya, 2", product_label: "Cuddly Teddy Bear", avatar: IMG.avatarDad1 } },
          { type: "review", settings: { quote: "Ordered on a Monday, paid cash on delivery on Tuesday. Bruno destroyed every other toy — not this one!", name: "Sadia K.", location: "Gulshan, Dhaka", child: "Pet parent to Bruno", product_label: "Squeaky Plush Dog Toy", avatar: IMG.avatarMum2 } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const reviews = blocks.filter((b) => b.type === "review" && str(b.settings.quote));
    if (!reviews.length) {
      if (!context.isPreview) return null;
      return (
        <Section settings={s}>
          <p className="rounded-pai border-2 border-dashed border-pai-border p-8 text-center text-sm opacity-70">Add “Review” blocks to show what parents say.</p>
        </Section>
      );
    }
    const slugs = reviews.map((b) => str(b.settings.product)).filter(Boolean);
    const products = slugs.length ? ((await context.data.getProducts({ slugs, limit: slugs.length }).catch(() => null))?.items ?? []) : [];
    const bySlug = new Map<string, SfProduct>(products.map((p) => [p.slug, p]));

    const cards = reviews.map((b, i) => {
      const bs = b.settings;
      const color = funAt(i + 1);
      const product = bySlug.get(str(bs.product));
      const productName = product?.title ?? str(bs.product_label);
      const name = str(bs.name, "A happy parent");
      const avatar = str(bs.avatar);
      return (
        <figure key={b.id} className={cn("relative flex h-full flex-col rounded-[28px] bg-pai-card p-6 pt-7 ring-1 ring-pai-border", i % 3 === 1 ? "md:rotate-1" : i % 3 === 2 ? "md:-rotate-1" : "")} style={{ "--ph-tone": color } as CSSProperties}>
          <span aria-hidden className="absolute -top-4 left-6 grid size-10 place-items-center rounded-full text-[#1f1f1f] shadow-sm" style={{ background: color }}>
            <Quote className="size-5 fill-current" strokeWidth={0} />
          </span>
          <Rating value={num(bs.rating, 5)} size={18} />
          <blockquote className="mt-3 flex-1 text-[1.02rem] font-semibold leading-relaxed">“{str(bs.quote)}”</blockquote>
          {productName ? (
            product ? (
              <SmartLink href={product.url} className={cn("mt-4 inline-flex max-w-full items-center gap-2 self-start rounded-full py-1 pl-1 pr-3 text-xs font-bold hover:underline", FOCUS)} style={{ background: tint(color, 35) }}>
                {product.featuredImage ? <img src={product.featuredImage.url} alt="" className="size-6 rounded-full object-cover" loading="lazy" /> : <ShoppingBag className="ml-1 size-4" aria-hidden />}
                <span className="truncate">Bought: {productName}</span>
              </SmartLink>
            ) : (
              <p className="mt-4 inline-flex max-w-full items-center gap-2 self-start rounded-full px-3 py-1.5 text-xs font-bold" style={{ background: tint(color, 35) }}>
                <ShoppingBag className="size-3.5" aria-hidden />
                <span className="truncate">Bought: {productName}</span>
              </p>
            )
          ) : null}
          <figcaption className="mt-5 flex items-center gap-3 border-t border-dashed border-pai-border pt-4">
            <span className="grid size-12 shrink-0 place-items-center overflow-hidden rounded-full font-heading text-lg font-bold ring-[3px] ring-offset-2 ring-offset-pai-card" style={{ background: tint(color, 45), ["--tw-ring-color" as string]: color }}>
              {avatar ? <img src={avatar} alt="" loading="lazy" className="size-full object-cover" /> : name.charAt(0)}
            </span>
            <span className="min-w-0">
              <span className="block font-heading font-semibold">{name}</span>
              <span className="block text-xs font-semibold opacity-70">{[str(bs.child), str(bs.location)].filter(Boolean).join(" · ")}</span>
            </span>
          </figcaption>
        </figure>
      );
    });

    return (
      <Section settings={s} ariaLabel={str(s.heading) || "Testimonials"} style={backgroundStyle(s.background)}>
        <SectionHeading eyebrow={str(s.eyebrow)} title={str(s.heading)} subtitle={str(s.subheading)} align={s.heading_align === "left" ? "left" : "center"} />
        {str(s.summary) ? (
          <p className={cn("-mt-4 mb-10 flex flex-wrap items-center gap-2 text-sm font-bold", s.heading_align === "left" ? "" : "justify-center")}>
            <Rating value={5} size={16} /> {str(s.summary)}
          </p>
        ) : null}
        {s.layout === "carousel" ? (
          <Carousel perView={{ base: 1.1, md: 2, lg: 3 }} gap={20} ariaLabel="Parent reviews">
            {cards.map((c, i) => (
              <div key={i} className="h-full pt-5">
                {c}
              </div>
            ))}
          </Carousel>
        ) : (
          <div className={cn("grid gap-x-6 gap-y-10 pt-4", reviews.length >= 3 ? "md:grid-cols-2 lg:grid-cols-3" : reviews.length === 2 ? "md:grid-cols-2" : "mx-auto max-w-xl")}>{cards}</div>
        )}
      </Section>
    );
  },
});
