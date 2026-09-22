import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ForgotForm } from "../_components/forms";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <div>
      <h1 className="font-display text-3xl font-bold tracking-tight">Forgot your password?</h1>
      <p className="mb-7 mt-2 text-sm text-muted-foreground">Enter the email you signed up with and we'll send you a link to reset it.</p>
      <ForgotForm />
      <Link href="/login" className="mt-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> Back to log in
      </Link>
    </div>
  );
}
