"use client";

import { useActionState, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { cn } from "@pai/ui";
import { submitContact, type FormState } from "@/lib/actions";

const TOPICS = [
  { v: "sales", label: "Sales" },
  { v: "support", label: "Support" },
  { v: "partnership", label: "Partnership" },
  { v: "enterprise", label: "Enterprise" },
  { v: "demo", label: "Book a demo" },
] as const;

const input =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm shadow-xs transition placeholder:text-slate-400 focus:border-brand-400 focus:outline-none focus:ring-3 focus:ring-brand-500/15 aria-[invalid=true]:border-rose-400";

export function ContactForm({ initialTopic }: { initialTopic?: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitContact, null);
  const [topic, setTopic] = useState<string>(TOPICS.some((t) => t.v === initialTopic) ? initialTopic! : "sales");
  const err = (k: string) => (state && !state.ok ? state.errors?.[k] : undefined);
  const val = (k: string) => state?.values?.[k] ?? "";

  if (state?.ok)
    return (
      <div className="flex min-h-[420px] flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 text-center" role="status">
        <span className="flex size-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="size-7" />
        </span>
        <h2 className="mt-5 text-2xl font-bold">Message received</h2>
        <p className="mt-2 max-w-sm text-slate-600">{state.message}</p>
      </div>
    );

  return (
    <form action={action} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8" noValidate>
      <fieldset>
        <legend className="text-sm font-semibold text-slate-900">What can we help with?</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {TOPICS.map((t) => (
            <label
              key={t.v}
              className={cn(
                "cursor-pointer rounded-full border px-4 py-1.5 text-sm font-medium transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand-500/40",
                topic === t.v ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 text-slate-600 hover:border-slate-300",
              )}
            >
              <input type="radio" name="topic" value={t.v} checked={topic === t.v} onChange={() => setTopic(t.v)} className="sr-only" />
              {t.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Full name" error={err("name")}>
          <input name="name" defaultValue={val("name")} autoComplete="name" required className={input} aria-invalid={!!err("name")} placeholder="Nusrat Jahan" />
        </Field>
        <Field label="Work email" error={err("email")}>
          <input name="email" defaultValue={val("email")} type="email" autoComplete="email" required className={input} aria-invalid={!!err("email")} placeholder="you@brand.com" />
        </Field>
        <Field label="Phone (optional)" error={err("phone")}>
          <input name="phone" defaultValue={val("phone")} type="tel" autoComplete="tel" className={input} aria-invalid={!!err("phone")} placeholder="+880 17xx-xxxxxx" />
        </Field>
        <Field label="Company / store (optional)" error={err("company")}>
          <input name="company" defaultValue={val("company")} autoComplete="organization" className={input} placeholder="Deshi Threads" />
        </Field>
      </div>
      <Field label="Message" error={err("message")} className="mt-4">
        <textarea
          name="message"
          defaultValue={val("message")}
          required
          rows={5}
          className={cn(input, "h-auto py-3")}
          aria-invalid={!!err("message")}
          placeholder={topic === "partnership" ? "Tell us about your agency or the themes you build…" : "Tell us about your business, monthly orders and what you need…"}
        />
      </Field>
      {/* honeypot */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {state && !state.ok && <p className="mt-4 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700" role="alert">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 text-sm font-semibold text-white shadow-[0_8px_24px_-8px_rgba(37,69,235,0.6)] transition hover:bg-brand-700 disabled:opacity-60"
      >
        {pending ? "Sending…" : (
          <>
            Send message <Send className="size-4" />
          </>
        )}
      </button>
      <p className="mt-3 text-center text-xs text-slate-500">
        By submitting you agree to our <a href="/legal/privacy" className="underline">privacy policy</a>. We reply within one business day.
      </p>
    </form>
  );
}

function Field({ label, error, children, className }: { label: string; error?: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className="mt-1.5 block">{children}</span>
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}
