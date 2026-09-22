import { defineSection } from "@pai/theme-sdk";
import { Quote } from "lucide-react";
import { bool, cn, gridColsClass, num, sanitizeHtml, str } from "../lib/utils";
import { STOCK_IMAGES } from "../lib/samples";
import { ButtonLink, Image, Rating, RichText, Section, SectionHeading, SmartLink, resolveHref } from "../components/primitives";
import { Icon, ICON_OPTIONS } from "../components/icons";
import { Accordion, Carousel, NewsletterForm } from "../client/widgets";
import { ContactForm } from "../client/forms";
import { buttonFields, columnsField, headingFields, paddingField, readButton, schemeField } from "./_shared";

/* ─────────────────────────── rich text ─────────────────────────── */

export const richText = defineSection({
  schema: {
    type: "rich-text",
    name: "Rich text",
    category: "content",
    icon: "text",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "" },
      { type: "text", id: "heading", label: "Heading", default: "Talk about your brand" },
      { type: "richtext", id: "text", label: "Text", default: "<p>Share information about your brand with your customers. Describe a product, make announcements, or welcome customers to your store.</p>" },
      {
        type: "select",
        id: "align",
        label: "Alignment",
        default: "center",
        options: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
        ],
      },
      {
        type: "select",
        id: "size",
        label: "Text size",
        default: "medium",
        options: [
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large (statement)" },
        ],
      },
      ...buttonFields("button", { label: "", link: "", style: "secondary" }),
      schemeField(),
      paddingField(),
    ],
    presets: [{ name: "Rich text" }],
  },
  component: ({ settings: s, context }) => {
    const btn = readButton(context, s, "button");
    const center = s.align !== "left";
    return (
      <Section settings={s} width="narrow">
        <div className={cn(center && "text-center")}>
          {str(s.eyebrow) ? <p className="pai-eyebrow mb-3">{str(s.eyebrow)}</p> : null}
          {str(s.heading) ? <h2 className={cn(s.size === "large" ? "pai-h1" : "pai-h2")}>{str(s.heading)}</h2> : null}
          <RichText html={str(s.text)} className={cn("mt-5 opacity-85", s.size === "large" ? "text-lg md:text-xl" : "text-base md:text-lg")} />
          {btn ? (
            <ButtonLink href={btn.href} variant={btn.variant} className="mt-8">
              {btn.label}
            </ButtonLink>
          ) : null}
        </div>
      </Section>
    );
  },
});

/* ─────────────────────────── multicolumn ─────────────────────────── */

