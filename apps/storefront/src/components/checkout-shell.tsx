import Link from "next/link";
import type { ReactNode } from "react";
import { Lock } from "lucide-react";

/** Distraction-free checkout chrome: store logo, secure badge, minimal footer. */
export function CheckoutShell({ storeName, logoUrl, homeUrl, cartUrl, children, policies }: { storeName: string; logoUrl: string | null; homeUrl: string; cartUrl: string; children: ReactNode; policies: { label: string; href: string }[] }) {
  return (
    <div className="min-h-screen bg-pai-bg">
      <header className="border-b border-pai-border">
        <div className="pai-container flex h-16 items-center justify-between gap-4">
          <Link href={homeUrl} className="inline-flex items-center" aria-label={`${storeName} home`}>
            {logoUrl ? <img src={logoUrl} alt={storeName} className="h-9 w-auto max-w-[180px] object-contain" /> : <span className="font-heading text-xl font-bold">{storeName}</span>}
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="hidden items-center gap-1.5 opacity-70 sm:inline-flex">
              <Lock className="size-4" aria-hidden /> Secure checkout
            </span>
            <Link href={cartUrl} className="font-medium underline underline-offset-4">
              Back to cart
            </Link>
          </div>
        </div>
      </header>
      <main id="main" className="pai-container py-8 md:py-12">
        {children}
      </main>
      <footer className="border-t border-pai-border py-6 text-center text-xs opacity-60">
        <nav className="flex flex-wrap justify-center gap-x-5 gap-y-2" aria-label="Policies">
          {policies.map((p) => (
            <Link key={p.href} href={p.href} className="hover:underline">
              {p.label}
            </Link>
          ))}
        </nav>
        <p className="mt-2">© {new Date().getFullYear()} {storeName}</p>
      </footer>
    </div>
  );
}
