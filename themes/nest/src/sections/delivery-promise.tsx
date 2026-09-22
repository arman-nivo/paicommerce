/**
 * Delivery & assembly promise: numbered steps joined by a thin line (or an icon row), from order to
 * a fully assembled room, with an optional delivery-charges note underneath.
 */
import { defineSection } from "@pai/theme-sdk";
import { Icon, Section, SmartLink, cn, paddingField, resolveHref, schemeField, str } from "@pai/theme-kit";
import { NEST_ICON_OPTIONS, NestHeading } from "./_nest";

export const deliveryPromise = defineSection({
  schema: {
    type: "delivery-promise",
    name: "Delivery & assembly promise",
    category: "content",
    icon: "truck",
    description: "Numbered steps or icons: free delivery, white-glove assembly, returns and warranty.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Our promise" },
      { type: "text", id: "heading", label: "Heading", default: "From our workshop to your room — we do the heavy lifting" },
      { type: "textarea", id: "subheading", label: "Text", default: "" },
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "steps",
        options: [
          { value: "steps", label: "Numbered steps with a connecting line" },
          { value: "icons", label: "Icon columns" },
        ],
      },
      { type: "select", id: "heading_align", label: "Heading alignment", default: "left", options: [{ value: "left", label: "Left" }, { value: "center", label: "Centre" }] },
      { type: "textarea", id: "note", label: "Note under the steps", default: "Delivery inside Dhaka is free over ৳20,000 (৳1,500 below). Chattogram, Sylhet & other districts: ৳2,500–৳4,500 by covered van, quoted at checkout." },
      { type: "text", id: "note_link_label", label: "Note link label", default: "Delivery details" },
      { type: "url", id: "note_link", label: "Note link", default: "/pages/refund-policy" },
      schemeField("default"),
      paddingField("large"),
    ],
    blocks: [
      {
        type: "step",
        name: "Step",
        limit: 6,
        settings: [
          { type: "select", id: "icon", label: "Icon", default: "truck", options: NEST_ICON_OPTIONS },
          { type: "text", id: "title", label: "Title", default: "Free delivery in Dhaka" },
          { type: "textarea", id: "text", label: "Text", default: "Our own two-person crew, in a covered van — never a courier bike." },
        ],
      },
    ],
    maxBlocks: 6,
    presets: [
      {
        name: "Delivery & assembly promise",
        blocks: [
          { type: "step", settings: { icon: "truck", title: "Free delivery in Dhaka", text: "Our own two-person crew in a covered van, on a day that suits you." } },
          { type: "step", settings: { icon: "wrench", title: "White-glove assembly", text: "We carry it in, build it in place and take every bit of packaging away." } },
          { type: "step", settings: { icon: "rotate-ccw", title: "7-day returns", text: "Not right for the room? We'll collect it within 7 days of delivery." } },
          { type: "step", settings: { icon: "shield-check", title: "5-year warranty", text: "On frames, joints and solid wood — repairs at home if anything loosens." } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks, context }) => {
    const steps = blocks.filter((b) => b.type === "step" && str(b.settings.title));
    if (!steps.length && !context.isPreview) return null;
    const heading = str(s.heading);
    const center = s.heading_align === "center";
    const note = str(s.note);
    const noteHref = resolveHref(context, s.note_link);
    const cols = steps.length >= 4 ? "lg:grid-cols-4" : steps.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";

    return (
      <Section settings={s} ariaLabel={heading || "Our promise"}>
        <NestHeading eyebrow={str(s.eyebrow)} heading={heading} text={str(s.subheading)} align={center ? "center" : "left"} />
        {s.layout === "icons" ? (
          <ul className={cn("grid gap-px overflow-hidden rounded-pai border border-pai-border bg-pai-border sm:grid-cols-2", cols)}>
            {steps.map((b) => (
              <li key={b.id} className="bg-pai-bg p-8">
                <Icon name={str(b.settings.icon, "truck")} className="size-8 text-pai-accent" strokeWidth={1.3} />
                <h3 className="mt-6 font-heading text-xl">{str(b.settings.title)}</h3>
                {str(b.settings.text) ? <p className="mt-2 text-sm leading-relaxed opacity-70">{str(b.settings.text)}</p> : null}
              </li>
            ))}
          </ul>
        ) : (
          <ol className={cn("nest-steps relative grid gap-10 sm:grid-cols-2 lg:gap-8", cols)}>
            {steps.map((b, i) => (
              <li key={b.id} className="relative">
                <div className="flex items-center gap-4">
                  <span className="relative z-10 grid size-14 shrink-0 place-items-center rounded-full border border-pai-border bg-pai-bg text-pai-accent">
                    <Icon name={str(b.settings.icon, "truck")} className="size-6" strokeWidth={1.4} />
                  </span>
                  <span aria-hidden className="nest-step-line hidden h-px flex-1 bg-pai-border lg:block" />
                </div>
                <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] opacity-50">Step {String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 font-heading text-xl leading-snug md:text-[1.4rem]">{str(b.settings.title)}</h3>
                {str(b.settings.text) ? <p className="mt-2 max-w-xs text-[0.95rem] leading-relaxed opacity-70">{str(b.settings.text)}</p> : null}
              </li>
            ))}
          </ol>
        )}
        {note ? (
          <p className={cn("mt-12 flex flex-col gap-2 border-t border-pai-border pt-6 text-sm opacity-80 sm:flex-row sm:items-center sm:justify-between", center && "text-center sm:text-left")}>
            <span className="max-w-3xl">{note}</span>
            {noteHref && str(s.note_link_label) ? (
              <SmartLink href={noteHref} className="shrink-0 font-semibold underline underline-offset-4">
                {str(s.note_link_label)}
              </SmartLink>
            ) : null}
          </p>
        ) : null}
      </Section>
    );
  },
});
