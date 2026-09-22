/**
 * Playhouse product page: the kit "main-product" plus two theme blocks —
 *  - `age_safety`: the product's age range (from tags/title/options) and colourful safety chips;
 *  - `gift_note`: a friendly gift-wrap / delivery note.
 */
import type { BlockSchema, SectionDefinition } from "@pai/theme-sdk";
import { Gift } from "lucide-react";
import { Icon, ICON_OPTIONS, bool, extendMainProduct, str, type ProductBlockProps } from "@pai/theme-kit";
import { ageBadge, funAt, tint } from "./_playhouse";

const ageSafetyBlock: BlockSchema = {
  type: "age_safety",
  name: "Age & safety",
  limit: 1,
  settings: [
    { type: "checkbox", id: "show_age", label: "Show recommended age", default: true },
    { type: "text", id: "age_fallback", label: "Age when unknown", default: "", info: "Shown when the product has no age tag, e.g. “All ages”. Leave empty to hide." },
    { type: "select", id: "icon_1", label: "Chip 1 icon", default: "leaf", options: ICON_OPTIONS },
    { type: "text", id: "text_1", label: "Chip 1 text", default: "Non-toxic materials" },
    { type: "select", id: "icon_2", label: "Chip 2 icon", default: "shield-check", options: ICON_OPTIONS },
    { type: "text", id: "text_2", label: "Chip 2 text", default: "Safety checked" },
    { type: "select", id: "icon_3", label: "Chip 3 icon", default: "banknote", options: ICON_OPTIONS },
    { type: "text", id: "text_3", label: "Chip 3 text", default: "Cash on delivery" },
    { type: "text", id: "hide_for_tag", label: "Hide safety chips for tag", default: "", info: "E.g. “dog” to hide them on pet products. Leave empty to always show." },
  ],
};

function AgeSafety({ block, product }: ProductBlockProps) {
  const s = block.settings;
  const age = bool(s.show_age, true) ? (ageBadge(product) ?? (str(s.age_fallback) || null)) : null;
  const hideTag = str(s.hide_for_tag).toLowerCase().trim();
  const hideChips = hideTag ? product.tags.some((t) => t.toLowerCase() === hideTag) : false;
  const chips = hideChips
    ? []
    : [1, 2, 3].map((n) => ({ icon: str(s[`icon_${n}`], "star"), text: str(s[`text_${n}`]) })).filter((c) => c.text);
  if (!age && !chips.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {age ? (
        <span className="inline-flex items-center gap-2 rounded-full bg-pai-fg py-1.5 pl-1.5 pr-3.5 text-sm font-bold text-pai-bg">
          <span className="grid size-6 place-items-center rounded-full bg-[var(--ph-c1)] text-xs text-pai-fg" aria-hidden>
            ★
          </span>
          Ages {age}
        </span>
      ) : null}
      {chips.map((c, i) => (
        <span key={i} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold" style={{ background: tint(funAt(i + 2), 40) }}>
          <Icon name={c.icon} className="size-4" />
          {c.text}
        </span>
      ))}
    </div>
  );
}

const giftNoteBlock: BlockSchema = {
  type: "gift_note",
  name: "Gift note",
  limit: 1,
  settings: [
    { type: "text", id: "heading", label: "Heading", default: "Free gift wrapping" },
    { type: "textarea", id: "text", label: "Text", default: "Add a note at checkout and we'll wrap it in playful paper with a handwritten card — at no extra cost." },
  ],
};

function GiftNote({ block }: ProductBlockProps) {
  const heading = str(block.settings.heading);
  const text = str(block.settings.text);
  if (!heading && !text) return null;
  return (
    <div className="flex gap-3 rounded-[20px] border-2 border-dashed p-4" style={{ borderColor: "var(--ph-c2)", background: tint("var(--ph-c2)", 14) }}>
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--ph-c2)] text-pai-fg" aria-hidden>
        <Gift className="size-5" />
      </span>
      <div className="text-sm">
        {heading ? <p className="font-heading text-base font-semibold">{heading}</p> : null}
        {text ? <p className="opacity-80">{text}</p> : null}
      </div>
    </div>
  );
}

export function playhouseMainProduct(base: SectionDefinition<any>): SectionDefinition<any> {
  return extendMainProduct(
    [
      { schema: ageSafetyBlock, component: AgeSafety },
      { schema: giftNoteBlock, component: GiftNote },
    ],
    base,
  );
}
