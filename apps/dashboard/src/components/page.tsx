import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@pai/ui";

/** Small "← Back to X" link placed above page titles. */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition hover:text-foreground">
      <ArrowLeft className="size-4" /> {label}
    </Link>
  );
}

/** Consistent page header with optional back link. */
export function Header({ title, description, actions, back }: { title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode; back?: { href: string; label: string } }) {
  return <PageHeader title={title} description={description} actions={actions} back={back ? <BackLink {...back} /> : undefined} />;
}

/** Two-column edit layout: main (2/3) + aside (1/3) on desktop, stacked on mobile. */
export function EditLayout({ main, aside }: { main: React.ReactNode; aside: React.ReactNode }) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <div className="space-y-5 lg:col-span-2">{main}</div>
      <div className="space-y-5">{aside}</div>
    </div>
  );
}
