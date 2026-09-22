/**
 * Book helpers shared by Folio's card, sections and product page.
 *
 * Many bookstores keep the author in the product title ("Atomic Habits — James Clear") while
 * `vendor` holds the publisher or the store's own name. `bookMeta` reads the author from the vendor
 * when it looks like a real author, otherwise from the title suffix after an em/en dash, and
 * returns the title without that suffix. It also works out a short "format" hint and whether the
 * product is digital (eBook, online course … or tagged `digital`).
 */
import type { SfProduct, StorefrontContext } from "@pai/theme-sdk";

const DASH_SPLIT = /\s+[—–]\s+/;
const FORMAT_OPTION = /^(format|formats|edition|binding|type|version)$/i;
const DEFAULT_DIGITAL_TYPES = ["ebook", "e-book", "online course", "course", "audiobook", "digital", "digital download", "pdf"];
const BOOKISH_TYPES = /book|novel|bundle|comic|manga|poetry|textbook|magazine/i;

export type BookMeta = {
  /** Title without the " — Author" suffix. */
  title: string;
  author: string | null;
  /** Short format hint, e.g. "Paperback · Hardcover" or "eBook · Instant download". */
  format: string | null;
  digital: boolean;
  /** Book-like product (gets the spine effect in "auto" mode). */
  bookish: boolean;
  /** "ebook" | "course" | "audio" | null — used for digital copy. */
  digitalKind: "ebook" | "course" | "audio" | "other" | null;
};

const clean = (s: string) => s.trim().toLowerCase();

/** Split "Title — Author" (em or en dash). Returns the whole title when there is no suffix. */
export function splitTitle(title: string): { title: string; author: string | null } {
  const parts = title.split(DASH_SPLIT);
  if (parts.length < 2) return { title, author: null };
  const author = parts.pop()!.trim();
  // A suffix that's clearly not a person ("Vol. 2", "(Hardcover)") stays part of the title.
  if (!author || /^(vol\.?|volume|part|book)\s*\d/i.test(author) || /^\(.*\)$/.test(author)) return { title, author: null };
  return { title: parts.join(" — ").trim(), author };
}

function digitalTypes(context: Pick<StorefrontContext, "theme">): string[] {
  const raw = context.theme.digital_product_types;
  const list = typeof raw === "string" && raw.trim() ? raw.split(",").map(clean).filter(Boolean) : DEFAULT_DIGITAL_TYPES;
  return list;
}

export function isDigital(p: Pick<SfProduct, "productType" | "tags">, context: Pick<StorefrontContext, "theme">): boolean {
  const type = clean(p.productType ?? "");
  const tag = typeof context.theme.digital_tag === "string" && context.theme.digital_tag.trim() ? clean(context.theme.digital_tag) : "digital";
  if (type && digitalTypes(context).includes(type)) return true;
  return p.tags.some((t) => {
    const c = clean(t);
    return c === tag || c === "ebook" || c === "course";
  });
}

function kindOf(p: Pick<SfProduct, "productType" | "tags" | "title">): BookMeta["digitalKind"] {
  const hay = `${p.productType ?? ""} ${p.tags.join(" ")} ${p.title}`.toLowerCase();
  if (/course|class|masterclass|workshop/.test(hay)) return "course";
  if (/audio/.test(hay)) return "audio";
  if (/e-?book|pdf|epub/.test(hay)) return "ebook";
  return "other";
}

export function bookMeta(p: SfProduct, context: Pick<StorefrontContext, "theme" | "store">): BookMeta {
  const split = splitTitle(p.title);
  const vendor = (p.vendor ?? "").trim();
  const storeName = clean(context.store.name ?? "");
  const vendorIsStore = !vendor || clean(vendor) === storeName || clean(vendor) === "folio" || storeName.startsWith(clean(vendor));
  const author = !vendorIsStore ? vendor : split.author;
  const digital = isDigital(p, context);
  const digitalKind = digital ? kindOf(p) : null;

  let format: string | null = null;
  const formatOption = p.options.find((o) => FORMAT_OPTION.test(o.name) && o.values.length);
  if (formatOption) format = formatOption.values.slice(0, 3).join(" · ");
  else if (digital) {
    format =
      digitalKind === "course" ? "Online course · Instant access" : digitalKind === "audio" ? "Audiobook · Instant download" : digitalKind === "ebook" ? "eBook · Instant download" : "Digital · Instant download";
  } else {
    const other = p.options.find((o) => o.values.length > 1);
    const type = (p.productType ?? "").trim();
    if (other && type) format = `${type} · ${other.values.length} ${other.name.toLowerCase()}s`;
    else if (other) format = `${other.values.length} ${other.name.toLowerCase()}s`;
    else if (type && !/^book$/i.test(type)) format = type;
  }

  const bookish = !!formatOption || BOOKISH_TYPES.test(p.productType ?? "") || !!split.author || (digital && digitalKind === "ebook");
  return { title: split.title, author, format, digital, bookish, digitalKind };
}

/** Parse `store.address`, which may be plain text or a JSON-ish object string. */
export function formatAddress(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const t = raw.trim();
  if (!t) return null;
  if (t.startsWith("{")) {
    try {
      const a = JSON.parse(t) as Record<string, unknown>;
      const parts = [a.line1, a.line2, a.area, [a.city, a.postalCode].filter(Boolean).join(" ")]
        .map((x) => (typeof x === "string" ? x.trim() : ""))
        .filter(Boolean);
      return parts.length ? parts.join(", ") : null;
    } catch {
      return null;
    }
  }
  // De-duplicate repeated parts ("Dhaka, Dhaka").
  return t
    .split(/\s*,\s*/)
    .filter((part, i, all) => part && part.toLowerCase() !== all[i - 1]?.toLowerCase())
    .join(", ");
}
