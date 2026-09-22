/**
 * Made-to-order process: numbered steps joined by a kantha running stitch, each with an icon or a
 * small photo and a duration, plus a lead-time card ("Ready in 3–4 weeks") and a call to action.
 */
import { defineSection } from "@pai/theme-sdk";
import { ButtonLink, ICON_OPTIONS, Icon, Section, bool, buttonFields, cn, paddingField, readButton, schemeField, str } from "@pai/theme-kit";
import { Accent, Eyebrow, plain } from "./_artisan";

const STEP_ICONS = [
  { value: "messages-square", label: "Conversation" },
  { value: "pencil-ruler", label: "Sketch / measure" },
  { value: "hand", label: "Hand" },
  { value: "hammer", label: "Hammer" },
  { value: "palette", label: "Palette" },
  { value: "flame", label: "Kiln / fire" },
  { value: "package", label: "Parcel" },
  ...ICON_OPTIONS,
];

export const madeToOrder = defineSection({
  schema: {
    type: "made-to-order",
    name: "Made-to-order process",
    category: "content",
    icon: "list-ordered",
    description: "Numbered process steps joined by a running stitch, with lead time and a call to action.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Made to order" },
      { type: "text", id: "heading", label: "Heading", default: "From our makers' hands *to yours*" },
      { type: "textarea", id: "text", label: "Text", default: "Most pieces are made after you order — that's how we keep waste low and pay makers for every hour they work." },
      { type: "text", id: "lead_time", label: "Lead time", default: "Ready in 3–4 weeks" },
      { type: "text", id: "lead_note", label: "Lead-time note", default: "from the day you order · we'll send photos as it's made" },
      { type: "checkbox", id: "show_numbers", label: "Show step numbers", default: true },
      {
        type: "select",
        id: "style",
        label: "Step style",
        default: "icons",
        options: [
          { value: "icons", label: "Icons in stitched circles" },
          { value: "images", label: "Small photos (when set)" },
        ],
      },
      ...buttonFields("button", { label: "Start a custom order", link: "/pages/contact", style: "primary" }),
      schemeField("default"),
      paddingField("large"),
    ],
    blocks: [
      {
        type: "step",
        name: "Step",
        limit: 6,
        settings: [
          { type: "select", id: "icon", label: "Icon", default: "hand", options: STEP_ICONS },
          { type: "image", id: "image", label: "Photo", info: "Used when Step style = Small photos." },
          { type: "text", id: "image_alt", label: "Photo description (alt text)", default: "" },
          { type: "text", id: "title", label: "Title", default: "Made by hand" },
          { type: "textarea", id: "text", label: "Text", default: "Your piece is made start to finish by one maker." },
          { type: "text", id: "duration", label: "Duration", default: "", info: "E.g. “Day 1–2” or “2–3 weeks”." },
        ],
      },
    ],
    maxBlocks: 6,
    presets: [
      {
        name: "Made-to-order process",
        blocks: [
          { type: "step", settings: { icon: "messages-square", title: "You choose", text: "Pick a piece, size and colour — or message us an idea.", duration: "Day 1" } },
          { type: "step", settings: { icon: "pencil-ruler", title: "We brief the maker", text: "Your order goes straight to the artisan's village.", duration: "Days 2–3" } },
          { type: "step", settings: { icon: "hand", title: "Made by hand", text: "Thrown, stitched or hammered — one piece at a time.", duration: "2–3 weeks" } },
          { type: "step", settings: { icon: "package", title: "Wrapped & sent", text: "Packed in jute and kraft, delivered to your door.", duration: "2–4 days" } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks, context }) => {
    const steps = blocks.filter((b) => b.type === "step" && str(b.settings.title));
    if (!steps.length) return null;
    const heading = str(s.heading);
    const btn = readButton(context, s, "button");
    const images = s.style === "images";
    const numbers = bool(s.show_numbers, true);
    const cols = steps.length >= 5 ? "lg:grid-cols-5" : steps.length === 4 ? "lg:grid-cols-4" : steps.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";
    return (
      <Section settings={s} ariaLabel={plain(heading) || "How it's made"}>
        <div className="mb-14 grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div className="max-w-2xl">
            {str(s.eyebrow) ? <Eyebrow>{str(s.eyebrow)}</Eyebrow> : null}
            {heading ? (
              <h2 className="pai-h2">
                <Accent text={heading} />
              </h2>
            ) : null}
            {str(s.text) ? <p className="mt-4 max-w-xl text-[1.02rem] opacity-75">{str(s.text)}</p> : null}
          </div>
          {str(s.lead_time) ? (
            <div className="artisan-leadtime artisan-stitch-box relative flex items-center gap-5 p-6 lg:justify-self-end">
              <span aria-hidden className="grid size-14 shrink-0 place-items-center rounded-full bg-pai-accent text-pai-bg">
                <Icon name="clock" className="size-6" />
              </span>
              <div>
                <p className="artisan-hand text-[2rem] leading-none text-pai-accent">{str(s.lead_time)}</p>
                {str(s.lead_note) ? <p className="mt-1.5 max-w-[17rem] text-sm opacity-70">{str(s.lead_note)}</p> : null}
              </div>
            </div>
          ) : null}
        </div>

        <ol className={cn("artisan-steps relative grid gap-10 sm:grid-cols-2", cols)}>
          {steps.map((b, i) => {
            const bs = b.settings;
            const img = images ? str(bs.image) : "";
            return (
              <li key={b.id} className="artisan-step relative">
                <div className="relative z-10 flex items-center gap-4">
                  {img ? (
                    <span className="artisan-step-photo relative block size-24 shrink-0 overflow-hidden rounded-full">
                      <img src={img} alt={str(bs.image_alt)} loading="lazy" className="absolute inset-0 size-full object-cover" />
                    </span>
                  ) : (
                    <span className="artisan-step-icon grid size-20 shrink-0 place-items-center rounded-full">
                      <Icon name={str(bs.icon, "hand")} className="size-7" strokeWidth={1.4} />
                    </span>
                  )}
                  {numbers ? (
                    <span aria-hidden className="font-heading text-5xl leading-none text-pai-accent/35">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  ) : null}
                </div>
                <h3 className="mt-6 font-heading text-xl">
                  {numbers ? <span className="sr-only">Step {i + 1}: </span> : null}
                  {str(bs.title)}
                </h3>
                {str(bs.text) ? <p className="mt-2 text-[0.95rem] leading-relaxed opacity-75">{str(bs.text)}</p> : null}
                {str(bs.duration) ? <p className="artisan-hand mt-3 text-2xl leading-none text-pai-accent">{str(bs.duration)}</p> : null}
              </li>
            );
          })}
        </ol>

        {btn ? (
          <div className="mt-14 flex flex-wrap items-center gap-4">
            <ButtonLink href={btn.href} variant={btn.variant} size="lg">
              {btn.label}
            </ButtonLink>
            <p className="text-sm opacity-65">Every piece is unique — small variations are the maker's mark, not flaws.</p>
          </div>
        ) : null}
      </Section>
    );
  },
});
