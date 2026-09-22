"use client";
import Link from "next/link";
import * as React from "react";
import {
  ArrowLeft,
  ArrowRight,
  Baby,
  BookOpen,
  Car,
  Check,
  CircleAlert,
  CircleCheck,
  Dumbbell,
  Gem,
  Gift,
  HeartPulse,
  Lock,
  MonitorPlay,
  Palette,
  PawPrint,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sofa,
  Sparkles,
  Store,
  UtensilsCrossed,
  X,
  type LucideIcon,
} from "lucide-react";
import { Badge, Button, cn, Input, Spinner } from "@pai/ui";
import { formatMoney } from "@pai/core";
import { checkSlug, createStore } from "./actions";

type ThemeOpt = { slug: string; name: string; tagline: string; thumbnail: string; categories: string[]; price: number; features: string[] };

const CAT_ICONS: Record<string, LucideIcon> = {
  fashion: Shirt,
  electronics: Smartphone,
  grocery: ShoppingBasket,
  beauty: Sparkles,
  home: Sofa,
  food: UtensilsCrossed,
  jewelry: Gem,
  health: HeartPulse,
  kids: Baby,
  sports: Dumbbell,
  books: BookOpen,
  digital: MonitorPlay,
  handicraft: Palette,
  automotive: Car,
  pets: PawPrint,
  gifts: Gift,
  general: Store,
};

const STEPS = ["Store name", "Web address", "Business type", "Theme"];

function toSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40)
    .replace(/-+$/g, "");
}

