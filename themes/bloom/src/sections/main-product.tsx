/**
 * Bloom's product page: the kit's "main-product" plus two beauty blocks —
 *  - `skin_profile`: "Best for" skin-type chips + key ingredient pills
 *  - `how_to_use`: numbered application steps
 */
import type { BlockSchema, SectionDefinition } from "@pai/theme-sdk";
import { extendMainProduct, str, type ProductBlockProps } from "@pai/theme-kit";

const splitList = (v: unknown) =>
  str(v)
    .split(/[,\n]/)
    .map((x) => x.trim())
    .filter(Boolean);

export const skinProfileBlock: BlockSchema = {
  type: "skin_profile",
  name: "Skin profile",
  limit: 1,
  settings: [
    { type: "text", id: "skin_label", label: "Skin types label", default: "Best for" },
    { type: "text", id: "skin_types", label: "Skin types", default: "All skin types", info: "Comma separated. Products tagged “oily”, “dry”, “sensitive”… are added automatically." },
    { type: "text", id: "ingredients_label", label: "Ingredients label", default: "Key ingredients" },
    { type: "text", id: "ingredients", label: "Key ingredients", default: "", info: "Comma separated, e.g. Vitamin C, Niacinamide." },
    { type: "text", id: "badges", label: "Free-from badges", default: "Cruelty-free, Paraben-free, Dermatologist tested" },
  ],
};

const SKIN_TAGS: Record<string, string> = { oily: "Oily", dry: "Dry", sensitive: "Sensitive", combination: "Combination", normal: "Normal", "acne-prone": "Acne-prone", mature: "Mature" };

export function SkinProfile({ block, product }: ProductBlockProps) {
  const s = block.settings;
  const fromTags = product.tags.map((t) => SKIN_TAGS[t.toLowerCase()]).filter((x): x is string => !!x);
  const skin = [...new Set([...fromTags, ...splitList(s.skin_types)])];
  const ingredients = splitList(s.ingredients);
  const badges = splitList(s.badges);
  if (!skin.length && !ingredients.length && !badges.length) return null;
  return (
    <div className="space-y-4 rounded-pai bg-pai-muted p-5">
      {skin.length ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] opacity-70">{str(s.skin_label, "Best for")}</p>
          <ul className="flex flex-wrap gap-2">
            {skin.map((x) => (
              <li key={x} className="rounded-full bg-pai-bg px-3 py-1 text-sm">
                {x}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {ingredients.length ? (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] opacity-70">{str(s.ingredients_label, "Key ingredients")}</p>
          <ul className="flex flex-wrap gap-2">
            {ingredients.map((x) => (
              <li key={x} className="rounded-full border border-pai-accent/40 px-3 py-1 text-sm text-pai-fg">
                {x}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {badges.length ? (
        <ul className="flex flex-wrap gap-x-5 gap-y-1 border-t border-pai-border pt-3 text-xs opacity-75">
          {badges.map((x) => (
            <li key={x} className="inline-flex items-center gap-1.5">
              <span aria-hidden className="text-pai-accent">✿</span>
              {x}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export const howToUseBlock: BlockSchema = {
  type: "how_to_use",
  name: "How to use",
  limit: 1,
  settings: [
    { type: "text", id: "heading", label: "Heading", default: "How to use" },
    { type: "textarea", id: "steps", label: "Steps", default: "Cleanse and pat skin dry.\nApply 2–3 drops to face and neck.\nFollow with moisturiser — and SPF in the morning.", info: "One step per line." },
  ],
};

export function HowToUse({ block }: ProductBlockProps) {
  const steps = str(block.settings.steps)
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
  if (!steps.length) return null;
  return (
    <div>
      <p className="mb-3 font-heading text-lg">{str(block.settings.heading, "How to use")}</p>
      <ol className="space-y-2.5">
        {steps.map((x, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-pai-accent/15 text-xs font-semibold text-pai-accent">{i + 1}</span>
            <span className="pt-0.5 opacity-85">{x}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function bloomMainProduct(base: SectionDefinition<any>): SectionDefinition<any> {
  return extendMainProduct(
    [
      { schema: skinProfileBlock, component: SkinProfile },
      { schema: howToUseBlock, component: HowToUse },
    ],
    base,
  );
}
