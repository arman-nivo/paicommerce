/**
 * Impact numbers: large counters (artisans supported, % paid to makers, villages, years) separated
 * by running stitches, with a handwritten footnote and an optional link to an impact report.
 */
import { defineSection } from "@pai/theme-sdk";
import { Section, SmartLink, cn, num, paddingField, resolveHref, schemeField, str } from "@pai/theme-kit";
import { CountUp } from "../client/count-up";
import { Accent, Eyebrow, plain } from "./_artisan";

export const impactNumbers = defineSection({
  schema: {
    type: "impact-numbers",
    name: "Impact numbers",
    category: "social-proof",
    icon: "hand-heart",
    description: "Animated counters for your impact — artisans supported, share paid to makers, villages, years.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Fair by design" },
      { type: "text", id: "heading", label: "Heading", default: "What your order *makes possible*" },
      { type: "textarea", id: "text", label: "Text", default: "We publish what we pay. Makers set their own prices, and are paid half up-front when an order is placed." },
      { type: "checkbox", id: "animate", label: "Count up when scrolled into view", default: true },
      { type: "text", id: "footnote", label: "Handwritten footnote", default: "numbers from our 2025 maker report" },
      { type: "text", id: "link_label", label: "Link label", default: "Read the impact report" },
      { type: "url", id: "link", label: "Link", default: "/pages/about" },
      schemeField("primary"),
      paddingField("large"),
    ],
    blocks: [
      {
        type: "stat",
        name: "Number",
        limit: 6,
        settings: [
          { type: "number", id: "value", label: "Number", default: 180 },
          { type: "range", id: "decimals", label: "Decimals", min: 0, max: 2, step: 1, default: 0 },
          { type: "text", id: "prefix", label: "Prefix", default: "", info: "E.g. ৳" },
          { type: "text", id: "suffix", label: "Suffix", default: "+", info: "E.g. %, +, k" },
          { type: "text", id: "label", label: "Label", default: "artisans supported" },
          { type: "text", id: "note", label: "Small print", default: "" },
        ],
      },
    ],
    maxBlocks: 6,
    presets: [
      {
        name: "Impact numbers",
        blocks: [
          { type: "stat", settings: { value: 180, suffix: "+", label: "artisans supported", note: "68% of them women" } },
          { type: "stat", settings: { value: 62, suffix: "%", label: "of every sale paid to makers", note: "the rest covers materials, delivery & us" } },
          { type: "stat", settings: { value: 23, suffix: "", label: "villages across 9 districts", note: "from Rangpur to Rupganj" } },
          { type: "stat", settings: { value: 11, suffix: "", label: "years of working together", note: "since 2014" } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks, context }) => {
    const stats = blocks.filter((b) => b.type === "stat" && str(b.settings.label));
    if (!stats.length) return null;
    const heading = str(s.heading);
    const link = resolveHref(context, s.link);
    const animate = s.animate !== false;
    const cols = stats.length >= 4 ? "lg:grid-cols-4" : stats.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-2";
    return (
      <Section settings={s} ariaLabel={plain(heading) || "Our impact"} className="artisan-paper artisan-impact-section">
        <div className="grid gap-10 lg:grid-cols-[1fr_2.2fr] lg:gap-16">
          <div>
            {str(s.eyebrow) ? <Eyebrow>{str(s.eyebrow)}</Eyebrow> : null}
            {heading ? (
              <h2 className="pai-h2">
                <Accent text={heading} />
              </h2>
            ) : null}
            {str(s.text) ? <p className="mt-4 max-w-sm opacity-80">{str(s.text)}</p> : null}
            {str(s.link_label) && link ? (
              <SmartLink href={link} className="mt-6 inline-block text-sm font-medium underline decoration-dashed underline-offset-[6px] hover:decoration-solid">
                {str(s.link_label)}
              </SmartLink>
            ) : null}
          </div>
          <div>
            <dl className={cn("artisan-stats grid grid-cols-2", cols)}>
              {stats.map((b) => {
                const bs = b.settings;
                const value = num(bs.value, 0);
                const decimals = num(bs.decimals, 0);
                return (
                  <div key={b.id} className="artisan-stat flex flex-col-reverse justify-end px-5 py-6 lg:py-2">
                    <dt className="mt-2 text-sm leading-snug opacity-85">
                      {str(bs.label)}
                      {str(bs.note) ? <span className="mt-1 block text-xs opacity-65">{str(bs.note)}</span> : null}
                    </dt>
                    <dd className="font-heading text-[clamp(2.8rem,5vw,4.4rem)] leading-none">
                      {str(bs.prefix)}
                      {animate ? <CountUp value={value} decimals={decimals} /> : value.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
                      <span className="text-pai-accent">{str(bs.suffix)}</span>
                    </dd>
                  </div>
                );
              })}
            </dl>
            {str(s.footnote) ? <p className="artisan-hand mt-8 text-right text-2xl opacity-80">— {str(s.footnote)}</p> : null}
          </div>
        </div>
      </Section>
    );
  },
});