export function Wizard({ userName, hasStores, domain, categories, themes }: { userName: string; hasStores: boolean; domain: string; categories: { id: string; label: string }[]; themes: ThemeOpt[] }) {
  const [step, setStep] = React.useState(0);
  const [name, setName] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [slugTouched, setSlugTouched] = React.useState(false);
  const [slugState, setSlugState] = React.useState<{ checking: boolean; available?: boolean; reason?: string; suggestion?: string; failed?: boolean }>({ checking: false });
  const [slugRetry, setSlugRetry] = React.useState(0);
  const nameRef = React.useRef<HTMLInputElement>(null);
  const [category, setCategory] = React.useState("");
  const [theme, setTheme] = React.useState("");
  const [creating, setCreating] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // If the merchant typed before the page finished hydrating (slow first load in dev / on mobile),
  // the text is in the DOM but not in React state — adopt it so Continue works.
  React.useEffect(() => {
    const v = nameRef.current?.value;
    if (v && !name) setName(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-derive slug from name until the merchant edits it.
  React.useEffect(() => {
    if (!slugTouched) setSlug(toSlug(name));
  }, [name, slugTouched]);

  // Live availability check.
  React.useEffect(() => {
    if (!slug) {
      setSlugState({ checking: false });
      return;
    }
    setSlugState((s) => ({ ...s, checking: true }));
    const t = setTimeout(async () => {
      try {
        const r = await checkSlug(slug);
        setSlugState({ checking: false, available: r.available, reason: r.reason, suggestion: r.suggestion });
      } catch (e) {
        console.error("[onboarding] availability check failed", e);
        // Don't block the merchant: the server re-validates the address when the store is created.
        setSlugState({ checking: false, failed: true });
      }
    }, 350);
    return () => clearTimeout(t);
  }, [slug, slugRetry]);

  const sortedThemes = React.useMemo(() => {
    const rec = (t: ThemeOpt) => (category && t.categories.includes(category) ? 0 : 1);
    return [...themes].sort((a, b) => rec(a) - rec(b) || (a.price > 0 ? 1 : 0) - (b.price > 0 ? 1 : 0) || a.name.localeCompare(b.name));
  }, [themes, category]);

  React.useEffect(() => {
    if (step === 3 && !theme) {
      const first = sortedThemes.find((t) => t.price === 0);
      if (first) setTheme(first.slug);
    }
  }, [step, theme, sortedThemes]);

  const slugOk = !slugState.checking && (slugState.available === true || (!!slugState.failed && slug.length >= 3));
  const canNext = [name.trim().length >= 2, !!slug && slugOk, !!category, !!theme][step];

  const next = async () => {
    setError(null);
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    setCreating(true);
    const res = await createStore({ name: name.trim(), slug, category, themeSlug: theme });
    if (res && !res.ok) {
      setError(res.error);
      setCreating(false);
    }
  };

  if (creating) return <Creating name={name} />;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-3 sm:px-8">
        <span className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 text-white">
            <Store className="size-4" />
          </span>
          PaiCommerce
        </span>
        <div className="hidden items-center gap-2 sm:flex">
          {STEPS.map((s, i) => (
            <React.Fragment key={s}>
              <span className={cn("flex items-center gap-1.5 text-xs font-medium", i <= step ? "text-foreground" : "text-muted-foreground")}>
                <span className={cn("flex size-5 items-center justify-center rounded-full text-[10px] font-bold", i < step ? "bg-emerald-500 text-white" : i === step ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                  {i < step ? <Check className="size-3" /> : i + 1}
                </span>
                {s}
              </span>
              {i < STEPS.length - 1 && <span className="h-px w-6 bg-border" />}
            </React.Fragment>
          ))}
        </div>
        {hasStores ? (
          <Link href="/" className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-muted-foreground hover:bg-muted">
            <X className="size-4" /> Cancel
          </Link>
        ) : (
          <a href="/logout" className="text-sm text-muted-foreground hover:text-foreground">
            Log out
          </a>
        )}
      </header>
      <div className="h-1 bg-muted sm:hidden">
        <div className="h-full bg-primary transition-all" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
      </div>

      <main className={cn("mx-auto w-full flex-1 px-4 py-10 sm:py-14", step === 3 ? "max-w-5xl" : step === 2 ? "max-w-3xl" : "max-w-xl")}>
        <p className="text-sm font-medium text-primary">
          Step {step + 1} of {STEPS.length}
        </p>
        {step === 0 && (
          <section className="animate-slide-up">
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">{hasStores ? "Let's create another store" : `Welcome, ${userName}! Let's name your store`}</h1>
            <p className="mt-2 text-muted-foreground">You can change this any time. Pick something short and memorable.</p>
            <Input
              ref={nameRef}
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && canNext && next()}
              placeholder="e.g. Dhaka Threads"
              maxLength={60}
              className="mt-8 h-14 rounded-xl px-4 text-lg"
            />
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
              Ideas:
              {["Deshi Bazaar", "Nokshi Crafts", "Gadget Ghor", "Mayer Doa Store"].map((s) => (
                <button key={s} onClick={() => setName(s)} className="rounded-full border border-border px-2.5 py-0.5 hover:bg-muted">
                  {s}
                </button>
              ))}
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="animate-slide-up">
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Choose your store's web address</h1>
            <p className="mt-2 text-muted-foreground">This is where customers will find you. You can connect your own domain (like yourbrand.com) later.</p>
            <div className={cn("mt-8 flex h-14 items-center overflow-hidden rounded-xl border bg-card shadow-xs focus-within:ring-3", slugState.available === false ? "border-red-400 focus-within:ring-red-500/15" : slugState.available ? "border-emerald-400 focus-within:ring-emerald-500/15" : "border-input focus-within:ring-ring/15")}>
              <span className="pl-4 text-muted-foreground">https://</span>
              <input
                autoFocus
                value={slug}
                onChange={(e) => {
                  setSlugTouched(true);
                  setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").slice(0, 40));
                }}
                onKeyDown={(e) => e.key === "Enter" && canNext && next()}
                className="min-w-0 flex-1 bg-transparent px-0.5 text-lg font-semibold outline-none"
                aria-label="Store address"
              />
              <span className="pr-4 text-muted-foreground">.{domain}</span>
            </div>
            <div className="mt-3 min-h-6 text-sm">
              {slugState.checking ? (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Spinner className="size-3.5" /> Checking availability…
                </span>
              ) : slugState.available ? (
                <span className="flex items-center gap-1.5 font-medium text-emerald-600">
                  <CircleCheck className="size-4" /> {slug}.{domain} is available!
                </span>
              ) : slugState.failed ? (
                <span className="flex flex-wrap items-center gap-1.5 text-amber-700">
                  <CircleAlert className="size-4" /> We couldn&apos;t check this address right now — you can still continue.
                  <button className="font-semibold text-primary underline underline-offset-2" onClick={() => setSlugRetry((n) => n + 1)}>
                    Check again
                  </button>
                </span>
              ) : slugState.available === false ? (
                <span className="flex flex-wrap items-center gap-1.5 text-red-600">
                  <CircleAlert className="size-4" /> {slugState.reason}.
                  {slugState.suggestion && (
                    <button
                      className="font-semibold text-primary underline underline-offset-2"
                      onClick={() => {
                        setSlugTouched(true);
                        setSlug(slugState.suggestion!);
                      }}
                    >
                      Use {slugState.suggestion}
                    </button>
                  )}
                </span>
              ) : null}
            </div>
            <div className="mt-8 rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
                <span className="flex gap-1">
                  <span className="size-2.5 rounded-full bg-red-400" />
                  <span className="size-2.5 rounded-full bg-amber-400" />
                  <span className="size-2.5 rounded-full bg-emerald-400" />
                </span>
                <Lock className="ml-2 size-3" />
                <span className="truncate">
                  {slug || "your-store"}.{domain}
                </span>
              </div>
              <div className="mt-4 space-y-2 px-1">
                <div className="h-3 w-1/3 rounded bg-muted" />
                <div className="font-display text-xl font-bold">{name || "Your store"}</div>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="aspect-[4/3] rounded-lg bg-muted" />
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="animate-slide-up">
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">What will you sell?</h1>
            <p className="mt-2 text-muted-foreground">We'll recommend themes and set up your store for your kind of business.</p>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {categories.map((c) => {
                const Icon = CAT_ICONS[c.id] ?? Store;
                const on = category === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => setCategory(c.id)}
                    onDoubleClick={() => {
                      setCategory(c.id);
                      setStep(3);
                    }}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border bg-card p-3.5 text-left text-sm font-medium transition hover:border-primary/60 hover:shadow-sm",
                      on ? "border-primary ring-3 ring-primary/15" : "border-border",
                    )}
                  >
                    <span className={cn("flex size-9 shrink-0 items-center justify-center rounded-lg", on ? "bg-primary text-white" : "bg-muted text-muted-foreground")}>
                      <Icon className="size-[18px]" />
                    </span>
                    <span className="leading-tight">{c.label}</span>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {step === 3 && (
          <section className="animate-slide-up">
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight">Pick a starting theme</h1>
            <p className="mt-2 text-muted-foreground">Every theme is fully customizable with our drag-and-drop editor. You can switch any time.</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {sortedThemes.map((t) => {
                const recommended = t.categories.includes(category);
                const premium = t.price > 0;
                const on = theme === t.slug;
                return (
                  <button
                    key={t.slug}
                    disabled={premium}
                    onClick={() => setTheme(t.slug)}
                    className={cn(
                      "group overflow-hidden rounded-2xl border bg-card text-left transition",
                      on ? "border-primary ring-3 ring-primary/20" : "border-border hover:border-primary/50 hover:shadow-md",
                      premium && "cursor-not-allowed opacity-70",
                    )}
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.thumbnail} alt={t.name} className="size-full object-cover transition duration-500 group-hover:scale-[1.03]" loading="lazy" />
                      <div className="absolute left-2.5 top-2.5 flex gap-1.5">
                        {recommended && (
                          <Badge tone="green" className="bg-emerald-50/95 backdrop-blur">
                            Recommended
                          </Badge>
                        )}
                        {premium && (
                          <Badge tone="purple" className="bg-violet-50/95 backdrop-blur">
                            <Lock className="size-3" /> {formatMoney(t.price)}
                          </Badge>
                        )}
                      </div>
                      {on && (
                        <span className="absolute right-2.5 top-2.5 flex size-7 items-center justify-center rounded-full bg-primary text-white shadow-lg">
                          <Check className="size-4" />
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold">{t.name}</span>
                        <span className="text-xs font-medium text-muted-foreground">{premium ? "Premium" : "Free"}</span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{t.tagline}</p>
                      {premium && <p className="mt-2 text-xs text-muted-foreground">Available later from the Theme Store.</p>}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
            <CircleAlert className="size-4" /> {error}
          </div>
        )}
      </main>

      <footer className="sticky bottom-0 border-t border-border bg-card/95 backdrop-blur">
        <div className={cn("mx-auto flex w-full items-center justify-between gap-3 px-4 py-3", step === 3 ? "max-w-5xl" : step === 2 ? "max-w-3xl" : "max-w-xl")}>
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            <ArrowLeft /> Back
          </Button>
          <Button size="lg" onClick={next} disabled={!canNext}>
            {step === 3 ? (
              <>
                <Sparkles /> Create my store
              </>
            ) : (
              <>
                Continue <ArrowRight />
              </>
            )}
          </Button>
        </div>
      </footer>
    </div>
  );
}

function Creating({ name }: { name: string }) {
  const tasks = ["Creating your store", "Installing your theme", "Adding pages & menus", "Setting up delivery zones", "Turning on Cash on Delivery"];
  const [i, setI] = React.useState(0);
  React.useEffect(() => {
    const t = setInterval(() => setI((x) => Math.min(tasks.length - 1, x + 1)), 550);
    return () => clearInterval(t);
  }, [tasks.length]);
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-600/30">
          <Store className="size-7 animate-pulse" />
        </div>
        <h1 className="mt-6 font-display text-2xl font-bold">Setting up {name}…</h1>
        <ul className="mt-6 space-y-2.5 text-left text-sm">
          {tasks.map((t, idx) => (
            <li key={t} className={cn("flex items-center gap-2.5 transition", idx > i && "opacity-40")}>
              {idx < i ? <CircleCheck className="size-4 text-emerald-500" /> : idx === i ? <Spinner className="size-4 text-primary" /> : <span className="size-4 rounded-full border border-border" />}
              {t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
