import { defineSection } from "@pai/theme-sdk";
import { ButtonLink, Container, bool, cn, formatMoney, moneyOf, resolveHref, str } from "@pai/theme-kit";
import { CalendarClock, MessageCircle, Phone } from "lucide-react";
import { IMG } from "../images";
import { padOf, whatsappHref } from "../components/utils";

export const pulseConsultBanner = defineSection({
  schema: {
    type: "consult-banner",
    name: "Consult a pharmacist",
    category: "marketing",
    icon: "stethoscope",
    description: "Banner inviting customers to call, chat or book a paid consultation with a pharmacist or doctor.",
    settings: [
      { type: "image", id: "image", label: "Image", default: IMG.doctor },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "Smiling doctor with a stethoscope" },
      { type: "text", id: "status", label: "Availability", default: "Pharmacists online · 9am – 11pm" },
      { type: "text", id: "heading", label: "Heading", default: "Talk to a pharmacist, free" },
      { type: "textarea", id: "text", label: "Text", default: "Questions about dosage, side effects or alternatives? Our registered pharmacists answer by phone or WhatsApp — no appointment needed." },
      { type: "checkbox", id: "show_call", label: "Show “Call now” (store phone)", default: true },
      { type: "text", id: "whatsapp_label", label: "WhatsApp label", default: "Chat on WhatsApp" },
      { type: "text", id: "whatsapp", label: "WhatsApp number", info: "Defaults to the theme WhatsApp setting, then your store phone." },
      { type: "header", label: "Paid consultation (optional)" },
      { type: "product", id: "product", label: "Consultation product", info: "Shows its price on the button and links to it." },
      { type: "text", id: "book_label", label: "Button label", default: "Book a doctor" },
      { type: "url", id: "book_link", label: "Button link", info: "Used when no product is selected." },
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
    presets: [{ name: "Consult a pharmacist", settings: { product: "online-doctor-consultation-15-min" } }],
  },
  component: async ({ settings: s, context }) => {
    const product = str(s.product) ? await context.data.getProduct(str(s.product)).catch(() => null) : null;
    const money = moneyOf(context);
    const wa = whatsappHref(context, s.whatsapp, "Hello {store}, I'd like to speak to a pharmacist.");
    const phone = context.store.phone;
    const bookHref = product?.url || resolveHref(context, s.book_link);
    const right = s.image_position === "right";
    const image = str(s.image);
    return (
      <section aria-label={str(s.heading) || "Consultation"} className="pai-section" style={{ ["--pai-section-pad" as string]: padOf(s.padding) }}>
        <Container>
          <div className="grid items-center overflow-hidden rounded-[calc(var(--pai-radius)*2)] border border-pai-border bg-[linear-gradient(120deg,color-mix(in_srgb,var(--pai-accent)_10%,var(--pai-bg)),var(--pai-muted))] md:grid-cols-[0.9fr_1.1fr]">
            {image ? (
              <div className={cn("relative h-64 md:h-full md:min-h-[380px]", right && "md:order-2")}>
                <img src={image} alt={str(s.image_alt)} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover object-top" />
              </div>
            ) : null}
            <div className="flex flex-col gap-4 p-6 sm:p-10">
              {str(s.status) ? (
                <p className="inline-flex w-fit items-center gap-2 rounded-full bg-pai-bg px-3 py-1 text-xs font-semibold shadow-sm ring-1 ring-pai-border">
                  <span className="relative flex size-2.5">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60 motion-reduce:animate-none" />
                    <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
                  </span>
                  {str(s.status)}
                </p>
              ) : null}
              {str(s.heading) ? <h2 className="pai-h2 [text-wrap:balance]">{str(s.heading)}</h2> : null}
              {str(s.text) ? <p className="max-w-lg opacity-75">{str(s.text)}</p> : null}
              <div className="flex flex-wrap gap-3 pt-2">
                {bool(s.show_call, true) && phone ? (
                  <a href={`tel:${phone}`} className="pai-btn pai-btn-primary pai-btn-lg">
                    <Phone className="size-5" aria-hidden /> Call now
                  </a>
                ) : null}
                {wa && str(s.whatsapp_label) ? (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className="pai-btn pai-btn-lg bg-[#177a43] text-white hover:bg-[#12663a]">
                    <MessageCircle className="size-5" aria-hidden /> {str(s.whatsapp_label)}
                  </a>
                ) : null}
                {str(s.book_label) && bookHref ? (
                  <ButtonLink href={bookHref} variant="secondary" size="lg">
                    <CalendarClock className="size-5" aria-hidden />
                    {str(s.book_label)}
                    {product ? <span className="font-normal opacity-70">· {formatMoney(product.price, money.currency, money.display)}</span> : null}
                  </ButtonLink>
                ) : null}
              </div>
            </div>
          </div>
        </Container>
      </section>
    );
  },
});
