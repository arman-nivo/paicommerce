"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Check, LoaderCircle, SlidersHorizontal, X } from "lucide-react";
import { cn } from "../lib/utils";
import { useStorefront } from "./storefront-context";

/* ─────────────────────────── collection toolbar ─────────────────────────── */

export const SORT_OPTIONS = [
  { value: "manual", label: "Featured" },
  { value: "best-selling", label: "Best selling" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "rating", label: "Top rated" },
  { value: "title", label: "Alphabetical" },
];

function useQueryUpdater() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, start] = useTransition();
  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(patch)) {
      if (v === null || v === "") next.delete(k);
      else next.set(k, v);
    }
    next.delete("page");
    const qs = next.toString();
    start(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  };
  return { params, update, pending };
}

/** Sort dropdown bound to `?sort=`. */
export function SortSelect({ defaultSort = "manual", className }: { defaultSort?: string; className?: string }) {
  const { params, update, pending } = useQueryUpdater();
  return (
    <label className={cn("inline-flex items-center gap-2 text-sm", className)}>
      <span className="hidden opacity-70 sm:inline">Sort by</span>
      <select value={params.get("sort") ?? defaultSort} onChange={(e) => update({ sort: e.target.value === defaultSort ? null : e.target.value })} className="pai-input min-h-10 w-auto py-2 pr-8 text-sm">
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {pending ? <LoaderCircle className="size-4 animate-spin opacity-60" /> : null}
    </label>
  );
}

/** Price range + availability filters bound to `?min=&max=&instock=1` (prices in major units). */
export function CollectionFilters({ className, onApplied, currencySymbol = "৳" }: { className?: string; onApplied?: () => void; currencySymbol?: string }) {
  const { params, update, pending } = useQueryUpdater();
  const [min, setMin] = useState(params.get("min") ?? "");
  const [max, setMax] = useState(params.get("max") ?? "");
  useEffect(() => {
    setMin(params.get("min") ?? "");
    setMax(params.get("max") ?? "");
  }, [params]);
  const inStock = params.get("instock") === "1";
  const active = !!(params.get("min") || params.get("max") || inStock);
  return (
    <div className={cn("space-y-6", className)}>
      <div>
        <h3 className="mb-3 text-sm font-semibold">Availability</h3>
        <label className="flex cursor-pointer items-center gap-2.5 text-sm">
          <input type="checkbox" checked={inStock} onChange={(e) => { update({ instock: e.target.checked ? "1" : null }); onApplied?.(); }} className="size-4 accent-[var(--pai-primary)]" />
          In stock only
        </label>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          update({ min: min.replace(/\D/g, "") || null, max: max.replace(/\D/g, "") || null });
          onApplied?.();
        }}
      >
        <h3 className="mb-3 text-sm font-semibold">Price</h3>
        <div className="flex items-center gap-2">
          <label className="relative flex-1">
            <span className="sr-only">Minimum price</span>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-60">{currencySymbol}</span>
            <input inputMode="numeric" value={min} onChange={(e) => setMin(e.target.value)} placeholder="Min" className="pai-input min-h-10 py-2 pl-7 text-sm" />
          </label>
          <span className="opacity-50">–</span>
          <label className="relative flex-1">
            <span className="sr-only">Maximum price</span>
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm opacity-60">{currencySymbol}</span>
            <input inputMode="numeric" value={max} onChange={(e) => setMax(e.target.value)} placeholder="Max" className="pai-input min-h-10 py-2 pl-7 text-sm" />
          </label>
        </div>
        <button type="submit" className="pai-btn pai-btn-outline pai-btn-sm mt-3 w-full">
          {pending ? <LoaderCircle className="size-4 animate-spin" /> : null}
          Apply price
        </button>
      </form>
      {active ? (
        <button type="button" onClick={() => { update({ min: null, max: null, instock: null }); onApplied?.(); }} className="inline-flex items-center gap-1 text-sm underline underline-offset-4 opacity-75 hover:opacity-100">
          <X className="size-3.5" /> Clear all filters
        </button>
      ) : null}
    </div>
  );
}

/** Mobile "Filter" button opening the filters in a drawer. */
export function FilterDrawerButton({ currencySymbol, className }: { currencySymbol?: string; className?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={cn("pai-btn pai-btn-outline pai-btn-sm", className)}>
        <SlidersHorizontal className="size-4" /> Filter
      </button>
      {open ? (
        <div className="fixed inset-0 z-[70] text-pai-fg" role="dialog" aria-modal="true" aria-label="Filters">
          <button type="button" aria-label="Close filters" className="animate-pai-fade absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <aside className="animate-pai-slide-in-left absolute inset-y-0 left-0 w-[86%] max-w-sm overflow-y-auto bg-pai-bg p-5 shadow-2xl">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="font-heading text-lg font-semibold">Filters</h2>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="grid size-9 place-items-center rounded-full hover:bg-pai-muted">
                <X className="size-5" />
              </button>
            </div>
            <CollectionFilters currencySymbol={currencySymbol} onApplied={() => setOpen(false)} />
          </aside>
        </div>
      ) : null}
    </>
  );
}

/* ─────────────────────────── contact ─────────────────────────── */

