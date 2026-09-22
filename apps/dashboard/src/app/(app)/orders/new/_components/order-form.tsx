"use client";
import { useRouter } from "next/navigation";
import * as React from "react";
import { CircleAlert, Minus, Plus, ShoppingBag, Tag, Trash2, X } from "lucide-react";
import { isValidBdPhone } from "@pai/core";
import { Badge, Button, Card, CardBody, CardHeader, Checkbox, cn, EmptyState, Field, Input, Select, Spinner, Textarea } from "@pai/ui";
import { MoneyInput } from "@/components/money-input";
import { useMoney } from "@/components/store-context";
import { run } from "@/lib/client";
import { createManualOrder, priceDraftOrder, type CustomerHit } from "../actions";
import { CustomerPicker, ProductPicker, Thumb } from "./pickers";

export type DraftLine = { productId: string; variantId: string | null; quantity: number; title: string; variantTitle: string | null; imageUrl: string | null };
type Address = { name: string; phone: string; line1: string; area: string; city: string };
export type OrderPrefill = {
  number: number;
  lines: DraftLine[];
  customerId: string | null;
  name: string;
  phone: string;
  email: string;
  address: Address;
  deliveryZoneId: string;
  paymentMethod: string;
  note: string;
};
type Zone = { id: string; name: string; charge: number; estimatedDays: string | null };
type Priced = Extract<Awaited<ReturnType<typeof priceDraftOrder>>, { ok: true }>["data"];

const METHODS = [
  { value: "cod", label: "Cash on Delivery" },
  { value: "bkash_manual", label: "bKash / Nagad (Send Money)" },
  { value: "bkash", label: "bKash" },
  { value: "nagad", label: "Nagad" },
  { value: "sslcommerz", label: "Card / SSLCommerz" },
  { value: "manual", label: "Other / manual" },
] as const;
type Method = (typeof METHODS)[number]["value"];

const key = (l: { productId: string; variantId: string | null }) => `${l.productId}:${l.variantId ?? ""}`;
const EMPTY_ADDR: Address = { name: "", phone: "", line1: "", area: "", city: "" };

