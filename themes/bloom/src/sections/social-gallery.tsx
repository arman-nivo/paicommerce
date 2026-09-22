/**
 * Instagram-style gallery: profile header with a follow button and a mosaic of posts; each post
 * can link to a product or any URL and shows its caption on hover/focus.
 */
import { defineSection } from "@pai/theme-sdk";
import { ButtonLink, Icon, Section, SmartLink, SocialIcon, cn, getSocialLinks, paddingField, resolveHref, schemeField, str } from "@pai/theme-kit";
import { Accent, Eyebrow } from "./_bloom";
import { GALLERY } from "../images";

export const socialGallery = defineSection({
  schema: {
    type: "social-gallery",
    name: "Instagram gallery",
    category: "media",
    icon: "camera",
    description: "Instagram-style grid with a follow button. Link posts to products.",
    settings: [
      { type: "text", id: "eyebrow", label: "Eyebrow", default: "#BloomRitual" },
      { type: "text", id: "heading", label: "Heading", default: "Glowing on *your* feed" },
      { type: "text", id: "handle", label: "Handle", default: "@bloombeauty.bd" },
      { type: "url", id: "profile_url", label: "Profile link", info: "Defaults to your Instagram link from social settings." },
      { type: "text", id: "button_label", label: "Button label", default: "Follow us" },
      {
        type: "select",
        id: "layout",
        label: "Layout",
        default: "mosaic",
        options: [
          { value: "mosaic", label: "Mosaic (one large tile)" },
          { value: "grid", label: "Even grid" },
          { value: "strip", label: "Single row strip" },
        ],
      },
      { type: "header", label: "Tip", info: "Mosaic looks best with 5 or 9 posts; the even grid with 6 or 12." },
      schemeField("default"),
      paddingField("medium"),
    ],
    blocks: [
      {
        type: "post",
        name: "Post",
        limit: 12,
        settings: [
          { type: "image", id: "image", label: "Image" },
          { type: "text", id: "alt", label: "Image description (alt text)", default: "" },
          { type: "text", id: "caption", label: "Caption", default: "" },
          { type: "product", id: "product", label: "Tagged product", info: "Clicking the post opens this product." },
          { type: "url", id: "link", label: "Or link to" },
        ],
      },
    ],
    maxBlocks: 12,
    presets: [
      {
        name: "Instagram gallery",
        blocks: GALLERY.map((image) => ({ type: "post", settings: { image } })),
      },
    ],
  },
  component: async ({ settings: s, blocks, context }) => {
    const posts = blocks.filter((b) => b.type === "post" && str(b.settings.image));
    if (!posts.length) return null;
    const products = await Promise.all(posts.map((b) => (str(b.settings.product) ? context.data.getProduct(str(b.settings.product)).catch(() => null) : Promise.resolve(null))));
    const insta = getSocialLinks(context).find((l) => l.network === "instagram")?.href;
    const profile = resolveHref(context, s.profile_url) || insta || "";
    const heading = str(s.heading);
    const layout = str(s.layout, "mosaic");

    const tiles = posts.map((b, i) => {
      const p = products[i];
      const href = p?.url ?? resolveHref(context, b.settings.link) ?? "";
      const caption = str(b.settings.caption);
      const alt = str(b.settings.alt) || caption || "Instagram post";
      const big = layout === "mosaic" && i === 0;
      const inner = (
        <>
          <img src={str(b.settings.image)} alt={alt} loading="lazy" decoding="async" className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105" />
          <span className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-pai-fg/45 p-4 text-center text-sm text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
            <Icon name={p ? "shopping-bag" : "heart"} className="size-6" />
            {caption ? <span className="pai-line-clamp-2 max-w-[16ch]">{caption}</span> : null}
            {p ? <span className="text-xs font-semibold uppercase tracking-[0.16em]">Shop it</span> : null}
          </span>
        </>
      );
      const cls = cn("group relative block aspect-square overflow-hidden rounded-pai bg-pai-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pai-accent", big && "col-span-2 row-span-2", layout === "strip" && "w-[46vw] shrink-0 snap-start sm:w-auto");
      return href ? (
        <SmartLink key={b.id} href={href} className={cls} ariaLabel={p ? `Shop ${p.title}` : alt}>
          {inner}
        </SmartLink>
      ) : (
        <div key={b.id} className={cls}>
          {inner}
        </div>
      );
    });

    return (
      <Section settings={s} ariaLabel={heading.replace(/\*/g, "") || "Instagram"}>
        <div className="mb-10 flex flex-col items-center gap-4 text-center">
          {str(s.eyebrow) ? <Eyebrow>{str(s.eyebrow)}</Eyebrow> : null}
          {heading ? (
            <h2 className="pai-h2">
              <Accent text={heading} />
            </h2>
          ) : null}
          <div className="flex items-center gap-3">
            {str(s.handle) ? <span className="text-sm font-medium opacity-75">{str(s.handle)}</span> : null}
            {profile && str(s.button_label) ? (
              <ButtonLink href={profile} variant="secondary" size="sm">
                <SocialIcon network="instagram" className="size-4" /> {str(s.button_label)}
              </ButtonLink>
            ) : null}
          </div>
        </div>
        {layout === "strip" ? (
          <div className="pai-no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:grid sm:grid-cols-4 sm:px-0 lg:grid-cols-6">{tiles}</div>
        ) : (
          <div className={cn("grid grid-cols-2 gap-3 md:gap-4", layout === "mosaic" ? "md:grid-cols-4" : "md:grid-cols-4 lg:grid-cols-6")}>{tiles}</div>
        )}
      </Section>
    );
  },
});
