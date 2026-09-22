/**
 * Savor's product page: the kit "main-product" section plus two food blocks —
 * `dish_facts` (serves, prep time, spice level, dietary tags) and `order_hours` (live open/closed
 * status with today's hours and a WhatsApp link, so guests know when their food will arrive).
 */
import type { BlockSchema, SectionDefinition } from "@pai/theme-sdk";
import { Clock, Flame, MessageCircle, Timer, Users } from "lucide-react";
import { extendMainProduct, str, type ProductBlockProps } from "@pai/theme-kit";
import { OpenStatus } from "../client/open-status";
import { restaurantInfo } from "../lib/info";
import { dishTags } from "./card";

const dishFactsBlock: BlockSchema = {
  type: "dish_facts",
  name: "Dish facts",
  limit: 1,
  settings: [
    { type: "text", id: "serves", label: "Serves", default: "", info: "E.g. “1–2 people”. Leave empty to hide." },
    { type: "text", id: "prep", label: "Ready in", default: "25–35 min" },
    {
      type: "select",
      id: "spice",
      label: "Spice level",
      default: "auto",
      options: [
        { value: "auto", label: "From product tags (spicy)" },
        { value: "0", label: "Hide" },
        { value: "1", label: "Mild" },
        { value: "2", label: "Medium" },
        { value: "3", label: "Hot" },
      ],
    },
    { type: "checkbox", id: "show_tags", label: "Show dietary tags", default: true },
  ],
};

const orderHoursBlock: BlockSchema = {
  type: "order_hours",
  name: "Kitchen hours",
  limit: 1,
  settings: [{ type: "text", id: "text", label: "Text", default: "Cooked fresh when you order · delivered hot" }],
};

function DishFacts({ block, product }: ProductBlockProps) {
  const s = block.settings;
  const tags = s.show_tags === false ? [] : dishTags(product);
  const spicyTag = product.tags.some((t) => /spicy|hot/i.test(t));
  const spice = str(s.spice, "auto") === "auto" ? (spicyTag ? 3 : 0) : Number(s.spice) || 0;
  const facts = [
    str(s.serves) ? { icon: Users, label: "Serves", value: str(s.serves) } : null,
    str(s.prep) ? { icon: Timer, label: "Ready in", value: str(s.prep) } : null,
    spice ? { icon: Flame, label: "Spice", value: ["", "Mild", "Medium", "Hot"][spice] ?? "" } : null,
  ].filter((f): f is NonNullable<typeof f> => !!f);
  if (!facts.length && !tags.length) return null;
  return (
    <div className="space-y-3">
      {facts.length ? (
        <dl className={`grid gap-2 rounded-pai border border-dashed border-pai-border p-3 text-sm ${facts.length === 3 ? "grid-cols-3" : facts.length === 2 ? "grid-cols-2" : "w-fit grid-cols-1 pr-6"}`}>
          {facts.map((f) => (
            <div key={f.label} className="flex items-center gap-2">
              <f.icon className="size-4 shrink-0 text-pai-primary" aria-hidden />
              <div className="min-w-0">
                <dt className="text-[10px] uppercase tracking-[0.14em] opacity-60">{f.label}</dt>
                <dd className="truncate font-semibold">{f.value}</dd>
              </div>
            </div>
          ))}
        </dl>
      ) : null}
      {tags.length ? (
        <ul className="flex flex-wrap gap-1.5" aria-label="Dietary information">
          {tags.map((t) => (
            <li key={t.label} className={`savor-tag savor-tag-${t.tone} rounded-full px-2.5 py-1 text-xs font-semibold`}>
              {t.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function OrderHours({ block, context }: ProductBlockProps) {
  const info = restaurantInfo(context);
  if (!info.week.length && !info.whatsapp) return null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-pai bg-pai-muted px-4 py-3 text-sm">
      <div className="flex items-start gap-2.5">
        <Clock className="mt-0.5 size-4 shrink-0 opacity-70" aria-hidden />
        <div>
          {info.week.length ? <OpenStatus week={info.week} timeZone={info.timeZone} fallback={`Today ${info.todayRange}`} /> : null}
          {str(block.settings.text) ? <p className="text-xs opacity-70">{str(block.settings.text)}</p> : null}
        </div>
      </div>
      {info.whatsapp ? (
        <a href={info.whatsapp} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold underline-offset-4 hover:underline">
          <MessageCircle className="size-4" aria-hidden /> Ask on WhatsApp
        </a>
      ) : null}
    </div>
  );
}

export function savorMainProduct(base: SectionDefinition<any>): SectionDefinition<any> {
  return extendMainProduct(
    [
      { schema: dishFactsBlock, component: DishFacts },
      { schema: orderHoursBlock, component: OrderHours },
    ],
    base,
  );
}
