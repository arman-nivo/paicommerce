import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-4 text-center">
      <p className="font-display text-6xl font-bold text-primary">404</p>
      <h1 className="mt-3 text-xl font-semibold">Page not found</h1>
      <p className="mt-1 text-sm text-muted-foreground">The page you're looking for doesn't exist.</p>
      <Link href="/" className="mt-6 inline-flex h-10 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        Go to dashboard
      </Link>
    </div>
  );
}
