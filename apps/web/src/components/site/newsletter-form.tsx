"use client";

import { useActionState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { subscribeNewsletter, type FormState } from "@/lib/actions";

export function NewsletterForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribeNewsletter, null);
  return (
    <form action={action} className="mt-6">
      <label htmlFor="nl-email" className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-300">
        Seller playbooks, monthly
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="nl-email"
          name="email"
          type="email"
          required
          placeholder="you@brand.com"
          className="h-10 min-w-0 flex-1 rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white placeholder:text-slate-500 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        />
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center gap-1 rounded-xl bg-white px-3.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100 disabled:opacity-60"
          aria-label="Subscribe"
        >
          {state?.ok ? <Check className="size-4" /> : <ArrowRight className="size-4" />}
        </button>
      </div>
      {state && <p className={`mt-2 text-xs ${state.ok ? "text-emerald-400" : "text-rose-400"}`} role="status">{state.message}</p>}
    </form>
  );
}
