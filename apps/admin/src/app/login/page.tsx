import { redirect } from "next/navigation";
import { ShieldCheck } from "lucide-react";
import { Button, Card } from "@pai/ui";
import { getCurrentUser } from "@pai/core/session";
import { getAdmin } from "@/lib/auth";
import { exitImpersonation } from "./actions";
import { LoginForm } from "./login-form";

export const metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  if (await getAdmin()) redirect("/");
  const { next } = await searchParams;
  const current = await getCurrentUser();
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-12">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--accent),transparent_60%)]" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <ShieldCheck className="size-6" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight">PaiCommerce Admin</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in with your team account</p>
        </div>
        {current?.impersonatorId && (
          <Card className="mb-4 p-4 text-sm">
            <p className="text-muted-foreground">
              You are currently impersonating <span className="font-medium text-foreground">{current.email}</span>.
            </p>
            <form action={exitImpersonation} className="mt-3">
              <Button type="submit" size="sm" className="w-full">
                Stop impersonating & return to admin
              </Button>
            </form>
          </Card>
        )}
        <Card className="p-6">
          <LoginForm next={next} />
        </Card>
        <p className="mt-6 text-center text-xs text-muted-foreground">Access is restricted to PaiCommerce staff. All activity is audit-logged.</p>
      </div>
    </main>
  );
}
