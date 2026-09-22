import { defineSection } from "@pai/theme-sdk";
import { ButtonLink, Container, Icon, SmartLink, bool, buttonFields, cn, readButton, str } from "@pai/theme-kit";
import { SearchBox } from "@pai/theme-kit/client";
import { IMG } from "../images";
import { HEALTH_ICONS, whatsappHref } from "../components/utils";

export const pulseHero = defineSection({
  schema: {
    type: "pulse-hero",
    name: "Pharmacy hero",
    category: "hero",
    icon: "heart-pulse",
    description: "Split hero with a medicine search, popular searches, two CTAs and floating trust cards over a photo.",
    settings: [
      { type: "text", id: "eyebrow", label: "Badge", default: "Licensed online pharmacy" },
      { type: "text", id: "heading", label: "Heading", default: "Genuine medicines, delivered to your door" },
      { type: "textarea", id: "text", label: "Text", default: "Order prescription and over-the-counter medicines, vitamins and health essentials. Every order checked by a registered pharmacist." },
      { type: "checkbox", id: "show_search", label: "Show search", default: true },
      { type: "text", id: "search_placeholder", label: "Search placeholder", default: "Search for Napa, Seclo, vitamin D…" },
      { type: "text", id: "popular", label: "Popular searches", default: "Paracetamol, Omeprazole, Vitamin D3, ORS, Face masks", info: "Comma separated." },
      ...buttonFields("button", { label: "Shop medicines", link: "/collections/medicines", style: "primary" }),
      ...buttonFields("button2", { label: "Upload prescription", link: "#prescription", style: "secondary" }, "Second button"),
      { type: "header", label: "Image & trust cards" },
      { type: "image", id: "image", label: "Image", default: IMG.pharmacyStore },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "Bright, well-stocked pharmacy aisle" },
      { type: "select", id: "card_icon_1", label: "Card 1 icon", default: "badge-check", options: HEALTH_ICONS },
      { type: "text", id: "card_title_1", label: "Card 1 title", default: "Pharmacist verified" },
      { type: "text", id: "card_text_1", label: "Card 1 text", default: "Every order double-checked" },
      { type: "select", id: "card_icon_2", label: "Card 2 icon", default: "truck", options: HEALTH_ICONS },
      { type: "text", id: "card_title_2", label: "Card 2 title", default: "Express delivery" },
      { type: "text", id: "card_text_2", label: "Card 2 text", default: "Within 24h in Dhaka" },
      {
        type: "select",
        id: "background",
        label: "Background",
        default: "soft",
        options: [
          { value: "soft", label: "Soft gradient" },
          { value: "plain", label: "Plain" },
        ],
      },
    ],
    presets: [{ name: "Pharmacy hero" }],
  },
  component: ({ settings: s, context }) => {
    const b1 = readButton(context, s, "button");
    const b2 = readButton(context, s, "button2");
    const b2href = b2 ? (str(s.button2_link) ? b2.href : whatsappHref(context, "", "Hello {store}, I'd like to send my prescription.") || b2.href) : "";
    const popular = str(s.popular)
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean)
      .slice(0, 6);
    const cards = [1, 2].map((n) => ({ icon: str(s[`card_icon_${n}`], "badge-check"), title: str(s[`card_title_${n}`]), text: str(s[`card_text_${n}`]) })).filter((c) => c.title);
    const image = str(s.image);

    return (
      <section
        aria-label={str(s.heading) || "Welcome"}
        className={cn("pulse-hero relative overflow-hidden", s.background !== "plain" && "bg-[radial-gradient(70%_90%_at_0%_0%,color-mix(in_srgb,var(--pai-primary)_12%,transparent),transparent_60%),radial-gradient(60%_80%_at_100%_100%,color-mix(in_srgb,var(--pai-accent)_12%,transparent),transparent_60%)]")}
      >
        <Container className="grid items-center gap-10 py-10 md:py-14 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
          <div className="flex flex-col gap-5">
            {str(s.eyebrow) ? (
              <p className="inline-flex w-fit items-center gap-2 rounded-full border border-pai-accent/30 bg-pai-accent/10 px-3 py-1 text-xs font-semibold text-pai-accent">
                <Icon name="badge-check" className="size-4" /> {str(s.eyebrow)}
              </p>
            ) : null}
            {str(s.heading) ? <h1 className="pai-h1 pulse-display [text-wrap:balance]">{str(s.heading)}</h1> : null}
            {str(s.text) ? <p className="max-w-xl text-base opacity-75 md:text-lg">{str(s.text)}</p> : null}
            {bool(s.show_search, true) ? (
              <div className="hidden max-w-xl md:block">
                <SearchBox placeholder={str(s.search_placeholder, "Search medicines…")} className="pulse-search pulse-search-lg" />
                {popular.length ? (
                  <p className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="font-semibold opacity-60">Popular:</span>
                    {popular.map((t) => (
                      <SmartLink key={t} href={context.url(`/search?q=${encodeURIComponent(t)}`)} className="rounded-full border border-pai-border bg-pai-bg px-3 py-1 font-medium transition hover:border-pai-primary hover:text-pai-primary">
                        {t}
                      </SmartLink>
                    ))}
                  </p>
                ) : null}
              </div>
            ) : null}
            <div className="mt-1 flex flex-wrap gap-3">
              {b1 ? (
                <ButtonLink href={b1.href} variant={b1.variant} size="lg">
                  {b1.label}
                </ButtonLink>
              ) : null}
              {b2 && b2href ? (
                <ButtonLink href={b2href} variant={b2.variant} size="lg">
                  <Icon name="file-up" className="size-[18px]" />
                  {b2.label}
                </ButtonLink>
              ) : null}
            </div>
          </div>
          {image ? (
            <div className="relative">
              <div className="relative aspect-[4/3] overflow-hidden rounded-[calc(var(--pai-radius)*2)] bg-pai-muted shadow-[0_40px_80px_-40px_rgba(10,60,70,0.45)] lg:aspect-[5/5]">
                <img src={image} alt={str(s.image_alt)} fetchPriority="high" className="absolute inset-0 size-full object-cover" />
              </div>
              {cards.map((c, i) => (
                <div
                  key={i}
                  className={cn(
                    "pulse-float absolute flex items-center gap-3 rounded-pai border border-pai-border bg-pai-bg/95 p-3 pr-4 shadow-xl backdrop-blur",
                    i === 0 ? "-left-3 top-6 sm:-left-6" : "-right-3 bottom-6 sm:-right-6",
                  )}
                >
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-full", i === 0 ? "bg-pai-accent/15 text-pai-accent" : "bg-pai-primary/12 text-pai-primary")}>
                    <Icon name={c.icon} className="size-5" />
                  </span>
                  <span className="text-sm">
                    <span className="block font-semibold leading-tight">{c.title}</span>
                    {c.text ? <span className="block text-xs opacity-65">{c.text}</span> : null}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </Container>
      </section>
    );
  },
});
