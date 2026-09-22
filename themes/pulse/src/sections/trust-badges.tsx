import { defineSection } from "@pai/theme-sdk";
import { Container, Icon, cn, str } from "@pai/theme-kit";
import { HEALTH_ICONS, padOf } from "../components/utils";

export const pulseTrust = defineSection({
  schema: {
    type: "pulse-trust",
    name: "Pharmacy trust badges",
    category: "social-proof",
    icon: "shield-check",
    description: "Seal-style badges for genuine medicines, licensed pharmacy, cold chain and secure payments.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Why customers trust us" },
      { type: "text", id: "heading", label: "Heading", default: "Pharmacy standards, online" },
      { type: "textarea", id: "subheading", label: "Subheading", default: "" },
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "cards",
        options: [
          { value: "cards", label: "Cards" },
          { value: "strip", label: "Compact strip" },
        ],
      },
      {
        type: "select",
        id: "padding",
        label: "Vertical spacing",
        default: "medium",
        options: [
          { value: "small", label: "Small" },
          { value: "medium", label: "Medium" },
          { value: "large", label: "Large" },
        ],
      },
    ],
    blocks: [
      {
        type: "badge",
        name: "Badge",
        limit: 6,
        settings: [
          { type: "select", id: "icon", label: "Icon", default: "shield-check", options: HEALTH_ICONS },
          { type: "text", id: "title", label: "Title", default: "100% genuine medicines" },
          { type: "textarea", id: "text", label: "Text", default: "Sourced only from licensed manufacturers and distributors." },
          { type: "text", id: "detail", label: "Detail line", default: "", info: "Optional, e.g. a licence number." },
        ],
      },
    ],
    maxBlocks: 6,
    presets: [
      {
        name: "Pharmacy trust badges",
        blocks: [
          { type: "badge", settings: { icon: "shield-check", title: "100% genuine medicines", text: "Sourced only from licensed manufacturers and distributors." } },
          { type: "badge", settings: { icon: "badge-check", title: "Licensed pharmacy", text: "Every order reviewed and dispensed by a registered pharmacist." } },
          { type: "badge", settings: { icon: "snowflake", title: "Cold-chain storage", text: "Insulin, vaccines and sensitive items kept at the right temperature." } },
          { type: "badge", settings: { icon: "lock", title: "Private & secure", text: "Discreet packaging and your prescriptions are never shared." } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks }) => {
    const badges = blocks.filter((b) => b.type === "badge" && str(b.settings.title));
    if (!badges.length) return null;
    const strip = s.layout === "strip";
    const cols = badges.length >= 4 ? "lg:grid-cols-4" : badges.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";
    return (
      <section aria-label={str(s.heading) || "Our standards"} className={cn("pai-section", !strip && "bg-pai-muted/60")} style={{ ["--pai-section-pad" as string]: padOf(s.padding) }}>
        <Container>
          {!strip && (str(s.heading) || str(s.eyebrow)) ? (
            <div className="mx-auto mb-10 max-w-2xl text-center">
              {str(s.eyebrow) ? <p className="pai-eyebrow mb-2 text-pai-primary">{str(s.eyebrow)}</p> : null}
              {str(s.heading) ? <h2 className="pai-h2">{str(s.heading)}</h2> : null}
              {str(s.subheading) ? <p className="mt-3 opacity-70">{str(s.subheading)}</p> : null}
            </div>
          ) : null}
          <ul className={cn("grid gap-4 sm:grid-cols-2", cols, strip && "rounded-pai border border-pai-border bg-pai-card p-4 md:p-5")}>
            {badges.map((b) => {
              const bs = b.settings;
              return strip ? (
                <li key={b.id} className="flex items-center gap-3">
                  <span className="grid size-11 shrink-0 place-items-center rounded-full bg-pai-primary/10 text-pai-primary">
                    <Icon name={str(bs.icon, "shield-check")} className="size-5" />
                  </span>
                  <span className="text-sm">
                    <span className="block font-semibold">{str(bs.title)}</span>
                    {str(bs.detail) ? <span className="block text-xs opacity-60">{str(bs.detail)}</span> : null}
                  </span>
                </li>
              ) : (
                <li key={b.id} className="pulse-badge relative flex flex-col items-center rounded-[calc(var(--pai-radius)*1.4)] border border-pai-border bg-pai-card p-6 text-center">
                  <span className="relative mb-5 grid size-20 place-items-center">
                    <span aria-hidden className="absolute inset-0 rounded-full border-2 border-dashed border-pai-primary/30" />
                    <span className="grid size-16 place-items-center rounded-full bg-pai-primary text-pai-primary-fg shadow-[0_10px_30px_-10px_var(--pai-primary)]">
                      <Icon name={str(bs.icon, "shield-check")} className="size-7" strokeWidth={1.8} />
                    </span>
                  </span>
                  <h3 className="font-heading text-base font-bold">{str(bs.title)}</h3>
                  {str(bs.text) ? <p className="mt-2 text-sm opacity-70">{str(bs.text)}</p> : null}
                  {str(bs.detail) ? <p className="mt-3 rounded-full bg-pai-muted px-3 py-1 text-[11px] font-semibold opacity-80">{str(bs.detail)}</p> : null}
                </li>
              );
            })}
          </ul>
        </Container>
      </section>
    );
  },
});
