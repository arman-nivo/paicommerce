import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@pai/core/session";
import { LoginForm } from "../_components/forms";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await getCurrentUser()) redirect(next?.startsWith("/") && !next.startsWith("//") ? next : "/");
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">Welcome back</h1>
      <p className="mb-7 mt-2 text-sm text-muted-foreground">Log in to manage your store.</p>
      <LoginForm next={next} />
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to PaiCommerce?{" "}
        <Link href="/signup" className="font-semibold text-primary hover:underline">
          Start your free store
        </Link>
      </p>
    </div>
  );
}
