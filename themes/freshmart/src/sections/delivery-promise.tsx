/** Delivery promise banner — e.g. "Delivery in 60 minutes" — with how-it-works steps. */
import { defineSection } from "@pai/theme-sdk";
import { ButtonLink, Icon, Section, buttonFields, cn, readButton, str, paddingField } from "@pai/theme-kit";
import { IMG } from "../images";

export const deliveryPromise = defineSection({
  schema: {
    type: "delivery-promise",
    name: "Delivery promise banner",
    category: "marketing",
    icon: "truck",
    description: "Big delivery promise with steps, delivery slots and an image.",
    settings: [
      { type: "text", id: "badge", label: "Badge", default: "Express delivery" },
      { type: "text", id: "big", label: "Big number", default: "60", info: "Shown large beside the heading, e.g. 60 or 2h." },
      { type: "text", id: "big_unit", label: "Big number unit", default: "min" },
      { type: "text", id: "heading", label: "Heading", default: "Delivery in 60 minutes, anywhere in Dhaka city" },
      { type: "textarea", id: "text", label: "Text", default: "Order by 9 PM and our riders bring it to your door, chilled and packed with care. Free delivery on baskets over ৳999." },
      { type: "text", id: "slots", label: "Delivery slots", default: "Express · 60 min, Morning · 8–11 AM, Evening · 5–9 PM", info: "Comma separated chips." },
      { type: "image", id: "image", label: "Image", default: IMG.veggieBowl },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "A bag of freshly delivered groceries" },
      ...buttonFields("button", { label: "Fill your basket", link: "/collections/all", style: "light" }),
      {
        type: "select",
        id: "color_scheme",
        label: "Colours",
        default: "primary",
        options: [
          { value: "primary", label: "Primary" },
          { value: "inverse", label: "Inverse (dark)" },
          { value: "accent", label: "Accent" },
          { value: "muted", label: "Muted" },
        ],
      },
      paddingField("small"),
    ],
    blocks: [
      {
        type: "step",
        name: "Step",
        limit: 4,
        settings: [
          { type: "text", id: "icon", label: "Icon", default: "shopping-basket", info: "lucide icon name" },
          { type: "text", id: "title", label: "Title", default: "Fill your basket" },
          { type: "text", id: "text", label: "Text", default: "Pick from 5,000+ fresh products" },
        ],
      },
    ],
    maxBlocks: 4,
    presets: [
      {
        name: "Delivery promise banner",
        blocks: [
          { type: "step", settings: { icon: "shopping-basket", title: "Fill your basket", text: "Fresh picks at market prices" } },
          { type: "step", settings: { icon: "package-check", title: "We pack it fresh", text: "Cold chain for meat, fish & dairy" } },
          { type: "step", settings: { icon: "bike", title: "Rider on the way", text: "Track live, pay cash or bKash" } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks, context }) => {
    const btn = readButton(context, s, "button");
    const steps = blocks.filter((b) => b.type === "step");
    const slots = str(s.slots)
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
    const scheme = str(s.color_scheme, "primary");
    return (
      <Section settings={{ ...s, color_scheme: "default" }} ariaLabel={str(s.heading) || "Delivery promise"}>
        <div className={cn("fm-promise relative isolate grid overflow-hidden rounded-[calc(var(--pai-radius)+8px)] md:grid-cols-[1.35fr_1fr]", `pai-scheme-${scheme}`)}>
          <span aria-hidden className="absolute -left-20 -top-24 -z-10 size-72 rounded-full bg-white/10" />
          <span aria-hidden className="absolute -bottom-28 left-1/3 -z-10 size-64 rounded-full bg-white/5" />
          <div className="flex flex-col gap-5 p-6 sm:p-10">
            {str(s.badge) ? <p className="w-fit rounded-full bg-pai-accent px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-white">{str(s.badge)}</p> : null}
            <div className="flex items-center gap-5">
              {str(s.big) ? (
                <p className="flex shrink-0 flex-col items-center justify-center rounded-full border-4 border-current/30 bg-white/10 px-5 py-4 leading-none" aria-hidden>
                  <span className="font-heading text-5xl font-extrabold tabular-nums md:text-6xl">{str(s.big)}</span>
                  <span className="text-xs font-bold uppercase tracking-widest opacity-80">{str(s.big_unit)}</span>
                </p>
              ) : null}
              <h2 className="pai-h2">{str(s.heading)}</h2>
            </div>
            {str(s.text) ? <p className="max-w-xl opacity-85">{str(s.text)}</p> : null}
            {slots.length ? (
              <ul className="flex flex-wrap gap-2" aria-label="Delivery slots">
                {slots.map((x) => (
                  <li key={x} className="rounded-full border border-current/25 bg-white/10 px-3 py-1 text-xs font-semibold">
                    {x}
                  </li>
                ))}
              </ul>
            ) : null}
            {steps.length ? (
              <ol className={cn("grid gap-3 sm:grid-cols-2", steps.length >= 3 && "lg:grid-cols-3")}>
                {steps.map((b, i) => (
                  <li key={b.id} className="flex items-start gap-3 rounded-pai bg-white/10 p-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-pai-bg text-pai-fg" aria-hidden>
                      <Icon name={str(b.settings.icon, "check")} className="size-5" strokeWidth={2} />
                    </span>
                    <span>
                      <span className="block text-sm font-bold">
                        <span className="sr-only">Step {i + 1}: </span>
                        {str(b.settings.title)}
                      </span>
                      <span className="block text-xs opacity-80">{str(b.settings.text)}</span>
                    </span>
                  </li>
                ))}
              </ol>
            ) : null}
            {btn ? (
              <ButtonLink href={btn.href} variant={btn.variant} size="lg" className="w-fit">
                {btn.label}
              </ButtonLink>
            ) : null}
          </div>
          {str(s.image) ? (
            <div className="relative min-h-[220px]">
              <img src={str(s.image)} alt={str(s.image_alt)} loading="lazy" className="absolute inset-0 size-full object-cover md:rounded-l-[48px]" />
            </div>
          ) : null}
        </div>
      </Section>
    );
  },
});