export function OrderForm({ zones, prefill, freeShippingOver }: { zones: Zone[]; prefill: OrderPrefill | null; freeShippingOver: number | null }) {
  const router = useRouter();
  const money = useMoney();
  const [lines, setLines] = React.useState<DraftLine[]>(prefill?.lines ?? []);
  const [customerId, setCustomerId] = React.useState<string | null>(prefill?.customerId ?? null);
  const [name, setName] = React.useState(prefill?.name ?? "");
  const [phone, setPhone] = React.useState(prefill?.phone ?? "");
  const [email, setEmail] = React.useState(prefill?.email ?? "");
  const [addr, setAddr] = React.useState<Address>(prefill?.address ?? EMPTY_ADDR);
  const [zoneId, setZoneId] = React.useState(prefill?.deliveryZoneId || zones[0]?.id || "");
  const [customShipping, setCustomShipping] = React.useState(false);
  const [shippingOverride, setShippingOverride] = React.useState<number | null>(null);
  const [discountInput, setDiscountInput] = React.useState("");
  const [discountCode, setDiscountCode] = React.useState("");
  const [method, setMethod] = React.useState<Method>((METHODS.find((m) => m.value === prefill?.paymentMethod)?.value ?? "cod") as Method);
  const [payStatus, setPayStatus] = React.useState<"pending" | "paid">("pending");
  const [payRef, setPayRef] = React.useState("");
  const [note, setNote] = React.useState(prefill?.note ?? "");
  const [priced, setPriced] = React.useState<Priced | null>(null);
  const [pricing, setPricing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const reqId = React.useRef(0);

  // Live pricing (stock, discount, delivery zone) from the same engine as checkout.
  const pricingKey = JSON.stringify([lines.map((l) => [l.productId, l.variantId, l.quantity]), zoneId, discountCode]);
  React.useEffect(() => {
    if (!lines.length) {
      reqId.current++;
      setPriced(null);
      setPricing(false);
      return;
    }
    const id = ++reqId.current;
    setPricing(true);
    const t = setTimeout(async () => {
      const r = await priceDraftOrder({ lines: lines.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity })), discountCode: discountCode || null, deliveryZoneId: zoneId || null });
      if (id !== reqId.current) return;
      setPricing(false);
      if (r.ok) setPriced(r.data);
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pricingKey]);

  const pricedBy = new Map((priced?.lines ?? []).map((l) => [key(l), l]));
  const shipping = customShipping ? (shippingOverride ?? 0) : (priced?.shippingTotal ?? 0);
  const subtotal = priced?.subtotal ?? 0;
  const discountTotal = priced?.discountTotal ?? 0;
  const total = Math.max(0, subtotal - discountTotal + shipping);
  const discountError = discountCode && priced && !priced.discount ? (priced.errors.find((e) => /discount|code|minimum/i.test(e)) ?? "Invalid code") : null;
  const unavailableCount = priced ? lines.filter((l) => !pricedBy.has(key(l))).length : 0;
  const stockErrors = [
    ...(priced?.errors ?? []).filter((e) => e !== discountError),
    ...(unavailableCount ? [`Remove ${unavailableCount} product${unavailableCount > 1 ? "s" : ""} that ${unavailableCount > 1 ? "are" : "is"} no longer available`] : []),
  ];

  function addLine(l: DraftLine) {
    setLines((cur) => {
      const i = cur.findIndex((x) => key(x) === key(l));
      if (i >= 0) return cur.map((x, j) => (j === i ? { ...x, quantity: Math.min(999, x.quantity + 1) } : x));
      return [...cur, l];
    });
  }
  const setQty = (k: string, q: number) => setLines((cur) => cur.map((x) => (key(x) === k ? { ...x, quantity: Math.max(1, Math.min(999, q || 1)) } : x)));
  const removeLine = (k: string) => setLines((cur) => cur.filter((x) => key(x) !== k));

  function pickCustomer(c: CustomerHit) {
    setCustomerId(c.id);
    setName(c.name);
    setPhone(c.phone ?? "");
    setEmail(c.email ?? "");
    if (c.address) setAddr({ name: c.address.name ?? "", phone: c.address.phone ?? "", line1: c.address.line1 ?? "", area: c.address.area ?? "", city: c.address.city ?? c.address.district ?? "" });
  }
  function clearCustomer() {
    setCustomerId(null);
    setName("");
    setPhone("");
    setEmail("");
    setAddr(EMPTY_ADDR);
  }

  async function submit() {
    const errs: Record<string, string> = {};
    if (!lines.length) errs.lines = "Add at least one product.";
    if (!name.trim()) errs.name = "Customer name is required.";
    if (!phone.trim() && !email.trim()) errs.phone = "Add a phone number so you can reach the customer.";
    else if (phone.trim() && !isValidBdPhone(phone)) errs.phone = "Enter a valid Bangladeshi mobile number (01XXXXXXXXX).";
    if (addr.phone.trim() && !isValidBdPhone(addr.phone)) errs.addrPhone = "Enter a valid mobile number.";
    setErrors(errs);
    if (Object.keys(errs).length) {
      document.getElementById(errs.lines ? "order-items" : "order-customer")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setSaving(true);
    const res = await run(
      createManualOrder({
        lines: lines.map(({ productId, variantId, quantity }) => ({ productId, variantId, quantity })),
        customerId,
        customer: { name: name.trim(), phone: phone.trim(), email: email.trim() },
        address: { name: addr.name || null, phone: addr.phone || null, line1: addr.line1 || null, area: addr.area || null, city: addr.city || null },
        deliveryZoneId: zoneId || null,
        shippingOverride: customShipping ? (shippingOverride ?? 0) : null,
        discountCode: discountCode || null,
        paymentMethod: method,
        paymentStatus: payStatus,
        paymentRef: payRef.trim() || null,
        note: note.trim() || null,
      }),
      { success: (d) => `Order #${d.number} created` },
    );
    if (res) router.push(`/orders/${res.id}`);
    else setSaving(false);
  }

  const setA = (k: keyof Address, v: string) => setAddr((a) => ({ ...a, [k]: v }));

  return (
    <div className="grid gap-5 pb-24 lg:grid-cols-3 lg:pb-0">
      <div className="space-y-5 lg:col-span-2">
        {/* Products */}
        <Card id="order-items">
          <CardHeader title="Products" description="Search your catalog — prices and stock come from your products." />
          <CardBody className="space-y-4">
            <ProductPicker onAdd={addLine} />
            {errors.lines && !lines.length && <p className="text-sm text-red-600">{errors.lines}</p>}
            {lines.length ? (
              <ul className="divide-y divide-border rounded-xl border border-border">
                {lines.map((l) => {
                  const k = key(l);
                  const p = pricedBy.get(k);
                  const unavailable = priced && !p;
                  return (
                    <li key={k} className="flex flex-wrap items-center gap-3 p-3 sm:flex-nowrap">
                      <Thumb url={l.imageUrl} className="size-11" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{l.title}</p>
                        <p className="flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                          {l.variantTitle && <span>{l.variantTitle}</span>}
                          {p && <span>{money(p.unitPrice)} each</span>}
                          {p && p.available != null && <span className={cn(!p.inStock && "font-medium text-red-600")}>{p.inStock ? `${p.available} in stock` : `Only ${Math.max(0, p.available)} left`}</span>}
                          {unavailable && <span className="font-medium text-red-600">No longer available</span>}
                        </p>
                      </div>
                      <div className="flex items-center rounded-lg border border-input">
                        <button type="button" onClick={() => setQty(k, l.quantity - 1)} className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground" aria-label="Decrease quantity">
                          <Minus className="size-3.5" />
                        </button>
                        <input
                          inputMode="numeric"
                          value={l.quantity}
                          onChange={(e) => setQty(k, parseInt(e.target.value.replace(/\D/g, ""), 10))}
                          className="h-8 w-10 border-x border-input bg-transparent text-center text-sm tabular-nums outline-none"
                          aria-label="Quantity"
                        />
                        <button type="button" onClick={() => setQty(k, l.quantity + 1)} className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground" aria-label="Increase quantity">
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <span className="w-20 text-right text-sm font-medium tabular-nums">{p ? money(p.total) : "—"}</span>
                      <button type="button" onClick={() => removeLine(k)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-red-600" aria-label="Remove">
                        <Trash2 className="size-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState className="py-8" icon={<ShoppingBag />} title="No products added" description="Search above to add products to this order." />
            )}
          </CardBody>
        </Card>

        {/* Customer */}
        <Card id="order-customer">
          <CardHeader
            title="Customer"
            action={
              customerId ? (
                <button type="button" onClick={clearCustomer} className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
                  <X className="size-3.5" /> New customer instead
                </button>
              ) : undefined
            }
          />
          <CardBody className="space-y-4">
            {customerId ? (
              <p className="flex items-center gap-2 rounded-lg bg-accent/60 px-3 py-2 text-sm">
                <Badge tone="brand">Existing customer</Badge> Order will be added to {name}&apos;s history.
              </p>
            ) : (
              <CustomerPicker onPick={pickCustomer} />
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.name}>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Rahim Uddin" autoComplete="off" />
              </Field>
              <Field label="Mobile number" error={errors.phone}>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="01XXXXXXXXX" inputMode="tel" autoComplete="off" />
              </Field>
              <Field label="Email" hint="Optional" className="sm:col-span-2">
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="customer@example.com" autoComplete="off" />
              </Field>
            </div>
          </CardBody>
        </Card>

        {/* Shipping */}
        <Card>
          <CardHeader title="Shipping address" description="Leave the name and phone blank to use the customer's." />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Field label="Recipient name">
              <Input value={addr.name} onChange={(e) => setA("name", e.target.value)} placeholder={name || "Same as customer"} />
            </Field>
            <Field label="Recipient phone" error={errors.addrPhone}>
              <Input value={addr.phone} onChange={(e) => setA("phone", e.target.value)} placeholder={phone || "Same as customer"} inputMode="tel" />
            </Field>
            <Field label="Address" className="sm:col-span-2">
              <Textarea value={addr.line1} onChange={(e) => setA("line1", e.target.value)} placeholder="House, road, village / para" className="min-h-16" />
            </Field>
            <Field label="Area / Thana">
              <Input value={addr.area} onChange={(e) => setA("area", e.target.value)} placeholder="e.g. Mirpur 10" />
            </Field>
            <Field label="City / District">
              <Input value={addr.city} onChange={(e) => setA("city", e.target.value)} placeholder="e.g. Dhaka" />
            </Field>
          </CardBody>
        </Card>

        {/* Payment & note */}
        <Card>
          <CardHeader title="Payment" />
          <CardBody className="grid gap-4 sm:grid-cols-2">
            <Field label="Payment method">
              <Select value={method} onChange={(e) => setMethod(e.target.value as Method)}>
                {METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Payment status">
              <Select value={payStatus} onChange={(e) => setPayStatus(e.target.value as "pending" | "paid")}>
                <option value="pending">{method === "cod" ? "Pending — collect on delivery" : "Pending"}</option>
                <option value="paid">Paid</option>
              </Select>
            </Field>
            {method !== "cod" && (
              <Field label={method === "bkash_manual" || method === "bkash" || method === "nagad" ? "TrxID" : "Payment reference"} hint="Optional" className="sm:col-span-2">
                <Input value={payRef} onChange={(e) => setPayRef(e.target.value)} className="font-mono" placeholder="e.g. 9K7D6XY2AB" />
              </Field>
            )}
            <Field label="Order note" hint="Shown on the invoice." className="sm:col-span-2">
              <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Gift wrap please" maxLength={1000} className="min-h-16" />
            </Field>
          </CardBody>
        </Card>
      </div>

      {/* Summary */}
      <div>
        <div className="space-y-5 lg:sticky lg:top-20">
          <Card>
            <CardHeader title="Summary" action={pricing ? <Spinner className="text-muted-foreground" /> : undefined} />
            <CardBody className="space-y-4">
              <Field label="Delivery zone">
                {zones.length ? (
                  <Select value={zoneId} onChange={(e) => setZoneId(e.target.value)} disabled={customShipping}>
                    <option value="">No delivery charge</option>
                    {zones.map((z) => (
                      <option key={z.id} value={z.id}>
                        {z.name} — {money(z.charge)}
                        {z.estimatedDays ? ` (${z.estimatedDays})` : ""}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No delivery zones yet.{" "}
                    <a href="/settings/delivery" className="text-primary hover:underline">
                      Set up zones
                    </a>{" "}
                    or use a custom charge.
                  </p>
                )}
              </Field>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={customShipping} onChange={(e) => setCustomShipping(e.target.checked)} /> Custom delivery charge
              </label>
              {customShipping && <MoneyInput value={shippingOverride} onChange={setShippingOverride} allowEmpty placeholder="0" />}

              <Field label="Discount code" error={discountError ?? undefined}>
                {discountCode && priced?.discount ? (
                  <div className="flex items-center justify-between rounded-lg border border-emerald-300/60 bg-emerald-50 px-3 py-1.5 text-sm dark:border-emerald-500/30 dark:bg-emerald-500/10">
                    <span className="flex items-center gap-1.5 font-mono font-medium text-emerald-700 dark:text-emerald-300">
                      <Tag className="size-3.5" /> {priced.discount.code}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setDiscountCode("");
                        setDiscountInput("");
                      }}
                      className="text-muted-foreground hover:text-foreground"
                      aria-label="Remove discount"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input
                      value={discountInput}
                      onChange={(e) => setDiscountInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          setDiscountCode(discountInput.trim());
                        }
                      }}
                      placeholder="CODE"
                      className="font-mono uppercase"
                    />
                    <Button type="button" variant="outline" onClick={() => setDiscountCode(discountInput.trim())} disabled={!discountInput.trim() || !lines.length}>
                      Apply
                    </Button>
                  </div>
                )}
              </Field>

              <dl className="space-y-2 border-t border-border pt-4 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Subtotal · {priced?.itemCount ?? 0} items</dt>
                  <dd className="tabular-nums">{money(subtotal)}</dd>
                </div>
                {discountTotal > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <dt>Discount</dt>
                    <dd className="tabular-nums">−{money(discountTotal)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Delivery</dt>
                  <dd className="tabular-nums">{shipping ? money(shipping) : "Free"}</dd>
                </div>
                {!customShipping && freeShippingOver != null && freeShippingOver > 0 && subtotal >= freeShippingOver && <p className="text-xs text-emerald-600">Free delivery over {money(freeShippingOver)} applied.</p>}
                <div className="flex justify-between border-t border-border pt-2 text-base font-semibold">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{money(total)}</dd>
                </div>
                {method === "cod" && payStatus === "pending" && total > 0 && <p className="text-xs text-muted-foreground">Courier collects {money(total)} on delivery.</p>}
              </dl>

              {stockErrors.length > 0 && (
                <div className="space-y-1 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
                  {stockErrors.map((e) => (
                    <p key={e} className="flex items-start gap-1.5">
                      <CircleAlert className="mt-0.5 size-4 shrink-0" /> {e}
                    </p>
                  ))}
                </div>
              )}

              <Button className="hidden w-full lg:inline-flex" size="lg" onClick={submit} loading={saving} disabled={!lines.length || pricing || stockErrors.length > 0 || !!discountError}>
                Create order
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Mobile sticky submit */}
      <div className="fixed inset-x-0 bottom-[calc(3.5rem+env(safe-area-inset-bottom))] z-30 flex items-center gap-3 border-t border-border bg-card/95 px-4 py-2.5 backdrop-blur-md lg:hidden">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="font-semibold tabular-nums">{money(total)}</p>
        </div>
        <Button size="lg" onClick={submit} loading={saving} disabled={!lines.length || pricing || stockErrors.length > 0 || !!discountError}>
          Create order
        </Button>
      </div>
    </div>
  );
}
