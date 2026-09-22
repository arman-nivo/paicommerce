import { defineSection } from "@pai/theme-sdk";
import { ButtonLink, Container, Icon, cn, resolveHref, str } from "@pai/theme-kit";
import { FileUp, MessageCircle } from "lucide-react";
import { IMG } from "../images";
import { HEALTH_ICONS, padOf, whatsappHref } from "../components/utils";

export const pulseRxUpload = defineSection({
  schema: {
    type: "rx-upload",
    name: "Prescription upload",
    category: "marketing",
    icon: "file-up",
    limit: 1,
    description: "“Order with a prescription” call to action: steps, WhatsApp upload and a contact-page option.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "Prescription orders" },
      { type: "text", id: "heading", label: "Heading", default: "Have a prescription? We'll do the rest." },
      { type: "textarea", id: "text", label: "Text", default: "Send a clear photo of your prescription. Our pharmacist checks it, confirms availability and price by phone, and we deliver — cash on delivery." },
      { type: "header", label: "WhatsApp button" },
      { type: "text", id: "whatsapp_label", label: "Label", default: "Send on WhatsApp" },
      { type: "text", id: "whatsapp", label: "WhatsApp number", info: "Defaults to the theme WhatsApp setting, then your store phone." },
      { type: "textarea", id: "whatsapp_message", label: "Pre-filled message", default: "Hello {store}, I'd like to order the medicines on my prescription (photo attached)." },
      { type: "header", label: "Second button" },
      { type: "text", id: "button_label", label: "Label", default: "Upload via contact form" },
      { type: "url", id: "button_link", label: "Link", default: "/pages/contact" },
      { type: "text", id: "note", label: "Small print", default: "Accepted: photo or PDF of a prescription from a registered physician. Your data stays private." },
      { type: "header", label: "Design" },
      { type: "image", id: "image", label: "Image", default: IMG.doctorPhone },
      { type: "text", id: "image_alt", label: "Image description (alt text)", default: "Doctor holding a smartphone" },
      {
        type: "select",
        id: "style",
        label: "Style",
        default: "primary",
        options: [
          { value: "primary", label: "Brand colour panel" },
          { value: "muted", label: "Soft panel" },
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
        type: "step",
        name: "Step",
        limit: 4,
        settings: [
          { type: "select", id: "icon", label: "Icon", default: "file-up", options: [{ value: "file-up", label: "Upload" }, ...HEALTH_ICONS] },
          { type: "text", id: "title", label: "Title", default: "Upload" },
          { type: "text", id: "text", label: "Text", default: "Snap a photo of your prescription" },
        ],
      },
    ],
    maxBlocks: 4,
    presets: [
      {
        name: "Prescription upload",
        blocks: [
          { type: "step", settings: { icon: "file-up", title: "Upload", text: "Snap a photo of your prescription" } },
          { type: "step", settings: { icon: "badge-check", title: "Pharmacist verifies", text: "We confirm medicines & price" } },
          { type: "step", settings: { icon: "truck", title: "Delivered", text: "To your door, pay on delivery" } },
        ],
      },
    ],
  },
  component: ({ settings: s, blocks, context }) => {
    const wa = whatsappHref(context, s.whatsapp, str(s.whatsapp_message));
    const second = str(s.button_label) ? resolveHref(context, s.button_link, "/pages/contact") : "";
    const steps = blocks.filter((b) => b.type === "step");
    const brand = s.style !== "muted";
    const image = str(s.image);
    return (
      <section id="prescription" aria-label={str(s.heading) || "Prescription orders"} className="pai-section scroll-mt-40" style={{ ["--pai-section-pad" as string]: padOf(s.padding) }}>
        <Container>
          <div
            className={cn(
              "relative grid overflow-hidden rounded-[calc(var(--pai-radius)*2)] lg:grid-cols-[1.25fr_1fr]",
              brand ? "bg-pai-primary text-pai-primary-fg" : "border border-pai-border bg-pai-muted",
            )}
          >
            <div aria-hidden className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex flex-col gap-5 p-6 sm:p-10 lg:p-12">
              {str(s.eyebrow) ? (
                <p className={cn("inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold", brand ? "bg-white/15" : "bg-pai-primary/10 text-pai-primary")}>
                  <FileUp className="size-3.5" aria-hidden /> {str(s.eyebrow)}
                </p>
              ) : null}
              {str(s.heading) ? <h2 className="pai-h2 [text-wrap:balance]">{str(s.heading)}</h2> : null}
              {str(s.text) ? <p className="max-w-xl opacity-85">{str(s.text)}</p> : null}
              {steps.length ? (
                <ol className="grid gap-3 sm:grid-cols-3">
                  {steps.map((b, i) => (
                    <li key={b.id} className={cn("relative rounded-pai p-4", brand ? "bg-white/10 ring-1 ring-white/15" : "bg-pai-bg ring-1 ring-pai-border")}>
                      <span className={cn("absolute right-3 top-3 font-heading text-xs font-bold opacity-50")} aria-hidden>
                        0{i + 1}
                      </span>
                      <Icon name={str(b.settings.icon, "file-up")} className="mb-3 size-6" />
                      <p className="font-semibold leading-tight">
                        <span className="sr-only">Step {i + 1}: </span>
                        {str(b.settings.title)}
                      </p>
                      {str(b.settings.text) ? <p className="mt-1 text-sm opacity-75">{str(b.settings.text)}</p> : null}
                    </li>
                  ))}
                </ol>
              ) : null}
              <div className="flex flex-wrap gap-3 pt-1">
                {wa ? (
                  <a href={wa} target="_blank" rel="noopener noreferrer" className={cn("pai-btn pai-btn-lg", brand ? "pai-btn-light" : "pai-btn-primary")}>
                    <MessageCircle className="size-5" aria-hidden /> {str(s.whatsapp_label, "Send on WhatsApp")}
                  </a>
                ) : null}
                {second ? (
                  <ButtonLink href={second} variant="secondary" size="lg" className={brand ? "!border-white/60 !text-white hover:!bg-white hover:!text-pai-primary" : ""}>
                    {str(s.button_label)}
                  </ButtonLink>
                ) : null}
              </div>
              {str(s.note) ? <p className="text-xs opacity-70">{str(s.note)}</p> : null}
            </div>
            {image ? (
              <div className="relative min-h-[260px] lg:min-h-full">
                <img src={image} alt={str(s.image_alt)} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover" />
                <div className={cn("absolute inset-0", brand ? "bg-gradient-to-r from-pai-primary via-pai-primary/20 to-transparent max-lg:bg-gradient-to-b" : "")} />
              </div>
            ) : null}
          </div>
        </Container>
      </section>
    );
  },
});
