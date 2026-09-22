/**
 * Savor "Opening hours & location": a weekly hours table (today highlighted, live open/closed
 * status), address, phone and WhatsApp, and a map card (an image linking to Google Maps).
 * Blocks = one row per day or day range; no blocks → the hours from Theme settings › Restaurant.
 */
import { defineSection } from "@pai/theme-sdk";
import { Clock, MapPin, MessageCircle, Navigation, Phone } from "lucide-react";
import { Section, cn, headingFields, paddingField, schemeField, str, bool } from "@pai/theme-kit";
import { HoursTable, OpenStatus } from "../client/open-status";
import { DAYS, closedDaySet, dayIndex, hoursRange, parseTime, type DayHours } from "../lib/hours";
import { restaurantInfo } from "../lib/info";
import { IMG } from "../images";

export const savorHours = defineSection({
  schema: {
    type: "savor-hours",
    name: "Opening hours & location",
    category: "content",
    icon: "clock",
    description: "Weekly hours with a live open/closed badge, address, phone and a map link.",
    settings: [
      ...headingFields({ eyebrow: "Visit or order", heading: "Find us in Banani", subheading: "Dine in by the window, pick up on your way home, or let our riders bring it to you.", align: "left" }),
      { type: "image", id: "image", label: "Map or storefront image", default: IMG.interiorWarm },
      { type: "url", id: "map_link", label: "Google Maps link", info: "Defaults to Theme settings › Restaurant › Google Maps link, or a search for your address." },
      { type: "text", id: "map_label", label: "Map button label", default: "Get directions" },
      { type: "textarea", id: "address", label: "Address", info: "Defaults to your store address." },
      { type: "text", id: "note", label: "Note under the hours", default: "" },
      { type: "checkbox", id: "show_contact", label: "Show phone & WhatsApp", default: true },
      {
        type: "select",
        id: "image_position",
        label: "Image position",
        default: "right",
        options: [
          { value: "left", label: "Left" },
          { value: "right", label: "Right" },
        ],
      },
      schemeField(),
      paddingField(),
    ],
    blocks: [
      {
        type: "day",
        name: "Day / hours row",
        settings: [
          { type: "text", id: "label", label: "Day(s)", default: "Saturday", info: "A day name (highlighted when it's today) or a range like “Sat – Thu”." },
          { type: "text", id: "open", label: "Opens", default: "11:00" },
          { type: "text", id: "close", label: "Closes", default: "23:00" },
          { type: "checkbox", id: "closed", label: "Closed this day", default: false },
        ],
      },
    ],
    maxBlocks: 10,
    presets: [{ name: "Opening hours & location" }],
  },
  component: ({ settings: s, blocks, context }) => {
    const info = restaurantInfo(context);
    let rows: { day: number | null; label: string; hours: string; closed: boolean }[];
    let week: DayHours[];
    if (blocks.length) {
      rows = blocks.map((b) => {
        const label = str(b.settings.label, "Day");
        const single = /^[a-z]+$/i.test(label.trim()) ? dayIndex(label) : -1;
        return { day: single >= 0 ? single : null, label, hours: hoursRange(b.settings.open, b.settings.close), closed: bool(b.settings.closed) };
      });
      week = blocks
        .map((b) => {
          const d = dayIndex(str(b.settings.label));
          return /^[a-z]+$/i.test(str(b.settings.label).trim()) && d >= 0 ? { day: d, open: parseTime(b.settings.open), close: parseTime(b.settings.close), closed: bool(b.settings.closed) } : null;
        })
        .filter((x): x is DayHours => !!x);
      if (week.length < 7) week = info.week; // ranges → fall back to global hours for the live badge
    } else {
      const closed = closedDaySet(context.theme.closed_days);
      rows = info.week.length ? DAYS.map((d, day) => ({ day, label: d, hours: info.todayRange, closed: closed.has(day) })) : [];
      week = info.week;
    }
    const address = str(s.address) || info.address;
    const mapHref = str(s.map_link) || info.mapsHref;
    const image = str(s.image);
    if (!rows.length && !address && !image) return null;
    const imgLeft = s.image_position === "left";

    return (
      <Section settings={s} ariaLabel={str(s.heading) || "Opening hours"} className="savor-hours">
        <div className={cn("grid items-stretch gap-8 lg:grid-cols-2 lg:gap-14")}>
          <div className={cn("flex flex-col", imgLeft && "lg:order-2")}>
            {str(s.eyebrow) ? <p className="savor-eyebrow mb-3 text-pai-primary">{str(s.eyebrow)}</p> : null}
            {str(s.heading) ? <h2 className="pai-h2">{str(s.heading)}</h2> : null}
            {str(s.subheading) ? <p className="mt-3 max-w-lg opacity-75 md:text-lg">{str(s.subheading)}</p> : null}
            {week.length ? (
              <p className="mt-6 inline-flex w-fit items-center gap-2 rounded-full border border-pai-border px-4 py-2 text-sm">
                <Clock className="size-4 opacity-70" aria-hidden />
                <OpenStatus week={week} timeZone={info.timeZone} fallback={`Today ${info.todayRange}`} />
              </p>
            ) : null}
            {rows.length ? (
              <div className="savor-hours-card mt-6 rounded-pai border border-pai-border bg-pai-card p-5 md:p-6">
                <HoursTable rows={rows} timeZone={info.timeZone} />
                {str(s.note) || info.hoursNote ? <p className="mt-3 text-xs opacity-65">{str(s.note) || info.hoursNote}</p> : null}
              </div>
            ) : null}
            <div className="mt-6 space-y-3 text-[0.95rem]">
              {address ? (
                <p className="flex gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-pai-primary" aria-hidden />
                  <span>{address}</span>
                </p>
              ) : null}
              {bool(s.show_contact, true) && (info.phone || info.whatsapp) ? (
                <div className="flex flex-wrap gap-3 pt-1">
                  {info.phone ? (
                    <a href={info.phoneHref} className="pai-btn pai-btn-primary pai-btn-sm">
                      <Phone className="size-4" aria-hidden /> {info.phone}
                    </a>
                  ) : null}
                  {info.whatsapp ? (
                    <a href={info.whatsapp} target="_blank" rel="noopener noreferrer" className="pai-btn pai-btn-outline pai-btn-sm">
                      <MessageCircle className="size-4" aria-hidden /> WhatsApp us
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
          {image || mapHref ? (
            <div className={cn("relative min-h-[320px] overflow-hidden rounded-pai bg-pai-muted", imgLeft && "lg:order-1")}>
              {image ? <img src={image} alt={`${context.store.name} — restaurant`} loading="lazy" className="absolute inset-0 size-full object-cover" /> : null}
              <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              {mapHref ? (
                <a
                  href={mapHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3 rounded-pai bg-pai-bg/95 p-4 text-pai-fg shadow-xl backdrop-blur transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pai-primary sm:right-auto sm:min-w-80"
                >
                  <span className="min-w-0">
                    <span className="block font-heading text-lg font-semibold">{context.store.name}</span>
                    {address ? <span className="block truncate text-sm opacity-70">{address}</span> : null}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-pai-primary px-3 py-2 text-xs font-semibold text-pai-primary-fg">
                    <Navigation className="size-3.5" aria-hidden /> {str(s.map_label, "Get directions")}
                  </span>
                </a>
              ) : null}
            </div>
          ) : null}
        </div>
      </Section>
    );
  },
});