export const multicolumn = defineSection({
  schema: {
    type: "multicolumn",
    name: "Multicolumn",
    category: "content",
    icon: "columns-3",
    description: "Icons or images with text — perfect for delivery, COD and returns info.",
    settings: [
      ...headingFields({ heading: "", align: "center" }),
      {
        type: "select",
        id: "style",
        label: "Style",
        default: "icons",
        options: [
          { value: "icons", label: "Icons" },
          { value: "icons_inline", label: "Icons inline (compact strip)" },
          { value: "cards", label: "Cards" },
          { value: "images", label: "Images" },
        ],
      },
      columnsField(4, 1, 6),
      {
        type: "select",
        id: "align",
        label: "Text alignment",
        default: "center",
        options: [
          { value: "left", label: "Left" },
          { value: "center", label: "Center" },
        ],
      },
      schemeField(),
      paddingField("small"),
    ],
    blocks: [
      {
        type: "column",
        name: "Column",
        limit: 8,
        settings: [
          { type: "select", id: "icon", label: "Icon", default: "truck", options: ICON_OPTIONS },
          { type: "image", id: "image", label: "Image (Images style)" },
          { type: "text", id: "title", label: "Title", default: "Fast delivery" },
          { type: "textarea", id: "text", label: "Text", default: "Inside Dhaka in 24–48 hours, nationwide in 3–5 days." },
          { type: "url", id: "link", label: "Link" },
        ],
      },
    ],
    presets: [
      {
        name: "Store benefits",
        blocks: [
          { type: "column", settings: { icon: "truck", title: "Nationwide delivery", text: "Inside Dhaka in 1–2 days, all over Bangladesh in 3–5 days." } },
          { type: "column", settings: { icon: "banknote", title: "Cash on delivery", text: "Pay when your order arrives — no advance needed." } },
          { type: "column", settings: { icon: "rotate-ccw", title: "Easy returns", text: "Changed your mind? Return within 7 days." } },
          { type: "column", settings: { icon: "headset", title: "Friendly support", text: "Call or message us 10am–10pm, every day." } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks, context }) => {
    if (!blocks.length) return null;
    const style = str(s.style, "icons");
    const center = s.align !== "left";
    const cols = num(s.columns, 4);
    return (
      <Section settings={s}>
        <SectionHeading eyebrow={str(s.eyebrow)} title={str(s.heading)} subtitle={str(s.subheading)} align={s.heading_align === "left" ? "left" : "center"} />
        <div className={cn("grid", style === "icons_inline" ? "gap-6 md:gap-8" : "gap-8 md:gap-10", gridColsClass(Math.min(cols, blocks.length), style === "images" ? 1 : 2))}>
          {blocks.map((b) => {
            const bs = b.settings;
            const href = resolveHref(context, bs.link);
            const inner =
              style === "icons_inline" ? (
                <div className="flex items-center gap-3.5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-pai-muted">
                    <Icon name={str(bs.icon, "truck")} className="size-5" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold">{str(bs.title)}</span>
                    {str(bs.text) ? <span className="block text-xs opacity-70">{str(bs.text)}</span> : null}
                  </span>
                </div>
              ) : (
                <div className={cn("flex h-full flex-col gap-3", center && "items-center text-center", style === "cards" && "rounded-pai bg-pai-card p-6 ring-1 ring-pai-border")}>
                  {style === "images" ? (
                    <Image src={str(bs.image, STOCK_IMAGES.gallery[0])} alt={str(bs.title)} ratio="aspect-[4/3]" wrapperClassName="mb-2 w-full rounded-pai" />
                  ) : (
                    <span className="grid size-14 place-items-center rounded-full bg-pai-muted text-pai-fg">
                      <Icon name={str(bs.icon, "truck")} className="size-6" />
                    </span>
                  )}
                  <h3 className="font-heading text-lg font-semibold">{str(bs.title)}</h3>
                  {str(bs.text) ? <p className="text-sm opacity-75">{str(bs.text)}</p> : null}
                </div>
              );
            return href ? (
              <SmartLink key={b.id} href={href} className="block transition hover:opacity-80">
                {inner}
              </SmartLink>
            ) : (
              <div key={b.id}>{inner}</div>
            );
          })}
        </div>
      </Section>
    );
  },
});

/* ─────────────────────────── trust badges ─────────────────────────── */

export const trustBadges = defineSection({
  schema: {
    type: "trust-badges",
    name: "Trust badges",
    category: "social-proof",
    icon: "shield-check",
    description: "Compact strip of guarantees — genuine products, secure payment, COD.",
    settings: [schemeField("muted"), paddingField("small")],
    blocks: [
      {
        type: "badge",
        name: "Badge",
        limit: 6,
        settings: [
          { type: "select", id: "icon", label: "Icon", default: "shield-check", options: ICON_OPTIONS },
          { type: "text", id: "title", label: "Title", default: "100% genuine" },
          { type: "text", id: "text", label: "Text", default: "Sourced directly from brands" },
        ],
      },
    ],
    presets: [
      {
        name: "Trust badges",
        blocks: [
          { type: "badge", settings: { icon: "shield-check", title: "100% genuine", text: "Authentic products only" } },
          { type: "badge", settings: { icon: "banknote", title: "Cash on delivery", text: "Pay at your doorstep" } },
          { type: "badge", settings: { icon: "truck", title: "Fast delivery", text: "Across all 64 districts" } },
          { type: "badge", settings: { icon: "rotate-ccw", title: "7-day returns", text: "Hassle-free exchange" } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks }) => {
    if (!blocks.length) return null;
    return (
      <Section settings={s}>
        <ul className={cn("grid gap-6", gridColsClass(Math.min(blocks.length, 4), 2))}>
          {blocks.map((b) => (
            <li key={b.id} className="flex items-center gap-3">
              <Icon name={str(b.settings.icon, "shield-check")} className="size-8 shrink-0 opacity-90" strokeWidth={1.5} />
              <span>
                <span className="block text-sm font-semibold">{str(b.settings.title)}</span>
                <span className="block text-xs opacity-70">{str(b.settings.text)}</span>
              </span>
            </li>
          ))}
        </ul>
      </Section>
    );
  },
});

/* ─────────────────────────── testimonials ─────────────────────────── */

export const testimonials = defineSection({
  schema: {
    type: "testimonials",
    name: "Testimonials",
    category: "social-proof",
    icon: "message-square-quote",
    settings: [
      ...headingFields({ heading: "Loved by thousands of customers", align: "center" }),
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
      columnsField(3, 1, 4),
      schemeField("muted"),
      paddingField(),
    ],
    blocks: [
      {
        type: "testimonial",
        name: "Testimonial",
        limit: 12,
        settings: [
          { type: "textarea", id: "quote", label: "Quote", default: "Excellent quality and super fast delivery. Will definitely order again!" },
          { type: "text", id: "author", label: "Author", default: "Customer name" },
          { type: "text", id: "location", label: "Location / detail", default: "Dhaka" },
          { type: "image", id: "avatar", label: "Photo" },
          { type: "range", id: "rating", label: "Rating", min: 1, max: 5, step: 1, default: 5 },
        ],
      },
    ],
    presets: [
      {
        name: "Testimonials",
        blocks: [
          { type: "testimonial", settings: { quote: "The fabric quality is amazing and the fit is perfect. Delivered to Chattogram in just 3 days!", author: "Nusrat J.", location: "Chattogram", avatar: STOCK_IMAGES.avatar1 } },
          { type: "testimonial", settings: { quote: "Ordered with cash on delivery and it arrived next day in Dhaka. Packaging was beautiful.", author: "Tanvir A.", location: "Dhaka", avatar: STOCK_IMAGES.avatar2 } },
          { type: "testimonial", settings: { quote: "Customer service helped me exchange a size without any hassle. Highly recommended.", author: "Farhana R.", location: "Sylhet", avatar: STOCK_IMAGES.avatar3 } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks }) => {
    if (!blocks.length) return null;
    const cards = blocks.map((b) => {
      const bs = b.settings;
      return (
        <figure key={b.id} className="flex h-full flex-col gap-5 rounded-pai bg-pai-card p-7 ring-1 ring-pai-border">
          <div className="flex items-center justify-between">
            <Rating value={num(bs.rating, 5)} size={16} />
            <Quote className="size-7 opacity-15" />
          </div>
          <blockquote className="flex-1 text-[0.975rem] leading-relaxed">“{str(bs.quote)}”</blockquote>
          <figcaption className="flex items-center gap-3">
            {str(bs.avatar) ? (
              <img src={str(bs.avatar)} alt="" loading="lazy" className="size-11 rounded-full object-cover" />
            ) : (
              <span className="grid size-11 place-items-center rounded-full bg-pai-primary font-semibold text-pai-primary-fg">{str(bs.author, "?").charAt(0)}</span>
            )}
            <span>
              <span className="block text-sm font-semibold">{str(bs.author)}</span>
              {str(bs.location) ? <span className="block text-xs opacity-65">{str(bs.location)}</span> : null}
            </span>
          </figcaption>
        </figure>
      );
    });
    const cols = num(s.columns, 3);
    return (
      <Section settings={s}>
        <SectionHeading eyebrow={str(s.eyebrow)} title={str(s.heading)} subtitle={str(s.subheading)} align={s.heading_align === "left" ? "left" : "center"} />
        {s.layout === "carousel" ? (
          <Carousel perView={{ base: 1.1, md: 2, lg: cols }} gap={20}>
            {cards}
          </Carousel>
        ) : (
          <div className={cn("grid gap-5", gridColsClass(cols, 1))}>{cards}</div>
        )}
      </Section>
    );
  },
});

/* ─────────────────────────── logo list ─────────────────────────── */

export const logoList = defineSection({
  schema: {
    type: "logo-list",
    name: "Logo list",
    category: "social-proof",
    icon: "award",
    description: "Brands you carry or press features.",
    settings: [
      ...headingFields({ heading: "Brands we carry", align: "center" }),
      { type: "checkbox", id: "grayscale", label: "Grayscale logos", default: true },
      { type: "checkbox", id: "marquee", label: "Scrolling marquee", default: false },
      schemeField(),
      paddingField("small"),
    ],
    blocks: [
      {
        type: "logo",
        name: "Logo",
        limit: 16,
        settings: [
          { type: "image", id: "image", label: "Logo image" },
          { type: "text", id: "name", label: "Brand name", default: "Brand" },
          { type: "url", id: "link", label: "Link" },
        ],
      },
    ],
    presets: [
      {
        name: "Logo list",
        blocks: ["Aarong", "Yellow", "Richman", "Ecstasy", "Sailor", "Lotto"].map((name) => ({ type: "logo", settings: { name } })),
      },
    ],
  },
  component: ({ settings: s, blocks, context }) => {
    if (!blocks.length) return null;
    const items = blocks.map((b) => {
      const inner = str(b.settings.image) ? (
        <img src={str(b.settings.image)} alt={str(b.settings.name)} loading="lazy" className={cn("h-10 w-auto max-w-[140px] object-contain md:h-12", bool(s.grayscale, true) && "opacity-70 grayscale transition hover:opacity-100 hover:grayscale-0")} />
      ) : (
        <span className="font-heading text-xl font-bold tracking-tight opacity-60 md:text-2xl">{str(b.settings.name)}</span>
      );
      const href = resolveHref(context, b.settings.link);
      return (
        <li key={b.id} className="flex shrink-0 items-center justify-center px-6">
          {href ? <SmartLink href={href}>{inner}</SmartLink> : inner}
        </li>
      );
    });
    return (
      <Section settings={s}>
        <SectionHeading eyebrow={str(s.eyebrow)} title={str(s.heading)} subtitle={str(s.subheading)} align={s.heading_align === "left" ? "left" : "center"} />
        {bool(s.marquee) ? (
          <div className="overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_10%,#000_90%,transparent)]">
            <ul className="animate-pai-marquee flex w-max items-center gap-8">
              {items}
              {items.map((it, i) => (
                <li key={`dup-${i}`} aria-hidden className="flex shrink-0 items-center justify-center px-6">
                  {it.props.children}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-8">{items}</ul>
        )}
      </Section>
    );
  },
});

/* ─────────────────────────── newsletter ─────────────────────────── */

export const newsletter = defineSection({
  schema: {
    type: "newsletter",
    name: "Newsletter",
    category: "marketing",
    icon: "mail",
    settings: [
      { type: "text", id: "heading", label: "Heading", default: "Get 10% off your first order" },
      { type: "textarea", id: "subheading", label: "Text", default: "Subscribe for early access to new arrivals, exclusive offers and style notes." },
      { type: "text", id: "button_label", label: "Button label", default: "Subscribe" },
      { type: "image", id: "image", label: "Background image", info: "Optional." },
      schemeField("inverse"),
      paddingField(),
    ],
    presets: [{ name: "Newsletter" }],
  },
  component: ({ settings: s }) => {
    const img = str(s.image);
    return (
      <Section settings={s} className={cn(img && "relative isolate overflow-hidden")}>
        {img ? (
          <>
            <img src={img} alt="" loading="lazy" className="absolute inset-0 -z-20 size-full object-cover" />
            <span className="absolute inset-0 -z-10 bg-black/55" />
          </>
        ) : null}
        <div className={cn("mx-auto max-w-2xl text-center", img && "text-white")}>
          <h2 className="pai-h2">{str(s.heading)}</h2>
          {str(s.subheading) ? <p className="mt-3 opacity-80">{str(s.subheading)}</p> : null}
          <NewsletterForm buttonLabel={str(s.button_label, "Subscribe")} className="mx-auto mt-7 max-w-lg" />
        </div>
      </Section>
    );
  },
});

/* ─────────────────────────── FAQ ─────────────────────────── */

export const faq = defineSection({
  schema: {
    type: "faq",
    name: "FAQ",
    category: "content",
    icon: "circle-help",
    settings: [
      ...headingFields({ heading: "Frequently asked questions", align: "center" }),
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "centered",
        options: [
          { value: "centered", label: "Centered" },
          { value: "split", label: "Heading left, questions right" },
        ],
      },
      { type: "checkbox", id: "open_first", label: "Open first question", default: true },
      schemeField(),
      paddingField(),
    ],
    blocks: [
      {
        type: "question",
        name: "Question",
        limit: 30,
        settings: [
          { type: "text", id: "question", label: "Question", default: "How long does delivery take?" },
          { type: "richtext", id: "answer", label: "Answer", default: "<p>Inside Dhaka 1–2 days, outside Dhaka 3–5 working days.</p>" },
        ],
      },
    ],
    presets: [
      {
        name: "FAQ",
        blocks: [
          { type: "question", settings: { question: "How long does delivery take?", answer: "<p>Inside Dhaka we deliver within 1–2 days. Outside Dhaka takes 3–5 working days via our courier partners.</p>" } },
          { type: "question", settings: { question: "Do you offer cash on delivery?", answer: "<p>Yes! Cash on delivery is available all over Bangladesh. You can also pay with bKash or Nagad.</p>" } },
          { type: "question", settings: { question: "What is your return policy?", answer: "<p>If something isn't right, you can return or exchange unused items within 7 days of delivery.</p>" } },
          { type: "question", settings: { question: "How can I track my order?", answer: "<p>Use the “Track order” page with your order number and phone number, or contact our support team.</p>" } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks }) => {
    if (!blocks.length) return null;
    const split = s.layout === "split";
    const acc = (
      <Accordion
        multiple={false}
        items={blocks.map((b, i) => ({
          id: b.id,
          title: str(b.settings.question),
          content: <RichText html={str(b.settings.answer)} />,
          defaultOpen: i === 0 && bool(s.open_first, true),
        }))}
      />
    );
    return (
      <Section settings={s} width={split ? "default" : "narrow"}>
        {split ? (
          <div className="grid gap-10 md:grid-cols-[1fr_1.6fr] md:gap-16">
            <SectionHeading eyebrow={str(s.eyebrow)} title={str(s.heading)} subtitle={str(s.subheading)} align="left" className="md:mb-0" />
            {acc}
          </div>
        ) : (
          <>
            <SectionHeading eyebrow={str(s.eyebrow)} title={str(s.heading)} subtitle={str(s.subheading)} align={s.heading_align === "left" ? "left" : "center"} />
            {acc}
          </>
        )}
      </Section>
    );
  },
});

/* ─────────────────────────── image gallery ─────────────────────────── */

export const imageGallery = defineSection({
  schema: {
    type: "image-gallery",
    name: "Image gallery",
    category: "media",
    icon: "images",
    description: "Instagram-style grid of images with optional links.",
    settings: [
      ...headingFields({ heading: "Follow us @yourbrand", align: "center" }),
      columnsField(6, 2, 6),
      { type: "checkbox", id: "gap", label: "Spacing between images", default: true },
      schemeField(),
      paddingField(),
    ],
    blocks: [
      {
        type: "image",
        name: "Image",
        limit: 18,
        settings: [
          { type: "image", id: "image", label: "Image", default: STOCK_IMAGES.gallery[0] },
          { type: "text", id: "caption", label: "Caption" },
          { type: "url", id: "link", label: "Link" },
        ],
      },
    ],
    presets: [{ name: "Image gallery", blocks: STOCK_IMAGES.gallery.map((image) => ({ type: "image", settings: { image } })) }],
  },
  component: ({ settings: s, blocks, context }) => {
    if (!blocks.length) return null;
    return (
      <Section settings={s}>
        <SectionHeading eyebrow={str(s.eyebrow)} title={str(s.heading)} subtitle={str(s.subheading)} align={s.heading_align === "left" ? "left" : "center"} />
        <ul className={cn("grid", bool(s.gap, true) ? "gap-2 md:gap-3" : "gap-0", gridColsClass(num(s.columns, 6), 2))}>
          {blocks.map((b) => {
            const href = resolveHref(context, b.settings.link);
            const img = (
              <span className="group relative block aspect-square overflow-hidden bg-pai-muted">
                <img src={str(b.settings.image)} alt={str(b.settings.caption)} loading="lazy" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105" />
                {str(b.settings.caption) ? <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 p-3 text-xs text-white opacity-0 transition group-hover:opacity-100">{str(b.settings.caption)}</span> : null}
              </span>
            );
            return <li key={b.id} className={cn(bool(s.gap, true) && "overflow-hidden rounded-pai")}>{href ? <SmartLink href={href}>{img}</SmartLink> : img}</li>;
          })}
        </ul>
      </Section>
    );
  },
});

/* ─────────────────────────── contact form ─────────────────────────── */

export const contactForm = defineSection({
  schema: {
    type: "contact-form",
    name: "Contact form",
    category: "content",
    icon: "send",
    settings: [
      ...headingFields({ heading: "Get in touch", subheading: "Questions about an order or a product? Send us a message and we'll reply within a day." }),
      { type: "checkbox", id: "show_details", label: "Show store contact details", default: true },
      schemeField(),
      paddingField(),
    ],
    presets: [{ name: "Contact form" }],
  },
  component: ({ settings: s, context }) => {
    const st = context.store;
    const details = bool(s.show_details, true) && (st.phone || st.email || st.address);
    return (
      <Section settings={s}>
        <div className={cn("grid gap-10", details ? "md:grid-cols-[1fr_1.5fr]" : "mx-auto max-w-2xl")}>
          <div>
            <SectionHeading eyebrow={str(s.eyebrow)} title={str(s.heading)} subtitle={str(s.subheading)} className="!mb-6" />
            {details ? (
              <dl className="space-y-4 text-sm">
                {st.phone ? (
                  <div>
                    <dt className="font-semibold">Phone</dt>
                    <dd className="opacity-75">
                      <a href={`tel:${st.phone}`}>{st.phone}</a>
                    </dd>
                  </div>
                ) : null}
                {st.email ? (
                  <div>
                    <dt className="font-semibold">Email</dt>
                    <dd className="opacity-75">
                      <a href={`mailto:${st.email}`}>{st.email}</a>
                    </dd>
                  </div>
                ) : null}
                {st.address ? (
                  <div>
                    <dt className="font-semibold">Address</dt>
                    <dd className="opacity-75">{st.address}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
          </div>
          <ContactForm />
        </div>
      </Section>
    );
  },
});

/* ─────────────────────────── custom HTML ─────────────────────────── */

export const customHtml = defineSection({
  schema: {
    type: "custom-html",
    name: "Custom HTML",
    category: "content",
    icon: "code",
    description: "Embed simple HTML (scripts, iframes and event handlers are removed for safety).",
    settings: [
      { type: "textarea", id: "html", label: "HTML", default: "<p style=\"text-align:center\">Your custom content</p>" },
      { type: "checkbox", id: "contained", label: "Constrain to page width", default: true },
      schemeField(),
      paddingField("small"),
    ],
    presets: [{ name: "Custom HTML" }],
  },
  component: ({ settings: s }) => (
    <Section settings={s} container={bool(s.contained, true)}>
      <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(str(s.html)) }} />
    </Section>
  ),
});

/* ─────────────────────────── spacer & divider ─────────────────────────── */

export const spacer = defineSection({
  schema: {
    type: "spacer",
    name: "Spacer",
    category: "content",
    icon: "move-vertical",
    settings: [
      { type: "range", id: "height", label: "Height (desktop)", min: 8, max: 200, step: 4, unit: "px", default: 48 },
      { type: "range", id: "mobile_height", label: "Height (mobile)", min: 8, max: 160, step: 4, unit: "px", default: 32 },
      schemeField(),
    ],
    presets: [{ name: "Spacer" }],
  },
  component: ({ settings: s }) => (
    <div
      aria-hidden
      className={cn("h-[var(--h-m)] md:h-[var(--h-d)]", s.color_scheme !== "default" && `pai-scheme-${str(s.color_scheme)}`)}
      style={{ ["--h-d" as string]: `${num(s.height, 48)}px`, ["--h-m" as string]: `${num(s.mobile_height, 32)}px` }}
    />
  ),
});

export const divider = defineSection({
  schema: {
    type: "divider",
    name: "Divider",
    category: "content",
    icon: "separator-horizontal",
    settings: [
      {
        type: "select",
        id: "style",
        label: "Style",
        default: "line",
        options: [
          { value: "line", label: "Line" },
          { value: "dashed", label: "Dashed" },
          { value: "ornament", label: "Ornament" },
        ],
      },
      { type: "checkbox", id: "full_width", label: "Full width", default: false },
      paddingField("small"),
    ],
    presets: [{ name: "Divider" }],
  },
  component: ({ settings: s }) => (
    <Section settings={s} className="!py-[calc(var(--pai-section-spacing)*var(--pai-section-pad)*0.5)]">
      {s.style === "ornament" ? (
        <div className="flex items-center gap-4 opacity-60" aria-hidden>
          <span className="h-px flex-1 bg-pai-border" />
          <span className="text-sm">✦</span>
          <span className="h-px flex-1 bg-pai-border" />
        </div>
      ) : (
        <hr className={cn("border-0 border-t border-pai-border", s.style === "dashed" && "border-dashed")} />
      )}
    </Section>
  ),
});
