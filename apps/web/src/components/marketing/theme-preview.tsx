import { cn } from "@pai/ui";
import { fontFamily, themeStyle } from "@/lib/theme-styles";

function img(url: string, w: number) {
  if (!url.includes("images.unsplash.com")) return url;
  const u = new URL(url);
  u.searchParams.set("w", String(w));
  u.searchParams.set("q", "75");
  u.searchParams.set("auto", "format");
  u.searchParams.set("fit", "crop");
  return u.toString();
}

/**
 * A stylised storefront screenshot for a theme, built in HTML/CSS from the theme's
 * identity (colours, type) and its thumbnail photo. `variant="mobile"` renders a phone.
 */
export function ThemePreview({
  slug,
  name,
  tagline,
  thumbnail,
  className,
  variant = "desktop",
  chrome = true,
  eager,
}: {
  slug: string;
  name: string;
  tagline?: string;
  thumbnail: string;
  className?: string;
  variant?: "desktop" | "mobile";
  chrome?: boolean;
  eager?: boolean;
}) {
  const s = themeStyle(slug);
  const font = fontFamily(s.font);
  const positions = ["20% 30%", "80% 40%", "50% 80%", "10% 90%"];

  if (variant === "mobile") {
    return (
      <div className={cn("relative overflow-hidden rounded-[2rem] border-[6px] border-slate-900 bg-slate-900 shadow-2xl", className)}>
        <div className="absolute left-1/2 top-1.5 z-10 h-4 w-16 -translate-x-1/2 rounded-full bg-slate-900" />
        <div className="h-full overflow-hidden rounded-[1.6rem]" style={{ background: s.bg, color: s.fg }}>
          <div className="flex items-center justify-between px-4 pb-2 pt-7 text-[10px] font-semibold" style={{ fontFamily: font }}>
            <span className="text-sm">{name}</span>
            <span className="flex gap-1.5">
              <span className="size-2 rounded-full" style={{ background: s.fg, opacity: 0.5 }} />
              <span className="size-2 rounded-full" style={{ background: s.accent }} />
            </span>
          </div>
          <div className="relative mx-3 h-40 overflow-hidden rounded-xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img(thumbnail, 500)} alt="" className="size-full object-cover" loading={eager ? "eager" : "lazy"} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <p className="absolute bottom-3 left-3 right-3 text-sm font-bold leading-tight text-white" style={{ fontFamily: font }}>
              {tagline ?? "New season arrivals"}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 p-3">
            {positions.map((p, i) => (
              <div key={i}>
                <div className="aspect-[4/5] overflow-hidden rounded-lg" style={{ background: s.muted }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img(thumbnail, 300)} alt="" className="size-full object-cover" style={{ objectPosition: p, transform: "scale(1.6)" }} loading="lazy" />
                </div>
                <div className="mt-1.5 h-1.5 w-3/4 rounded-full" style={{ background: s.fg, opacity: 0.25 }} />
                <div className="mt-1 h-1.5 w-1/3 rounded-full" style={{ background: s.accent }} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden rounded-xl bg-white ring-1 ring-slate-900/10", className)}>
      {chrome && (
        <div className="flex items-center gap-1.5 border-b border-slate-200/80 bg-slate-50 px-3 py-2">
          <span className="size-2.5 rounded-full bg-[#ff5f57]" />
          <span className="size-2.5 rounded-full bg-[#febc2e]" />
          <span className="size-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-3 flex-1 truncate rounded-md bg-white px-2 py-0.5 text-center font-mono text-[10px] text-slate-400 ring-1 ring-slate-200">
            {slug}-demo.paicommerce.com
          </span>
        </div>
      )}
      <div style={{ background: s.bg, color: s.fg }}>
        <div className="flex items-center justify-between px-5 py-3" style={{ fontFamily: font }}>
          <span className="text-base font-bold tracking-tight">{name}</span>
          <div className="hidden gap-4 text-[10px] font-medium opacity-70 sm:flex">
            <span>Shop</span>
            <span>Collections</span>
            <span>About</span>
          </div>
          <span className="rounded-full px-2.5 py-1 text-[10px] font-semibold" style={{ background: s.accent, color: s.dark ? s.bg : "#fff" }}>
            Cart · 2
          </span>
        </div>
        <div className="relative mx-4 aspect-[16/7] overflow-hidden rounded-lg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={img(thumbnail, 1000)} alt={`${name} theme preview`} className="size-full object-cover" loading={eager ? "eager" : "lazy"} />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
          <div className="absolute inset-y-0 left-0 flex max-w-[60%] flex-col justify-center p-5 text-white">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] opacity-80">New collection</p>
            <p className="mt-1 text-lg font-bold leading-tight sm:text-xl" style={{ fontFamily: font }}>
              {tagline ?? name}
            </p>
            <span className="mt-3 inline-flex w-fit rounded-full px-3 py-1 text-[10px] font-semibold" style={{ background: s.accent, color: s.dark ? s.bg : "#fff" }}>
              Shop now
            </span>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-3 p-4">
          {positions.map((p, i) => (
            <div key={i}>
              <div className="aspect-square overflow-hidden rounded-md" style={{ background: s.muted }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img(thumbnail, 300)} alt="" className="size-full object-cover" style={{ objectPosition: p, transform: "scale(1.7)" }} loading="lazy" />
              </div>
              <div className="mt-2 h-1.5 w-4/5 rounded-full" style={{ background: s.fg, opacity: 0.22 }} />
              <div className="mt-1 h-1.5 w-2/5 rounded-full" style={{ background: s.accent, opacity: 0.9 }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
