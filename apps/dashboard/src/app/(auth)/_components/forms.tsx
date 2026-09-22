"use client";
import Link from "next/link";
import * as React from "react";
import { useActionState } from "react";
import { CircleAlert, CircleCheck, Eye, EyeOff } from "lucide-react";
import { Button, Field, Input } from "@pai/ui";
import { forgotPasswordAction, loginAction, resetPasswordAction, signupAction, type AuthState } from "../actions";

function FormError({ state }: { state: AuthState }) {
  if (!state?.error) return null;
  return (
    <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      {state.error}
    </div>
  );
}

function PasswordInput({ name, autoComplete, placeholder, invalid }: { name: string; autoComplete: string; placeholder?: string; invalid?: boolean }) {
  const [show, setShow] = React.useState(false);
  return (
    <div className="relative">
      <Input id={name} name={name} type={show ? "text" : "password"} autoComplete={autoComplete} placeholder={placeholder} required className="h-10 pr-10" aria-invalid={invalid} />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground" aria-label={show ? "Hide password" : "Show password"}>
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState(loginAction, undefined);
  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormError state={state} />
      {next && <input type="hidden" name="next" value={next} />}
      <Field label="Email" htmlFor="email" error={state?.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" defaultValue={state?.values?.email} required autoFocus className="h-10" />
      </Field>
      <Field
        label={
          <span className="flex items-center justify-between">
            Password
            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          </span>
        }
        htmlFor="password"
        error={state?.fieldErrors?.password}
      >
        <PasswordInput name="password" autoComplete="current-password" placeholder="••••••••" invalid={!!state?.fieldErrors?.password} />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={pending}>
        Log in
      </Button>
    </form>
  );
}

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, undefined);
  const v = state?.values ?? {};
  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormError state={state} />
      <Field label="Full name" htmlFor="name" error={state?.fieldErrors?.name}>
        <Input id="name" name="name" autoComplete="name" placeholder="Rahim Uddin" defaultValue={v.name} required autoFocus className="h-10" />
      </Field>
      <Field label="Email" htmlFor="email" error={state?.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" defaultValue={v.email} required className="h-10" />
      </Field>
      <Field label="Mobile number" htmlFor="phone" error={state?.fieldErrors?.phone} hint="We'll only use this for important account alerts.">
        <div className="flex">
          <span className="inline-flex h-10 items-center rounded-l-lg border border-r-0 border-input bg-muted px-3 text-sm text-muted-foreground">🇧🇩 +88</span>
          <Input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="01XXXXXXXXX" defaultValue={v.phone} className="h-10 rounded-l-none" />
        </div>
      </Field>
      <Field label="Password" htmlFor="password" error={state?.fieldErrors?.password} hint={!state?.fieldErrors?.password ? "At least 8 characters." : undefined}>
        <PasswordInput name="password" autoComplete="new-password" placeholder="Create a password" invalid={!!state?.fieldErrors?.password} />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={pending}>
        Create account
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        By signing up you agree to our{" "}
        <a href="https://paicommerce.com/terms" className="underline underline-offset-2">
          Terms
        </a>{" "}
        and{" "}
        <a href="https://paicommerce.com/privacy" className="underline underline-offset-2">
          Privacy Policy
        </a>
        .
      </p>
    </form>
  );
}

export function ForgotForm() {
  const [state, formAction, pending] = useActionState(forgotPasswordAction, undefined);
  if (state?.ok)
    return (
      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
        <CircleCheck className="mb-2 size-5" />
        {state.message}
        <p className="mt-2 text-xs opacity-80">Didn't get it? Check spam, or try again in a minute.</p>
      </div>
    );
  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormError state={state} />
      <Field label="Email" htmlFor="email" error={state?.fieldErrors?.email}>
        <Input id="email" name="email" type="email" autoComplete="email" placeholder="you@example.com" required autoFocus className="h-10" />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={pending}>
        Send reset link
      </Button>
    </form>
  );
}

export function ResetForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, undefined);
  return (
    <form action={formAction} className="space-y-4" noValidate>
      <FormError state={state} />
      <input type="hidden" name="token" value={token} />
      <Field label="New password" htmlFor="password" error={state?.fieldErrors?.password}>
        <PasswordInput name="password" autoComplete="new-password" placeholder="At least 8 characters" />
      </Field>
      <Field label="Confirm password" htmlFor="confirm" error={state?.fieldErrors?.confirm}>
        <PasswordInput name="confirm" autoComplete="new-password" placeholder="Repeat password" />
      </Field>
      <Button type="submit" size="lg" className="w-full" loading={pending}>
        Update password & log in
      </Button>
    </form>
  );
}
