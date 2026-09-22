import Link from "next/link";
import { CircleCheck, Mail, MapPin, PhoneCall, ShoppingCart, Wallet } from "lucide-react";
import { loadLineData } from "@pai/core/orders";
import { and, carts, count, db, desc, eq, gte, isNotNull, isNull, sql, type CartLine, type SQL } from "@pai/db";
import { Badge, buttonVariants, Card, EmptyState, StatCard } from "@pai/ui";
import { Header } from "@/components/page";
import { Pagination } from "@/components/pagination";
import { RelativeTime } from "@/components/time";
import { UrlTabs } from "@/components/url-controls";
import { can, getCtx } from "@/lib/ctx";
import { formatMoney, formatNumber, pageParam, str, type SearchParams } from "@/lib/format";
import { addressLines } from "../_lib/filters";
import { CartActions } from "./_components/cart-actions";

export const metadata = { title: "Incomplete orders" };

const PAGE_SIZE = 20;

const STEP_LABEL: Record<string, string> = { contact: "Entered contact", shipping: "Entered address", payment: "Reached payment" };

export default async function IncompletePage({ searchParams }: { searchParams: SearchParams }) {
  const ctx = await getCtx("orders.view");
  const sp = await searchParams;
  const tab = str(sp.tab) || "all";
  const page = pageParam(sp.page);
  const storeId = ctx.store.id;
  const money = (n: number) => formatMoney(n, ctx.store.currency);
  const settings = ctx.store.settings ?? {};
  const zones = new Map((settings.delivery?.zones ?? []).map((z) => [z.id, z]));

  const base: SQL[] = [eq(carts.storeId, storeId), isNull(carts.recoveredOrderId), isNotNull(carts.checkout), sql`coalesce(${carts.checkout}->>'phone', '') <> ''`];
  const tabCond = tab === "not_contacted" ? isNull(carts.recoveryContactedAt) : tab === "contacted" ? isNotNull(carts.recoveryContactedAt) : undefined;
  const where = and(...base, tabCond);

  const [all, rows, [{ n: total } = { n: 0 }], [{ n: recovered } = { n: 0 }]] = await Promise.all([
    db.select({ id: carts.id, lines: carts.lines, contactedAt: carts.recoveryContactedAt }).from(carts).where(and(...base)).limit(2000),
    db.select().from(carts).where(where).orderBy(desc(carts.updatedAt)).limit(PAGE_SIZE).offset((page - 1) * PAGE_SIZE),
    db.select({ n: count() }).from(carts).where(where),
    db
      .select({ n: count() })
      .from(carts)
      .where(and(eq(carts.storeId, storeId), isNotNull(carts.recoveredOrderId), gte(carts.updatedAt, new Date(Date.now() - 30 * 86400_000)))),
  ]);

  // Price every line with one query (current product/variant prices).
  const allLines: CartLine[] = [...all.flatMap((c) => c.lines), ...rows.flatMap((c) => c.lines)];
  const { prods, vars } = allLines.length ? await loadLineData(storeId, allLines) : { prods: new Map(), vars: new Map() };
  const priceLine = (l: CartLine) => {
    const p = prods.get(l.productId);
    if (!p) return null;
    const v = l.variantId ? vars.get(l.variantId) : undefined;
    if (l.variantId && !v) return null;
    const unit = v ? v.price : p.price;
    return { key: `${l.productId}:${l.variantId ?? ""}`, title: p.title, variant: v?.title ?? null, imageUrl: (v?.imageUrl || p.images[0]?.url) ?? null, qty: l.quantity, unit, total: unit * l.quantity };
  };
  const cartValue = (lines: CartLine[]) => lines.reduce((s, l) => s + (priceLine(l)?.total ?? 0), 0);

  const potential = all.reduce((s, c) => s + cartValue(c.lines), 0);
  const notContacted = all.filter((c) => !c.contactedAt).length;
  const manage = can(ctx, "orders.manage");

  const tabs = [
    { value: "all", label: "All", count: all.length },
    { value: "not_contacted", label: "Not contacted", count: notContacted },
    { value: "contacted", label: "Contacted", count: all.length - notContacted },
  ];

  const captureOn = settings.checkout?.captureIncomplete !== false;

  return (
    <>
      <Header
        title="Incomplete orders"
        description="Shoppers who started checkout and left their phone number — call or WhatsApp them to win the sale back."
        back={{ href: "/orders", label: "Orders" }}
      />

      {!all.length ? (
        <Card>
          <EmptyState
            icon={<ShoppingCart />}
            title="No incomplete orders right now"
            description={
              captureOn
                ? "When a shopper types their phone number at checkout but doesn't place the order, they appear here so you can follow up. Stores recover 10–20% of these with one call."
                : "Incomplete order capture is turned off. Turn it on to save shoppers who leave checkout after entering their phone number — then follow up and recover the sale."
            }
            action={
              <Link href="/settings/checkout" className={buttonVariants({ variant: captureOn ? "outline" : "default" })}>
                {captureOn ? "Checkout settings" : "Turn on incomplete orders"}
              </Link>
            }
          />
        </Card>
      ) : (
        <>
          <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard label="Incomplete checkouts" value={formatNumber(all.length)} icon={<ShoppingCart />} />
            <StatCard label="Potential revenue" value={money(potential)} icon={<Wallet />} hint="at current prices" />
            <StatCard label="Not contacted yet" value={formatNumber(notContacted)} icon={<PhoneCall />} />
            <StatCard label="Recovered (30 days)" value={formatNumber(recovered)} icon={<CircleCheck />} />
          </div>

          <Card className="overflow-hidden">
            <UrlTabs param="tab" tabs={tabs} />
            {!rows.length ? (
              <EmptyState icon={<CircleCheck />} title={tab === "not_contacted" ? "You've contacted everyone" : "Nothing here"} description="Great follow-up! New incomplete checkouts will show up automatically." />
            ) : (
              <ul className="divide-y divide-border">
                {rows.map((c) => {
                  const s = c.checkout ?? {};
                  const lines = c.lines.map(priceLine).filter((x): x is NonNullable<typeof x> => !!x);
                  const value = lines.reduce((a, l) => a + l.total, 0);
                  const zone = s.deliveryZoneId ? zones.get(s.deliveryZoneId) : undefined;
                  const addr = addressLines(s.address);
                  return (
                    <li key={c.id} className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]">
                      <div className="min-w-0 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold">{s.name || "Unnamed shopper"}</span>
                          {c.recoveryContactedAt ? (
                            <Badge tone="green">
                              <CircleCheck className="size-3" /> Contacted
                            </Badge>
                          ) : (
                            <Badge tone="yellow" dot>
                              Not contacted
                            </Badge>
                          )}
                          {s.step && <Badge tone="gray">{STEP_LABEL[s.step] ?? s.step}</Badge>}
                        </div>
                        <p className="text-sm font-medium tabular-nums">{s.phone}</p>
                        {s.email && (
                          <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                            <Mail className="size-3.5 shrink-0" /> {s.email}
                          </p>
                        )}
                        {(addr || zone) && (
                          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
                            <MapPin className="mt-0.5 size-3.5 shrink-0" />
                            <span>
                              {addr}
                              {zone && <span className="block">Zone: {zone.name}</span>}
                            </span>
                          </p>
                        )}
                        {s.note && <p className="text-xs italic text-muted-foreground">“{s.note}”</p>}
                        <p className="text-xs text-muted-foreground">
                          Last activity <RelativeTime date={c.updatedAt} />
                          {c.recoveryContactedAt && (
                            <>
                              {" "}
                              · contacted <RelativeTime date={c.recoveryContactedAt} />
                            </>
                          )}
                        </p>
                      </div>
                      <div className="min-w-0">
                        <ul className="space-y-1.5">
                          {lines.slice(0, 4).map((l) => (
                            <li key={l.key} className="flex items-center gap-2 text-sm">
                              {l.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={l.imageUrl} alt="" className="size-8 shrink-0 rounded-md border border-border object-cover" />
                              ) : (
                                <span className="size-8 shrink-0 rounded-md border border-border bg-muted" />
                              )}
                              <span className="min-w-0 flex-1 truncate">
                                {l.title}
                                {l.variant && <span className="text-muted-foreground"> · {l.variant}</span>}
                              </span>
                              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                                {l.qty} × {money(l.unit)}
                              </span>
                            </li>
                          ))}
                          {lines.length > 4 && <li className="text-xs text-muted-foreground">+{lines.length - 4} more</li>}
                          {!lines.length && <li className="text-sm text-muted-foreground">Products in this cart are no longer available.</li>}
                        </ul>
                        <p className="mt-2 text-sm">
                          Cart value <span className="font-semibold tabular-nums">{money(value)}</span>
                          {zone && <span className="text-xs text-muted-foreground"> + {money(zone.charge)} delivery</span>}
                        </p>
                      </div>
                      <CartActions
                        id={c.id}
                        canManage={manage}
                        phone={s.phone ?? ""}
                        name={s.name ?? ""}
                        storeName={ctx.store.name}
                        valueText={money(value)}
                        contacted={!!c.recoveryContactedAt}
                        convertible={lines.length > 0}
                      />
                    </li>
                  );
                })}
              </ul>
            )}
            {total > PAGE_SIZE && <Pagination page={page} pageSize={PAGE_SIZE} total={total} basePath="/orders/incomplete" params={sp} />}
          </Card>
        </>
      )}
    </>
  );
}
