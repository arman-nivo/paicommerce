"use client";

/**
 * One-page checkout (contact → delivery → payment → review) styled with the store theme variables.
 * Delivery-zone changes re-price the cart via `{base}/api/checkout/draft`; the order is placed
 * with `{base}/api/checkout`, which returns where to go next (thank-you page or payment gateway).
 */
import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AlertCircle, Banknote, Check, CreditCard, LoaderCircle, Lock, ShieldCheck, Smartphone, Tag, Truck } from "lucide-react";
import { CartLineItem, DiscountForm, trackEvent, useCart, useStorefront } from "@pai/theme-kit/client";
import type { CartView } from "@pai/theme-kit";

export type CheckoutZone = { id: string; name: string; charge: number; estimatedDays?: string };
export type CheckoutPaymentMethod = { id: string; label: string; description: string; kind: "offline" | "manual" | "redirect"; numbers?: { label: string; number: string }[]; instructions?: string };

export type CheckoutFormProps = {
  zones: CheckoutZone[];
  methods: CheckoutPaymentMethod[];
  districts: string[];
  requireEmail: boolean;
  allowNote: boolean;
  termsUrl: string | null;
  minimumOrder: number | null;
  freeShippingOver: number | null;
  initial: {
    name: string;
    phone: string;
    email: string;
    line1: string;
    area: string;
    city: string;
    district: string;
    deliveryZoneId: string;
    note: string;
  };
  isPreview: boolean;
};

type Errors = Partial<Record<"name" | "phone" | "email" | "line1" | "deliveryZoneId" | "paymentMethod" | "transactionId" | "terms", string>>;

const PHONE_RE = /^01[3-9]\d{8}$/;
const normalizePhone = (p: string) => {
  let v = p.replace(/[^\d+]/g, "");
  if (v.startsWith("+880")) v = "0" + v.slice(4);
  else if (v.startsWith("880")) v = "0" + v.slice(3);
  return v;
};

function MethodIcon({ id }: { id: string }) {
  if (id === "cod") return <Banknote className="size-5" aria-hidden />;
  if (id === "bkash" || id === "bkash_manual" || id === "nagad") return <Smartphone className="size-5" aria-hidden />;
  return <CreditCard className="size-5" aria-hidden />;
}

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="rounded-pai border border-pai-border bg-pai-bg p-5 md:p-6" aria-labelledby={`step-${n}`}>
      <h2 id={`step-${n}`} className="mb-5 flex items-center gap-3 text-lg font-semibold">
        <span className="grid size-7 place-items-center rounded-full bg-pai-primary text-sm font-bold text-pai-primary-fg">{n}</span>
        {title}
      </h2>
      {children}
    </section>
  );
}

function Field({ label, error, children, hint, className }: { label: string; error?: string; hint?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="pai-label">{label}</span>
      {children}
      {error ? (
        <span className="mt-1 flex items-center gap-1 text-xs font-medium text-pai-sale" role="alert">
          <AlertCircle className="size-3.5" aria-hidden /> {error}
        </span>
      ) : hint ? (
        <span className="mt-1 block text-xs opacity-60">{hint}</span>
      ) : null}
    </label>
  );
}

