/**
 * Savor "Chef's story": a large photo (with an optional inset photo), eyebrow, heading, a pull
 * quote, the chef's name as a signature, a short text and stat blocks ("12 hrs slow-cooked").
 */
import { defineSection } from "@pai/theme-sdk";
import { RichText, Section, SmartLink, cn, paddingField, resolveHref, schemeField, str } from "@pai/theme-kit";
import { IMG } from "../images";

export const savorStory = defineSection({
  schema: {
    type: "savor-story",
    name: "Chef's story",
    category: "content",
    icon: "chef-hat",
    description: "Chef or founder story with a quote, signature and stats.",
    settings: [
      { type: "image", id: "image", label: "Image", default: IMG.chefPortrait },
      { type: "image", id: "image_2", label: "Inset image", default: IMG.spices },
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
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "From our kitchen" },
      { type: "text", id: "heading", label: "Heading", default: "Three generations of Old Dhaka recipes" },
      { type: "textarea", id: "quote", label: "Quote", default: "We still seal every kacchi deg with dough and let it rest on the coals. You can't rush a good biryani — so we don't." },
      { type: "text", id: "name", label: "Signature name", default: "Chef Rafiqul Islam" },
      { type: "text", id: "role", label: "Role", default: "Head chef & founder" },
      { type: "richtext", id: "text", label: "Text", default: "<p>Our spices are roasted and ground in-house every morning, our mutton comes from trusted farms in Manikganj, and nothing sits under a heat lamp — every order is cooked when you place it.</p>" },
      { type: "text", id: "button_label", label: "Button label", default: "Read our story" },
      { type: "url", id: "button_link", label: "Button link", default: "/pages/about" },
      schemeField("default"),
      paddingField("large"),
    ],
    blocks: [
      {
        type: "stat",
        name: "Stat",
        limit: 4,
        settings: [
          { type: "text", id: "value", label: "Value", default: "12 hrs" },
          { type: "text", id: "label", label: "Label", default: "Slow-cooked kacchi" },
        ],
      },
    ],
    maxBlocks: 4,
    presets: [
      {
        name: "Chef's story",
        blocks: [
          { type: "stat", settings: { value: "2016", label: "Serving Banani since" } },
          { type: "stat", settings: { value: "18", label: "House-ground spices" } },
          { type: "stat", settings: { value: "45 min", label: "Average delivery" } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks, context }) => {
    const image = str(s.image);
    const right = s.image_position === "right";
    const stats = blocks.filter((b) => str(b.settings.value));
    if (!image && !str(s.heading) && !str(s.quote)) return null;
    const href = str(s.button_label) ? resolveHref(context, s.button_link, "/pages/about") : "";
    return (
      <Section settings={s} ariaLabel={str(s.heading) || "Our story"} className="savor-story">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          {image ? (
            <div className={cn("relative mx-auto w-full max-w-xl pb-10 sm:pb-0", right && "lg:order-2")}>
              <div className="savor-arch relative aspect-[4/5] overflow-hidden bg-pai-muted">
                <img src={image} alt={str(s.name) ? `${str(s.name)}, ${str(s.role)}` : "Our chef"} loading="lazy" className="absolute inset-0 size-full object-cover" />
              </div>
              {str(s.image_2) ? (
                <div className={cn("absolute bottom-0 aspect-square w-36 overflow-hidden rounded-pai border-[6px] border-pai-bg bg-pai-muted shadow-xl sm:-bottom-8 sm:w-44", right ? "-left-2 sm:-left-8" : "-right-2 sm:-right-8")}>
                  <img src={str(s.image_2)} alt="" loading="lazy" className="size-full object-cover" />
                </div>
              ) : null}
            </div>
          ) : null}
          <div className={cn(right && "lg:order-1")}>
            {str(s.eyebrow) ? <p className="savor-eyebrow mb-3 text-pai-primary">{str(s.eyebrow)}</p> : null}
            {str(s.heading) ? <h2 className="pai-h2 [text-wrap:balance]">{str(s.heading)}</h2> : null}
            {str(s.quote) ? (
              <blockquote className="savor-quote relative mt-7 pl-8 font-heading text-xl leading-relaxed md:text-2xl">
                <span aria-hidden className="absolute -left-1 -top-4 font-heading text-6xl leading-none text-pai-accent">
                  “
                </span>
                <p className="italic">{str(s.quote)}</p>
                {str(s.name) ? (
                  <footer className="mt-5 not-italic">
                    <span className="savor-signature block text-3xl text-pai-primary md:text-4xl">{str(s.name)}</span>
                    {str(s.role) ? <span className="mt-1 block font-body text-xs font-semibold uppercase tracking-[0.16em] opacity-60">{str(s.role)}</span> : null}
                  </footer>
                ) : null}
              </blockquote>
            ) : null}
            {str(s.text) ? <RichText html={str(s.text)} className="mt-6 max-w-xl opacity-80" /> : null}
            {stats.length ? (
              <dl className={cn("mt-8 grid gap-4 border-y border-dashed border-pai-border py-6", stats.length >= 3 ? "grid-cols-3" : "grid-cols-2")}>
                {stats.map((b) => (
                  <div key={b.id}>
                    <dt className="sr-only">{str(b.settings.label)}</dt>
                    <dd>
                      <span className="block font-heading text-3xl font-semibold text-pai-primary md:text-4xl">{str(b.settings.value)}</span>
                      <span className="mt-1 block text-xs leading-snug opacity-70 md:text-sm" aria-hidden>
                        {str(b.settings.label)}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            ) : null}
            {href ? (
              <SmartLink href={href} className="pai-btn pai-btn-secondary mt-8">
                {str(s.button_label)}
              </SmartLink>
            ) : null}
          </div>
        </div>
      </Section>
    );
  },
});
