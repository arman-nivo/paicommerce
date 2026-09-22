import { defineSection, type SfCollection } from "@pai/theme-sdk";
import { Container, SmartLink, bool, cn, loadMenu, num, resolveHref, str } from "@pai/theme-kit";
import { Slideshow } from "@pai/theme-kit/client";
import { ChevronRight, LayoutGrid } from "lucide-react";
import { IMG } from "../images";

const HEIGHTS: Record<string, string> = {
  compact: "h-[190px] sm:h-[260px] lg:h-[320px]",
  standard: "h-[200px] sm:h-[290px] lg:h-[370px]",
  tall: "h-[220px] sm:h-[330px] lg:h-[430px]",
};

type SideItem = { id: string; label: string; href: string; image: string | null; count: number | null };

/**
 * Marketplace hero: category sidebar (collections or a menu) · banner slideshow · two stacked promo
 * banners. On mobile the sidebar hides (the header menu and category icons take over) and the promos
 * sit side by side under the slideshow.
 */
export const bazaarHero = defineSection({
  schema: {
    type: "bazaar-hero",
    name: "Marketplace hero",
    category: "hero",
    icon: "layout-dashboard",
    description: "Category sidebar, a banner slideshow and two promo banners — the classic marketplace home-page opener.",
    settings: [
      { type: "header", label: "Category sidebar" },
      { type: "checkbox", id: "show_sidebar", label: "Show category sidebar (desktop)", default: true },
      { type: "text", id: "sidebar_heading", label: "Sidebar heading", default: "Categories" },
      {
        type: "select",
        id: "sidebar_source",
        label: "Sidebar links",
        default: "collections",
        options: [
          { value: "collections", label: "Collections (with images)" },
          { value: "menu", label: "A menu" },
        ],
      },
      { type: "menu", id: "sidebar_menu", label: "Menu", default: "main", info: "Used when Sidebar links = A menu." },
      { type: "range", id: "sidebar_limit", label: "Links shown", min: 4, max: 14, step: 1, default: 9 },
      { type: "header", label: "Slideshow" },
      { type: "range", id: "autoplay", label: "Autoplay", min: 0, max: 12, step: 1, unit: "s", default: 5, info: "0 turns autoplay off." },
      {
        type: "select",
        id: "height",
        label: "Height",
        default: "standard",
        options: [
          { value: "compact", label: "Compact" },
          { value: "standard", label: "Standard" },
          { value: "tall", label: "Tall" },
        ],
      },
      { type: "checkbox", id: "show_promos", label: "Show promo banners", default: true },
    ],
    blocks: [
      {
        type: "slide",
        name: "Slide",
        limit: 6,
        settings: [
          { type: "image", id: "image", label: "Image", default: IMG.shoppingBags },
          { type: "text", id: "image_alt", label: "Image description (alt text)", default: "" },
          { type: "text", id: "eyebrow", label: "Badge", default: "Mega sale" },
          { type: "text", id: "heading", label: "Heading", default: "Up to 60% off" },
          { type: "text", id: "text", label: "Text", default: "Thousands of deals across every category." },
          { type: "text", id: "button_label", label: "Button label", default: "Shop now" },
          { type: "url", id: "link", label: "Link", default: "/collections/all" },
          {
            type: "select",
            id: "align",
            label: "Text position",
            default: "left",
            options: [
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
            ],
          },
          { type: "checkbox", id: "overlay", label: "Darken image behind text", default: true },
        ],
      },
      {
        type: "promo",
        name: "Promo banner",
        limit: 2,
        settings: [
          { type: "image", id: "image", label: "Image", default: IMG.headphonesYellow },
          { type: "text", id: "image_alt", label: "Image description (alt text)", default: "" },
          { type: "text", id: "eyebrow", label: "Badge", default: "Up to 40% off" },
          { type: "text", id: "heading", label: "Heading", default: "Audio week" },
          { type: "text", id: "link_label", label: "Link label", default: "Shop now" },
          { type: "url", id: "link", label: "Link", default: "/collections/electronics" },
        ],
      },
    ],
    maxBlocks: 8,
    presets: [
      {
        name: "Marketplace hero",
        blocks: [
          { type: "slide" },
          { type: "slide", settings: { image: IMG.laptopRainbow, eyebrow: "Tech fest", heading: "Laptops & gadgets", text: "0% EMI and official warranty.", link: "/collections/electronics" } },
          { type: "promo" },
          { type: "promo", settings: { image: IMG.makeupFlatlay, eyebrow: "Buy 2 get 1", heading: "Beauty essentials", link: "/collections/beauty-health" } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const slides = blocks.filter((b) => b.type === "slide" && str(b.settings.image));
    const promos = bool(s.show_promos, true) ? blocks.filter((b) => b.type === "promo" && str(b.settings.image)).slice(0, 2) : [];
    const showSidebar = bool(s.show_sidebar, true);
    const limit = num(s.sidebar_limit, 9);
    let side: SideItem[] = [];
    if (showSidebar) {
      if (str(s.sidebar_source, "collections") === "menu") {
        const items = await loadMenu(context, str(s.sidebar_menu, "main"));
        side = items
          .flatMap((i) => (i.children?.length ? i.children : [i]))
          .filter((i) => i.url !== context.url("/"))
          .slice(0, limit)
          .map((i) => ({ id: i.id, label: i.label, href: i.url, image: null, count: null }));
      } else {
        const cols = await context.data.getCollections({ limit }).catch(() => [] as SfCollection[]);
        side = cols.map((c) => ({ id: c.id, label: c.title, href: c.url, image: c.image?.url ?? null, count: c.productsCount }));
      }
    }
    const h = HEIGHTS[str(s.height, "standard")] ?? HEIGHTS.standard!;
    const autoplay = num(s.autoplay, 5) * 1000;
    const hasSide = showSidebar && side.length > 0;

    const slideEls = slides.map((b, i) => {
      const bs = b.settings;
      const right = bs.align === "right";
      const href = resolveHref(context, bs.link, "/collections/all");
      return (
        <SmartLink key={b.id} href={href} className={cn("bz-slide group relative isolate block overflow-hidden", h)} ariaLabel={str(bs.heading) || str(bs.image_alt) || `Slide ${i + 1}`}>
          <img
            src={str(bs.image)}
            alt={str(bs.image_alt)}
            loading={i === 0 ? "eager" : "lazy"}
            fetchPriority={i === 0 ? "high" : undefined}
            decoding="async"
            className="absolute inset-0 -z-20 size-full object-cover transition duration-[1.2s] group-hover:scale-[1.03]"
          />
          {bs.overlay !== false ? (
            <span aria-hidden className={cn("absolute inset-0 -z-10 from-black/75 via-black/35 to-transparent", right ? "bg-gradient-to-l" : "bg-gradient-to-r")} />
          ) : null}
          <span className={cn("flex h-full max-w-[34rem] flex-col justify-center gap-2 p-5 text-white sm:gap-3 sm:p-8 lg:p-10", right && "ml-auto items-end text-right")}>
            {str(bs.eyebrow) ? <span className="bz-pill bg-pai-accent text-[#1a1a1a]">{str(bs.eyebrow)}</span> : null}
            {str(bs.heading) ? (
              <span className="block font-heading text-2xl font-extrabold leading-[1.05] tracking-tight [text-wrap:balance] sm:text-4xl lg:text-5xl">{str(bs.heading)}</span>
            ) : null}
            {str(bs.text) ? <span className="hidden max-w-sm text-sm opacity-90 sm:block md:text-base">{str(bs.text)}</span> : null}
            {str(bs.button_label) ? (
              <span className="bz-slide-btn mt-1 inline-flex w-fit items-center gap-1 rounded-pai-btn px-4 py-2 text-sm font-bold sm:px-5 sm:py-2.5">
                {str(bs.button_label)} <ChevronRight className="size-4" aria-hidden />
              </span>
            ) : null}
          </span>
        </SmartLink>
      );
    });

    return (
      <section aria-label="Featured offers" className="bz-hero pt-3 md:pt-4">
        <Container className={cn("grid gap-3", hasSide && promos.length ? "lg:grid-cols-[228px_minmax(0,1fr)_minmax(0,17rem)]" : hasSide ? "lg:grid-cols-[228px_minmax(0,1fr)]" : promos.length ? "lg:grid-cols-[minmax(0,1fr)_minmax(0,17rem)]" : "")}>
          {hasSide ? (
            <nav aria-label={str(s.sidebar_heading, "Categories")} className={cn("bz-sidebar hidden flex-col overflow-hidden rounded-pai bg-pai-card lg:flex", h)}>
              <p className="flex items-center gap-2 border-b border-pai-border px-4 py-2.5 text-[0.8rem] font-bold uppercase tracking-wide">
                <LayoutGrid className="size-4 text-pai-primary" aria-hidden /> {str(s.sidebar_heading, "Categories")}
              </p>
              <ul className="flex min-h-0 flex-1 flex-col overflow-y-auto py-1">
                {side.map((it) => (
                  <li key={it.id} className="flex max-h-12 min-h-9 flex-1">
                    <SmartLink href={it.href} className="bz-side-link group flex w-full items-center gap-2.5 px-3 py-[0.4rem] text-[0.82rem] transition">
                      {it.image ? (
                        <span className="relative size-7 shrink-0 overflow-hidden rounded-full bg-pai-muted">
                          <img src={it.image} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
                        </span>
                      ) : (
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-pai-muted text-[0.7rem] font-bold text-pai-primary">{it.label.slice(0, 1)}</span>
                      )}
                      <span className="min-w-0 flex-1 truncate">{it.label}</span>
                      <ChevronRight className="size-3.5 shrink-0 opacity-30 transition group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden />
                    </SmartLink>
                  </li>
                ))}
              </ul>
              <SmartLink href={context.url("/collections")} className="border-t border-pai-border px-4 py-2 text-xs font-semibold text-pai-primary hover:underline">
                See all categories →
              </SmartLink>
            </nav>
          ) : null}

          <div className="min-w-0 overflow-hidden rounded-pai bg-pai-muted">
            {slideEls.length > 1 ? <Slideshow autoplay={autoplay}>{slideEls}</Slideshow> : slideEls[0] ?? <div className={h} />}
          </div>

          {promos.length ? (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:grid-rows-2">
              {promos.map((b) => {
                const bs = b.settings;
                return (
                  <SmartLink key={b.id} href={resolveHref(context, bs.link, "/collections/all")} className="bz-promo group relative isolate flex min-h-[120px] flex-col justify-end overflow-hidden rounded-pai p-3 text-white sm:min-h-[150px] sm:p-4">
                    <img src={str(bs.image)} alt={str(bs.image_alt)} loading="lazy" decoding="async" className="absolute inset-0 -z-20 size-full object-cover transition duration-700 group-hover:scale-105" />
                    <span aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                    {str(bs.eyebrow) ? <span className="bz-pill mb-1.5 bg-pai-sale text-white">{str(bs.eyebrow)}</span> : null}
                    <span className="block font-heading text-base font-bold leading-tight sm:text-lg">{str(bs.heading)}</span>
                    {str(bs.link_label) ? <span className="mt-0.5 text-xs font-semibold text-pai-accent">{str(bs.link_label)} →</span> : null}
                  </SmartLink>
                );
              })}
            </div>
          ) : null}
        </Container>
      </section>
    );
  },
});