export function CheckoutForm(props: CheckoutFormProps) {
  const sf = useStorefront();
  const { cart, setCart, pending } = useCart();
  const router = useRouter();
  const [v, setV] = useState({ ...props.initial, deliveryZoneId: props.initial.deliveryZoneId || (props.zones.length === 1 ? props.zones[0]!.id : "") });
  const [payment, setPayment] = useState(props.methods[0]?.id ?? "cod");
  const [trx, setTrx] = useState("");
  const [agree, setAgree] = useState(!props.termsUrl);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [repricing, setRepricing] = useState(false);
  const draftTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const started = useRef(false);

  const method = props.methods.find((m) => m.id === payment);
  const zone = props.zones.find((z) => z.id === v.deliveryZoneId) ?? null;

  // InitiateCheckout once per visit.
  useEffect(() => {
    if (started.current || !cart.lines.length) return;
    started.current = true;
    trackEvent({ event: "InitiateCheckout", value: cart.total / 100, currency: cart.currency, contentIds: cart.lines.map((l) => l.variantId ?? l.productId), numItems: cart.itemCount });
  }, [cart]);

  const saveDraft = async (patch: Partial<typeof v>, immediate = false) => {
    const next = { ...v, ...patch };
    const run = async () => {
      const body = {
        name: next.name || undefined,
        phone: next.phone || undefined,
        email: next.email || undefined,
        address: { line1: next.line1, area: next.area, city: next.city, district: next.district },
        deliveryZoneId: next.deliveryZoneId || undefined,
        note: next.note || undefined,
      };
      try {
        const res = await fetch(sf.api("/checkout/draft"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
        const data = (await res.json().catch(() => ({}))) as { cart?: CartView };
        if (data.cart) setCart(data.cart);
      } catch {
        /* offline — the order request re-prices anyway */
      }
    };
    if (draftTimer.current) clearTimeout(draftTimer.current);
    if (immediate) {
      setRepricing(true);
      await run();
      setRepricing(false);
    } else draftTimer.current = setTimeout(run, 900);
  };

  // Price the initially selected zone.
  useEffect(() => {
    if (v.deliveryZoneId && cart.deliveryZone?.id !== v.deliveryZoneId) void saveDraft({}, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k: keyof typeof v) => (e: { target: { value: string } }) => {
    const value = e.target.value;
    setV((s) => ({ ...s, [k]: value }));
    setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const chooseZone = (id: string) => {
    setV((s) => ({ ...s, deliveryZoneId: id }));
    setErrors((er) => ({ ...er, deliveryZoneId: undefined }));
    void saveDraft({ deliveryZoneId: id }, true);
  };

  // Suggest the matching zone when the district changes (e.g. Dhaka → "Inside Dhaka").
  const onDistrict = (district: string) => {
    setV((s) => ({ ...s, district }));
    if (!district) return;
    const inside = props.zones.find((z) => /(inside|within).*dhaka|dhaka city|ঢাকার ভিতরে/i.test(z.name));
    const outside = props.zones.find((z) => /outside|ঢাকার বাইরে/i.test(z.name));
    const suggestion = district === "Dhaka" ? inside : outside;
    if (suggestion && suggestion.id !== v.deliveryZoneId) chooseZone(suggestion.id);
  };

  const shippingLabel = useMemo(() => {
    if (!zone) return "Choose delivery area";
    if (cart.shippingTotal === 0) return "Free";
    return sf.format(cart.shippingTotal);
  }, [zone, cart.shippingTotal, sf]);

  const belowMinimum = props.minimumOrder != null && cart.subtotal < props.minimumOrder;

  const validate = (): Errors => {
    const e: Errors = {};
    if (v.name.trim().length < 2) e.name = "Enter your full name";
    if (!PHONE_RE.test(normalizePhone(v.phone))) e.phone = "Enter a valid 11-digit mobile number (01XXXXXXXXX)";
    if (props.requireEmail && !v.email.trim()) e.email = "Email is required";
    else if (v.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = "Enter a valid email address";
    if (v.line1.trim().length < 3) e.line1 = "Enter your full address (house, road, area)";
    if (!v.deliveryZoneId) e.deliveryZoneId = "Choose a delivery area";
    if (!method) e.paymentMethod = "Choose a payment method";
    if (method?.id === "bkash_manual" && trx.trim().length < 4) e.transactionId = "Enter the transaction ID from your payment SMS";
    if (props.termsUrl && !agree) e.terms = "Please accept the terms to continue";
    return e;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (props.isPreview) {
      setFormError("Checkout is disabled in the theme preview.");
      return;
    }
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = Object.keys(errs)[0];
      document.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(sf.api("/checkout"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: v.name.trim(),
          phone: normalizePhone(v.phone),
          email: v.email.trim(),
          address: { line1: v.line1.trim(), area: v.area.trim(), city: v.city.trim(), district: v.district },
          deliveryZoneId: v.deliveryZoneId,
          paymentMethod: payment,
          transactionId: trx.trim() || null,
          note: v.note.trim() || null,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; redirect?: string };
      if (!res.ok || !data.redirect) throw new Error(data.error ?? "We couldn't place your order. Please try again.");
      if (/^https?:\/\//.test(data.redirect)) window.location.assign(data.redirect);
      else router.push(data.redirect);
    } catch (err) {
      setFormError((err as Error).message);
      setSubmitting(false);
      // Stock or price may have changed — refresh the summary.
      void saveDraft({}, true);
    }
  };

  const busy = submitting || repricing || pending;

  return (
    <form onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
      <div className="space-y-5">
        <Step n={1} title="Contact">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name" error={errors.name} className="sm:col-span-2">
              <input name="name" value={v.name} onChange={set("name")} onBlur={() => saveDraft({})} autoComplete="name" required maxLength={120} className="pai-input" aria-invalid={!!errors.name} />
            </Field>
            <Field label="Mobile number" error={errors.phone} hint="We'll call to confirm your order">
              <input name="phone" value={v.phone} onChange={set("phone")} onBlur={() => saveDraft({})} inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" required maxLength={16} className="pai-input" aria-invalid={!!errors.phone} />
            </Field>
            <Field label={props.requireEmail ? "Email" : "Email (optional)"} error={errors.email} hint="For your order confirmation">
              <input name="email" type="email" value={v.email} onChange={set("email")} onBlur={() => saveDraft({})} autoComplete="email" maxLength={200} className="pai-input" aria-invalid={!!errors.email} />
            </Field>
          </div>
          {!sf.customer ? (
            <p className="mt-4 text-sm opacity-70">
              Have an account?{" "}
              <Link href={sf.url(`/account/login?return_to=${encodeURIComponent("/checkout")}`)} className="font-semibold underline underline-offset-4">
                Log in
              </Link>{" "}
              for faster checkout.
            </p>
          ) : null}
        </Step>

        <Step n={2} title="Delivery">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Address" error={errors.line1} className="sm:col-span-2">
              <textarea name="line1" value={v.line1} onChange={set("line1")} onBlur={() => saveDraft({})} rows={2} autoComplete="street-address" placeholder="House, road, block / village" maxLength={200} className="pai-input" aria-invalid={!!errors.line1} />
            </Field>
            <Field label="Area / Thana">
              <input name="area" value={v.area} onChange={set("area")} onBlur={() => saveDraft({})} autoComplete="address-level3" maxLength={100} className="pai-input" placeholder="e.g. Dhanmondi" />
            </Field>
            <Field label="District">
              <select name="district" value={v.district} onChange={(e) => onDistrict(e.target.value)} autoComplete="address-level2" className="pai-input">
                <option value="">Select district</option>
                {props.districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <fieldset className="mt-6">
            <legend className="pai-label">Delivery area</legend>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup">
              {props.zones.map((z) => {
                const active = z.id === v.deliveryZoneId;
                const free = props.freeShippingOver != null && cart.subtotal >= props.freeShippingOver;
                return (
                  <label key={z.id} className={`flex cursor-pointer items-start gap-3 rounded-pai border p-4 transition ${active ? "border-pai-primary ring-1 ring-pai-primary" : "border-pai-border hover:border-pai-fg/40"}`}>
                    <input type="radio" name="deliveryZoneId" value={z.id} checked={active} onChange={() => chooseZone(z.id)} className="mt-1 accent-[var(--pai-primary)]" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2 font-medium">
                        {z.name}
                        <span className="shrink-0 text-sm">{free ? "Free" : sf.format(z.charge)}</span>
                      </span>
                      {z.estimatedDays ? (
                        <span className="mt-0.5 flex items-center gap-1 text-xs opacity-65">
                          <Truck className="size-3.5" aria-hidden /> {z.estimatedDays}
                        </span>
                      ) : null}
                    </span>
                  </label>
                );
              })}
            </div>
            {errors.deliveryZoneId ? <p className="mt-2 text-xs font-medium text-pai-sale">{errors.deliveryZoneId}</p> : null}
          </fieldset>

          {props.allowNote ? (
            <Field label="Order note (optional)" className="mt-5">
              <textarea name="note" value={v.note} onChange={set("note")} onBlur={() => saveDraft({})} rows={2} maxLength={1000} className="pai-input" placeholder="Delivery instructions, preferred time …" />
            </Field>
          ) : null}
        </Step>

        <Step n={3} title="Payment">
          <div className="space-y-3" role="radiogroup" aria-label="Payment method">
            {props.methods.map((m) => {
              const active = m.id === payment;
              return (
                <div key={m.id} className={`rounded-pai border transition ${active ? "border-pai-primary ring-1 ring-pai-primary" : "border-pai-border"}`}>
                  <label className="flex cursor-pointer items-start gap-3 p-4">
                    <input type="radio" name="paymentMethod" value={m.id} checked={active} onChange={() => setPayment(m.id)} className="mt-1 accent-[var(--pai-primary)]" />
                    <span className="flex-1">
                      <span className="flex items-center gap-2 font-medium">
                        <MethodIcon id={m.id} /> {m.label}
                      </span>
                      <span className="mt-0.5 block text-sm opacity-70">{m.description}</span>
                    </span>
                  </label>
                  {active && m.kind === "manual" ? (
                    <div className="border-t border-pai-border px-4 pb-4 pt-3 text-sm">
                      <p className="opacity-80">
                        Send <strong>{sf.format(cart.total)}</strong> using <em>Send Money</em> to:
                      </p>
                      <ul className="mt-2 space-y-1">
                        {(m.numbers ?? []).map((n) => (
                          <li key={n.label} className="flex items-center justify-between rounded-pai bg-pai-muted px-3 py-2">
                            <span className="font-medium">{n.label}</span>
                            <span className="font-mono">{n.number}</span>
                          </li>
                        ))}
                      </ul>
                      {m.instructions ? <p className="mt-2 opacity-70">{m.instructions}</p> : null}
                      <Field label="Transaction ID" error={errors.transactionId} className="mt-3">
                        <input name="transactionId" value={trx} onChange={(e) => setTrx(e.target.value)} maxLength={60} className="pai-input font-mono uppercase" placeholder="e.g. 9FT7XK2L1Q" />
                      </Field>
                    </div>
                  ) : null}
                  {active && m.kind === "redirect" ? <p className="border-t border-pai-border px-4 py-3 text-sm opacity-70">You&apos;ll be redirected to complete your payment securely.</p> : null}
                </div>
              );
            })}
          </div>
          {errors.paymentMethod ? <p className="mt-2 text-xs font-medium text-pai-sale">{errors.paymentMethod}</p> : null}
        </Step>
      </div>

      <aside className="lg:sticky lg:top-6" aria-label="Order summary">
        <div className="rounded-pai border border-pai-border bg-pai-muted/40 p-5 md:p-6">
          <h2 className="mb-4 text-lg font-semibold">Order summary</h2>
          <ul className="divide-y divide-pai-border">
            {cart.lines.map((l) => (
              <CartLineItem key={l.key} line={l} compact />
            ))}
          </ul>
          <div className="mt-4 border-t border-pai-border pt-4">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium opacity-80">
              <Tag className="size-4" aria-hidden /> Discount code
            </div>
            <DiscountForm />
          </div>
          <dl className="mt-5 space-y-2 border-t border-pai-border pt-4 text-sm">
            <div className="flex justify-between">
              <dt className="opacity-75">Subtotal ({cart.itemCount} items)</dt>
              <dd>{sf.format(cart.subtotal)}</dd>
            </div>
            {cart.discountTotal > 0 ? (
              <div className="flex justify-between text-pai-sale">
                <dt>Discount{cart.discount ? ` (${cart.discount.code})` : ""}</dt>
                <dd>−{sf.format(cart.discountTotal)}</dd>
              </div>
            ) : null}
            <div className="flex justify-between">
              <dt className="opacity-75">Delivery{zone ? ` · ${zone.name}` : ""}</dt>
              <dd>{repricing ? <LoaderCircle className="size-4 animate-spin" aria-label="Updating" /> : shippingLabel}</dd>
            </div>
            <div className="flex justify-between border-t border-pai-border pt-3 text-base font-semibold">
              <dt>Total</dt>
              <dd>{sf.format(cart.total)}</dd>
            </div>
          </dl>

          {cart.errors.length ? (
            <ul className="mt-4 space-y-1 rounded-pai border border-pai-sale/40 bg-pai-sale/10 p-3 text-sm text-pai-sale" role="alert">
              {cart.errors.map((er) => (
                <li key={er}>{er}</li>
              ))}
            </ul>
          ) : null}
          {belowMinimum ? <p className="mt-4 text-sm font-medium text-pai-sale">Minimum order is {sf.format(props.minimumOrder!)}. Add a little more to continue.</p> : null}

          {props.termsUrl ? (
            <label className="mt-5 flex items-start gap-2 text-sm">
              <input type="checkbox" name="terms" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-0.5 accent-[var(--pai-primary)]" />
              <span>
                I agree to the{" "}
                <a href={props.termsUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">
                  terms &amp; conditions
                </a>
              </span>
            </label>
          ) : null}
          {errors.terms ? <p className="mt-1 text-xs font-medium text-pai-sale">{errors.terms}</p> : null}

          {formError ? (
            <p className="mt-4 flex items-start gap-2 rounded-pai border border-pai-sale/40 bg-pai-sale/10 p-3 text-sm text-pai-sale" role="alert">
              <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden /> {formError}
            </p>
          ) : null}

          <button type="submit" disabled={busy || belowMinimum || !cart.lines.length} className="pai-btn pai-btn-primary pai-btn-lg pai-btn-block mt-5">
            {submitting ? <LoaderCircle className="size-5 animate-spin" aria-hidden /> : <Lock className="size-4" aria-hidden />}
            {submitting ? "Placing order…" : method?.kind === "redirect" ? `Pay ${sf.format(cart.total)}` : `Place order · ${sf.format(cart.total)}`}
          </button>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs opacity-60">
            <ShieldCheck className="size-3.5" aria-hidden /> Secure checkout · your details are never shared
          </p>
        </div>
        <p className="mt-4 flex items-center justify-center gap-1.5 text-sm">
          <Check className="size-4 opacity-60" aria-hidden />
          <Link href={sf.url("/cart")} className="underline underline-offset-4 opacity-75 hover:opacity-100">
            Edit cart
          </Link>
        </p>
      </aside>
    </form>
  );
}
