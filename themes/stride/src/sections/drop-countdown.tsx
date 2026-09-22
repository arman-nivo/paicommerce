import { defineSection } from "@pai/theme-sdk";
import { ButtonLink, Section, buttonFields, cn, formatMoney, moneyOf, num, paddingField, readButton, schemeField, str } from "@pai/theme-kit";
import { Countdown } from "@pai/theme-kit/client";
import { IMG } from "../images";

/** Next occurrence of `weekday` (0 = Sunday) at `hour`:00 Bangladesh time (UTC+6), as ISO. */
export function nextDhakaWeekday(weekday: number, hour: number, now = Date.now()): string {
  const offset = 6 * 3600_000;
  const local = new Date(now + offset);
  let days = (weekday - local.getUTCDay() + 7) % 7;
  const target = () => Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate() + days, hour) - offset;
  if (target() <= now) days += 7;
  return new Date(target()).toISOString();
}

/**
 * Countdown drop: a big product image beside a "next drop" countdown with the product's price
 * and two buttons. Without a date it counts down to the next weekly drop (e.g. Friday 8 pm).
 */
export const strideDrop = defineSection({
  schema: {
    type: "stride-drop",
    name: "Countdown drop",
    category: "marketing",
    icon: "timer",
    description: "Launch countdown beside a big product image — for limited drops and restocks.",
    settings: [
      { type: "product", id: "product", label: "Product", info: "Optional — shows its price and links the first button to it." },
      { type: "image", id: "image", label: "Image", default: IMG.sneakerLime },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "Neon running shoe on a lime background" },
      {
        type: "select",
        id: "image_position",
        label: "Image position",
        default: "left",
        options: [
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ],
      },
      { type: "text", id: "sticker", label: "Image sticker", default: "Limited pairs", info: "Round badge on the image. Leave empty to hide." },
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Next drop" },
      { type: "text", id: "heading", label: "Heading", default: "Velocity Knit 2.0" },
      { type: "textarea", id: "text", label: "Text", default: "Lighter foam, a tighter knit and a new volt colourway. Limited pairs — once they're gone, they're gone." },
      { type: "datetime", id: "ends_at", label: "Drop date & time", info: "Leave empty to count down to the next weekly drop below." },
      {
        type: "select",
        id: "weekday",
        label: "Weekly drop day",
        default: "5",
        options: [
          { value: "0", label: "Sunday" },
          { value: "1", label: "Monday" },
          { value: "2", label: "Tuesday" },
          { value: "3", label: "Wednesday" },
          { value: "4", label: "Thursday" },
          { value: "5", label: "Friday" },
          { value: "6", label: "Saturday" },
        ],
      },
      { type: "range", id: "hour", label: "Weekly drop hour (Dhaka time)", min: 0, max: 23, step: 1, default: 20 },
      { type: "text", id: "ended_text", label: "Text when the countdown ends", default: "Out now — while pairs last." },
      ...buttonFields("button", { label: "Shop the drop", link: "/collections/running", style: "accent" }),
      ...buttonFields("button2", { label: "Get drop alerts", link: "/pages/contact", style: "secondary" }, "Second button"),
      schemeField("inverse"),
      paddingField("none"),
    ],
    presets: [{ name: "Countdown drop" }],
  },
  component: async ({ settings: s, context }) => {
    const product = str(s.product) ? await context.data.getProduct(str(s.product)).catch(() => null) : null;
    const money = moneyOf(context);
    const endsAt = str(s.ends_at) || nextDhakaWeekday(num(s.weekday, 5), num(s.hour, 20));
    const b1 = readButton(context, s, "button");
    const b2 = readButton(context, s, "button2");
    const href1 = b1 ? (product && !str(s.button_link) ? product.url : b1.href) : "";
    const image = str(s.image) || product?.featuredImage?.url || "";
    const right = s.image_position === "right";
    const heading = str(s.heading) || product?.title || "";

    return (
      <Section settings={s} ariaLabel={heading || "Countdown"} container={false} className="stride-drop overflow-hidden">
        <div className={cn("grid md:grid-cols-2", right && "md:[&>*:first-child]:order-2")}>
          <div className="relative min-h-[360px] overflow-hidden bg-pai-muted md:min-h-[600px]">
            {image ? <img src={image} alt={str(s.image_alt) || product?.title || ""} loading="lazy" decoding="async" className="stride-float absolute inset-0 size-full object-cover" /> : null}
            {str(s.sticker) ? (
              <span className="stride-sticker absolute left-5 top-5 grid size-24 place-items-center rounded-full bg-pai-accent p-3 text-center font-heading text-lg uppercase leading-[0.95] text-[var(--stride-accent-fg)] md:size-28 md:text-xl">
                {str(s.sticker)}
              </span>
            ) : null}
          </div>
          <div className="flex flex-col justify-center gap-6 px-5 py-14 sm:px-10 lg:px-16">
            {str(s.eyebrow) ? (
              <p className="stride-kicker">
                <span aria-hidden className="stride-kicker-dot" />
                {str(s.eyebrow)}
              </p>
            ) : null}
            {heading ? <h2 className="stride-display text-[clamp(3rem,7vw,6.5rem)]">{heading}</h2> : null}
            {str(s.text) ? <p className="max-w-lg text-base leading-relaxed opacity-75 md:text-lg">{str(s.text)}</p> : null}
            <div>
              <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] opacity-60">Drops in</p>
              <Countdown
                to={endsAt}
                expiredLabel={str(s.ended_text, "Out now")}
                className="stride-countdown gap-2 sm:gap-3"
                boxClassName="min-w-[4.5rem] rounded-none border border-pai-border !bg-transparent px-3 py-3 !text-pai-fg sm:min-w-24 [&>span:first-child]:font-heading [&>span:first-child]:text-4xl [&>span:first-child]:font-normal sm:[&>span:first-child]:text-6xl"
              />
            </div>
            {product ? (
              <p className="flex items-baseline gap-3">
                <span className="font-heading text-4xl">{formatMoney(product.price, money.currency, money.display)}</span>
                {product.compareAtPrice && product.compareAtPrice > product.price ? (
                  <s className="opacity-50">
                    <span className="sr-only">Was </span>
                    {formatMoney(product.compareAtPrice, money.currency, money.display)}
                  </s>
                ) : null}
              </p>
            ) : null}
            {b1 || b2 ? (
              <div className="flex flex-wrap gap-3">
                {b1 ? (
                  <ButtonLink href={href1} variant={b1.variant} size="lg" className="stride-btn-arrow">
                    {b1.label}
                  </ButtonLink>
                ) : null}
                {b2 ? (
                  <ButtonLink href={b2.href} variant={b2.variant} size="lg">
                    {b2.label}
                  </ButtonLink>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </Section>
    );
  },
});
