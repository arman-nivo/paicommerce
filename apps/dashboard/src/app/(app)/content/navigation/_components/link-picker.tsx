"use client";
import * as React from "react";
import { BookOpen, Check, FileText, Globe, House, ImageIcon, Layers, Link2, Newspaper, Package, Search, ShoppingBag } from "lucide-react";
import { cn, Input, Spinner } from "@pai/ui";
import { searchLinkTargets, type LinkTarget } from "../actions";

export type LinkType = "home" | "all" | "collection" | "product" | "page" | "blog" | "post" | "search" | "custom";
type ResourceType = "collection" | "product" | "page" | "post";

const TYPES: { value: LinkType; label: string; icon: React.ReactNode; url?: string; defaultLabel?: string }[] = [
  { value: "home", label: "Home page", icon: <House />, url: "/", defaultLabel: "Home" },
  { value: "collection", label: "Collection", icon: <Layers /> },
  { value: "product", label: "Product", icon: <Package /> },
  { value: "all", label: "All products", icon: <ShoppingBag />, url: "/collections/all", defaultLabel: "Shop all" },
  { value: "page", label: "Page", icon: <FileText /> },
  { value: "blog", label: "Blog", icon: <BookOpen />, url: "/blog", defaultLabel: "Blog" },
  { value: "post", label: "Blog post", icon: <Newspaper /> },
  { value: "search", label: "Search page", icon: <Search />, url: "/search", defaultLabel: "Search" },
  { value: "custom", label: "Custom URL", icon: <Globe /> },
];

export function detectLinkType(url: string): LinkType {
  if (!url) return "collection";
  if (url === "/") return "home";
  if (url === "/collections/all") return "all";
  if (url.startsWith("/collections/")) return "collection";
  if (url.startsWith("/products/")) return "product";
  if (url.startsWith("/pages/")) return "page";
  if (url === "/blog") return "blog";
  if (url.startsWith("/blog/")) return "post";
  if (url === "/search") return "search";
  return "custom";
}

function isResource(t: LinkType): t is ResourceType {
  return t === "collection" || t === "product" || t === "page" || t === "post";
}

/** Pick a link destination. `onPick(url, suggestedLabel)` fires whenever the destination changes. */
export function LinkPicker({ url, onPick }: { url: string; onPick: (url: string, label?: string) => void }) {
  const [type, setType] = React.useState<LinkType>(() => detectLinkType(url));
  const [q, setQ] = React.useState("");
  const [results, setResults] = React.useState<LinkTarget[] | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [custom, setCustom] = React.useState(type === "custom" ? url : "");

  React.useEffect(() => {
    if (!isResource(type)) return;
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(async () => {
      try {
        const res = await searchLinkTargets({ type, q });
        if (!cancelled) setResults(res.ok ? res.data : []);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, q ? 250 : 0);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [type, q]);

  const chooseType = (t: (typeof TYPES)[number]) => {
    setType(t.value);
    setQ("");
    setResults(null);
    if (t.url) onPick(t.url, t.defaultLabel);
    else if (t.value === "custom") onPick(custom);
    else if (detectLinkType(url) !== t.value) onPick("");
  };

  const placeholder = { collection: "Search collections", product: "Search products", page: "Search pages", post: "Search blog posts" } as Record<string, string>;
  const emptyText = { collection: "No collections yet. Create one in Products › Collections.", product: "No products found.", page: "No pages yet. Create one in Online store › Pages.", post: "No blog posts yet." } as Record<string, string>;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
        {TYPES.map((t) => (
          <button
            key={t.value}
            type="button"
            onClick={() => chooseType(t)}
            className={cn(
              "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-sm transition [&_svg]:size-4 [&_svg]:shrink-0",
              type === t.value ? "border-primary bg-accent text-primary" : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground",
            )}
          >
            {t.icon}
            <span className="truncate">{t.label}</span>
          </button>
        ))}
      </div>

      {isResource(type) && (
        <div className="rounded-lg border border-border">
          <div className="relative border-b border-border">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder[type]} className="h-10 w-full bg-transparent pl-9 pr-9 text-sm outline-none" autoFocus />
            {loading && <Spinner className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />}
          </div>
          <div className="max-h-60 overflow-y-auto p-1 scrollbar-thin">
            {results === null && !loading && <div className="p-3 text-center text-sm text-muted-foreground">Loading…</div>}
            {results?.length === 0 && !loading && <div className="p-4 text-center text-sm text-muted-foreground">{q ? `No results for “${q}”.` : emptyText[type]}</div>}
            {results?.map((r) => {
              const on = r.url === url;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => onPick(r.url, r.title)}
                  className={cn("flex w-full items-center gap-3 rounded-md px-2 py-1.5 text-left text-sm hover:bg-muted", on && "bg-accent")}
                >
                  {type !== "page" && (
                    <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted text-muted-foreground">
                      {r.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={r.image} alt="" className="size-full object-cover" />
                      ) : (
                        <ImageIcon className="size-3.5" />
                      )}
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium">{r.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">{r.url}</span>
                  </span>
                  {r.hint && <span className="shrink-0 rounded bg-muted px-1.5 text-[11px] text-muted-foreground">{r.hint}</span>}
                  {on && <Check className="size-4 shrink-0 text-primary" />}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {type === "custom" && (
        <div className="space-y-1.5">
          <div className="relative">
            <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={custom}
              autoFocus
              className="pl-9"
              placeholder="https://facebook.com/yourpage or /collections/sale"
              onChange={(e) => {
                setCustom(e.target.value);
                onPick(e.target.value.trim());
              }}
            />
          </div>
          <p className="text-xs text-muted-foreground">Use a full address (https://…) for other websites, or a path starting with / for pages in your store. Phone links: tel:01XXXXXXXXX</p>
        </div>
      )}

      {url && !isResource(type) && type !== "custom" && (
        <p className="text-xs text-muted-foreground">
          Links to <code className="rounded bg-muted px-1 py-0.5">{url}</code>
        </p>
      )}
    </div>
  );
}
