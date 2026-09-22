import type { Metadata } from "next";
import Link from "next/link";
import { ResetForm } from "../_components/forms";
import { isResetTokenValid } from "../actions";

export const metadata: Metadata = { title: "Choose a new password" };

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  const valid = token ? await isResetTokenValid(token) : false;
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">Choose a new password</h1>
      {valid && token ? (
        <>
          <p className="mb-7 mt-2 text-sm text-muted-foreground">Pick something you haven't used before.</p>
          <ResetForm token={token} />
        </>
      ) : (
        <>
          <p className="mb-6 mt-2 text-sm text-muted-foreground">This reset link is invalid or has expired.</p>
          <Link href="/forgot-password" className="inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            Request a new link
          </Link>
        </>
      )}
    </div>
  );
}
