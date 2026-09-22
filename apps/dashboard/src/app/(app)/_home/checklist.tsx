"use client";
import Link from "next/link";
import * as React from "react";
import { ChevronDown, CircleCheck, CreditCard, Globe, Package, Palette, ShoppingCart, Truck, X } from "lucide-react";
import { Button, Card, cn } from "@pai/ui";

type Item = { key: string; done: boolean; title: string; body: string; href: string; cta: string; icon: React.ReactNode };

export function SetupChecklist({ checklist, themeId, storeUrl, hasCod }: { checklist: Record<string, boolean>; themeId: string | null; storeUrl: string; hasCod: boolean }) {
  const items: Item[] = [
    { key: "product", done: checklist.product!, title: "Add your first product", body: "Add photos, a price and stock. Use ✨ Write with AI for the description.", href: "/products/new", cta: "Add product", icon: <Package /> },
    { key: "theme", done: checklist.theme!, title: "Customize your theme", body: "Add your logo, colors and banners with the drag-and-drop editor.", href: themeId ? `/themes/${themeId}/customize` : "/themes", cta: "Customize theme", icon: <Palette /> },
    {
      key: "payments",
      done: checklist.payments!,
      title: "Set up payments",
      body: hasCod ? "Cash on Delivery is on. Add bKash, Nagad or SSLCommerz to accept online payments." : "Turn on Cash on Delivery, bKash, Nagad or cards.",
      href: "/settings/payments",
      cta: "Set up payments",
      icon: <CreditCard />,
    },
    { key: "delivery", done: checklist.delivery!, title: "Connect a courier", body: "Link Steadfast, Pathao or RedX to book deliveries in one click. Delivery charges are already set.", href: "/settings/couriers", cta: "Connect courier", icon: <Truck /> },
    { key: "domain", done: checklist.domain!, title: "Add a custom domain", body: "Use your own brand name like yourbrand.com (optional).", href: "/domains", cta: "Add domain", icon: <Globe /> },
    { key: "order", done: checklist.order!, title: "Place a test order", body: "Visit your store and place an order to see the full customer experience.", href: storeUrl, cta: "Open my store", icon: <ShoppingCart /> },
  ];
  const doneCount = items.filter((i) => i.done).length;
  const [hidden, setHidden] = React.useState(true);
  const [open, setOpen] = React.useState<string | null>(null);
  React.useEffect(() => {
    try {
      setHidden(localStorage.getItem("pai-checklist-hidden") === "1" && doneCount >= 3);
    } catch {
      setHidden(false);
    }
    setOpen(items.find((i) => !i.done)?.key ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (hidden || doneCount === items.length) return null;
  const pctDone = Math.round((doneCount / items.length) * 100);
  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-4 bg-gradient-to-r from-brand-50 to-transparent px-5 py-4 dark:from-brand-500/10">
        <div>
          <h2 className="font-display text-lg font-bold">Set up your store</h2>
          <p className="text-sm text-muted-foreground">Complete these steps to start selling. It only takes a few minutes.</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 w-40 overflow-hidden rounded-full bg-muted sm:w-56">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pctDone}%` }} />
            </div>
            <span className="text-xs font-medium text-muted-foreground">
              {doneCount} of {items.length} done
            </span>
          </div>
        </div>
        <button
          onClick={() => {
            setHidden(true);
            try {
              localStorage.setItem("pai-checklist-hidden", "1");
            } catch {}
          }}
          className="rounded-md p-1 text-muted-foreground hover:bg-muted"
          aria-label="Hide setup guide"
          title="Hide setup guide"
        >
          <X className="size-4" />
        </button>
      </div>
      <ul className="divide-y divide-border">
        {items.map((i) => {
          const expanded = open === i.key;
          const external = i.href.startsWith("http");
          return (
            <li key={i.key}>
              <button onClick={() => setOpen(expanded ? null : i.key)} className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-muted/40">
                {i.done ? <CircleCheck className="size-5 shrink-0 text-emerald-500" /> : <span className="size-5 shrink-0 rounded-full border-2 border-dashed border-muted-foreground/40" />}
                <span className={cn("flex-1 text-sm font-medium", i.done && "text-muted-foreground line-through decoration-muted-foreground/40")}>{i.title}</span>
                <ChevronDown className={cn("size-4 text-muted-foreground transition", expanded && "rotate-180")} />
              </button>
              {expanded && (
                <div className="flex flex-col gap-3 px-5 pb-4 pl-13 sm:flex-row sm:items-center">
                  <span className="hidden size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary sm:flex [&_svg]:size-5">{i.icon}</span>
                  <p className="flex-1 text-sm text-muted-foreground">{i.body}</p>
                  {external ? (
                    <a href={i.href} target="_blank" rel="noreferrer">
                      <Button size="sm" variant={i.done ? "outline" : "default"}>
                        {i.cta}
                      </Button>
                    </a>
                  ) : (
                    <Link href={i.href}>
                      <Button size="sm" variant={i.done ? "outline" : "default"}>
                        {i.cta}
                      </Button>
                    </Link>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
