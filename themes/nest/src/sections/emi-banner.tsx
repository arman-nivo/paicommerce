/**
 * Financing / EMI banner: "0% EMI up to 12 months" with an interactive tenure calculator for a
 * chosen product's price (or a set amount), a room image and partner banks as text blocks.
 */
import { defineSection } from "@pai/theme-sdk";
import { ButtonLink, Price, SmartLink, bool, buttonFields, cn, moneyOf, num, readButton, schemeClass, schemeField, str } from "@pai/theme-kit";
import { EmiCalculator } from "../client/emi";
import { Eyebrow, emiDefaults, monthly } from "./_nest";
import { IMG } from "../images";

export const emiBanner = defineSection({
  schema: {
    type: "emi-banner",
    name: "Financing / EMI banner",
    category: "marketing",
    icon: "credit-card",
    description: "0% EMI offer with a tenure calculator, the product it's calculated for and partner banks.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Pay in instalments" },
      { type: "text", id: "heading", label: "Heading", default: "0% EMI for up to 12 months" },
      { type: "textarea", id: "text", label: "Text", default: "Bring home the sofa now and spread the cost — no interest, no processing fee on partner bank credit cards. Choose EMI at checkout." },
      {
        type: "select",
        id: "source",
        label: "Calculate for",
        default: "product",
        options: [
          { value: "product", label: "A product's price" },
          { value: "amount", label: "A set amount" },
        ],
      },
      { type: "product", id: "product", label: "Product", info: "Falls back to your best seller." },
      { type: "number", id: "amount", label: "Amount (৳)", min: 1000, default: 60000 },
      { type: "text", id: "months_options", label: "Tenures (months)", default: "3, 6, 9, 12", info: "Comma separated." },
      { type: "range", id: "default_months", label: "Selected tenure", min: 3, max: 36, step: 3, unit: " mo", default: 12 },
      { type: "image", id: "image", label: "Image", default: IMG.greenSofa },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "Emerald velvet three-seater sofa" },
      { type: "text", id: "banks_heading", label: "Banks heading", default: "Partner bank cards" },
      { type: "text", id: "footnote", label: "Footnote", default: "EMI available on orders over ৳10,000. Terms set by the issuing bank." },
      ...buttonFields("button", { label: "Shop sofas", link: "/collections/all", style: "light" }),
      { type: "checkbox", id: "show_calculator", label: "Show tenure calculator", default: true },
      schemeField("primary"),
    ],
    blocks: [
      {
        type: "bank",
        name: "Bank",
        limit: 16,
        settings: [{ type: "text", id: "name", label: "Bank name", default: "City Bank" }],
      },
    ],
    maxBlocks: 16,
    presets: [
      {
        name: "Financing / EMI banner",
        blocks: [
          { type: "bank", settings: { name: "City Bank (Amex)" } },
          { type: "bank", settings: { name: "BRAC Bank" } },
          { type: "bank", settings: { name: "Eastern Bank" } },
          { type: "bank", settings: { name: "Dutch-Bangla Bank" } },
          { type: "bank", settings: { name: "Standard Chartered" } },
          { type: "bank", settings: { name: "Prime Bank" } },
        ],
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const { months: globalMonths } = emiDefaults(context);
    let product = null;
    if (s.source !== "amount") {
      product = str(s.product) ? await context.data.getProduct(str(s.product)).catch(() => null) : null;
      if (!product) product = (await context.data.getProducts({ sort: "best-selling", limit: 1 }).catch(() => null))?.items[0] ?? null;
    }
    const price = product ? product.price : Math.max(0, num(s.amount, 60000)) * 100;
    if (!price) return null;
    const options = [
      ...new Set(
        str(s.months_options, "3, 6, 9, 12")
          .split(",")
          .map((x) => Math.round(Number(x.trim())))
          .filter((n) => n >= 2 && n <= 60),
      ),
    ].sort((a, b) => a - b);
    const months = options.length ? options : [globalMonths];
    const def = num(s.default_months, globalMonths);
    const maxMonths = Math.max(...months);
    const banks = blocks.filter((b) => b.type === "bank" && str(b.settings.name));
    const btn = readButton(context, s, "button");
    const money = moneyOf(context);
    const heading = str(s.heading);
    const image = str(s.image) || product?.featuredImage?.url || "";
    const fromLine = `from ${context.formatMoney(monthly(price, maxMonths))}/month`;

    return (
      <section aria-label={heading || "EMI"} className={cn("nest-emi-banner", schemeClass(s.color_scheme))}>
        <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
          <div className="relative min-h-[320px] overflow-hidden bg-pai-muted">
            {image ? <img src={image} alt={str(s.image_alt)} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" /> : null}
            <span className="absolute left-5 top-5 rounded-full bg-pai-bg px-4 py-2 text-sm font-semibold text-pai-fg shadow-lg md:left-8 md:top-8">{fromLine}</span>
            {product ? (
              <SmartLink href={product.url} className="absolute inset-x-5 bottom-5 flex items-center justify-between gap-4 rounded-pai bg-black/45 px-4 py-3 text-white backdrop-blur md:inset-x-8 md:bottom-8">
                <span className="min-w-0">
                  <span className="block text-[0.65rem] uppercase tracking-[0.2em] opacity-80">Calculated for</span>
                  <span className="block truncate font-medium">{product.title}</span>
                </span>
                <Price price={product.price} compareAt={product.compareAtPrice} size="sm" className="shrink-0 [&_*]:!text-white" {...money} />
              </SmartLink>
            ) : null}
          </div>
          <div className="px-4 py-14 sm:px-8 lg:py-20 lg:pl-20 lg:pr-[max(2rem,calc((100vw-var(--pai-container))/2+2rem))]">
            <div className="max-w-xl">
              {str(s.eyebrow) ? <Eyebrow className="!text-current opacity-80">{str(s.eyebrow)}</Eyebrow> : null}
              {heading ? <h2 className="pai-h2 nest-title">{heading}</h2> : null}
              {str(s.text) ? <p className="mt-4 leading-relaxed opacity-80">{str(s.text)}</p> : null}
              {bool(s.show_calculator, true) ? (
                <div className="mt-9 border-t border-current/20 pt-8">
                  <EmiCalculator price={price} months={months} defaultMonths={months.includes(def) ? def : maxMonths} />
                </div>
              ) : null}
              {banks.length ? (
                <div className="mt-9">
                  <p className="mb-3 text-[0.7rem] font-semibold uppercase tracking-[0.22em] opacity-70">{str(s.banks_heading, "Partner bank cards")}</p>
                  <ul className="flex flex-wrap gap-2">
                    {banks.map((b) => (
                      <li key={b.id} className="rounded-pai border border-current/20 px-3 py-1.5 text-xs font-medium tracking-wide">
                        {str(b.settings.name)}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {btn ? (
                <div className="mt-9">
                  <ButtonLink href={btn.href} variant={btn.variant} size="lg">
                    {btn.label}
                  </ButtonLink>
                </div>
              ) : null}
              {str(s.footnote) ? <p className="mt-6 text-xs opacity-60">{str(s.footnote)}</p> : null}
            </div>
          </div>
        </div>
      </section>
    );
  },
});
