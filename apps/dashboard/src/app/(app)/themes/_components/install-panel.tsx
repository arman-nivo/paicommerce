"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, CircleCheck, CreditCard, Crown, ExternalLink, Lock, Paintbrush, Plus, ShieldCheck, Smartphone, Wallet } from "lucide-react";
import { Button, Card, cn, Dialog, toast } from "@pai/ui";
import { run } from "@/lib/client";
import { formatMoney } from "@pai/core";
import { addThemeToLibrary, purchaseTheme } from "../actions";
import { LinkButton } from "./link-button";

type Props = {
  theme: { id: string; name: string; price: number };
  installedCount: number;
  firstInstallId: string | null;
  isLive: boolean;
  purchased: boolean;
  canBuyPremium: boolean;
  planName: string;
  demoUrl: string | null;
};

const METHODS = [
  { id: "bkash", label: "Pay with bKash", hint: "Mobile wallet", icon: Smartphone },
  { id: "sslcommerz", label: "Pay with SSLCommerz", hint: "Nagad, Rocket, cards & net banking", icon: Wallet },
  { id: "card", label: "Pay with card", hint: "Visa, Mastercard, Amex", icon: CreditCard },
] as const;

type Method = (typeof METHODS)[number]["id"];

export function InstallPanel({ theme, installedCount, firstInstallId, isLive, purchased, canBuyPremium, planName, demoUrl }: Props) {
  const router = useRouter();
  const money = (minor: number) => formatMoney(minor, "BDT");
  const [busy, setBusy] = React.useState(false);
  const [buying, setBuying] = React.useState(false);
  const [method, setMethod] = React.useState<Method>("bkash");
  const [added, setAdded] = React.useState<string | null>(null);

  const premium = theme.price > 0;
  const owned = !premium || purchased;
  const installed = installedCount > 0;

  function onAdded(storeThemeId: string, msg: string) {
    setAdded(storeThemeId);
    toast.success(msg, { action: { label: "Customize now", onClick: () => router.push(`/themes/${storeThemeId}/customize`) } });
    router.refresh();
  }

  async function add() {
    setBusy(true);
    const res = await run(addThemeToLibrary({ themeId: theme.id }));
    setBusy(false);
    if (res) onAdded(res.storeThemeId, `${res.name} added to your theme library`);
  }

  async function buy() {
    setBusy(true);
    const res = await run(purchaseTheme({ themeId: theme.id, method }), { loading: "Processing payment…" });
    setBusy(false);
    if (res) {
      setBuying(false);
      onAdded(res.storeThemeId, res.invoiceNumber ? `Payment successful — ${res.name} is yours (invoice ${res.invoiceNumber})` : `${res.name} added to your theme library`);
    }
  }

  const demo = demoUrl && (
    <LinkButton href={demoUrl} external variant="outline" className="w-full">
      <ExternalLink /> View live demo
    </LinkButton>
  );

  return (
    <Card className="p-5">
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-2xl font-semibold tracking-tight">{premium ? money(theme.price) : "Free"}</p>
        {premium && <p className="text-xs text-muted-foreground">{purchased ? "Purchased" : "One-time payment"}</p>}
      </div>
      {premium && !purchased && <p className="mt-1 text-xs text-muted-foreground">Lifetime updates included. Use it on this store forever.</p>}

      <div className="mt-4 space-y-2">
        {added ? (
          <div className="space-y-2">
            <div className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CircleCheck className="mt-0.5 size-4 shrink-0" />
              <span>Added to your theme library. Customize it now — customers won&apos;t see it until you publish.</span>
            </div>
            <LinkButton href={`/themes/${added}/customize`} className="w-full">
              <Paintbrush /> Customize now
            </LinkButton>
            <LinkButton href="/themes" variant="outline" className="w-full">
              Go to your themes
            </LinkButton>
          </div>
        ) : owned ? (
          installed && firstInstallId ? (
            <>
              <LinkButton href={`/themes/${firstInstallId}/customize`} className="w-full">
                <Check /> {isLive ? "Live" : "Installed"} · Customize
              </LinkButton>
              <Button variant="outline" className="w-full" onClick={add} loading={busy}>
                <Plus className="size-4" /> Add another copy
              </Button>
            </>
          ) : (
            <Button className="w-full" size="lg" onClick={add} loading={busy}>
              <Plus className="size-4" /> Add to theme library
            </Button>
          )
        ) : canBuyPremium ? (
          <Button className="w-full" size="lg" onClick={() => setBuying(true)}>
            <Crown className="size-4" /> Buy for {money(theme.price)}
          </Button>
        ) : (
          <div className="space-y-3 rounded-xl border border-dashed border-border bg-muted/40 p-4">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                <Lock className="size-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Premium themes are available on Growth and above</p>
                <p className="mt-0.5 text-xs text-muted-foreground">You&apos;re on the {planName} plan. Upgrade to unlock premium designs.</p>
              </div>
            </div>
            <LinkButton href="/settings/billing" className="w-full">
              <Crown /> Upgrade plan
            </LinkButton>
          </div>
        )}
        {demo}
      </div>

      <ul className="mt-5 space-y-2 border-t border-border pt-4 text-xs text-muted-foreground">
        {["Free updates for life", "Mobile-first & fast on 3G/4G", "Works with COD, bKash & couriers", "Customize without code"].map((f) => (
          <li key={f} className="flex items-center gap-2">
            <Check className="size-3.5 text-emerald-600 dark:text-emerald-400" /> {f}
          </li>
        ))}
      </ul>

      <Dialog
        open={buying}
        onClose={() => !busy && setBuying(false)}
        title={`Buy ${theme.name}`}
        description="One-time payment, lifetime updates."
        footer={
          <>
            <Button variant="outline" onClick={() => setBuying(false)} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={buy} loading={busy}>
              Pay {money(theme.price)}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
            <div className="flex justify-between">
              <span>{theme.name} theme</span>
              <span className="font-medium">{money(theme.price)}</span>
            </div>
            <div className="mt-1 flex justify-between text-xs text-muted-foreground">
              <span>License</span>
              <span>This store · lifetime updates</span>
            </div>
            <div className="mt-2 flex justify-between border-t border-border pt-2 font-semibold">
              <span>Total</span>
              <span>{money(theme.price)}</span>
            </div>
          </div>
          <div className="space-y-2" role="radiogroup" aria-label="Payment method">
            {METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                role="radio"
                aria-checked={method === m.id}
                onClick={() => setMethod(m.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg border p-3 text-left transition",
                  method === m.id ? "border-primary bg-accent/60 ring-2 ring-primary/15" : "border-border hover:bg-muted",
                )}
              >
                <m.icon className="size-5 text-muted-foreground" />
                <span className="flex-1">
                  <span className="block text-sm font-medium">{m.label}</span>
                  <span className="block text-xs text-muted-foreground">{m.hint}</span>
                </span>
                <span className={cn("size-4 rounded-full border-2", method === m.id ? "border-primary bg-primary shadow-[inset_0_0_0_2px_var(--color-card)]" : "border-input")} />
              </button>
            ))}
          </div>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" /> Secure payment. You&apos;ll get an invoice under{" "}
            <Link href="/settings/billing" className="underline">
              Plan &amp; billing
            </Link>
            .
          </p>
        </div>
      </Dialog>
    </Card>
  );
}
