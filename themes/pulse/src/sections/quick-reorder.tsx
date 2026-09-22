import { defineSection } from "@pai/theme-sdk";
import { Container, Link, Placeholder, PreviewNotice, SmartLink, cn, discountPercent, formatMoney, loadSectionProducts, moneyOf, productSourceFields, resolveHref, str } from "@pai/theme-kit";
import { QuickAddButton } from "@pai/theme-kit/client";
import { RotateCcw } from "lucide-react";
import { isRx, slim } from "../components/card";
import { padOf } from "../components/utils";

export const pulseQuickReorder = defineSection({
  schema: {
    type: "quick-reorder",
    name: "Quick reorder",
    category: "products",
    icon: "rotate-ccw",
    description: "Compact one-tap list of everyday essentials or best sellers, with a personal greeting for signed-in customers.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Quick reorder" },
      { type: "text", id: "heading", label: "Heading", default: "Your everyday essentials" },
      { type: "textarea", id: "text", label: "Text", default: "Our most re-ordered medicines and supplements — add them to your cart in one tap." },
      { type: "text", id: "greeting", label: "Greeting for signed-in customers", default: "Welcome back, {name}", info: "{name} is replaced with the customer's first name." },
      ...productSourceFields({ source: "best-selling", limit: 8 }),
      { type: "text", id: "link_label", label: "Link label", default: "View order history" },
      { type: "url", id: "link", label: "Link", default: "/account" },
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
    presets: [{ name: "Quick reorder" }],
  },
  component: async ({ settings: s, context }) => {
    const { products, sample } = await loadSectionProducts(context, s, 8);
    if (!products.length) return null;
    const money = moneyOf(context);
    const fmt = (n: number) => formatMoney(n, money.currency, money.display);
    const first = context.customer?.name?.split(" ")[0];
    const greeting = first && str(s.greeting) ? str(s.greeting).replace("{name}", first) : "";
    const link = resolveHref(context, s.link);
    return (
      <section aria-label={str(s.heading) || "Quick reorder"} className="pai-section" style={{ ["--pai-section-pad" as string]: padOf(s.padding) }}>
        <Container>
          {sample ? <PreviewNotice context={context}>No products matched — showing sample products.</PreviewNotice> : null}
          <div className="grid gap-6 lg:grid-cols-[320px_1fr] lg:gap-10">
            <div className="flex flex-col gap-3 rounded-[calc(var(--pai-radius)*1.4)] bg-pai-muted p-6 lg:self-start">
              <span className="grid size-12 place-items-center rounded-full bg-pai-primary text-pai-primary-fg">
                <RotateCcw className="size-6" aria-hidden />
              </span>
              {greeting ? <p className="text-sm font-semibold text-pai-primary">{greeting}</p> : str(s.eyebrow) ? <p className="pai-eyebrow text-pai-primary">{str(s.eyebrow)}</p> : null}
              {str(s.heading) ? <h2 className="pai-h3">{str(s.heading)}</h2> : null}
              {str(s.text) ? <p className="text-sm opacity-75">{str(s.text)}</p> : null}
              {str(s.link_label) && link ? (
                <SmartLink href={link} className="mt-2 text-sm font-semibold text-pai-primary hover:underline">
                  {str(s.link_label)} →
                </SmartLink>
              ) : null}
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {products.map((p) => {
                const img = p.featuredImage ?? p.images[0];
                const off = discountPercent(p.price, p.compareAtPrice);
                return (
                  <li key={p.id} className="pulse-row group relative flex items-center gap-3 rounded-pai border border-pai-border bg-pai-card p-2.5 pr-3 transition hover:border-pai-primary/40">
                    <span className="relative size-16 shrink-0 overflow-hidden rounded-[calc(var(--pai-radius)*0.7)] bg-pai-muted">
                      {img ? <img src={img.url} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" /> : <Placeholder kind="product" className="absolute inset-0" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[11px] font-medium text-pai-primary">
                        {[p.vendor, p.productType].filter(Boolean).join(" · ")}
                        {isRx(p) ? <span className="ml-1.5 rounded bg-amber-100 px-1 text-amber-900">Rx</span> : null}
                      </span>
                      <Link href={p.url} className="block truncate text-sm font-semibold outline-none after:absolute after:inset-0 after:content-[''] focus-visible:underline">
                        {p.title}
                      </Link>
                      <span className="mt-0.5 flex items-baseline gap-2 text-sm">
                        <span className={cn("font-bold tabular-nums", off && "text-pai-sale")}>{fmt(p.price)}</span>
                        {off && p.compareAtPrice ? <s className="text-xs opacity-50">{fmt(p.compareAtPrice)}</s> : null}
                      </span>
                    </span>
                    {p.available ? (
                      <span className="relative z-10 shrink-0">
                        <QuickAddButton product={slim(p)} mode="icon" className="size-10" />
                      </span>
                    ) : (
                      <span className="shrink-0 text-xs font-medium opacity-60">Out of stock</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </Container>
      </section>
    );
  },
});
