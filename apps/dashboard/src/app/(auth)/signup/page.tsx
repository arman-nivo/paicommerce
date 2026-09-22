import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@pai/core/session";
import { SignupForm } from "../_components/forms";

export const metadata: Metadata = { title: "Create your store" };

export default async function SignupPage() {
  if (await getCurrentUser()) redirect("/");
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">Start selling online</h1>
      <p className="mb-7 mt-2 text-sm text-muted-foreground">Create your account — your store will be ready in 2 minutes. Free 14-day trial, no card needed.</p>
      <SignupForm />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
