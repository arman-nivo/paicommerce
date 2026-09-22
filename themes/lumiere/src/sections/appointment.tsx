/**
 * Book-an-appointment CTA: an invitation to a private viewing at the atelier — split layout with
 * an editorial image and a gold-framed card holding the address, hours, phone and a WhatsApp /
 * email / page call to action.
 */
import { defineSection } from "@pai/theme-sdk";
import { Section, SmartLink, cn, paddingField, resolveHref, schemeField, str } from "@pai/theme-kit";
import { Eyebrow, whatsappHref } from "./_lumiere";
import { IMG } from "../images";

export const appointmentCta = defineSection({
  schema: {
    type: "appointment-cta",
    name: "Book an appointment",
    category: "marketing",
    icon: "calendar-heart",
    description: "Invitation to a private viewing: image, address, hours, phone and a WhatsApp or email button.",
    settings: [
      { type: "image", id: "image", label: "Image", default: IMG.ringTray },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "Diamond rings presented in an ivory velvet tray at the atelier" },
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
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Private viewings" },
      { type: "text", id: "heading", label: "Heading", default: "An hour, a cup of tea, and the piece that's meant for you" },
      { type: "textarea", id: "text", label: "Text", default: "Our advisers will set aside the salon for you — try bridal sets at your own pace, see stones under daylight, or begin a bespoke commission. There is never any obligation." },
      { type: "header", label: "Details" },
      { type: "textarea", id: "address", label: "Address", info: "Defaults to your store address." },
      { type: "textarea", id: "hours", label: "Hours", default: "Saturday – Thursday · 11am – 8pm\nFriday · by appointment only" },
      { type: "text", id: "phone", label: "Phone", info: "Defaults to your store phone." },
      { type: "text", id: "whatsapp", label: "WhatsApp number", info: "Defaults to the WhatsApp social link, then the store phone." },
      { type: "text", id: "whatsapp_message", label: "WhatsApp message", default: "Hello, I'd like to book a private viewing at the atelier." },
      { type: "header", label: "Button" },
      {
        type: "select",
        id: "action",
        label: "Primary action",
        default: "whatsapp",
        options: [
          { value: "whatsapp", label: "Open WhatsApp" },
          { value: "email", label: "Send an email" },
          { value: "link", label: "Go to a page" },
        ],
      },
      { type: "text", id: "button_label", label: "Button label", default: "Book via WhatsApp" },
      { type: "url", id: "button_link", label: "Page link", default: "/pages/contact", info: "Used when the action is “Go to a page”, and as the secondary link." },
      { type: "text", id: "secondary_label", label: "Secondary link label", default: "Or write to us" },
      schemeField("default"),
      paddingField("large"),
    ],
    presets: [{ name: "Book an appointment" }, { name: "Book an appointment — dark", settings: { color_scheme: "inverse", image_position: "right" } }],
  },
  component: ({ settings: s, context }) => {
    const store = context.store;
    const address = str(s.address) || store.address || "";
    const hours = str(s.hours)
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
    const phone = str(s.phone) || store.phone || "";
    const wa = str(s.whatsapp) || str(context.theme.social_whatsapp) || phone;
    const page = resolveHref(context, s.button_link, "/pages/contact");
    const action = str(s.action, "whatsapp");
    const primary =
      action === "whatsapp" && wa
        ? whatsappHref(wa, str(s.whatsapp_message))
        : action === "email" && store.email
          ? `mailto:${store.email}?subject=${encodeURIComponent("Private viewing request")}`
          : page;
    const right = s.image_position === "right";
    const image = str(s.image);

    return (
      <Section settings={s} ariaLabel={str(s.heading) || "Book an appointment"} className="lumiere-appointment">
        <div className={cn("grid items-stretch gap-0 md:grid-cols-2", !image && "md:grid-cols-1")}>
          {image ? (
            <div className={cn("relative min-h-[360px] overflow-hidden bg-pai-card md:min-h-[640px]", right && "md:order-2")}>
              <img src={image} alt={str(s.image_alt)} loading="lazy" decoding="async" className="lumiere-slowzoom absolute inset-0 size-full object-cover" />
            </div>
          ) : null}
          <div className="flex items-center bg-pai-card p-3 md:p-5">
            <div className="lumiere-double-frame flex h-full w-full flex-col justify-center px-7 py-12 md:px-14 md:py-16">
              <Eyebrow align="left">{str(s.eyebrow)}</Eyebrow>
              {str(s.heading) ? <h2 className="pai-h2 lumiere-display-2 max-w-lg">{str(s.heading)}</h2> : null}
              {str(s.text) ? <p className="mt-5 max-w-md leading-[1.8] opacity-70">{str(s.text)}</p> : null}
              <dl className="mt-10 grid gap-6 border-t border-[var(--lumiere-rule)] pt-8 text-[0.92rem] sm:grid-cols-2">
                {address ? (
                  <div>
                    <dt className="lumiere-label">The atelier</dt>
                    <dd className="mt-2 whitespace-pre-line font-heading text-lg leading-snug">{address}</dd>
                  </div>
                ) : null}
                {hours.length ? (
                  <div>
                    <dt className="lumiere-label">Hours</dt>
                    <dd className="mt-2 space-y-0.5 opacity-80">
                      {hours.map((h) => (
                        <span key={h} className="block">
                          {h}
                        </span>
                      ))}
                    </dd>
                  </div>
                ) : null}
                {phone ? (
                  <div>
                    <dt className="lumiere-label">Telephone</dt>
                    <dd className="mt-2">
                      <a href={`tel:${phone}`} className="lumiere-underline">{phone}</a>
                    </dd>
                  </div>
                ) : null}
                {store.email ? (
                  <div>
                    <dt className="lumiere-label">Email</dt>
                    <dd className="mt-2 break-all">
                      <a href={`mailto:${store.email}`} className="lumiere-underline">{store.email}</a>
                    </dd>
                  </div>
                ) : null}
              </dl>
              <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
                {str(s.button_label) && primary ? (
                  <SmartLink href={primary} className="pai-btn pai-btn-primary pai-btn-lg">
                    {str(s.button_label)}
                  </SmartLink>
                ) : null}
                {str(s.secondary_label) && page && primary !== page ? (
                  <SmartLink href={page} className="lumiere-textlink">
                    {str(s.secondary_label)}
                  </SmartLink>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </Section>
    );
  },
});
