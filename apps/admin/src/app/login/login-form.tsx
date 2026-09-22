"use client";

import { useActionState } from "react";
import { Button, Field, Input } from "@pai/ui";
import { login, type LoginState } from "./actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(login, undefined);
  return (
    <form action={action} className="space-y-4">
      {next && <input type="hidden" name="next" value={next} />}
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="username" required autoFocus defaultValue={state?.email} placeholder="you@paicommerce.com" />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required placeholder="••••••••" />
      </Field>
      {state?.error && (
        <p role="alert" className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
      <Button type="submit" className="w-full" loading={pending}>
        Sign in
      </Button>
    </form>
  );
}