/** Contact form posting to `{base}/api/contact`. */
export function ContactForm({ className, buttonLabel = "Send message", showPhone = true }: { className?: string; buttonLabel?: string; showPhone?: boolean }) {
  const sf = useStorefront();
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  if (state === "done") {
    return (
      <div className={cn("rounded-pai bg-pai-muted p-6 text-center", className)}>
        <Check className="mx-auto mb-2 size-8" />
        <p className="font-semibold">Thanks! Your message has been sent.</p>
        <p className="mt-1 text-sm opacity-70">We&apos;ll get back to you as soon as possible.</p>
      </div>
    );
  }
  return (
    <form
      className={cn("grid gap-4 sm:grid-cols-2", className)}
      onSubmit={async (e) => {
        e.preventDefault();
        setState("loading");
        const fd = new FormData(e.currentTarget);
        try {
          const res = await fetch(sf.api("/contact"), { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(Object.fromEntries(fd)) });
          const data = (await res.json().catch(() => ({}))) as { error?: string };
          if (!res.ok) throw new Error(data.error ?? "Could not send your message");
          setState("done");
        } catch (err) {
          setError((err as Error).message);
          setState("error");
        }
      }}
    >
      <label className="block">
        <span className="pai-label">Name</span>
        <input name="name" required maxLength={120} className="pai-input" autoComplete="name" />
      </label>
      <label className="block">
        <span className="pai-label">Email</span>
        <input name="email" type="email" required maxLength={200} className="pai-input" autoComplete="email" />
      </label>
      {showPhone ? (
        <label className="block sm:col-span-2">
          <span className="pai-label">Phone (optional)</span>
          <input name="phone" inputMode="tel" maxLength={20} className="pai-input" autoComplete="tel" />
        </label>
      ) : null}
      <label className="block sm:col-span-2">
        <span className="pai-label">Message</span>
        <textarea name="message" required rows={5} maxLength={4000} className="pai-input" />
      </label>
      {state === "error" ? <p className="text-sm text-pai-sale sm:col-span-2">{error}</p> : null}
      <div className="sm:col-span-2">
        <button type="submit" disabled={state === "loading"} className="pai-btn pai-btn-primary">
          {state === "loading" ? <LoaderCircle className="size-4 animate-spin" /> : null}
          {buttonLabel}
        </button>
      </div>
    </form>
  );
}

/* ─────────────────────────── customer accounts ─────────────────────────── */

async function postJson(url: string, body: unknown) {
  const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  const data = (await res.json().catch(() => ({}))) as { error?: string; redirect?: string };
  if (!res.ok) throw new Error(data.error ?? "Something went wrong");
  return data;
}

/** Customer login (phone or email + password) → `{base}/api/account/login`. */
export function LoginForm({ returnTo = "/account", className }: { returnTo?: string; className?: string }) {
  const sf = useStorefront();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      className={cn("space-y-4", className)}
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const fd = new FormData(e.currentTarget);
        try {
          await postJson(sf.api("/account/login"), { identifier: fd.get("identifier"), password: fd.get("password") });
          router.push(sf.url(returnTo));
          router.refresh();
        } catch (err) {
          setError((err as Error).message);
          setBusy(false);
        }
      }}
    >
      <label className="block">
        <span className="pai-label">Phone or email</span>
        <input name="identifier" required autoComplete="username" className="pai-input" placeholder="01XXXXXXXXX or you@example.com" />
      </label>
      <label className="block">
        <span className="pai-label">Password</span>
        <input name="password" type="password" required autoComplete="current-password" className="pai-input" />
      </label>
      {error ? <p className="text-sm text-pai-sale">{error}</p> : null}
      <button type="submit" disabled={busy} className="pai-btn pai-btn-primary pai-btn-block pai-btn-lg">
        {busy ? <LoaderCircle className="size-4 animate-spin" /> : null} Log in
      </button>
      <p className="text-center text-sm opacity-75">
        New here?{" "}
        <Link href={sf.url("/account/register")} className="font-semibold underline underline-offset-4">
          Create an account
        </Link>
      </p>
    </form>
  );
}

/** Customer registration → `{base}/api/account/register`. */
export function RegisterForm({ returnTo = "/account", className }: { returnTo?: string; className?: string }) {
  const sf = useStorefront();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return (
    <form
      className={cn("space-y-4", className)}
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setError("");
        const fd = new FormData(e.currentTarget);
        try {
          await postJson(sf.api("/account/register"), Object.fromEntries(fd));
          router.push(sf.url(returnTo));
          router.refresh();
        } catch (err) {
          setError((err as Error).message);
          setBusy(false);
        }
      }}
    >
      <label className="block">
        <span className="pai-label">Full name</span>
        <input name="name" required maxLength={120} autoComplete="name" className="pai-input" />
      </label>
      <label className="block">
        <span className="pai-label">Mobile number</span>
        <input name="phone" inputMode="tel" required autoComplete="tel" className="pai-input" placeholder="01XXXXXXXXX" />
      </label>
      <label className="block">
        <span className="pai-label">Email (optional)</span>
        <input name="email" type="email" autoComplete="email" className="pai-input" />
      </label>
      <label className="block">
        <span className="pai-label">Password</span>
        <input name="password" type="password" required minLength={6} autoComplete="new-password" className="pai-input" />
      </label>
      {error ? <p className="text-sm text-pai-sale">{error}</p> : null}
      <button type="submit" disabled={busy} className="pai-btn pai-btn-primary pai-btn-block pai-btn-lg">
        {busy ? <LoaderCircle className="size-4 animate-spin" /> : null} Create account
      </button>
      <p className="text-center text-sm opacity-75">
        Already have an account?{" "}
        <Link href={sf.url("/account/login")} className="font-semibold underline underline-offset-4">
          Log in
        </Link>
      </p>
    </form>
  );
}
