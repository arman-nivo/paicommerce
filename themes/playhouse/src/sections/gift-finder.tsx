/**
 * Gift finder: an interactive island — pick who (kid / baby / pet), age or pet type and a budget,
 * and see matching products instantly, with a "See all" link to the collection filtered by price.
 * Product pools come from the collections picked in the settings (falling back to best sellers).
 */
import { defineSection, type SfProduct, type StorefrontContext } from "@pai/theme-sdk";
import { SAMPLE_PRODUCTS, Section, SectionHeading, bool, headingFields, num, paddingField, str } from "@pai/theme-kit";
import { GiftFinder, type FinderItem, type FinderPool } from "../client/gift-finder";
import { Blob, Sparkle, ageBadge, backgroundField, backgroundStyle } from "./_playhouse";

/** Age range in months from the Playhouse age badge ("3+ yrs", "2–7 yrs", "0–12m", "Newborn", "Baby"). */
function monthsOf(p: SfProduct): [number, number] | null {
  const badge = ageBadge(p);
  if (!badge) return null;
  if (badge === "Newborn") return [0, 3];
  if (badge === "Baby") return [0, 24];
  const plus = badge.match(/^(\d+)\+\s*(m|yrs)$/);
  if (plus) return [Number(plus[1]) * (plus[2] === "m" ? 1 : 12), 999];
  const r = badge.match(/^(\d+)(?:–(\d+))?\s*(m|yrs)$/);
  if (r) {
    const k = r[3] === "m" ? 1 : 12;
    const lo = Number(r[1]) * k;
    const hi = (r[2] ? Number(r[2]) : Number(r[1])) * k + (k === 12 ? 11 : 0);
    return [lo, hi];
  }
  return null;
}

function toItem(p: SfProduct): FinderItem {
  return {
    id: p.id,
    title: p.title,
    url: p.url,
    image: p.featuredImage?.url ?? p.images[0]?.url ?? null,
    price: p.price,
    compareAt: p.compareAtPrice,
    months: monthsOf(p),
    keywords: [...p.tags, p.title, p.productType ?? ""].join(" ").toLowerCase(),
  };
}

async function loadPool(context: StorefrontContext, slug: string, limit: number): Promise<{ items: SfProduct[]; url: string }> {
  if (slug) {
    const [r, c] = await Promise.all([context.data.getProducts({ collection: slug, limit, sort: "best-selling" }).catch(() => null), context.data.getCollection(slug).catch(() => null)]);
    if (r?.items.length) return { items: r.items, url: c?.url ?? context.url(`/collections/${slug}`) };
  }
  return { items: [], url: context.url("/collections/all") };
}

