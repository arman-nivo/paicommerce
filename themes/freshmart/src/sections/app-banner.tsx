/** App download / offer banner with a copyable first-order code and store badges. */
import { defineSection } from "@pai/theme-sdk";
import { Icon, Section, paddingField, resolveHref, str, cn } from "@pai/theme-kit";
import { CopyCode } from "../client/copy-code";
import { IMG } from "../images";
import { AppBadges } from "./app-badges";

export const appBanner = defineSection({
  schema: {
    type: "app-banner",
    name: "App download / offer banner",
    category: "marketing",
    icon: "smartphone",
    description: "Promote your app or a first-order offer with a code, store badges and an image.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Get the FreshMart app" },
      { type: "text", id: "heading", label: "Heading", default: "Groceries in 3 taps. ৳100 off your first app order." },
      { type: "textarea", id: "text", label: "Text", default: "Save your weekly basket, reorder in seconds and follow your rider live on the map." },
      { type: "textarea", id: "points", label: "Highlights", default: "One-tap reorder of your usual basket\nLive rider tracking\nApp-only flash deals every Friday", info: "One per line." },
      { type: "text", id: "code", label: "Offer code", default: "APP100" },
      { type: "text", id: "code_label", label: "Offer code text", default: "Use at checkout" },
      { type: "url", id: "ios", label: "App Store link", default: "https://apps.apple.com" },
      { type: "url", id: "android", label: "Google Play link", default: "https://play.google.com" },
      { type: "image", id: "image", label: "Image", default: IMG.phoneHand },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "Shopper ordering groceries on a phone" },
      {
        type: "select",
        id: "color_scheme",
        label: "Colours",
        default: "accent",
        options: [
          { value: "accent", label: "Accent" },
          { value: "primary", label: "Primary" },
          { value: "inverse", label: "Inverse (dark)" },
          { value: "muted", label: "Muted" },
        ],
      },
      paddingField("medium"),
    ],
    presets: [{ name: "App download banner" }, { name: "Offer banner (no app)", settings: { eyebrow: "New here?", heading: "৳150 off your first basket over ৳1,500", ios: "", android: "", code: "HELLO150", color_scheme: "primary" } }],
  },
  component: ({ settings: s, context }) => {
    const points = str(s.points)
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    const scheme = str(s.color_scheme, "accent");
    const light = scheme === "muted";
    return (
      <Section settings={{ ...s, color_scheme: "default" }} ariaLabel={str(s.heading) || "Offer"}>
        <div className={cn("relative isolate grid items-center overflow-hidden rounded-[calc(var(--pai-radius)+8px)] md:grid-cols-[1.3fr_1fr]", `pai-scheme-${scheme}`)}>
          <svg aria-hidden viewBox="0 0 400 400" className="absolute -right-24 -top-24 -z-10 size-[420px] opacity-15">
            <circle cx="200" cy="200" r="190" fill="none" stroke="currentColor" strokeWidth="40" />
          </svg>
          <div className="flex flex-col gap-4 p-6 sm:p-10 md:p-12">
            {str(s.eyebrow) ? <p className="pai-eyebrow opacity-90">{str(s.eyebrow)}</p> : null}
            <h2 className="pai-h2">{str(s.heading)}</h2>
            {str(s.text) ? <p className="max-w-lg opacity-90">{str(s.text)}</p> : null}
            {points.length ? (
              <ul className="space-y-1.5 text-sm font-semibold">
                {points.map((p) => (
                  <li key={p} className="flex items-center gap-2">
                    <Icon name="circle-check" className="size-4 shrink-0" strokeWidth={2.5} /> {p}
                  </li>
                ))}
              </ul>
            ) : null}
            {str(s.code) ? (
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <CopyCode code={str(s.code)} />
                <span className="opacity-85">{str(s.code_label)}</span>
              </div>
            ) : null}
            <AppBadges ios={resolveHref(context, s.ios)} android={resolveHref(context, s.android)} tone={light ? "dark" : "dark"} className="mt-1" />
          </div>
          {str(s.image) ? (
            <div className="relative h-64 md:h-full md:min-h-[380px]">
              <img src={str(s.image)} alt={str(s.image_alt)} loading="lazy" className="absolute inset-0 size-full object-cover md:[clip-path:ellipse(85%_100%_at_100%_50%)]" />
            </div>
          ) : null}
        </div>
      </Section>
    );
  },
});