export const giftFinder = defineSection({
  schema: {
    type: "gift-finder",
    name: "Gift finder",
    category: "marketing",
    icon: "gift",
    description: "Interactive quiz: who is it for, how old, what budget — with instant product ideas.",
    settings: [
      ...headingFields({ eyebrow: "Gift finder", heading: "Find the perfect present in 10 seconds", subheading: "Tell us who it's for and we'll pick out gifts they'll love — wrapped for free.", align: "left" }),
      {
        type: "select",
        id: "default_who",
        label: "Start with",
        default: "kid",
        options: [
          { value: "kid", label: "Kid" },
          { value: "baby", label: "Baby" },
          { value: "pet", label: "Pet" },
        ],
      },
      { type: "header", label: "Product pools", info: "Each answer searches this collection. Empty = best sellers." },
      { type: "text", id: "kid_label", label: "Kid label", default: "A kid" },
      { type: "collection", id: "kid_collection", label: "Kid collection" },
      { type: "text", id: "baby_label", label: "Baby label", default: "A baby" },
      { type: "collection", id: "baby_collection", label: "Baby collection" },
      { type: "checkbox", id: "show_pet", label: "Include pets", default: true },
      { type: "text", id: "pet_label", label: "Pet label", default: "A pet" },
      { type: "collection", id: "pet_collection", label: "Pet collection" },
      { type: "header", label: "Results" },
      { type: "text", id: "budgets", label: "Budget steps (৳)", default: "500, 1500, 3000", info: "Comma-separated amounts in taka, lowest first." },
      { type: "checkbox", id: "show_products", label: "Show matching products", default: true },
      { type: "range", id: "limit", label: "Products shown", min: 2, max: 8, step: 2, default: 4 },
      backgroundField("sky"),
      paddingField(),
    ],
    presets: [{ name: "Gift finder" }],
  },
  component: async ({ settings: s, context }) => {
    const size = 40;
    const kidSlug = str(s.kid_collection);
    const babySlug = str(s.baby_collection);
    const petSlug = str(s.pet_collection);
    const showPet = bool(s.show_pet, true);
    const [kid, baby, pet, best] = await Promise.all([
      loadPool(context, kidSlug, size),
      loadPool(context, babySlug, size),
      showPet ? loadPool(context, petSlug, size) : Promise.resolve(null),
      context.data.getProducts({ sort: "best-selling", limit: 60 }).catch(() => null),
    ]);
    let all = best?.items ?? [];
    if (!all.length && context.isPreview) all = SAMPLE_PRODUCTS;
    const isPet = (p: SfProduct) => /\b(dog|cat|puppy|kitten|pet)\b/i.test([...p.tags, p.title, p.productType ?? ""].join(" "));
    const isBaby = (p: SfProduct) => /\b(baby|newborn|infant)\b/i.test([...p.tags, p.title, p.productType ?? ""].join(" "));
    const fallbackUrl = context.url("/collections/all");

    const pools: FinderPool[] = [
      {
        key: "kid",
        label: str(s.kid_label, "A kid"),
        emoji: "🧒",
        url: kid.items.length ? kid.url : fallbackUrl,
        items: (kid.items.length ? kid.items : all.filter((p) => !isPet(p) && !isBaby(p))).map(toItem),
      },
      {
        key: "baby",
        label: str(s.baby_label, "A baby"),
        emoji: "👶",
        url: baby.items.length ? baby.url : context.url("/search?q=baby"),
        items: (baby.items.length ? baby.items : all.filter(isBaby)).map(toItem),
      },
    ];
    if (pet) {
      pools.push({
        key: "pet",
        label: str(s.pet_label, "A pet"),
        emoji: "🐾",
        url: pet.items.length ? pet.url : context.url("/search?q=pet"),
        items: (pet.items.length ? pet.items : all.filter(isPet)).map(toItem),
      });
    }
    const usable = pools.filter((p) => p.items.length);
    if (!usable.length) return null;
    const budgets = str(s.budgets, "500, 1500, 3000")
      .split(",")
      .map((v) => parseFloat(v.replace(/[^0-9.]/g, "")))
      .filter((n) => Number.isFinite(n) && n > 0);

    return (
      <Section settings={s} ariaLabel={str(s.heading) || "Gift finder"} style={backgroundStyle(s.background, 26)} className="relative isolate overflow-hidden">
        <Blob variant={2} color="white" className="absolute -right-24 -top-24 -z-10 size-80 opacity-50" />
        <Blob variant={0} color="white" className="absolute -bottom-28 -left-24 -z-10 size-72 opacity-40" />
        <Sparkle className="ph-float absolute right-[12%] top-10 -z-10 size-7" color="var(--ph-c4)" />
        <SectionHeading eyebrow={str(s.eyebrow)} title={str(s.heading)} subtitle={str(s.subheading)} align={s.heading_align === "center" ? "center" : "left"} />
        <GiftFinder pools={usable} budgets={budgets} defaultWho={str(s.default_who, "kid")} limit={num(s.limit, 4)} showProducts={bool(s.show_products, true)} />
      </Section>
    );
  },
});
